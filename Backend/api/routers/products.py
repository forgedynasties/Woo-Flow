from fastapi import APIRouter, Depends, HTTPException, status, Query, Path, File, UploadFile
from typing import List, Dict, Any, Optional
import shutil
import os
import logging

from woo_client import WooClient
from api.dependencies import get_woo_client
from api.models import (
    ProductCreate, ProductUpdate, ProductResponse,
    VariationCreate, VariationUpdate, VariationResponse,
    ErrorResponse, ProductStatus
)
from models import Product
from models.csv_product_importer import CSVProductImporter

router = APIRouter()

# Get a logger instance
logger = logging.getLogger(__name__)

@router.get("/count", summary="Get total product count", response_model=dict)
async def get_product_count(
    woo_client: WooClient = Depends(get_woo_client)
):
    """Get the total number of products"""
    try:
        # Try to use WooCommerce API's HEAD request or meta if available
        # Fallback: fetch first page and get total from headers or count
        products = woo_client.products.get_products(per_page=1, page=1)
        # If WooClient exposes total count, use it; else, fallback to len(products)
        total = 0
        if hasattr(woo_client.products, 'last_response') and hasattr(woo_client.products.last_response, 'headers'):
            headers = woo_client.products.last_response.headers
            if 'X-WP-Total' in headers:
                total = int(headers['X-WP-Total'])
        if not total:
            # Fallback: use length of returned products (not accurate for large stores)
            total = len(products)
        return {"count": total}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get product count: {str(e)}"
        )

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

@router.post("/upload/csv", summary="Upload and import products from a CSV file", response_model=Dict[str, Any])
async def upload_and_import_csv(
    file: UploadFile = File(..., description="CSV file containing product data."),
    woo_client: WooClient = Depends(get_woo_client)
):
    """
    Uploads a CSV file to import products into WooCommerce.

    This endpoint provides a robust way to bulk-create products, including simple,
    variable, and variation types. The CSV is processed by the backend, which
    handles parsing and product creation.

    ### CSV Format:

    The CSV file must have a header row. The following are key columns:

    - **`type`**: `simple`, `variable`, or `variation`. This is crucial.
    - **`name`**: Product name. Required for `simple` and `variable` types.
    - **`sku`**: Stock Keeping Unit. Must be unique.
    - **`regular_price`**: The product's regular price.
    - **`sale_price`**: The product's sale price (optional).
    - **`description`**: Detailed product description (optional).
    - **`short_description`**: Brief product summary (optional).
    - **`categories`**: Comma-separated list of category names (e.g., "Clothing, T-Shirts").
    - **`images`**: Comma-separated list of image URLs.
    - **`manage_stock`**: `TRUE` or `FALSE`.
    - **`stock_quantity`**: The number of items in stock.
    - **`Attribute: {Name}`**: For defining attributes (e.g., `Attribute: Color`).
      - For variations, the value in this column specifies the term (e.g., "Blue").
      - For variable products, provide a comma-separated list of terms (e.g., "Blue, Green, Red").

    #### Simple Products:
    - Set `type` to `simple`.
    - Fill in standard product details like `name`, `sku`, `price`, etc.

    #### Variable Products & Variations:
    1.  **Parent `variable` product**:
        - Set `type` to `variable`.
        - Define the attributes for variations in `Attribute: {Name}` columns
          (e.g., `Attribute: Color` with value "Blue, Green", `Attribute: Size` with value "S, M, L").
    2.  **Child `variation` products**:
        - Add a new row for each variation immediately after the parent.
        - Set `type` to `variation`.
        - Set the specific attribute value for that variation (e.g., `Attribute: Color` with value "Blue").
        - **Important**: The `sku` and `regular_price` for variations are required.

    ### Processing:
    1. The uploaded file is saved temporarily on the server.
    2. The `CSVProductImporter` is used to parse the file and interact with the WooCommerce API.
    3. After processing, the temporary file is deleted.

    ### Response:
    - Returns a JSON object with a summary of the import, including `created` and `failed` lists.
    - The `failed` list will contain details on which rows failed and why.
    """
    # Create a temporary file to store the upload
    temp_dir = "temp_uploads"
    os.makedirs(temp_dir, exist_ok=True)
    temp_file_path = os.path.join(temp_dir, file.filename)

    try:
        # Save the uploaded file
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        logger.info(f"CSV file '{file.filename}' uploaded and saved to '{temp_file_path}'.")

        # Initialize the importer
        importer = CSVProductImporter(client=woo_client, logger=logger)

        # Start the import process
        results = importer.import_from_file(temp_file_path)
        
        # Check for errors in the results and return appropriate status
        if "error" in results:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to process CSV file: {results['error']}"
            )
            
        logger.info(f"Import finished for '{file.filename}'. Results: {results}")
        
        return results

    except HTTPException as http_exc:
        # Re-raise HTTP exceptions to be handled by FastAPI
        raise http_exc
    except Exception as e:
        logger.error(f"An unexpected error occurred during CSV import: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {str(e)}"
        )
    finally:
        # Ensure the temporary file is deleted
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
            logger.info(f"Temporary file '{temp_file_path}' deleted.")
        
        # Close the uploaded file
        file.file.close()
