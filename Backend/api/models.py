from typing import Optional, List, Dict, Any, Union
from pydantic import BaseModel, Field, validator, ConfigDict, field_validator
from enum import Enum
from datetime import datetime

# Settings model for API configuration
class Settings(BaseModel):
    wc_key: str = ""
    wc_secret: str = ""
    wc_url: str = ""
    wp_username: Optional[str] = None
    wp_secret: Optional[str] = None
    api_key: Optional[str] = None
    verify_ssl: bool = False

# Error response model
class ErrorResponse(BaseModel):
    code: str
    message: str
    details: Optional[str] = None

# Product related schemas 
class ProductStatus(str, Enum):
    DRAFT = "draft"
    PENDING = "pending"
    PRIVATE = "private"
    PUBLISH = "publish"

class ProductType(str, Enum):
    SIMPLE = "simple"
    GROUPED = "grouped"
    EXTERNAL = "external"
    VARIABLE = "variable"

class StockStatus(str, Enum):
    INSTOCK = "instock"
    OUTOFSTOCK = "outofstock"
    ONBACKORDER = "onbackorder"

class CategoryModel(BaseModel):
    id: int
    name: Optional[str] = None
    slug: Optional[str] = None

class ProductAttributeValue(BaseModel):
    id: Optional[int] = None
    name: str
    options: List[str]
    position: int = 0
    visible: bool = True
    variation: bool = False
    is_global: bool = False
    global_slug: Optional[str] = None

class ImageModel(BaseModel):
    id: int  
    name: Optional[str] = None
    alt: Optional[str] = None
    src: Optional[str] = None

class ProductVariationModel(BaseModel):
    attributes: List[Dict[str, Any]]
    regular_price: str
    sale_price: Optional[str] = None
    sku: Optional[str] = None
    stock_quantity: Optional[int] = None
    manage_stock: bool = False
    dimensions: Optional[Dict[str, str]] = None
    weight: Optional[str] = None
    image: Optional[Union[ImageModel, Dict[str, Any], int]] = None

class ProductCreate(BaseModel):
    name: str
    type: ProductType = ProductType.SIMPLE
    description: str = ""
    short_description: str = ""
    regular_price: Optional[str] = None
    sale_price: Optional[str] = None
    sale_end_date: Optional[Union[str, datetime]] = None
    sku: Optional[str] = None
    manage_stock: bool = False
    stock_quantity: Optional[int] = None
    stock_status: Optional[StockStatus] = None
    status: ProductStatus = ProductStatus.PUBLISH
    categories: Optional[List[Union[int, Dict[str, Any]]]] = None
    images: Optional[List[Union[int, Dict[str, Any]]]] = None
    attributes: Optional[List[ProductAttributeValue]] = None
    variations: Optional[List[ProductVariationModel]] = None
    dimensions: Optional[Dict[str, str]] = None
    weight: Optional[str] = None

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    short_description: Optional[str] = None
    regular_price: Optional[str] = None
    sale_price: Optional[str] = None
    sale_end_date: Optional[Union[str, datetime]] = None
    sku: Optional[str] = None
    manage_stock: Optional[bool] = None
    stock_quantity: Optional[int] = None
    stock_status: Optional[StockStatus] = None
    status: Optional[ProductStatus] = None
    categories: Optional[List[Union[int, Dict[str, Any]]]] = None
    images: Optional[List[Union[int, Dict[str, Any]]]] = None
    attributes: Optional[List[ProductAttributeValue]] = None
    dimensions: Optional[Dict[str, str]] = None
    weight: Optional[str] = None

class ProductResponse(BaseModel):
    id: int
    name: str
    type: str
    status: str
    description: str
    short_description: str
    sku: Optional[str] = None
    price: Optional[str] = None
    regular_price: Optional[str] = None
    sale_price: Optional[str] = None
    on_sale: Optional[bool] = None
    date_created: Optional[datetime] = None
    stock_quantity: Optional[int] = None
    stock_status: Optional[str] = None
    categories: List[CategoryModel] = []
    images: List[ImageModel] = []
    attributes: List[Dict[str, Any]] = []
    variations: Optional[List[int]] = None
    model_config = ConfigDict(
        extra='allow',  # Allow additional fields
    )

# Category related schemas
class CategoryCreate(BaseModel):
    name: str
    slug: Optional[str] = None
    parent: Optional[int] = None
    description: str = ""
    image: Optional[Dict[str, Any]] = None

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    parent: Optional[int] = None
    description: Optional[str] = None
    image: Optional[Dict[str, Any]] = None

class CategoryResponse(BaseModel):
    id: int
    name: str
    slug: str
    parent: int = 0
    description: str = ""
    count: int = 0
    image: Optional[Dict[str, Any]] = None
    model_config = ConfigDict(
        extra='allow',  # Allow additional fields
    )

class CategoryTreeRequest(BaseModel):
    path: str
    delimiter: str = "/"

# Media related schemas
class MediaUpload(BaseModel):
    url: Optional[str] = None
    file_path: Optional[str] = None
    alt_text: Optional[str] = None
    title: Optional[str] = None
    
    @field_validator('url', 'file_path')
    @classmethod
    def validate_source(cls, v: Optional[str], info) -> Optional[str]:
        if info.field_name == 'url' and not v and not info.data.get('file_path'):
            raise ValueError("Either url or file_path must be provided")
        if info.field_name == 'file_path' and not v and not info.data.get('url'):
            raise ValueError("Either url or file_path must be provided")
        return v

class MediaResponse(BaseModel):
    id: int
    date_created: Optional[datetime] = None
    date_modified: Optional[datetime] = None
    src: str
    name: str = ""
    alt: Optional[str] = None
    model_config = ConfigDict(
        extra='allow',  # Allow additional fields
    )

# Variation related schemas
class VariationCreate(ProductVariationModel):
    pass

class VariationUpdate(BaseModel):
    attributes: Optional[List[Dict[str, Any]]] = None
    regular_price: Optional[str] = None
    sale_price: Optional[str] = None
    sku: Optional[str] = None
    stock_quantity: Optional[int] = None
    manage_stock: Optional[bool] = None
    dimensions: Optional[Dict[str, str]] = None
    weight: Optional[str] = None
    image: Optional[Union[ImageModel, Dict[str, Any], int]] = None

class VariationResponse(BaseModel):
    id: int
    attributes: List[Dict[str, Any]] = []
    regular_price: Optional[str] = None
    sale_price: Optional[str] = None
    sku: Optional[str] = None
    stock_quantity: Optional[int] = None
    manage_stock: bool = False
    image: Optional[Dict[str, Any]] = None
    model_config = ConfigDict(
        extra='allow',  # Allow additional fields
    )
