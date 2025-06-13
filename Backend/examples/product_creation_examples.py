import os
import sys
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Add parent directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models import Product, ProductAttribute, ProductCategory, ProductImage, ProductVariation
from woo_client import WooClient


# Load environment variables
load_dotenv()


def create_simple_product_example():
    """Example of creating a simple product with basic attributes"""
    # Create a simple product using the factory method
    product = Product.create_simple(
        name="Basic T-Shirt",
        price="19.99",
        description="A comfortable cotton t-shirt",
        short_description="Comfortable cotton t-shirt",
        sku="TSHIRT-001",
        stock_quantity=100,
        manage_stock=True
    )
    
    # Add a category
    product.add_category(ProductCategory(id=1, name="Clothing"))
    
    # # Add an image
    # product.add_image(ProductImage(
    #     src="https://example.com/tshirt.jpg",
    #     alt="Basic T-Shirt Image"
    # ))
    
    # Set a sale price
    product.set_sale(
        sale_price="14.99",
        end_date=datetime.now() + timedelta(days=7)
    )
    
    return product

def create_variable_product_example():
    """Example of creating a variable product with variations"""
    # Create attributes for the variable product
    size_attr = ProductAttribute(
        name="Size",
        options=["Small", "Medium", "Large", "X-Large"],
        variation=True
    )
    
    color_attr = ProductAttribute(
        name="Color",
        options=["Red", "Blue", "Black"],
        variation=True
    )
    
    # Create the variable product
    product = Product.create_variable(
        name="Premium T-Shirt",
        description="A premium quality t-shirt with multiple options",
        short_description="Premium quality t-shirt",
        attributes=[size_attr, color_attr]
    )
    
    # Add categories
    product.add_category(ProductCategory(id=1, name="Clothing"))
    product.add_category(ProductCategory(id=2, name="Premium"))
    
    # Add multiple images
    # product.add_image(ProductImage(
    #     src="https://example.com/tshirt-red.jpg",
    #     alt="Red Premium T-Shirt"
    # ))
    # product.add_image(ProductImage(
    #     src="https://example.com/tshirt-blue.jpg",
    #     alt="Blue Premium T-Shirt"
    # ))
    
    # Create variations
    variations = [
        ProductVariation(
            attributes=[
                {"name": "Size", "option": "Small"},
                {"name": "Color", "option": "Red"}
            ],
            regular_price="29.99",
            sku="TSHIRT-PREMIUM-S-RED",
            stock_quantity=50,
            manage_stock=True
        ),
        ProductVariation(
            attributes=[
                {"name": "Size", "option": "Medium"},
                {"name": "Color", "option": "Blue"}
            ],
            regular_price="24.99",
            sku="TSHIRT-PREMIUM-M-BLUE",
            stock_quantity=50,
            manage_stock=True
        )
    ]
    
    # Add variations to the product
    for variation in variations:
        product.add_variation(variation)
    
    return product

def create_product_with_sale_example():
    """Example of creating a product with sale price and inventory management"""
    product = Product.create_simple(
        name="Summer Hat",
        price="29.99",
        description="A stylish summer hat",
        short_description="Stylish summer hat",
        sku="HAT-001"
    )
    
    # Set stock management
    product.set_stock(quantity=75, manage=True)
    
    # Set a sale price with end date
    product.set_sale(
        sale_price="19.99",
        end_date=datetime.now() + timedelta(days=14)
    )
    
    # Add categories
    product.add_category(ProductCategory(id=3, name="Accessories"))
    product.add_category(ProductCategory(id=4, name="Summer Collection"))
    
    return product

def main():
    """Main function to demonstrate product creation and API interaction"""
    # Initialize WooCommerce client
    client = WooClient(
        api_key=os.getenv("WC_KEY"),
        api_secret=os.getenv("WC_SECRET"),
        store_url=os.getenv("WC_URL"),
        verify_ssl=False
    ) 
    
    try:
        simple_product = create_simple_product_example()
        print("\nCreating simple product...")
        response = client.products.create_product(simple_product.to_dict())
        print(f"Simple product created with ID: {response['id']}")
        
        # Create and upload a variable product
        variable_product = create_variable_product_example()
        print("\nCreating variable product...")
        response = client.products.create_product(variable_product.to_dict())
        parent_id = response['id']
        print(f"Variable product created with ID: {parent_id}")
        
        # Create variations for the variable product
        print("\nCreating variations...")
        for variation in variable_product.variations:
            variation_dict = variation.dict()
            variation_dict['parent_id'] = parent_id
            response = client.products.create_variation(parent_id, variation_dict)
            print(f"Variation created with ID: {response['id']}")
        
        
    except Exception as e:
        print(f"Error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main() 