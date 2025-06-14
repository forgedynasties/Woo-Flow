# Product Creation Documentation

This guide explains how to create products using the Woo-Kit backend library. The library provides a robust set of tools for creating both simple and variable products with various attributes, categories, and variations.

## Table of Contents
1. [Basic Concepts](#basic-concepts)
2. [Creating Simple Products](#creating-simple-products)
3. [Creating Variable Products](#creating-variable-products)
4. [Product Attributes](#product-attributes)
5. [Product Categories](#product-categories)
6. [Product Images](#product-images)
7. [Inventory Management](#inventory-management)
8. [Sale Prices](#sale-prices)

## Basic Concepts

The library provides several key classes for product management:

- `Product`: The main class for creating and managing products
- `ProductAttribute`: For defining product attributes (e.g., size, color)
- `ProductCategory`: For managing product categories
- `ProductImage`: For handling product images
- `ProductVariation`: For creating product variations

## Creating Simple Products

Simple products are the most basic type of product with no variations. Here's how to create one:

```python
from models import Product

# Create a simple product using the factory method
product = Product.create_simple(
    name="Basic T-Shirt",
    price="19.99",
    description="A comfortable cotton t-shirt",
    short_description="Comfortable cotton t-shirt",
    sku="TSHIRT-001",
    stock_quantity=100,
    manage_stock=True
)

# Add a category
product.add_category(ProductCategory(id=1, name="Clothing"))

# Set a sale price
product.set_sale(
    sale_price="14.99",
    end_date=datetime.now() + timedelta(days=7)
)
```

## Creating Variable Products

Variable products have multiple variations based on attributes. Here's how to create one:

```python
from models import Product, ProductAttribute, ProductVariation

# Create attributes for the variable product
size_attr = ProductAttribute(
    name="Size",
    options=["Small", "Medium", "Large", "X-Large"],
    variation=True
)

color_attr = ProductAttribute(
    name="Color",
    options=["Red", "Blue", "Black"],
    variation=True
)

# Create the variable product
product = Product.create_variable(
    name="Premium T-Shirt",
    description="A premium quality t-shirt with multiple options",
    short_description="Premium quality t-shirt",
    attributes=[size_attr, color_attr]
)

# Add variations
variation = ProductVariation(
    attributes=[
        {"name": "Size", "option": "Small"},
        {"name": "Color", "option": "Red"}
    ],
    regular_price="29.99",
    sku="TSHIRT-PREMIUM-S-RED",
    stock_quantity=50,
    manage_stock=True
)
product.add_variation(variation)
```

## Product Attributes

Attributes define the characteristics of a product. They can be used for both simple and variable products:

```python
# Create a non-variation attribute
material_attr = ProductAttribute(
    name="Material",
    options=["Cotton", "Polyester"],
    position=0,
    visible=True,
    variation=False
)

# Create a variation attribute
size_attr = ProductAttribute(
    name="Size",
    options=["Small", "Medium", "Large"],
    position=1,
    visible=True,
    variation=True
)
```

## Product Categories

Categories help organize products in your store:

```python
# Add a category to a product by ID
product.add_category(1)  # Using category ID

# Add a category to a product by slug
product.add_category("clothing", client=client)  # Using category slug with client for lookup

# Add a category with its full hierarchy (will include all parent categories)
product.add_category(
    category="tables",  # Just specify the leaf category slug
    include_hierarchy=True,
    client=client  # Client is needed to fetch the hierarchy
)
```

You can also use the ProductCategory class directly:

```python
from models import ProductCategory

product.add_category(ProductCategory(id=1, name="Clothing"))
```

## Product Images

Images can be added to products using URLs:

```python
# Add an image to a product
product.add_image(ProductImage(
    src="https://example.com/tshirt.jpg",
    alt="Basic T-Shirt Image"
))
```

## Inventory Management

You can manage product inventory using the following methods:

```python
# Set stock management for a product
product.set_stock(
    quantity=75,
    manage=True  # Enable stock management
)
```

## Sale Prices

Set sale prices with optional end dates:

```python
# Set a sale price with end date
product.set_sale(
    sale_price="19.99",
    end_date=datetime.now() + timedelta(days=14)
)
```

## Best Practices

1. **SKU Management**: Always provide unique SKUs for products and variations
2. **Stock Management**: Enable stock management for products that need inventory tracking
3. **Attributes**: Use variation attributes only when creating variable products
4. **Categories**: Assign products to appropriate categories for better organization
5. **Images**: Provide high-quality images with descriptive alt text
6. **Descriptions**: Write clear and detailed product descriptions
7. **Sale Prices**: Set end dates for sale prices to automatically revert to regular prices

## Error Handling

The library includes validation for:
- Price formats
- SKU formats
- Required fields for variable products
- Image URL formats
- Attribute options

Make sure to handle these validations when creating products.

## API Integration

To create products in your WooCommerce store:

```python
from woo_client import WooClient

# Initialize the client
client = WooClient(
    api_key="your_api_key",
    api_secret="your_api_secret",
    store_url="your_store_url",
    verify_ssl=False  # Set to True in production
)

# Create a product
response = client.products.create_product(product.to_dict())
```

Remember to handle API responses and errors appropriately in your implementation.