import os
import sys
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Add the parent directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from woo_client import WooClient
from models import Product, ProductAttribute, ProductVariation, ProductImage

def get_or_create_attribute(client, name: str, slug: str = None) -> dict:
    """Get an existing attribute or create it if it doesn't exist"""
    # Generate slug if not provided
    if not slug:
        slug = f"pa_{name.lower().replace(' ', '_')}"
    
    # Try to find existing attribute
    attributes = client.attributes.get_attributes(per_page=100)
    for attr in attributes:
        if attr['slug'] == slug:
            print(f"Found existing attribute: {attr['name']} (ID: {attr['id']})")
            return attr
    
    # Create new attribute if not found
    print(f"Creating new attribute: {name}")
    return client.attributes.create_attribute(name=name, slug=slug)

def get_or_create_attribute_term(client, attribute_id: int, name: str) -> dict:
    """Get an existing attribute term or create it if it doesn't exist"""
    # Try to find existing term
    terms = client.attributes.get_attribute_terms(attribute_id, per_page=100)
    for term in terms:
        if term['name'].lower() == name.lower():
            print(f"Found existing term: {term['name']}")
            return term
    
    # Create new term if not found
    print(f"Creating new term: {name}")
    return client.attributes.create_attribute_term(attribute_id=attribute_id, name=name)

def create_global_attribute_example():
    """Example of creating a product with global attributes"""
    # Load environment variables from .env file
    load_dotenv()

    # Get environment variables with validation
    api_key = os.getenv("WC_KEY")
    api_secret = os.getenv("WC_SECRET")
    store_url = os.getenv("WC_URL")

    # Validate required environment variables
    if not all([api_key, api_secret, store_url]):
        print("Error: Missing required environment variables.")
        print("Please create a .env file with the following variables:")
        print("WC_KEY=your_api_key_here")
        print("WC_SECRET=your_api_secret_here")
        print("WC_URL=https://your-store-url.com")
        sys.exit(1)

    # Initialize the client
    client = WooClient(
        api_key=api_key,
        api_secret=api_secret,
        store_url=store_url,
        verify_ssl=False
    )

    try:
        # Get or create the color attribute
        color_attribute = get_or_create_attribute(client, "Color", "pa_color")
        print(f"Using attribute: {color_attribute['name']} (ID: {color_attribute['id']})")

        # Add terms to the global attribute
        color_terms = ["Red", "Blue", "Green"]
        created_terms = []
        for color in color_terms:
            term = get_or_create_attribute_term(client, color_attribute['id'], color)
            created_terms.append(term)
            print(f"Using term: {term['name']} for {color_attribute['name']}")

        # Create a variable product using the global attribute
        product = Product(
            name="T-Shirt with Global Attributes",
            type="variable",
            description="A t-shirt with global color attributes",
            short_description="Comfortable cotton t-shirt",
            attributes=[
                ProductAttribute(
                    name="Color",
                    options=color_terms,
                    variation=True,
                    is_global=True,
                    id=color_attribute['id'],
                    global_slug="pa_color"
                )
            ]
        )

        # Add a default product image
        product.add_image(ProductImage(id=474))  # Replace with actual media ID

        # Create the product
        created_product = client.products.create_product(product)
        print(f"Created variable product with ID: {created_product['id']}")

        # Create variations for each color with their own images
        # In a real scenario, you would have different media IDs for each color
        color_images = {
            "Red": 475,    # Replace with actual media ID for red t-shirt
            "Blue": 476,   # Replace with actual media ID for blue t-shirt
            "Green": 477   # Replace with actual media ID for green t-shirt
        }

        for color in color_terms:
            variation = ProductVariation(
                attributes=[{"name": f"pa_{color_attribute['id']}", "option": color}],
                regular_price="19.99",
                sku=f"TSHIRT-{color.upper()}"
            )
            # Add the color-specific image to the variation
            variation.add_image(ProductImage(id=color_images[color]))
            
            # Create the variation
            response = client.products.create_variation(created_product['id'], variation.to_dict())
            print(f"Created variation for color: {color} with image ID: {color_images[color]}")

    except Exception as e:
        print(f"Error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    create_global_attribute_example() 