from typing import List, Dict, Optional, Any, Union, Literal
from datetime import datetime
from decimal import Decimal
import re
from pydantic import BaseModel, Field, validator, model_validator


class ProductImage(BaseModel):
    """WooCommerce product image with validation"""
    id: int  # WordPress media ID
    name: Optional[str] = None
    alt: Optional[str] = None

    @validator('id')
    def validate_id(cls, v):
        if v <= 0:
            raise ValueError('Media ID must be a positive integer')
        return v

    @model_validator(mode='after')
    def validate_image_data(self):
        """Ensure id is provided"""
        if self.id is None:
            raise ValueError('Media ID must be provided')
        return self


class ProductAttribute(BaseModel):
    """WooCommerce product attribute with validation"""
    name: str
    options: List[str]
    position: int = 0
    visible: bool = True
    variation: bool = False
    id: Optional[int] = None
    is_global: bool = False  # Whether this is a global attribute
    global_slug: Optional[str] = None  # The global attribute slug (e.g., pa_color)

    @validator('options')
    def validate_options(cls, v):
        if not v:
            raise ValueError('Attribute must have at least one option')
        return v

    @validator('global_slug')
    def validate_global_slug(cls, v, values):
        if values.get('is_global') and not v:
            raise ValueError('Global attributes must have a slug')
        if v and not v.startswith('pa_'):
            raise ValueError('Global attribute slug must start with pa_')
        return v


class ProductCategory(BaseModel):
    """WooCommerce product category with validation"""
    id: int
    name: Optional[str] = None
    slug: Optional[str] = None


class ProductVariation(BaseModel):
    """Helper class for creating product variations"""
    attributes: List[Dict[str, str]]  # List of attribute name-option pairs
    regular_price: str
    sale_price: Optional[str] = None
    sku: Optional[str] = None
    stock_quantity: Optional[int] = None
    manage_stock: bool = False
    images: List[Union[ProductImage, Dict[str, Any], int]] = Field(default_factory=list)  # Support for variation images

    @validator('regular_price', 'sale_price')
    def validate_price(cls, v):
        if v is not None:
            try:
                Decimal(v)
            except:
                raise ValueError('Price must be a valid decimal number')
        return v

    def add_image(self, image: Union[ProductImage, int]) -> None:
        """Add an image to the variation using media ID"""
        if isinstance(image, int):
            image = ProductImage(id=image)
        self.images.append(image)

    def to_dict(self) -> Dict[str, Any]:
        """Convert the variation to a dictionary for WooCommerce API"""
        result = {
            "regular_price": str(self.regular_price),
            "attributes": [],
            "manage_stock": self.manage_stock,
        }

        # Process attributes
        for attr in self.attributes:
            attr_dict = {}
            # Check if this is a global attribute (starts with pa_)
            if attr.get('name', '').startswith('pa_'):
                attr_dict = {
                    "id": int(attr.get('name', '').split('_')[1]),  # Extract ID from pa_123 format
                    "option": attr.get('option', '')
                }
            else:
                attr_dict = {
                    "name": attr.get('name', ''),
                    "option": attr.get('option', '')
                }
            result["attributes"].append(attr_dict)

        if self.sale_price is not None:
            result["sale_price"] = str(self.sale_price)
        if self.sku is not None:
            result["sku"] = self.sku
        if self.stock_quantity is not None:
            result["stock_quantity"] = self.stock_quantity

        # Process images
        if self.images:
            result["image"] = {}  # WooCommerce API expects a single image for variations
            image = self.images[0]  # Use the first image
            if isinstance(image, int):
                result["image"] = {"id": image, "name": ""}
            elif isinstance(image, dict):
                result["image"] = image
            else:
                result["image"] = {
                    "id": image.id,
                    "name": image.name or "",
                    "alt": image.alt or ""
                }

        return result


