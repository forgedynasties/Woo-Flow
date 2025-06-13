import os
import sys
from dotenv import load_dotenv
import tempfile
import requests
from urllib.parse import urlparse
from pathlib import Path

# Add parent directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from woo_client import WooClient
from models import Product, ProductAttribute, ProductVariation

def download_temp_image(url: str) -> str:
    """Download an image to a temporary file and return the path"""
    response = requests.get(url, stream=True)
    if response.status_code != 200:
        raise Exception(f"Failed to download image from {url}")
        
    # Get filename from URL or generate one
    url_path = urlparse(url).path
    filename = os.path.basename(url_path)
    if not filename or '?' in filename:
        ext = '.jpg'  # Default extension
        # Try to determine extension from content type
        content_type = response.headers.get('Content-Type', '')
        if 'png' in content_type:
            ext = '.png'
        elif 'gif' in content_type:
            ext = '.gif'
        elif 'webp' in content_type:
            ext = '.webp'
        filename = f"temp_image{ext}"
    
    # Create a temporary file with proper extension
    # Get the base name and extension
    base_name, extension = os.path.splitext(filename)
    
    # Create temporary file with the right extension
    temp_file = tempfile.NamedTemporaryFile(suffix=extension, delete=False)
    
    # Download the file
    for chunk in response.iter_content(chunk_size=8192):
        temp_file.write(chunk)
    temp_file.close()
    
    return temp_file.name

def create_variable_product_with_image_uploads():
    """Example of creating a variable product with image uploads from URLs and local files"""
    # Load environment variables
    load_dotenv()
    
    # Get API credentials
    api_key = os.getenv('WC_KEY')
    api_secret = os.getenv('WC_SECRET')
    store_url = os.getenv('WC_URL')
    wp_username = os.getenv('WP_USERNAME')
    wp_password = os.getenv('WP_SECRET')
    
    if not all([api_key, api_secret, store_url, wp_username, wp_password]):
        raise ValueError("Missing required environment variables. Check your .env file.")
    
    # Initialize client with WordPress credentials for media uploads
    client = WooClient(
        api_key=api_key,
        api_secret=api_secret,
        store_url=store_url,
        wp_username=wp_username,
        wp_password=wp_password,
        verify_ssl=False
    )
    
    # Example image URLs
    main_image_url = "https://windsoruk.co.uk/wp-content/uploads/CLG003-legend-nuie-web.png"
    
    # Images for variations - mix of URLs and local paths
    variation_images = {
        "Red": "https://windsoruk.co.uk/wp-content/uploads/Carlton-basin.jpg",  # Remote URL
        "Blue": "C:/Users/Ali/Desktop/2.webp",  # Local file path
        "Green": "https://windsoruk.co.uk/wp-content/uploads/Carlton-1.jpg"  # Remote URL
    }
    
    # Check if the local file exists and handle appropriately
    if not os.path.exists(variation_images["Blue"]):
        print(f"Warning: Local image file not found at {variation_images['Blue']}")
        print("Falling back to a remote URL for Blue variation image")
        # Fallback to a remote URL
        variation_images["Blue"] = "https://windsoruk.co.uk/wp-content/uploads/SA2800.jpg"
    else:
        print(f"Using local image file: {variation_images['Blue']}")
    
    try:
        print("\n1. Creating variable product with color attribute...")
        # Create a variable product with color attribute
        product = Product(
            name="Demo Product with Uploaded Images",
            type="variable",
            description="A demo product showing image upload capabilities",
            short_description="Demo product with uploaded images",
            attributes=[
                # Color attribute
                ProductAttribute(
                    name="Color",
                    position=0,
                    visible=True,
                    variation=True,
                    options=["Red", "Blue", "Green"]
                )
            ]
        )
        
        # Upload and add the main product image from URL
        print("\n2. Uploading main product image...")
        main_image_id = product.add_image_from_path_or_url(
            client=client,
            path_or_url=main_image_url,
            alt_text="Main product image",
            title="Demo Product Main Image"
        )
        print(f"   - Main image uploaded with ID: {main_image_id}")
        
        # Create the product in WooCommerce
        print("\n3. Creating the product in WooCommerce...")
        created_product = client.products.create_product(product)
        print(f"   - Product created with ID: {created_product['id']}")
        
        # Create variations with different images
        print("\n4. Creating variations with their own images...")
        
        # Red variation with image from URL
        red_variation = ProductVariation(
            attributes=[{"name": "Color", "option": "Red"}],
            regular_price="19.99",
            sku=f"DEMO-RED"
        )
        red_image_id = red_variation.add_image_from_path_or_url(
            client=client,
            path_or_url=variation_images["Red"],
            alt_text="Red variation image",
            title="Demo Product - Red"
        )
        print(f"   - Red variation image uploaded with ID: {red_image_id}")
        client.products.create_variation(created_product['id'], red_variation)
        print("   - Red variation created")
        
        # Blue variation with image from local file or fallback URL
        blue_variation = ProductVariation(
            attributes=[{"name": "Color", "option": "Blue"}],
            regular_price="19.99",
            sku=f"DEMO-BLUE"
        )
        
        try:
            print(f"   - Uploading Blue variation image from: {variation_images['Blue']}")
            blue_image_id = blue_variation.add_image_from_path_or_url(
                client=client,
                path_or_url=variation_images["Blue"],
                alt_text="Blue variation image",
                title="Demo Product - Blue"
            )
            print(f"   - Blue variation image uploaded with ID: {blue_image_id}")
        except Exception as img_error:
            print(f"   - Error uploading Blue variation image: {str(img_error)}")
            print("   - Creating Blue variation without an image")
            blue_image_id = None
            
        client.products.create_variation(created_product['id'], blue_variation)
        print("   - Blue variation created")
        
        # Green variation with image from URL
        green_variation = ProductVariation(
            attributes=[{"name": "Color", "option": "Green"}],
            regular_price="19.99",
            sku=f"DEMO-GREEN"
        )
        green_image_id = green_variation.add_image_from_path_or_url(
            client=client,
            path_or_url=variation_images["Green"],
            alt_text="Green variation image",
            title="Demo Product - Green"
        )
        print(f"   - Green variation image uploaded with ID: {green_image_id}")
        client.products.create_variation(created_product['id'], green_variation)
        print("   - Green variation created")
        
        print("\n5. Product creation complete!")
        print(f"   - View the product here: {store_url}/wp-admin/post.php?post={created_product['id']}&action=edit")
        
        return {
            "product_id": created_product['id'],
            "image_ids": {
                "main": main_image_id,
                "red": red_image_id,
                "blue": blue_image_id,
                "green": green_image_id
            }
        }
        
    except Exception as e:
        print(f"Error: {str(e)}")
        import traceback
        traceback.print_exc()  # Print full stack trace for better debugging
        return None

if __name__ == "__main__":
    create_variable_product_with_image_uploads()
