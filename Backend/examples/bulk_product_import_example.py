import os
import sys
import logging
import traceback
import pandas as pd
from dotenv import load_dotenv
from datetime import datetime

# Set up path for imports - add parent directory to path
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir)

# Import after path setup
from woo_client import WooClient
from models.csv_product_importer import CSVProductImporter

def check_csv_format(csv_file):
    """Check if the CSV file is properly formatted and return a report"""
    try:
        # First try to read with pandas to diagnose issues
        df = pd.read_csv(csv_file)
        print(f"CSV successfully read with pandas. Shape: {df.shape}")
        return True
    except Exception as e:
        print(f"CSV format issue detected: {str(e)}")
        
        # Try to provide more information about the issue
        try:
            import csv
            with open(csv_file, 'r', encoding='utf-8-sig') as f:
                reader = csv.reader(f)
                headers = next(reader)
                print(f"Found {len(headers)} columns in header row")
                
                # Check first few rows
                for i, row in enumerate(reader, start=2):
                    print(f"Row {i}: {len(row)} fields")
                    if len(row) != len(headers):
                        print(f"  Mismatch! Row {i} has {len(row)} fields but header has {len(headers)}")
                        print(f"  Row content: {row}")
                        break
                    if i >= 10:  # Check at most 10 rows
                        break
        except Exception as csv_error:
            print(f"Error during CSV diagnosis: {str(csv_error)}")
        
        return False

def import_products():
    """Import products from the example CSV file"""
    # Load environment variables
    load_dotenv()
    
    # Create logs directory if it doesn't exist
    logs_dir = os.path.join(parent_dir, "logs")
    if not os.path.exists(logs_dir):
        os.makedirs(logs_dir)
    
    # Set up logging with debug level enabled
    log_filename = f"product_import_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log"
    log_file = os.path.join(logs_dir, log_filename)
    
    logging.basicConfig(
        level=logging.DEBUG,  # Enable DEBUG level for more detailed logs
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
    wp_username = os.getenv('WP_USERNAME')
    wp_password = os.getenv('WP_SECRET')
    
    if not all([api_key, api_secret, store_url]):
        logger.error("Missing required environment variables.")
        logger.error("Please ensure WC_KEY, WC_SECRET, and WC_URL are set in your .env file.")
        return
    
    # Path to the example CSV file
    csv_file = os.path.join(os.path.dirname(__file__), "products copy.csv")
    
    if not os.path.exists(csv_file):
        logger.error(f"CSV file not found: {csv_file}")
        return
    
    # Check CSV format before proceeding
    logger.info("Checking CSV format...")
    if not check_csv_format(csv_file):
        logger.error("CSV format issues detected. Please fix the CSV file before proceeding.")
        return
    
    # Initialize the client
    client = WooClient(
        api_key=api_key,
        api_secret=api_secret,
        store_url=store_url,
        wp_username=wp_username,
        wp_password=wp_password,
        verify_ssl=False  # Use True in production
    )
    
    logger.info("Starting product import process...")
    logger.info(f"Using CSV file: {csv_file}")
    
    try:
        # Initialize the CSV importer
        importer = CSVProductImporter(client, logger=logger)
        
        # Import the products
        start_time = datetime.now()
        results = importer.import_from_file(csv_file)
        end_time = datetime.now()
        
        # Log the results
        duration = (end_time - start_time).total_seconds()
        logger.info(f"Import completed in {duration:.2f} seconds")
        logger.info(f"Successfully created {len(results['created'])} products")
        
        # Log created products
        for product in results['created']:
            logger.info(f"  - {product['name']} (ID: {product['id']}, Type: {product['type']})")
        
        # Log any failures
        if results['failed']:
            logger.warning(f"Failed to create {len(results['failed'])} products/variations")
            for failure in results['failed']:
                logger.warning(f"  - Row {failure['row']}: {failure['error']}")
                
            # Print more detailed failure info for debugging
            for failure in results['failed']:
                logger.debug(f"Failure details for row {failure['row']}:")
                if 'data' in failure:
                    for key, value in failure['data'].items():
                        logger.debug(f"  - {key}: {value}")
        
        # Print success message
        logger.info("Product import complete!")
        logger.info(f"Check the log file for details: {log_file}")
        
        return results
        
    except Exception as e:
        logger.error(f"Error during import: {str(e)}")
        traceback.print_exc()
        return None

if __name__ == "__main__":
    import_products()
