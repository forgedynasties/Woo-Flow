import os
import sys
import logging
from dotenv import load_dotenv
from pathlib import Path
from datetime import datetime

# Set up path for imports - add parent directory to path
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir)

# Import after path setup
from woo_client import WooClient
from models.csv_product_importer import CSVProductImporter

# Create logs directory if it doesn't exist
logs_dir = os.path.join(parent_dir, "logs")
if not os.path.exists(logs_dir):
    os.makedirs(logs_dir)

# Configure logging
log_filename = f"csv_import_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log"
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

def import_products_from_csv(csv_file_path: str):
    """
    Import products from a CSV file into WooCommerce
    
    Args:
        csv_file_path: Path to the CSV file
    """
    # Load environment variables
    load_dotenv()
    
    # Get API credentials
    api_key = os.getenv('WC_KEY')
    api_secret = os.getenv('WC_SECRET')
    store_url = os.getenv('WC_URL')
    wp_username = os.getenv('WP_USERNAME')
    wp_password = os.getenv('WP_SECRET')
    
    if not all([api_key, api_secret, store_url]):
        logger.error("Missing required environment variables. Check your .env file.")
        sys.exit(1)
    
    if not all([wp_username, wp_password]):
        logger.warning("WordPress credentials not found. Image uploads may fail.")
    
    # Check if the file exists
    if not os.path.exists(csv_file_path):
        logger.error(f"CSV file not found: {csv_file_path}")
        sys.exit(1)
    
    try:
        logger.info(f"Starting import from {csv_file_path}")
        
        # Initialize the WooCommerce client
        client = WooClient(
            api_key=api_key,
            api_secret=api_secret,
            store_url=store_url,
            wp_username=wp_username,
            wp_password=wp_password,
            verify_ssl=False
        )
        
        # Create the CSV importer
        importer = CSVProductImporter(client, logger=logger)
        
        # Import products from the CSV file
        results = importer.import_from_file(csv_file_path)
        
        # Print results
        logger.info(f"Import complete. Created {len(results['created'])} products.")
        
        if results['created']:
            logger.info("Created products:")
            for product in results['created']:
                logger.info(f"  - {product['name']} (ID: {product['id']}, Type: {product.get('type', 'unknown')}, SKU: {product.get('sku', 'no-sku')})")
        
        if results['failed']:
            logger.warning(f"Failed to create {len(results['failed'])} products.")
            for failure in results['failed']:
                logger.warning(f"  - Row {failure['row']}: {failure['error']}")
        
        logger.info(f"Check the log file for details: {log_file}")
        return results
        
    except Exception as e:
        logger.error(f"Error during import: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return {"error": str(e)}

if __name__ == "__main__":
    # Check if a CSV file path was provided as a command-line argument
    if len(sys.argv) > 1:
        csv_path = sys.argv[1]
    else:
        # Use the example CSV file
        csv_path = os.path.join(os.path.dirname(__file__), "products copy.csv")
    
    import_products_from_csv(csv_path)
