import os
import sys
from dotenv import load_dotenv

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from models import Product, ProductAttribute, ProductCategory, ProductImage, ProductVariation
from woo_client import WooClient

def create_product_with_attributes():
    """Example of creating a product with both global and local attributes"""
    # Load environment variables
    load_dotenv()
    
    # Get API credentials from environment
    api_key = os.getenv('WC_KEY')
    api_secret = os.getenv('WC_SECRET')
    store_url = os.getenv('WC_URL')
    
    if not all([api_key, api_secret, store_url]):
        raise ValueError("Missing required environment variables. Please check your .env file.")
    
    # Initialize the client
    client = WooClient(api_key, api_secret, store_url, verify_ssl=False)
    
    # Get or create the global attribute (Color)
    color_attribute = client.attributes.get_or_create_attribute("Color")
    print(f"Using attribute: {color_attribute['name']}")
    
    # Add terms to the color attribute
    color_terms = []
    for color in ["Red", "Blue", "Green"]:
        term = client.attributes.get_or_create_term(color_attribute['id'], color)
        color_terms.append(term)
        print(f"Using term: {term['name']}")
        
    # Media IDs for product and variations
    # In a real-world scenario, you would upload these using the media client
    # For this example, we're using placeholder IDs that should exist in your store
    main_product_image_id = 474  # Replace with an actual media ID from your store
    variation_image_ids = {
        "Red": 475,     # Replace with actual media IDs
        "Blue": 476,
        "Green": 477
    }
    
    # Create a product with both global and local attributes
    product = Product(
        name="T-Shirt with Attributes",
        type="variable",
        description="A t-shirt with both global (Color) and local (Size) attributes",
        regular_price="19.99",
        attributes=[
            # Global attribute (Color)
            ProductAttribute(
                id=color_attribute['id'],
                name="Color",
                position=0,
                visible=True,
                variation=True,
                options=[term['name'] for term in color_terms],
                is_global=True,
                global_slug=f"pa_{color_attribute['slug']}" if 'slug' in color_attribute else None
            ),
            # Local attribute (Size)
            ProductAttribute(
                name="Size",
                position=1,
                visible=True,
                variation=True,
                options=["Small", "Medium", "Large"]
            )
        ]
    )
    
    # Add the main product image using a media ID
    product.add_image(main_product_image_id)
    
    # Create the product
    created_product = client.products.create_product(product)
    print(f"\nCreated product: {created_product['name']}")
    
    # Create variations for each combination
    for color in [term['name'] for term in color_terms]:
        for size in ["Small", "Medium", "Large"]:
            variation = ProductVariation(
                attributes=[
                    # For global attributes, pass the ID directly as integer
                    {"id": color_attribute['id'], "option": color},
                    # For local attributes, use the name
                    {"name": "Size", "option": size}
                ],
                regular_price="19.99",
                sku=f"TSHIRT-{color.upper()}-{size.upper()}"
            )
            
            # Add the variation-specific image using a media ID
            variation.add_image(variation_image_ids.get(color, main_product_image_id))
            
            # Create the variation
            client.products.create_variation(created_product['id'], variation)
            print(f"Created variation: Color={color}, Size={size}")
    
    return created_product

if __name__ == "__main__":
    create_product_with_attributes()