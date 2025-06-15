from fastapi import APIRouter, Depends, HTTPException, status, Path, Query
from typing import List, Dict, Any, Optional

from woo_client import WooClient
from api.dependencies import get_woo_client

router = APIRouter()

@router.get("", response_model=List[Dict[str, Any]])
async def get_attributes(
    woo_client: WooClient = Depends(get_woo_client)
):
    """Get a list of product attributes"""
    try:
        attributes = woo_client.attributes.get_attributes()
        return attributes
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get attributes: {str(e)}"
        )

@router.get("/{attribute_id}", response_model=Dict[str, Any])
async def get_attribute(
    attribute_id: int = Path(..., ge=1),
    woo_client: WooClient = Depends(get_woo_client)
):
    """Get a specific attribute by ID"""
    try:
        attribute = woo_client.attributes.get_attribute(attribute_id)
        return attribute
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Attribute with ID {attribute_id} not found: {str(e)}"
        )

@router.post("", response_model=Dict[str, Any], status_code=status.HTTP_201_CREATED)
async def create_attribute(
    attribute_data: Dict[str, Any],
    woo_client: WooClient = Depends(get_woo_client)
):
    """Create a new attribute"""
    try:
        created_attribute = woo_client.attributes.create_attribute(attribute_data)
        return created_attribute
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create attribute: {str(e)}"
        )

@router.put("/{attribute_id}", response_model=Dict[str, Any])
async def update_attribute(
    attribute_id: int = Path(..., ge=1),
    attribute_data: Dict[str, Any] = None,
    woo_client: WooClient = Depends(get_woo_client)
):
    """Update an existing attribute"""
    try:
        updated_attribute = woo_client.attributes.update_attribute(attribute_id, attribute_data or {})
        return updated_attribute
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to update attribute: {str(e)}"
        )

@router.delete("/{attribute_id}", response_model=Dict[str, Any])
async def delete_attribute(
    attribute_id: int = Path(..., ge=1),
    force: bool = Query(False),
    woo_client: WooClient = Depends(get_woo_client)
):
    """Delete an attribute"""
    try:
        result = woo_client.attributes.delete_attribute(attribute_id, force=force)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to delete attribute: {str(e)}"
        )

@router.get("/{attribute_id}/terms", response_model=List[Dict[str, Any]])
async def get_attribute_terms(
    attribute_id: int = Path(..., ge=1),
    woo_client: WooClient = Depends(get_woo_client)
):
    """Get terms for a specific attribute"""
    try:
        terms = woo_client.attributes.get_attribute_terms(attribute_id)
        return terms
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Attribute terms not found: {str(e)}"
        )

@router.post("/{attribute_id}/terms", response_model=Dict[str, Any], status_code=status.HTTP_201_CREATED)
async def create_attribute_term(
    attribute_id: int = Path(..., ge=1),
    term_data: Dict[str, Any] = None,
    woo_client: WooClient = Depends(get_woo_client)
):
    """Create a new term for an attribute"""
    try:
        created_term = woo_client.attributes.create_attribute_term(attribute_id, term_data or {})
        return created_term
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create attribute term: {str(e)}"
        )
