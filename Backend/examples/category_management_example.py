import os
import sys
from dotenv import load_dotenv

# Add parent directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from woo_client import WooClient
from models import Product


def category_management_example():
    """Example demonstrating category management capabilities"""
    # Load environment variables
    load_dotenv()
    
    # Get API credentials
    api_key = os.getenv('WC_KEY')
    api_secret = os.getenv('WC_SECRET')
    store_url = os.getenv('WC_URL')
    wp_username = os.getenv('WP_USERNAME')
    wp_password = os.getenv('WP_SECRET')
    
    if not all([api_key, api_secret, store_url]):
        raise ValueError("Missing required environment variables. Please check your .env file.")
    
    # Initialize the client
    client = WooClient(
        api_key=api_key,
        api_secret=api_secret,
        store_url=store_url,
        wp_username=wp_username,
        wp_password=wp_password,
        verify_ssl=False
    )
    
    try:
        # Part 1: Creating a category hierarchy
        print("\n1. Creating category hierarchy...")
        furniture_category = client.categories.get_or_create_category(name="Furniture")
        print(f"  - Created/found main category: Furniture (ID: {furniture_category['id']})")
        
        # Create a subcategory
        living_room = client.categories.get_or_create_category(
            name="Living Room", 
            parent=furniture_category['id']
        )
        print(f"  - Created/found subcategory: Living Room (ID: {living_room['id']})")
        
        # Create a deeper subcategory
        sofas = client.categories.get_or_create_category(
            name="Sofas", 
            parent=living_room['id']
        )
        print(f"  - Created/found subcategory: Sofas (ID: {sofas['id']})")
        
        # Part 2: Creating multiple categories at once with a path
        print("\n2. Creating categories with path notation...")
        kitchen_appliances = client.categories.get_or_create_category_tree("Kitchen/Appliances/Refrigerators")
        print(f"  - Created category tree: Kitchen/Appliances/Refrigerators (Leaf ID: {kitchen_appliances['id']})")
        
        # Part 3: Creating a product with categories by ID
        print("\n3. Creating a product with categories by ID...")
        sofa_product = Product.create_simple(
            name="Modern Sofa",
            price="599.99",
            description="A comfortable modern sofa for your living room.",
            short_description="Modern comfortable sofa"
        )
        
        # Add category by ID
        sofa_product.add_category(sofas['id'])
        
        created_sofa = client.products.create_product(sofa_product)
        print(f"  - Created product: {created_sofa['name']} with category ID: {sofas['id']}")
        
        # Part 4: Creating a product with category by slug
        print("\n4. Creating a product with category by slug...")
        fridge_product = Product.create_simple(
            name="Energy Star Refrigerator",
            price="899.99",
            description="Energy efficient refrigerator with advanced features.",
            short_description="Energy efficient refrigerator"
        )
        
        # Add category by slug (now passing the client so it can look up the ID)
        fridge_product.add_category("refrigerators", client=client, include_hierarchy=False)
        
        created_fridge = client.products.create_product(fridge_product)
        print(f"  - Created product: {created_fridge['name']} with category slug: refrigerators")
        
        # Part 5: Creating a product and including the full category hierarchy
        print("\n5. Creating a product with full category hierarchy...")
        table_product = Product.create_simple(
            name="Coffee Table",
            price="249.99",
            description="Elegant coffee table for your living room.",
            short_description="Elegant coffee table"
        )
        
        # Add category with hierarchy - just use the leaf category slug
        table_product.add_category(
            category="tables",  # Just use the leaf category slug
            include_hierarchy=True,
            client=client
        )
        
        created_table = client.products.create_product(table_product)
        print(f"  - Created product: {created_table['name']} with full category hierarchy")
        
        print("\nCategory management examples completed successfully!")
        
        return {
            "categories": {
                "furniture": furniture_category['id'],
                "living_room": living_room['id'],
                "sofas": sofas['id'],
                "refrigerators": kitchen_appliances['id']
            },
            "products": {
                "sofa": created_sofa['id'],
                "refrigerator": created_fridge['id'],
                "table": created_table['id']
            }
        }
        
    except Exception as e:
        print(f"Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return None


if __name__ == "__main__":
    category_management_example()
