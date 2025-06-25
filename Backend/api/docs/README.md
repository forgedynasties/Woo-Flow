# Woo-Flow API Documentation

This document provides an overview of the Woo-Flow API, which serves as a backend for the Woo-Flow application.

## Overview

The Woo-Flow API is built using FastAPI and provides a RESTful interface to WooCommerce functionality. It allows you to manage products, categories, attributes, and media items in your WooCommerce store.

## Authentication

The API uses API key authentication. You need to include the `X-API-Key` header in your requests:

```
X-API-Key: your_api_key_here
```

The API key is configured through the `API_KEY` environment variable.

## Configuration

The API is configured using environment variables:

- `WC_KEY`: WooCommerce API key
- `WC_SECRET`: WooCommerce API secret
- `WC_URL`: WooCommerce store URL
- `WP_USERNAME`: WordPress username (optional, for media uploads)
- `WP_PASSWORD`: WordPress application password (optional, for media uploads)
- `API_KEY`: API key for authenticating with this API (optional)
- `VERIFY_SSL`: Whether to verify SSL certificates (default: true)
- `DEBUG`: Enable debug mode (default: false)

You can set these variables in a `.env` file in the root directory.

## API Endpoints

### Health Check

- `GET /api/health`: Check if the API is running
- `GET /api/settings`: Get current API settings (sensitive information is masked)

### Products

- `GET /api/products`: Get a list of products
- `GET /api/products/{product_id}`: Get a specific product
- `POST /api/products`: Create a new product
- `PUT /api/products/{product_id}`: Update an existing product
- `DELETE /api/products/{product_id}`: Delete a product
- `POST /api/products/upload/csv`: Upload and import products from a CSV file

### Product Variations

- `GET /api/products/{product_id}/variations`: Get variations for a product
- `GET /api/products/{product_id}/variations/{variation_id}`: Get a specific variation
- `POST /api/products/{product_id}/variations`: Create a new variation
- `PUT /api/products/{product_id}/variations/{variation_id}`: Update a variation
- `DELETE /api/products/{product_id}/variations/{variation_id}`: Delete a variation

### Categories

- `GET /api/categories`: Get a list of categories
- `GET /api/categories/{category_id}`: Get a specific category
- `GET /api/categories/slug/{slug}`: Get a category by slug
- `POST /api/categories`: Create a new category
- `POST /api/categories/get-or-create`: Get or create a category
- `POST /api/categories/tree`: Create a category tree from a path
- `PUT /api/categories/{category_id}`: Update a category
- `DELETE /api/categories/{category_id}`: Delete a category

### Attributes

- `GET /api/attributes`: Get a list of attributes
- `GET /api/attributes/{attribute_id}`: Get a specific attribute
- `POST /api/attributes`: Create a new attribute
- `PUT /api/attributes/{attribute_id}`: Update an attribute
- `DELETE /api/attributes/{attribute_id}`: Delete an attribute

### Media

- `POST /api/media`: Create a media item from URL or file path
- `POST /api/media/upload`: Upload a media file directly
- `GET /api/media/{media_id}`: Get a specific media item
- `DELETE /api/media/{media_id}`: Delete a media item

### Store

- `GET /api/store/info`: Get store information
- `GET /api/store/orders`: Get a list of orders

## CSV Import

The API supports bulk product import via CSV file upload.

- **Endpoint**: `POST /api/products/upload/csv`
- **Request Type**: `multipart/form-data`
- **`file`**: The CSV file to upload.

### Example Usage (cURL)

```bash
curl -X POST "http://localhost:8000/api/products/upload/csv" \
     -H "Content-Type: multipart/form-data" \
     -H "X-API-Key: your_api_key" \
     -F "file=@/path/to/your/products.csv"
```

### Response Format

The endpoint returns a JSON object with a summary of the import process:

```json
{
  "created": [
    { "id": 123, "name": "New Product 1", "sku": "NP001" },
    { "id": 124, "name": "New Product 2", "sku": "NP002" }
  ],
  "failed": [
    { "row": 5, "error": "Invalid SKU" }
  ]
}
```

For more details on the required CSV format, see the [sample template](/Backend/examples/csv_sample_template.csv).

## Running the API

To run the API locally:

```bash
uvicorn api.main:app --reload
```

The API will be available at `http://localhost:8000`.

## API Documentation

When the API is running, you can access the automatically generated documentation:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
