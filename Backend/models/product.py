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
    attributes: List[Dict[str, Any]]  # Update to allow any type for values, not just strings
    regular_price: str
    sale_price: Optional[str] = None
    sku: Optional[str] = None
    stock_quantity: Optional[int] = None
    manage_stock: bool = False
    images: List[Union[ProductImage, Dict[str, Any], int]] = Field(default_factory=list)  # Support for variation images
    _dimensions: Optional[Dict[str, str]] = None
    _weight: Optional[str] = None

    @validator('regular_price', 'sale_price')
    def validate_price(cls, v):
        if v is not None:
            # Convert numeric values to strings
            if isinstance(v, (int, float)):
                v = str(v)
                
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
            # Handle global and local attributes correctly
            if 'id' in attr:
                # This is a global attribute - must provide ID as number
                attr_dict = {
                    "id": int(attr['id']),
                    "option": attr['option']
                }
            elif attr.get('name', '').startswith('pa_'):
                # This is a global attribute referenced by slug
                attr_dict = {
                    "name": attr['name'],
                    "option": attr['option']
                }
            else:
                # This is a local attribute
                attr_dict = {
                    "name": attr['name'],
                    "option": attr['option']
                }
            result["attributes"].append(attr_dict)

        if self.sale_price is not None:
            result["sale_price"] = str(self.sale_price)
        if self.sku is not None:
            result["sku"] = self.sku
        if self.stock_quantity is not None:
            result["stock_quantity"] = self.stock_quantity
            
        # Add weight and dimensions if set
        if hasattr(self, '_weight') and self._weight:
            result['weight'] = self._weight
            
        if hasattr(self, '_dimensions') and self._dimensions:
            result['dimensions'] = self._dimensions

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

    def add_image_from_url(self, client, image_url: str, alt_text: str = None, title: str = None) -> None:
        """Upload an image from URL and add it to the variation
        
        Args:
            client: WooClient instance with MediaClient
            image_url: URL of the image to upload
            alt_text: Alternative text for the image
            title: Title for the image
        """
        # Upload the image using the media client
        uploaded_image = client.media.create_media_from_url(
            image_url=image_url,
            alt_text=alt_text,
            title=title
        )
        
        # Add the uploaded image to the variation
        self.add_image(uploaded_image['id'])
        
        return uploaded_image['id']
        
    def add_image_from_path(self, client, file_path: str, alt_text: str = None, title: str = None) -> None:
        """Upload an image from local path and add it to the variation
        
        Args:
            client: WooClient instance with MediaClient
            file_path: Path to the local image file
            alt_text: Alternative text for the image
            title: Title for the image
        """
        # Upload the image using the media client
        uploaded_image = client.media.create_media_from_file(
            file_path=file_path,
            alt_text=alt_text,
            title=title
        )
        
        # Add the uploaded image to the variation
        self.add_image(uploaded_image['id'])
        
        return uploaded_image['id']

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
    categories: List[Union[ProductCategory, Dict[str, Any], int, str]] = Field(default_factory=list)
    images: List[Union[ProductImage, Dict[str, Any], int]] = Field(default_factory=list)  # Now accepts media IDs
    attributes: List[Union[ProductAttribute, Dict[str, Any]]] = Field(default_factory=list)
    
    # Variations (for variable products)
    variations: List[ProductVariation] = Field(default_factory=list)

    # Add dimensions and weight fields to store these values
    _dimensions: Optional[Dict[str, str]] = None
    _weight: Optional[str] = None
    
    @validator('regular_price', 'sale_price')
    def validate_price(cls, v):
        if v is not None:
            # Convert numeric values to strings
            if isinstance(v, (int, float)):
                v = str(v)
                
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

    def add_category(self, category: Union[ProductCategory, int, str], 
                    include_hierarchy: bool = False, client=None) -> None:
        """Add a category to the product
        
        Args:
            category: Category ID, ProductCategory object, or category slug
            include_hierarchy: Whether to include the full category hierarchy 
                              (only applies when using slug and client)
            client: WooClient instance (required when using slug with include_hierarchy)
        """
        # If category is a slug or name string and we want to include hierarchy
        if isinstance(category, str) and include_hierarchy:
            if not client:
                raise ValueError("Client must be provided to include category hierarchy")
                
            try:
                # Get or create the category by slug/name
                leaf_category = client.categories.get_or_create_category(name=category)
                
                # Get full hierarchy
                hierarchy = client.categories.get_category_hierarchy(leaf_category['id'])
                
                # Add all categories in hierarchy
                for cat in hierarchy:
                    self._add_single_category(cat['id'])
                    
            except Exception as e:
                raise ValueError(f"Error adding category hierarchy for '{category}': {str(e)}")
        
        # If it's just a slug/name without hierarchy but we have a client, find its ID
        elif isinstance(category, str) and client:
            try:
                # Try to find the category by slug
                cat = client.categories.get_category_by_slug(category)
                if cat:
                    # If found, add it by ID
                    self._add_single_category(cat['id'])
                else:
                    # If not found by slug, try to create it
                    created_cat = client.categories.get_or_create_category(name=category)
                    self._add_single_category(created_cat['id'])
            except Exception as e:
                # If all else fails, just add the slug directly (WooCommerce will handle this)
                self._add_single_category({"slug": category})
        else:
            # Add directly (either ID, ProductCategory object, or slug)
            self._add_single_category(category)

    def _add_single_category(self, category: Union[ProductCategory, int, str, Dict[str, Any]]):
        """Helper method to add a single category"""
        if isinstance(category, int):
            # Add by ID
            self.categories.append({"id": category})
        elif isinstance(category, str):
            # Add by slug
            self.categories.append({"slug": category})
        elif isinstance(category, dict):
            # Already a dict, add directly
            self.categories.append(category)
        else:
            # Assume it's a ProductCategory object
            self.categories.append({"id": category.id})

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
        
        # Add price fields if set - ensure they're strings
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
        
        # Add weight and dimensions if set
        if hasattr(self, '_weight') and getattr(self, '_weight', None):
            result['weight'] = getattr(self, '_weight')
            
        if hasattr(self, '_dimensions') and getattr(self, '_dimensions', None):
            result['dimensions'] = getattr(self, '_dimensions')
        
        # Process categories - updated to handle slug strings
        if self.categories:
            result["categories"] = []
            for category in self.categories:
                if isinstance(category, int):
                    result["categories"].append({"id": category})
                elif isinstance(category, str):
                    # For slugs, use the slug property
                    result["categories"].append({"slug": category})
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
        # Ensure price is a string
        if isinstance(price, (int, float)):
            price = str(price)
            
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

    def add_image_from_path_or_url(self, client, path_or_url: str, alt_text: str = None, title: str = None) -> int:
        """Add an image to the product from either a local path or a URL
        
        Args:
            client: WooClient instance with MediaClient
            path_or_url: Local file path or remote URL of the image
            alt_text: Alternative text for the image
            title: Title for the image
            
        Returns:
            Media ID of the uploaded image
        """
        # Check if the path is a URL or a local file
        if path_or_url.startswith(('http://', 'https://')):
            # It's a URL
            return self.add_image_from_url(client, path_or_url, alt_text, title)
        else:
            # It's a local path
            return self.add_image_from_path(client, path_or_url, alt_text, title)
    
    def add_image_from_url(self, client, image_url: str, alt_text: str = None, title: str = None) -> int:
        """Upload an image from URL and add it to the product
        
        Args:
            client: WooClient instance with MediaClient
            image_url: URL of the image to upload
            alt_text: Alternative text for the image
            title: Title for the image
            
        Returns:
            Media ID of the uploaded image
        """
        # Upload the image using the media client
        uploaded_image = client.media.create_media_from_url(
            image_url=image_url,
            alt_text=alt_text or f"Image for {self.name}",
            title=title or f"{self.name} - Image"
        )
        
        # Add the uploaded image to the product
        self.add_image(uploaded_image['id'])
        
        return uploaded_image['id']
        
    def add_image_from_path(self, client, file_path: str, alt_text: str = None, title: str = None) -> int:
        """Upload an image from local path and add it to the product
        
        Args:
            client: WooClient instance with MediaClient
            file_path: Path to the local image file
            alt_text: Alternative text for the image
            title: Title for the image
            
        Returns:
            Media ID of the uploaded image
        """
        # Upload the image using the media client
        uploaded_image = client.media.create_media_from_file(
            file_path=file_path,
            alt_text=alt_text or f"Image for {self.name}",
            title=title or f"{self.name} - Image"
        )
        
        # Add the uploaded image to the product
        self.add_image(uploaded_image['id'])
        
        return uploaded_image['id']

