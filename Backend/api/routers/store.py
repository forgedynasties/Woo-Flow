from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Dict, Any, List, Optional

from woo_client import WooClient
from api.dependencies import get_woo_client

router = APIRouter()

@router.get("/info", response_model=Dict[str, Any])
async def get_store_info(
    woo_client: WooClient = Depends(get_woo_client)
):
    """Get information about the WooCommerce store"""
    try:
        info = woo_client.get_store_info()
        return info
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get store info: {str(e)}"
        )

@router.get("/orders", response_model=List[Dict[str, Any]])
async def get_orders(
    per_page: int = Query(10, ge=1, le=100),
    page: int = Query(1, ge=1),
    status: Optional[str] = None,
    customer: Optional[int] = None,
    woo_client: WooClient = Depends(get_woo_client)
):
    """Get a list of orders with filters"""
    params = {"per_page": per_page}
    
    if status:
        params["status"] = status
    if customer:
        params["customer"] = customer
        
    try:
        orders = woo_client.get_orders(**params)
        return orders
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get orders: {str(e)}"
        )
