# Woo-Kit

A powerful toolkit for managing WooCommerce products with AI-powered description generation and batch processing capabilities.

## Features

### Current Features
- Create simple and variable products with variations
- Manage product attributes and categories
- Handle product images with media ID support
- Batch product creation and updates
- Media upload and management

### Upcoming Features
- CSV-based product management
- AI-powered product description generation
- Batch processing with progress tracking
- React-based frontend dashboard
- FastAPI backend for high-performance operations

## Project Structure

```
Backend/
├── woo_client/         # WooCommerce API client implementation
├── models/            # Data models for products and other entities
├── examples/          # Example scripts and usage patterns
├── tests/            # Test suite
└── api/              # FastAPI implementation (coming soon)
```

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Create a `.env` file with your WooCommerce credentials:
   ```
   WC_KEY=your_api_key
   WC_SECRET=your_api_secret
   WC_URL=your_store_url
   ```

## Usage

### Basic Product Creation
```python
from woo_client import WooClient
from models import Product

client = WooClient(
    api_key="your_api_key",
    api_secret="your_api_secret",
    store_url="your_store_url"
)

# Create a simple product
product = Product(
    name="Test Product",
    type="simple",
    regular_price="19.99",
    description="Product description"
)

created_product = client.products.create_product(product)
```

### Working with Media
```python
# Upload an image from URL and add it to a product
product.add_image_from_url(
    client=client,
    image_url="https://example.com/image.jpg",
    alt_text="Product Image"
)

# Upload an image from local file and add it to a product
product.add_image_from_path(
    client=client,
    file_path="/path/to/local/image.jpg",
    alt_text="Product Image"
)
```

### Working with Categories
```python
# Get or create categories
main_category = client.categories.get_or_create_category(name="Electronics")
sub_category = client.categories.get_or_create_category(
    name="Laptops", 
    parent=main_category['id']
)

# Create nested categories with a path
leaf_category = client.categories.get_or_create_category_tree("Home/Kitchen/Appliances")

# Add a category to a product by ID
product.add_category(category_id)

# Add a category using a slug
product.add_category("electronics")

# Add a category with its full hierarchy
product.add_category(
    category="Electronics/Computers/Laptops", 
    include_hierarchy=True, 
    client=client
)
```

### Creating Variable Products
See `examples/create_test_product.py` for detailed examples of creating variable products with variations.

## Upcoming Features

### CSV Product Management
- Import products from CSV files
- Display products in a WordPress-like dashboard
- Batch processing with progress tracking
- AI-powered description generation

### Frontend Dashboard
- React-based user interface
- Real-time progress tracking
- Product preview and management
- Configuration settings

### API Integration
- FastAPI backend for high-performance operations
- Batch processing endpoints
- AI integration for description generation
- Configuration management

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - see LICENSE file for details