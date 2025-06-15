from fastapi import APIRouter, Depends, HTTPException, status, Query, Path
from typing import List, Dict, Any, Optional

from woo_client import WooClient
from api.dependencies import get_woo_client
from api.models import (
    ProductCreate, ProductUpdate, ProductResponse,
    VariationCreate, VariationUpdate, VariationResponse,
    ErrorResponse, ProductStatus
)
from models import Product

router = APIRouter()

@router.get("", response_model=List[ProductResponse])
async def get_products(
    per_page: int = Query(10, ge=1, le=100),
    page: int = Query(1, ge=1),
    search: Optional[str] = None,
    status: Optional[ProductStatus] = None,
    category: Optional[int] = None,
    woo_client: WooClient = Depends(get_woo_client)
):
    """Get a list of products with filters"""
    params = {"per_page": per_page, "page": page}
    
    if search:
        params["search"] = search
    if status:
        params["status"] = status.value
    if category:
        params["category"] = category
        
    try:
        products = woo_client.products.get_products(**params)
        return products
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get products: {str(e)}"
        )

@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(
    product_id: int = Path(..., ge=1),
    woo_client: WooClient = Depends(get_woo_client)
):
    """Get a specific product by ID"""
    try:
        product = woo_client.products.get_product_by_id(product_id)
        return product
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID {product_id} not found: {str(e)}"
        )

@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    product_data: ProductCreate,
    woo_client: WooClient = Depends(get_woo_client)
):
    """Create a new product"""
    try:
        # Convert Pydantic model to dict
        product_dict = product_data.dict(exclude_none=True)
        
        # Create product through the WooClient
        created_product = woo_client.products.create_product(product_dict)
        return created_product
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create product: {str(e)}"
        )

@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: int = Path(..., ge=1),
    product_data: ProductUpdate = None,
    woo_client: WooClient = Depends(get_woo_client)
):
    """Update an existing product"""
    try:
        # Convert Pydantic model to dict, excluding None values
        product_dict = product_data.dict(exclude_none=True) if product_data else {}
        
        # Update product through the WooClient
        updated_product = woo_client.products.update_product(product_id, product_dict)
        return updated_product
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to update product: {str(e)}"
        )

@router.delete("/{product_id}", response_model=Dict[str, Any])
async def delete_product(
    product_id: int = Path(..., ge=1),
    force: bool = Query(False),
    woo_client: WooClient = Depends(get_woo_client)
):
    """Delete a product"""
    try:
        result = woo_client.products.delete_product(product_id, force=force)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to delete product: {str(e)}"
        )

@router.get("/{product_id}/variations", response_model=List[VariationResponse])
async def get_variations(
    product_id: int = Path(..., ge=1),
    per_page: int = Query(10, ge=1, le=100),
    page: int = Query(1, ge=1),
    woo_client: WooClient = Depends(get_woo_client)
):
    """Get variations for a product"""
    try:
        variations = woo_client.products.get_variations(
            parent_id=product_id,
            per_page=per_page,
            page=page
        )
        return variations
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Variations not found: {str(e)}"
        )

@router.get("/{product_id}/variations/{variation_id}", response_model=VariationResponse)
async def get_variation(
    product_id: int = Path(..., ge=1),
    variation_id: int = Path(..., ge=1),
    woo_client: WooClient = Depends(get_woo_client)
):
    """Get a specific variation"""
    try:
        variation = woo_client.products.get_variation(product_id, variation_id)
        return variation
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Variation not found: {str(e)}"
        )

@router.post("/{product_id}/variations", response_model=VariationResponse, status_code=status.HTTP_201_CREATED)
async def create_variation(
    product_id: int = Path(..., ge=1),
    variation_data: VariationCreate = None,
    woo_client: WooClient = Depends(get_woo_client)
):
    """Create a new variation for a product"""
    try:
        variation_dict = variation_data.dict(exclude_none=True) if variation_data else {}
        created_variation = woo_client.products.create_variation(product_id, variation_dict)
        return created_variation
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create variation: {str(e)}"
        )

@router.put("/{product_id}/variations/{variation_id}", response_model=VariationResponse)
async def update_variation(
    product_id: int = Path(..., ge=1),
    variation_id: int = Path(..., ge=1),
    variation_data: VariationUpdate = None,
    woo_client: WooClient = Depends(get_woo_client)
):
    """Update a product variation"""
    try:
        variation_dict = variation_data.dict(exclude_none=True) if variation_data else {}
        updated_variation = woo_client.products.update_variation(
            parent_id=product_id,
            variation_id=variation_id,
            variation_data=variation_dict
        )
        return updated_variation
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to update variation: {str(e)}"
        )

@router.delete("/{product_id}/variations/{variation_id}", response_model=Dict[str, Any])
async def delete_variation(
    product_id: int = Path(..., ge=1),
    variation_id: int = Path(..., ge=1),
    force: bool = Query(False),
    woo_client: WooClient = Depends(get_woo_client)
):
    """Delete a product variation"""
    try:
        result = woo_client.products.delete_variation(
            parent_id=product_id,
            variation_id=variation_id,
            force=force
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to delete variation: {str(e)}"
        )
