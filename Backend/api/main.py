import os
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from typing import List, Dict, Any, Optional
import logging
from pydantic import BaseModel

# Import API routers
from api.routers import products, categories, attributes, media, store
from api.dependencies import get_woo_client, get_settings
from api.models import ErrorResponse, Settings

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger("api")

# Create FastAPI app
app = FastAPI(
    title="Woo-Flow API",
    description="API for managing WooCommerce products and store data (Woo-Flow)",
    version="1.0.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # React development server
        "https://woo-flow.example.com",  # Production frontend
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(store.router, prefix="/api/store", tags=["Store"])
app.include_router(products.router, prefix="/api/products", tags=["Products"])
app.include_router(categories.router, prefix="/api/categories", tags=["Categories"])
app.include_router(attributes.router, prefix="/api/attributes", tags=["Attributes"])
app.include_router(media.router, prefix="/api/media", tags=["Media"])

@app.get("/api/health", tags=["Health"])
async def health_check():
    """Check if the API is running"""
    return {"status": "ok", "version": app.version}

@app.get("/api/settings", response_model=Settings)
async def get_api_settings(settings: Settings = Depends(get_settings)):
    """Get current API settings"""
    # Mask sensitive information
    masked_settings = settings.copy()
    if masked_settings.wc_secret:
        masked_settings.wc_secret = "********"
    if masked_settings.wp_password:
        masked_settings.wp_password = "********"
    return masked_settings

class SSLSettings(BaseModel):
    verify_ssl: bool

@app.post("/api/settings/ssl", response_model=Settings)
async def update_ssl_settings(
    ssl_settings: SSLSettings, 
    current_settings: Settings = Depends(get_settings)
):
    """Update SSL verification settings"""
    # This is a simplified implementation since we're not persisting the settings
    # In a production app, you would save this to a database or environment
    updated_settings = current_settings.copy(update={"verify_ssl": ssl_settings.verify_ssl})
    
    # Mask sensitive information
    if updated_settings.wc_secret:
        updated_settings.wc_secret = "********"
    if updated_settings.wp_password:
        updated_settings.wp_password = "********"
    
    return updated_settings

@app.exception_handler(Exception)
async def generic_exception_handler(request, exc):
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=ErrorResponse(
            code="internal_error",
            message="An internal server error occurred",
            details=str(exc) if os.getenv("DEBUG") == "true" else None
        ).dict()
    )

# When accessing http://localhost:8000/docs, FastAPI automatically generates
# and serves interactive Swagger UI documentation based on your API endpoints.
# This is testing the FastAPI application and not directly the WooCommerce API.
# 
# The Swagger UI lets you try the endpoints that ultimately communicate with WooCommerce,
# but it's an interface for your FastAPI application.
# 
# When you make requests through Swagger UI:
# 1. FastAPI handles the request
# 2. WooClient (your wrapper) is instantiated with your credentials
# 3. WooClient makes the actual request to WooCommerce API
# 4. The response is passed back to FastAPI and shown in the UI

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api.main:app", host="0.0.0.0", port=8000, reload=True)