class ProductVariation(BaseModel):
    """Helper class for creating product variations"""
    attributes: List[Dict[str, Any]]  # Update to allow any type for values, not just strings
    regular_price: str
    sale_price: Optional[str] = None
    sku: Optional[str] = None
    stock_quantity: Optional[int] = None
    manage_stock: bool = False
    images: List[Union[ProductImage, Dict[str, Any], int]] = Field(default_factory=list)  # Support for variation images
    _dimensions: Optional[Dict[str, str]] = None
    _weight: Optional[str] = None

    @validator('regular_price', 'sale_price')
    def validate_price(cls, v):
        if v is not None:
            # Convert numeric values to strings
            if isinstance(v, (int, float)):
                v = str(v)
                
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
            # Handle global and local attributes correctly
            if 'id' in attr:
                # This is a global attribute - must provide ID as number
                attr_dict = {
                    "id": int(attr['id']),
                    "option": attr['option']
                }
            elif attr.get('name', '').startswith('pa_'):
                # This is a global attribute referenced by slug
                attr_dict = {
                    "name": attr['name'],
                    "option": attr['option']
                }
            else:
                # This is a local attribute
                attr_dict = {
                    "name": attr['name'],
                    "option": attr['option']
                }
            result["attributes"].append(attr_dict)

        if self.sale_price is not None:
            result["sale_price"] = str(self.sale_price)
        if self.sku is not None:
            result["sku"] = self.sku
        if self.stock_quantity is not None:
            result["stock_quantity"] = self.stock_quantity
            
        # Add weight and dimensions if set
        if hasattr(self, '_weight') and getattr(self, '_weight', None):
            result['weight'] = getattr(self, '_weight')
            
        if hasattr(self, '_dimensions') and getattr(self, '_dimensions', None):
            result['dimensions'] = getattr(self, '_dimensions')
        
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

    def add_image_from_url(self, client, image_url: str, alt_text: str = None, title: str = None) -> None:
        """Upload an image from URL and add it to the variation
        
        Args:
            client: WooClient instance with MediaClient
            image_url: URL of the image to upload
            alt_text: Alternative text for the image
            title: Title for the image
        """
        # Upload the image using the media client
        uploaded_image = client.media.create_media_from_url(
            image_url=image_url,
            alt_text=alt_text,
            title=title
        )
        
        # Add the uploaded image to the variation
        self.add_image(uploaded_image['id'])
        
        return uploaded_image['id']
        
    def add_image_from_path(self, client, file_path: str, alt_text: str = None, title: str = None) -> None:
        """Upload an image from local path and add it to the variation
        
        Args:
            client: WooClient instance with MediaClient
            file_path: Path to the local image file
            alt_text: Alternative text for the image
            title: Title for the image
        """
        # Upload the image using the media client
        uploaded_image = client.media.create_media_from_file(
            file_path=file_path,
            alt_text=alt_text,
            title=title
        )
        
        # Add the uploaded image to the variation
        self.add_image(uploaded_image['id'])
        
        return uploaded_image['id']

    def add_image_from_path_or_url(self, client, path_or_url: str, alt_text: str = None, title: str = None) -> int:
        """Add an image to the variation from either a local path or a URL
        
        Args:
            client: WooClient instance with MediaClient
            path_or_url: Local file path or remote URL of the image
            alt_text: Alternative text for the image
            title: Title for the image
            
        Returns:
            Media ID of the uploaded image
        """
        # Check if the path is a URL or a local file
        if path_or_url.startswith(('http://', 'https://')):
            # It's a URL
            return self.add_image_from_url(client, path_or_url, alt_text, title)
        else:
            # It's a local path
            return self.add_image_from_path(client, path_or_url, alt_text, title)
