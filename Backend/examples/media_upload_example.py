import os
import sys
from dotenv import load_dotenv

# Add parent directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from woo_client import WooClient
from models import Product, ProductImage

def upload_and_use_media_example():
    """Example of uploading media and using it with products"""
    # Load environment variables
    load_dotenv()
    
    # Get API credentials
    api_key = os.getenv('WC_KEY')
    api_secret = os.getenv('WC_SECRET')
    store_url = os.getenv('WC_URL')
    
    if not all([api_key, api_secret, store_url]):
        raise ValueError("Missing required environment variables. Please check your .env file.")
    
    # Initialize WooCommerce client
    client = WooClient(
        api_key=api_key,
        api_secret=api_secret,
        store_url=store_url,
        verify_ssl=False
    )
    
    try:
        # Example 1: Upload an image from URL
        print("Uploading image from URL...")
        image_url = "https://example.com/path/to/image.jpg"  # Replace with a real image URL
        uploaded_image = client.media.create_media_from_url(
            image_url=image_url,
            alt_text="Sample product image",
            title="Product Image"
        )
        print(f"Uploaded image with ID: {uploaded_image['id']}")
        
        # Example 2: Upload an image from a local file (if available)
        image_path = os.path.join(os.path.dirname(__file__), "sample_images", "product.jpg")
        if os.path.exists(image_path):
            print("\nUploading image from local file...")
            local_image = client.media.create_media_from_file(
                file_path=image_path,
                alt_text="Local product image",
                title="Local Product Image"
            )
            print(f"Uploaded local image with ID: {local_image['id']}")
            media_id = local_image['id']
        else:
            print("\nLocal image file not found. Using URL uploaded image ID instead.")
            media_id = uploaded_image['id']
        
        # Example 3: Create a product using the media ID
        print("\nCreating product with uploaded image...")
        product = Product.create_simple(
            name="Product with Media ID",
            price="29.99",
            description="This product uses a media ID for its image",
            short_description="Product with media ID"
        )
        
        # Add the image using the media ID
        product.add_image(media_id)
        
        # Create the product
        created_product = client.products.create_product(product)
        print(f"Created product with ID: {created_product['id']}")
        print(f"Product image ID: {created_product['images'][0]['id'] if 'images' in created_product and created_product['images'] else 'No image'}")
        
        return {
            "media_id": media_id,
            "product_id": created_product['id']
        }
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return None

if __name__ == "__main__":
    upload_and_use_media_example()
