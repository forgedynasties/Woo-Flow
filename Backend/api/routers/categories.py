from fastapi import APIRouter, Depends, HTTPException, status, Query, Path
from typing import List, Dict, Any, Optional

from woo_client import WooClient
from api.dependencies import get_woo_client
from api.models import CategoryCreate, CategoryUpdate, CategoryResponse, CategoryTreeRequest

router = APIRouter()

@router.get("", response_model=List[CategoryResponse])
async def get_categories(
    per_page: int = Query(100, ge=1, le=100),
    page: int = Query(1, ge=1),
    parent: Optional[int] = None,
    woo_client: WooClient = Depends(get_woo_client)
):
    """Get a list of product categories"""
    params = {"per_page": per_page, "page": page}
    
    if parent is not None:
        params["parent"] = parent
        
    try:
        categories = woo_client.categories.get_categories(**params)
        return categories
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get categories: {str(e)}"
        )

@router.get("/{category_id}", response_model=CategoryResponse)
async def get_category(
    category_id: int = Path(..., ge=1),
    woo_client: WooClient = Depends(get_woo_client)
):
    """Get a specific category by ID"""
    try:
        category = woo_client.categories.get_category(category_id)
        return category
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Category with ID {category_id} not found: {str(e)}"
        )

@router.get("/slug/{slug}", response_model=CategoryResponse)
async def get_category_by_slug(
    slug: str = Path(...),
    woo_client: WooClient = Depends(get_woo_client)
):
    """Get a category by its slug"""
    try:
        category = woo_client.categories.get_category_by_slug(slug)
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Category with slug '{slug}' not found"
            )
        return category
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get category: {str(e)}"
        )

@router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category(
    category_data: CategoryCreate,
    woo_client: WooClient = Depends(get_woo_client)
):
    """Create a new category"""
    try:
        category_dict = category_data.dict(exclude_none=True)
        created_category = woo_client.categories.create_category(**category_dict)
        return created_category
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create category: {str(e)}"
        )

@router.post("/get-or-create", response_model=CategoryResponse)
async def get_or_create_category(
    name: str,
    slug: Optional[str] = None,
    parent: Optional[int] = None,
    woo_client: WooClient = Depends(get_woo_client)
):
    """Get an existing category by slug or create it if it doesn't exist"""
    try:
        category = woo_client.categories.get_or_create_category(name=name, slug=slug, parent=parent)
        return category
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to get or create category: {str(e)}"
        )

@router.post("/tree", response_model=CategoryResponse)
async def create_category_tree(
    tree_request: CategoryTreeRequest,
    woo_client: WooClient = Depends(get_woo_client)
):
    """Create a category tree from a path string"""
    try:
        category = woo_client.categories.get_or_create_category_tree(
            path=tree_request.path,
            delimiter=tree_request.delimiter
        )
        return category
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create category tree: {str(e)}"
        )

@router.get("/{category_id}/hierarchy", response_model=List[CategoryResponse])
async def get_category_hierarchy(
    category_id: int = Path(..., ge=1),
    woo_client: WooClient = Depends(get_woo_client)
):
    """Get the full hierarchy (ancestors) of a category"""
    try:
        hierarchy = woo_client.categories.get_category_hierarchy(category_id)
        return hierarchy
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to get category hierarchy: {str(e)}"
        )

@router.put("/{category_id}", response_model=CategoryResponse)
async def update_category(
    category_id: int = Path(..., ge=1),
    category_data: CategoryUpdate = None,
    woo_client: WooClient = Depends(get_woo_client)
):
    """Update an existing category"""
    try:
        category_dict = category_data.dict(exclude_none=True) if category_data else {}
        updated_category = woo_client.categories.update_category(category_id, category_dict)
        return updated_category
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to update category: {str(e)}"
        )

@router.delete("/{category_id}", response_model=Dict[str, Any])
async def delete_category(
    category_id: int = Path(..., ge=1),
    force: bool = Query(False),
    woo_client: WooClient = Depends(get_woo_client)
):
    """Delete a category"""
    try:
        result = woo_client.categories.delete_category(category_id, force=force)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to delete category: {str(e)}"
        )
