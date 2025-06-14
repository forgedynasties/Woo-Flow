# CSV Product Import

This document explains how to use the CSV product import functionality in the Woo-Kit library to bulk import products into WooCommerce.

## Overview

The CSV import feature allows you to:

- Import simple and variable products
- Automatically create variations for variable products
- Support both local and global attributes
- Add images from both URLs and local file paths
- Set product categories, including category hierarchies
- Manage inventory and stock status

## CSV Format

The CSV file should have the following format:

| Column | Description | Required |
|--------|-------------|----------|
| type | Product type: 'simple' or 'variable' or 'variation' | Yes |
| sku | Product SKU | No |
| name | Product name/title | Yes (except for variations) |
| description | Full product description | No |
| short_description | Short product description | No |
| regular_price | Regular price | Yes (except for variations) |
| sale_price | Sale price | No |
| manage_stock | Whether to manage stock (true/false) | No |
| stock_quantity | Stock quantity | No |
| stock_status | Stock status: 'instock', 'outofstock', 'onbackorder' | No |
| status | Product status: 'publish', 'draft', 'pending', 'private' | No |
| category_1, category_2, etc. | Product categories | No |
| include_hierarchy_1, include_hierarchy_2, etc. | Whether to include category hierarchy (true/false) | No |
| image_1, image_2, etc. | Product images (URLs or file paths) | No |
| attr_name_1, attr_name_2, etc. | Attribute names | No |
| attr_value_1, attr_value_2, etc. | Attribute values (comma-separated) | No |
| attr_var_1, attr_var_2, etc. | Whether attribute is for variation (true/false) | No |

## Variable Products and Variations

Variable products should be defined with `type=variable` followed by multiple rows with `type=variation`. Each variation automatically belongs to the preceding variable product.

For variations:
- You don't need to provide name, description, and short_description
- You should provide specific attribute values for each variation
- Only provide attributes that are marked as variation attributes
- Variation-specific pricing should be set in each variation row

## Global Attributes

Global attributes are identified by names that start with `pa_`. For example, `pa_color` is a global attribute for color. The importer will:

1. Look up the global attribute by slug
2. Use the attribute's ID when creating products
3. Ensure that attribute terms exist

## Example

Here's a simple example of how a CSV might look:

```
type,sku,name,description,short_description,regular_price,sale_price,attr_name_1,attr_value_1,attr_var_1,attr_name_2,attr_value_2,attr_var_2,image_1
simple,TS001,T-Shirt,A cotton t-shirt,Simple t-shirt,19.99,17.99,Material,"Cotton, Polyester",false,,,https://example.com/tshirt.jpg
variable,HDY001,Hoodie,A warm hoodie,Warm hoodie,29.99,,pa_color,"Red,Blue,Green",true,Size,"S,M,L",true,https://example.com/hoodie.jpg
variation,HDY001-RED-S,,,,,27.99,pa_color,Red,,Size,S,,https://example.com/hoodie-red.jpg
variation,HDY001-BLUE-M,,,,,27.99,pa_color,Blue,,Size,M,,https://example.com/hoodie-blue.jpg
```

## Usage

To import products from a CSV file:

```python
from models import CSVProductImporter
from woo_client import WooClient
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize WooCommerce client
client = WooClient(
    api_key="your_api_key",
    api_secret="your_api_secret",
    store_url="https://your-store.com",
    wp_username="your_username",  # Required for image uploads
    wp_password="your_app_password",  # Required for image uploads
    verify_ssl=True
)

# Create the importer
importer = CSVProductImporter(client, logger=logger)

# Import products from CSV
results = importer.import_from_file("path/to/your/products.csv")

# Check results
print(f"Created {len(results['created'])} products")
print(f"Failed to create {len(results['failed'])} products")
```

## Best Practices

1. **Test with a small CSV file first** before importing a large number of products.
2. **Include SKUs** for easier product management and identification.
3. **Use absolute paths for local images** or URLs for remote images.
4. **For global attributes**, make sure they already exist in your WooCommerce store or use the Attribute API to create them first.
5. **Use consistent attribute names** across your CSV file.
6. **For variations**, make sure all required attributes are specified.

## Troubleshooting

If you encounter issues during import:

- Check the logs for detailed error messages
- Verify your CSV format follows the expected structure
- Ensure all required fields are provided
- For image failures, check file paths and URL accessibility
- For global attribute failures, verify they exist in your store
