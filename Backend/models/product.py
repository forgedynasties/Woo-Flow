from dataclasses import dataclass, field
from typing import List, Dict, Optional, Any, Union
from datetime import datetime


@dataclass
class ProductImage:
    """WooCommerce product image"""
    src: str
    id: Optional[int] = None
    name: Optional[str] = None
    alt: Optional[str] = None


@dataclass
class ProductAttribute:
    """WooCommerce product attribute"""
    name: str
    options: List[str]
    position: int = 0
    visible: bool = True
    variation: bool = False
    id: Optional[int] = None


@dataclass
class ProductCategory:
    """WooCommerce product category reference"""
    id: int
    name: Optional[str] = None
    slug: Optional[str] = None


@dataclass
class Product:
    """
    WooCommerce product model
    
    For variable products:
    - Use type="variable" for the parent product
    - Use type="simple" for child variations with parent_id set
    """
    name: str
    type: str  # 'simple', 'grouped', 'external', 'variable'
    description: str = ""
    short_description: str = ""
    
    # Price fields
    regular_price: Optional[str] = None
    sale_price: Optional[str] = None
    sale_end_date: Optional[Union[str, datetime]] = None
    
    # Identifiers
    id: Optional[int] = None
    parent_id: Optional[int] = None  # For variations, this points to the parent variable product
    
    # Metadata
    status: str = "publish"  # 'draft', 'pending', 'private', 'publish'
    catalog_visibility: str = "visible"  # 'visible', 'catalog', 'search', 'hidden'
    featured: bool = False
    
    # Relationships
    categories: List[Union[ProductCategory, Dict[str, Any], int]] = field(default_factory=list)
    images: List[Union[ProductImage, Dict[str, Any], str]] = field(default_factory=list)
    attributes: List[Union[ProductAttribute, Dict[str, Any]]] = field(default_factory=list)
    
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
        
        # Add parent ID for variations (but don't include type=variation, use type=simple)
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
        
        # Process images
        if self.images:
            result["images"] = []
            for image in self.images:
                if isinstance(image, str):
                    result["images"].append({"src": image})
                elif isinstance(image, dict):
                    result["images"].append(image)
                else:
                    result["images"].append({"src": image.src, "name": image.name, "alt": image.alt})
        
        # Process attributes
        if self.attributes:
            result["attributes"] = []
            for attr in self.attributes:
                if isinstance(attr, dict):
                    result["attributes"].append(attr)
                else:
                    result["attributes"].append({
                        "name": attr.name,
                        "options": attr.options,
                        "position": attr.position,
                        "visible": attr.visible,
                        "variation": attr.variation,
                    })
                    if attr.id:
                        result["attributes"][-1]["id"] = attr.id
        
        return result
    
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
            
        # Extract images
        if "images" in data and data["images"]:
            product.images = [
                ProductImage(
                    id=image.get("id"),
                    src=image.get("src", ""),
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
                    variation=attr.get("variation", False)
                )
                for attr in data["attributes"]
            ]
            
        return product