class Product(BaseModel):
    """
    Enhanced WooCommerce product model with validation and helper methods
    
    Features:
    - Type validation
    - Price validation
    - Helper methods for common operations
    - Better variation handling
    - SKU and inventory management
    - Global attribute support
    """
    name: str
    type: Literal['simple', 'grouped', 'external', 'variable']
    description: str = ""
    short_description: str = ""
    
    # Price fields
    regular_price: Optional[str] = None
    sale_price: Optional[str] = None
    sale_end_date: Optional[Union[str, datetime]] = None
    
    # Identifiers
    id: Optional[int] = None
    parent_id: Optional[int] = None
    sku: Optional[str] = None
    
    # Inventory
    manage_stock: bool = False
    stock_quantity: Optional[int] = None
    stock_status: Optional[Literal['instock', 'outofstock', 'onbackorder']] = None
    
    # Metadata
    status: Literal['draft', 'pending', 'private', 'publish'] = "publish"
    catalog_visibility: Literal['visible', 'catalog', 'search', 'hidden'] = "visible"
    featured: bool = False
    
    # Relationships
    categories: List[Union[ProductCategory, Dict[str, Any], int]] = Field(default_factory=list)
    images: List[Union[ProductImage, Dict[str, Any], int]] = Field(default_factory=list)  # Now accepts media IDs
    attributes: List[Union[ProductAttribute, Dict[str, Any]]] = Field(default_factory=list)
    
    # Variations (for variable products)
    variations: List[ProductVariation] = Field(default_factory=list)

    @validator('regular_price', 'sale_price')
    def validate_price(cls, v):
        if v is not None:
            try:
                Decimal(v)
            except:
                raise ValueError('Price must be a valid decimal number')
        return v

    @validator('sku')
    def validate_sku(cls, v):
        if v is not None:
            if not re.match(r'^[a-zA-Z0-9-_]+$', v):
                raise ValueError('SKU must contain only letters, numbers, hyphens, and underscores')
        return v

    @model_validator(mode='after')
    def validate_variable_product(self):
        if self.type == 'variable':
            if not self.attributes:
                raise ValueError('Variable products must have attributes')
            if not any(attr.variation if isinstance(attr, ProductAttribute) else attr.get('variation', False) 
                      for attr in self.attributes):
                raise ValueError('Variable products must have at least one variation attribute')
        return self

    def add_variation(self, variation: ProductVariation) -> None:
        """Add a variation to a variable product"""
        if self.type != 'variable':
            raise ValueError('Can only add variations to variable products')
        self.variations.append(variation)

    def add_attribute(self, attribute: ProductAttribute) -> None:
        """Add an attribute to the product"""
        self.attributes.append(attribute)

    def add_category(self, category: Union[ProductCategory, int]) -> None:
        """Add a category to the product"""
        self.categories.append(category)

    def add_image(self, image: Union[ProductImage, int]) -> None:
        """Add an image to the product using media ID"""
        if isinstance(image, int):
            image = ProductImage(id=image)
        self.images.append(image)

    def set_sale(self, sale_price: str, end_date: Optional[Union[str, datetime]] = None) -> None:
        """Set a sale price and optional end date"""
        self.sale_price = sale_price
        self.sale_end_date = end_date

    def set_stock(self, quantity: int, manage: bool = True) -> None:
        """Set stock quantity and management"""
        self.stock_quantity = quantity
        self.manage_stock = manage
        self.stock_status = 'instock' if quantity > 0 else 'outofstock'

    def to_dict(self) -> Dict[str, Any]:
        """Convert the product to a dictionary for WooCommerce API"""
        result = {
            "name": self.name,
            "type": self.type,
            "description": self.description,
            "short_description": self.short_description,
            "status": self.status,
            "catalog_visibility": self.catalog_visibility,
            "featured": self.featured,
            "sku": self.sku,
            "manage_stock": self.manage_stock,
            "stock_quantity": self.stock_quantity,
            "stock_status": self.stock_status,
        }
        
        # Add price fields if set
        if self.regular_price is not None:
            result["regular_price"] = str(self.regular_price)
            
        if self.sale_price is not None:
            result["sale_price"] = str(self.sale_price)
            
        if self.sale_end_date is not None:
            if isinstance(self.sale_end_date, datetime):
                result["date_on_sale_to"] = self.sale_end_date.isoformat()
            else:
                result["date_on_sale_to"] = self.sale_end_date
        
        # Add parent ID for variations
        if self.parent_id is not None:
            result["parent_id"] = self.parent_id
            
        # Process categories
        if self.categories:
            result["categories"] = []
            for category in self.categories:
                if isinstance(category, int):
                    result["categories"].append({"id": category})
                elif isinstance(category, dict):
                    result["categories"].append(category)
                else:
                    result["categories"].append({"id": category.id})
        
        # Process images (now using media IDs)
        if self.images:
            result["images"] = []
            for image in self.images:
                if isinstance(image, int):
                    result["images"].append({"id": image, "name": ""})
                elif isinstance(image, dict):
                    result["images"].append(image)
                else:
                    result["images"].append({
                        "id": image.id,
                        "name": image.name or "",
                        "alt": image.alt or ""
                    })
        
        # Process attributes
        if self.attributes:
            result["attributes"] = []
            for attr in self.attributes:
                if isinstance(attr, dict):
                    result["attributes"].append(attr)
                else:
                    attr_dict = {
                        "name": attr.name,
                        "options": attr.options,
                        "position": attr.position,
                        "visible": attr.visible,
                        "variation": attr.variation,
                    }
                    if attr.is_global:
                        attr_dict["id"] = attr.id
                        attr_dict["attribute_id"] = attr.id
                    if attr.global_slug:
                        attr_dict["slug"] = attr.global_slug
                    result["attributes"].append(attr_dict)
        
        return result

    @classmethod
    def create_simple(
        cls,
        name: str,
        price: str,
        description: str = "",
        short_description: str = "",
        sku: Optional[str] = None,
        stock_quantity: Optional[int] = None,
        manage_stock: bool = False,
    ) -> 'Product':
        """Helper method to create a simple product"""
        return cls(
            name=name,
            type='simple',
            regular_price=price,
            description=description,
            short_description=short_description,
            sku=sku,
            stock_quantity=stock_quantity,
            manage_stock=manage_stock,
        )

    @classmethod
    def create_variable(
        cls,
        name: str,
        description: str = "",
        short_description: str = "",
        attributes: List[ProductAttribute] = None,
    ) -> 'Product':
        """Helper method to create a variable product"""
        return cls(
            name=name,
            type='variable',
            description=description,
            short_description=short_description,
            attributes=attributes or [],
        )

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Product':
        """Create a Product instance from a WooCommerce API response"""
        # Extract base fields
        product = cls(
            name=data.get("name", ""),
            type=data.get("type", "simple"),
            description=data.get("description", ""),
            short_description=data.get("short_description", ""),
            regular_price=data.get("regular_price", None),
            sale_price=data.get("sale_price", None),
            id=data.get("id"),
            parent_id=data.get("parent_id"),
            status=data.get("status", "publish"),
            catalog_visibility=data.get("catalog_visibility", "visible"),
            featured=data.get("featured", False),
            sku=data.get("sku"),
            manage_stock=data.get("manage_stock", False),
            stock_quantity=data.get("stock_quantity"),
            stock_status=data.get("stock_status"),
        )
        
        # Extract sale end date
        if "date_on_sale_to" in data and data["date_on_sale_to"]:
            product.sale_end_date = data["date_on_sale_to"]
            
        # Extract categories
        if "categories" in data and data["categories"]:
            product.categories = [
                ProductCategory(
                    id=category.get("id", 0),
                    name=category.get("name"),
                    slug=category.get("slug")
                )
                for category in data["categories"]
            ]
            
        # Extract images (now using media IDs)
        if "images" in data and data["images"]:
            product.images = [
                ProductImage(
                    id=image.get("id", 0),
                    name=image.get("name"),
                    alt=image.get("alt")
                )
                for image in data["images"]
            ]
            
        # Extract attributes
        if "attributes" in data and data["attributes"]:
            product.attributes = [
                ProductAttribute(
                    id=attr.get("id"),
                    name=attr.get("name", ""),
                    options=attr.get("options", []),
                    position=attr.get("position", 0),
                    visible=attr.get("visible", True),
                    variation=attr.get("variation", False),
                    is_global=bool(attr.get("id")),  # If it has an ID, it's a global attribute
                    global_slug=attr.get("slug")  # The global attribute slug
                )
                for attr in data["attributes"]
            ]
            
        return product
