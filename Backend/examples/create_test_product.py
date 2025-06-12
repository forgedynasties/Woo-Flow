import os
import sys
import time
import dotenv

# Add the parent directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import the WooClient and Product model
from woo_client import WooClient
from models import Product, ProductAttribute

# Load environment variables
dotenv.load_dotenv()

def create_test_products():
    """Create test products in WordPress including simple and variable products"""
    
    # Create a WooClient with your actual credentials
    client = WooClient(
        api_key=os.getenv("WC_KEY"),
        api_secret=os.getenv("WC_SECRET"),
        store_url=os.getenv("WC_URL"),
        verify_ssl=False  # Set to True in production
    )
    
    try:
        # 1. Create a simple product first
        print("\n--- Creating a simple product ---")
        simple_product_data = {
            "name": "Test Simple Product",
            "type": "simple",
            "regular_price": "19.99",
            "description": "This is a simple test product with no variations.",
            "short_description": "Simple test product",
            "categories": [
                {"id": 1}  # You may need to adjust this ID based on your categories
            ],
            # Images can either be added by ID or by URL (if your site supports it)
            # Since URL uploads are causing an error, we'll leave images empty for now
            # "images": [
            #     {
            #         "src": "https://picsum.photos/id/237/200/300"
            #     }
            # ],
            # Adding a non-variation attribute
            "attributes": [
                {
                    "name": "Material",
                    "position": 0,
                    "visible": True,
                    "variation": False,
                    "options": ["Cotton", "Polyester"]
                }
            ]
        }
        
        simple_product = client.products.create_product(simple_product_data)
        
        print(f"Simple product created successfully:")
        print(f"- ID: {simple_product['id']}")
        print(f"- Name: {simple_product['name']}")
        print(f"- Price: ${simple_product['regular_price']}")
        print(f"- Type: {simple_product['type']}")
        
        # 2. Create a variable product with variations
        print("\n--- Creating a variable product ---")
        
        # First create the parent variable product with attributes
        variable_product_data = {
            "name": "Test Variable Product",
            "type": "variable",  # This is important
            "description": "This is a variable product with multiple variations.",
            "short_description": "Variable test product with size and color options",
            "categories": [
                {"id": 1}  # You may need to adjust this ID based on your categories
            ],
            # Images removed to avoid the upload error
            # "images": [
            #     {
            #         "src": "https://picsum.photos/seed/picsum/200/300"
            #     }
            # ],
            # Define attributes that will be used for variations
            "attributes": [
                {
                    "name": "Size",  # Local attribute
                    "position": 0,
                    "visible": True,
                    "variation": True,  # This attribute will be used for variations
                    "options": ["Small", "Medium", "Large"]
                },
                {
                    "name": "Color",  # Local attribute
                    "position": 1,
                    "visible": True,
                    "variation": True,  # This attribute will be used for variations
                    "options": ["Red", "Blue", "Green"]
                },
                {
                    "name": "Material",  # Local attribute NOT used for variations
                    "position": 2,
                    "visible": True,
                    "variation": False, 
                    "options": ["Cotton", "Polyester", "Blend"]
                }
            ]
        }
        
        variable_product = client.products.create_product(variable_product_data)
        
        print(f"Variable product created successfully:")
        print(f"- ID: {variable_product['id']}")
        print(f"- Name: {variable_product['name']}")
        print(f"- Type: {variable_product['type']}")
        
        # Now create variations for the variable product
        print("\n--- Creating variations for the variable product ---")
        parent_id = variable_product['id']
        
        # Define variations - we'll create a subset of all possible combinations
        variations = [
            {
                "attributes": [
                    {"name": "Size", "option": "Small"},
                    {"name": "Color", "option": "Red"}
                ],
                "regular_price": "15.99",
            },
            {
                "attributes": [
                    {"name": "Size", "option": "Medium"},
                    {"name": "Color", "option": "Red"}
                ],
                "regular_price": "16.99",
            },
            {
                "attributes": [
                    {"name": "Size", "option": "Large"},
                    {"name": "Color", "option": "Red"}
                ],
                "regular_price": "17.99",
            },
            {
                "attributes": [
                    {"name": "Size", "option": "Small"},
                    {"name": "Color", "option": "Blue"}
                ],
                "regular_price": "15.99",
            },
            {
                "attributes": [
                    {"name": "Size", "option": "Medium"},
                    {"name": "Color", "option": "Blue"}
                ],
                "regular_price": "16.99",
            },
            {
                "attributes": [
                    {"name": "Size", "option": "Medium"},
                    {"name": "Color", "option": "Green"}
                ],
                "regular_price": "16.99",
                "sale_price": "14.99",
            }
        ]
        
        created_variations = []
        for i, variation_data in enumerate(variations):
            print(f"Creating variation {i+1}/{len(variations)}...")
            try:
                # Create the variation using the correct endpoint
                variation = client.products.create_variation(parent_id, variation_data)
                created_variations.append(variation)
                
                # Fix the index out of range error by checking if attributes exist in response
                attr_info = ""
                if 'attributes' in variation and len(variation['attributes']) >= 2:
                    attr_info = f"{variation['attributes'][0]['option']} {variation['attributes'][1]['option']}"
                else:
                    # If attributes are missing in the response, use info from our input data
                    size_option = next((a['option'] for a in variation_data['attributes'] if a['name'] == 'Size'), 'Unknown')
                    color_option = next((a['option'] for a in variation_data['attributes'] if a['name'] == 'Color'), 'Unknown')
                    attr_info = f"{size_option} {color_option}"
                
                print(f"  ✓ Variation created: {attr_info} - ID: {variation['id']}")
                
                # Brief pause to avoid overwhelming the API
                time.sleep(0.5)
            except Exception as e:
                print(f"  ✗ Error creating variation: {e}")
                # Print more debug info
                print(f"    Debug: variation_data = {variation_data}")
        
        print(f"\nCreated {len(created_variations)} variations for product ID {parent_id}")
        
        # 3. Create a product using the Product model with global attributes
        # For this example, we'd need to know the IDs of global attributes already in the system
        # This is a placeholder showing how it would be structured
        print("\n--- Creating a product using Product model ---")
        
        # You'd need to query your existing global attributes first
        # This is a simplified example assuming you know the attribute ID
        model_product = Product(
            name="Test Product from Model",
            type="simple",
            regular_price="29.99",
            description="This product demonstrates using the Product model.",
            short_description="Created using the Product model",
            attributes=[
                # These are local attributes
                ProductAttribute(
                    name="Feature",
                    options=["Premium", "Standard"],
                    position=0,
                    visible=True,
                    variation=False
                )
            ]
        )
        
        model_product_created = client.products.create_product(model_product)
        print(f"Model-based product created successfully:")
        print(f"- ID: {model_product_created['id']}")
        print(f"- Name: {model_product_created['name']}")
        print(f"- Price: ${model_product_created['regular_price']}")
        
        print("\nCheck your WordPress admin dashboard to see the new products.")
        print("The products will remain in your store until you manually delete them.")
        print("You can use the delete_all_products.py script to clean them up.")
        
        # Information about how to add images to products
        print("\nNote: To add images to the products, you need to:")
        print("1. Upload images through the WordPress Media Library first")
        print("2. Get the media ID of the uploaded image")
        print("3. Update the product with an image reference using the ID:")
        print("   client.products.update_product(product_id, {\"images\": [{\"id\": media_id}]})")
        
    except Exception as e:
        print(f"Error creating products: {e}")
        import traceback
        traceback.print_exc()  # Print the full traceback for debugging


def add_image_to_product_example():
    """Example of how to add an image to a product after creation using media ID"""
    # This is just an example function showing the proper way to add images
    client = WooClient(
        api_key=os.getenv("WC_KEY"),
        api_secret=os.getenv("WC_SECRET"),
        store_url=os.getenv("WC_URL"),
        verify_ssl=False
    )
    
    # Example: Update product with ID 123 to use an image with media ID 456
    product_id = 123  # Replace with your actual product ID
    media_id = 456    # Replace with your actual media ID
    
    try:
        updated_product = client.products.update_product(
            product_id,
            {
                "images": [
                    {"id": media_id}  # Reference existing media by ID
                ]
            }
        )
        print(f"Added image (Media ID: {media_id}) to product {product_id}")
    except Exception as e:
        print(f"Error adding image to product: {e}")


if __name__ == "__main__":
    create_test_products()
    # Uncomment to run the image example (after replacing with valid IDs)
    # add_image_to_product_example()
