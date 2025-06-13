import os
import sys
import time
import dotenv

# For permanent deletion
#python examples/delete_all_products.py

# To move products to trash instead
#python examples/delete_all_products.py --trash

# Add the parent directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import the WooClient
from woo_client import WooClient

# Load environment variables
dotenv.load_dotenv()

def delete_all_products(force=True):
    """Delete all products from the WordPress store
    
    Args:
        force (bool): Whether to permanently delete products instead of trashing them
    """
    # Create a WooClient with credentials from environment variables
    client = WooClient(
        api_key=os.getenv("WC_KEY"),
        api_secret=os.getenv("WC_SECRET"),
        store_url=os.getenv("WC_URL"),
        verify_ssl=False  # Set to True in production
    )
    
    try:
        # Get a large number of products to ensure we get all of them
        print("Fetching products...")
        products = client.products.get_products(per_page=100)
        
        if not products:
            print("No products found in the store.")
            return
        
        print(f"Found {len(products)} products to delete.")
        
        
        
        # Delete each product
        print("\nDeleting products...")
        for product in products:
            product_id = product['id']
            product_name = product['name']
            
            try:
                print(f"Deleting product ID {product_id}: {product_name}...", end="")
                client.products.delete_product(product_id, force=force)
                print(" ✓ Done")
                
                # Small delay to avoid overwhelming the API
                time.sleep(0.5)
                
            except Exception as e:
                print(f" ✗ Failed: {e}")
                
        print("\nProduct deletion complete.")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":

    # Parse command-line arguments for force flag
    import argparse
    parser = argparse.ArgumentParser(description="Delete all products from WooCommerce")
    parser.add_argument("--trash", action="store_true", help="Move products to trash instead of permanently deleting")
    args = parser.parse_args()
    
    # Run the deletion with force=True for permanent deletion or force=False for trash
    delete_all_products(force=not args.trash)
