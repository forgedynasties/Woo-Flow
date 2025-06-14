import os
import sys
import logging
from dotenv import load_dotenv
from datetime import datetime

# Set up path for imports
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir)

from woo_client import WooClient
from models import Product

def category_hierarchy_example():
    """Example showing how to work with category hierarchies"""
    # Load environment variables
    load_dotenv()
    
    # Create logs directory if it doesn't exist
    logs_dir = os.path.join(parent_dir, "logs")
    if not os.path.exists(logs_dir):
        os.makedirs(logs_dir)
    
    # Set up logging
    log_filename = f"category_example_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log"
    log_file = os.path.join(logs_dir, log_filename)
    
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s',
        handlers=[
            logging.StreamHandler(),
            logging.FileHandler(log_file)
        ]
    )
    logger = logging.getLogger(__name__)
    
    # Get API credentials
    api_key = os.getenv('WC_KEY')
    api_secret = os.getenv('WC_SECRET')
    store_url = os.getenv('WC_URL')
    
    if not all([api_key, api_secret, store_url]):
        logger.error("Missing required environment variables. Check your .env file.")
        return
    
    # Initialize client
    client = WooClient(
        api_key=api_key,
        api_secret=api_secret,
        store_url=store_url,
        verify_ssl=False
    )
    
    try:
        # Example 1: Create a simple product with flat categories
        logger.info("\nExample 1: Create product with individual categories")
        
        product1 = Product.create_simple(
            name="Test Product 1",
            price="19.99",
            description="This product has flat categories",
            short_description="Flat categories"
        )
        
        # Add individual categories - these will be added as separate categories
        product1.add_category("Clothing", client=client)
        product1.add_category("T-Shirts", client=client)
        
        result1 = client.products.create_product(product1)
        logger.info(f"Created product with ID: {result1['id']}")
        logger.info(f"Categories: {[cat['name'] for cat in result1.get('categories', [])]}")
        
        # Example 2: Create a product with category hierarchy
        logger.info("\nExample 2: Create product with category hierarchy")
        
        product2 = Product.create_simple(
            name="Test Product 2",
            price="29.99",
            description="This product uses category hierarchy",
            short_description="Category hierarchy"
        )
        
        # Add a category with its full hierarchy
        # If this is "Shoes > Women > Running", it will add 
        # "Shoes", "Women", and "Running" categories as a proper hierarchy
        product2.add_category(
            category="Running", 
            include_hierarchy=True,
            client=client
        )
        
        result2 = client.products.create_product(product2)
        logger.info(f"Created product with ID: {result2['id']}")
        logger.info(f"Categories: {[cat['name'] for cat in result2.get('categories', [])]}")
        
        return {
            "product1_id": result1['id'],
            "product2_id": result2['id']
        }
        
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return None
        
if __name__ == "__main__":
    category_hierarchy_example()
