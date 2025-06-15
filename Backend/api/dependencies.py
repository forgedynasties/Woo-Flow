import os
from functools import lru_cache
from fastapi import Depends, HTTPException, status, Query
from fastapi.security import APIKeyHeader
from dotenv import load_dotenv
from typing import Optional
from pydantic import BaseModel

from woo_client import WooClient
from api.models import Settings

# Load environment variables
load_dotenv()

API_KEY_HEADER = APIKeyHeader(name="X-API-Key", auto_error=False)

@lru_cache()
def get_settings() -> Settings:
    """Get application settings from environment variables"""
    return Settings(
        wc_key=os.getenv("WC_KEY", ""),
        wc_secret=os.getenv("WC_SECRET", ""),
        wc_url=os.getenv("WC_URL", ""),
        wp_username=os.getenv("WP_USERNAME"),
        wp_secret=os.getenv("WP_SECRET"),
        api_key=os.getenv("API_KEY"),
        verify_ssl=os.getenv("VERIFY_SSL", "true").lower() == "true"
    )

def verify_api_key(
    api_key_header: Optional[str] = Depends(API_KEY_HEADER),
    settings: Settings = Depends(get_settings)
) -> bool:
    """Verify the API key if configured"""
    # If no API key is configured, don't require authentication
    if not settings.api_key:
        return True
    
    # Otherwise, check if provided key matches
    if api_key_header and api_key_header == settings.api_key:
        return True
        
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or missing API key",
        headers={"WWW-Authenticate": "APIKey"},
    )

def get_woo_client(
    auth_valid: bool = Depends(verify_api_key),
    settings: Settings = Depends(get_settings),
    verify_ssl: Optional[bool] = Query(None, description="Override SSL verification (default from server config)")
) -> WooClient:
    """Create a WooClient instance with credentials from environment"""
    if not all([settings.wc_key, settings.wc_secret, settings.wc_url]):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="WooCommerce API credentials not configured"
        )
        
    try:
        # Use the verify_ssl from query param if provided, otherwise use from settings
        ssl_verify = verify_ssl if verify_ssl is not None else settings.verify_ssl
        
        # Create and return the WooClient
        return WooClient(
            api_key=settings.wc_key,
            api_secret=settings.wc_secret,
            store_url=settings.wc_url,
            wp_username=settings.wp_username,
            wp_password=settings.wp_secret,
            verify_ssl=ssl_verify
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Failed to initialize WooCommerce client: {str(e)}"
        )
