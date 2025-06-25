import csv
import os
import sys
import pandas as pd
from typing import List, Dict, Optional, Any, Union, TYPE_CHECKING
import logging
from datetime import datetime
from pathlib import Path

# Handle imports differently if run as script vs imported as module
if __name__ == "__main__":
    # When run directly as script
    sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    from models.product import Product, ProductVariation, ProductAttribute, ProductImage
    from woo_client import WooClient
else:
    # When imported as module
    from .product import Product, ProductVariation, ProductAttribute, ProductImage
    # Import WooClient for type checking
    if TYPE_CHECKING:
        from ..woo_client import WooClient

class CSVProductImporter:
    """
    Import products from a CSV file into WooCommerce.
    
    Supports:
    - Simple products
    - Variable products with variations
    - Local and global attributes
    - Images from URLs or local paths
    """
    
    def __init__(self, client: 'WooClient', logger=None):
        """
        Initialize the CSV product importer.
        
        Args:
            client: Initialized WooClient instance
            logger: Optional logger instance
        """
        self.client = client
        
        # Set up logger
        if logger is None:
            # Create logs directory if it doesn't exist
            parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            logs_dir = os.path.join(parent_dir, "logs")
            if not os.path.exists(logs_dir):
                os.makedirs(logs_dir)
                
            # Create a logger with default configuration
            log_filename = f"csv_importer_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log"
            log_file = os.path.join(logs_dir, log_filename)
            
            handler = logging.FileHandler(log_file)
            handler.setFormatter(logging.Formatter('%(asctime)s - %(levelname)s - %(message)s'))
            
            logger = logging.getLogger(__name__)
            logger.setLevel(logging.INFO)
            logger.addHandler(handler)
        
        self.logger = logger
        self.created_products = []
        self.failed_products = []
        self.current_variable_product = None
    
    def import_from_file(self, file_path: str, delimiter: str = ',') -> Dict[str, List]:
        """
        Import products from a CSV file.
        
        Args:
            file_path: Path to the CSV file
            delimiter: CSV delimiter character
            
        Returns:
            Dictionary with created and failed products
        """
        try:
            self.logger.info(f"Attempting to parse CSV file: {file_path}")
            
            # Use a robust CSV reader
            products_data = []
            with open(file_path, 'r', encoding='utf-8-sig') as f:
                # Sniff the delimiter to be more robust
                try:
                    dialect = csv.Sniffer().sniff(f.read(1024), delimiters=',\t;')
                    f.seek(0)
                    reader = csv.DictReader(f, dialect=dialect)
                except csv.Error:
                    self.logger.warning("Could not detect CSV dialect, falling back to default comma delimiter.")
                    f.seek(0)
                    reader = csv.DictReader(f)

                for row in reader:
                    products_data.append(row)
                    
            self.logger.info(f"Successfully loaded {len(products_data)} rows from CSV.")
            return self.import_from_list(products_data)
        except Exception as e:
            self.logger.error(f"Failed to import products from {file_path}: {str(e)}")
            import traceback
            self.logger.error(traceback.format_exc())
            # Optionally, you might want to return the state of created/failed products
            # even if the process was interrupted.
            return {
                "created": self.created_products,
                "failed": self.failed_products,
                "error": str(e)
            }
    
    def import_from_list(self, products_data: List[Dict]) -> Dict[str, List]:
        """
        Import products from a list of dictionaries.
        
        Args:
            products_data: List of product data dictionaries
            
        Returns:
            Dictionary with created and failed products
        """
        self.created_products = []
        self.failed_products = []
        self.current_variable_product = None
        
        # Group products by type to process variable products with their variations
        variable_products = {}  # Dictionary to store variable products and their variations
        simple_products = []    # List to store simple products
        
        # First pass: categorize products
        for index, product_data in enumerate(products_data):
            try:
                # Clean up the product data - convert empty strings to None
                product_data = {k: v if pd.notna(v) and v != '' else None for k, v in product_data.items()}
                
                product_type = product_data.get('type', '').lower()
                
                if product_type == 'simple':
                    simple_products.append((index, product_data))
                elif product_type == 'variable':
                    # Start a new variable product group
                    key = f"variable_{len(variable_products) + 1}"
                    variable_products[key] = {
                        'parent': (index, product_data),
                        'variations': []
                    }
                elif product_type == 'variation':
                    # Find the last variable product to attach this variation to
                    if variable_products:
                        last_key = list(variable_products.keys())[-1]
                        variable_products[last_key]['variations'].append((index, product_data))
                    else:
                        # No parent variable product found
                        self.logger.error(f"Row {index+2}: Variation found without a parent variable product")
                        self.failed_products.append({
                            "row": index + 2,
                            "error": "Variation found without a parent variable product",
                            "data": product_data
                        })
                else:
                    self.logger.warning(f"Row {index+2}: Unsupported product type: {product_type}")
                    self.failed_products.append({
                        "row": index + 2, 
                        "error": f"Unsupported product type: {product_type}",
                        "data": product_data
                    })
            except Exception as e:
                self.logger.error(f"Row {index+2}: Error categorizing product: {str(e)}")
                self.failed_products.append({
                    "row": index + 2,
                    "error": str(e),
                    "data": product_data
                })
        
        self.logger.debug(f"Found {len(simple_products)} simple products and {len(variable_products)} variable products")
        
        # Second pass: process products
        
        # Process all simple products
        for index, product_data in simple_products:
            try:
                self._process_simple_product(product_data)
            except Exception as e:
                self.logger.error(f"Row {index+2}: Error processing simple product: {str(e)}")
                self.failed_products.append({
                    "row": index + 2,
                    "error": str(e),
                    "data": product_data
                })
        
        # Process each variable product with its variations
        for key, group in variable_products.items():
            parent_index, parent_data = group['parent']
            variations_data = group['variations']
            
            self.logger.debug(f"Processing variable product {parent_data.get('name')} with {len(variations_data)} variations")
            
            try:
                # Process the variable product with its variations
                self._process_variable_product_with_variations(parent_data, variations_data)
            except Exception as e:
                self.logger.error(f"Row {parent_index+2}: Error processing variable product: {str(e)}")
                self.failed_products.append({
                    "row": parent_index + 2,
                    "error": str(e),
                    "data": parent_data
                })
        
        return {
            "created": self.created_products,
            "failed": self.failed_products
        }
    
    def _process_simple_product(self, product_data: Dict) -> None:
        """Process a simple product from CSV data"""
        # Reset current variable product
        self.current_variable_product = None
        
        # Ensure prices are strings
        regular_price = str(product_data.get('regular_price', '0')) if product_data.get('regular_price') is not None else None
        sale_price = str(product_data.get('sale_price', '')) if product_data.get('sale_price') is not None else None
        
        # Extract basic product info
        product = Product.create_simple(
            name=product_data.get('name', ''),
            price=regular_price,
            description=product_data.get('description', ''),
            short_description=product_data.get('short_description', ''),
            sku=product_data.get('sku'),
            stock_quantity=int(product_data.get('stock_quantity', 0)) if product_data.get('stock_quantity') else None,
            manage_stock=self._parse_bool(product_data.get('manage_stock', False))
        )
        
        # Set additional fields
        if sale_price:
            product.set_sale(
                sale_price=sale_price,
                end_date=product_data.get('sale_end_date')
            )
        
        if product_data.get('stock_status'):
            product.stock_status = product_data.get('stock_status')
            
        if product_data.get('status'):
            product.status = product_data.get('status')
            
        # Add dimensions and weight if present
        self._add_dimensions_and_weight(product, product_data)
        
        # Add categories
        self._add_categories(product, product_data)
        
        # Add attributes (non-variation)
        self._add_attributes(product, product_data, for_variation=False)
        
        # Add images
        self._add_images(product, product_data)
        
        # Create the product
        created_product = self.client.products.create_product(product)
        self.created_products.append({
            "id": created_product['id'],
            "name": created_product['name'],
            "type": "simple",
            "sku": created_product.get('sku', '')
        })
        self.logger.info(f"Created simple product: {created_product['name']} (ID: {created_product['id']})")
    
    def _process_variable_product_with_variations(self, parent_data: Dict, variations_data: List) -> None:
        """Process a variable product with its variations"""
        # Extract all attributes from the parent product first
        attributes_map = {}  # name -> set of options
        attr_names = []  # Store attribute names in order
        attr_used_in_variations = set()  # Track which attributes are used in variations
        
        self.logger.debug(f"Processing variable product: {parent_data.get('name')}")
        self.logger.debug(f"Found {len(variations_data)} variations")
        
        # First gather all attribute names and values from the parent product
        for i in range(1, 10):  # Support up to 10 attributes
            attr_name_key = f'attr_name_{i}'
            attr_value_key = f'attr_value_{i}'
            
            if attr_name_key in parent_data and parent_data[attr_name_key]:
                attr_name = parent_data[attr_name_key]
                attr_values_str = str(parent_data.get(attr_value_key, ''))
                attr_values = [v.strip() for v in attr_values_str.split(',') if v.strip()]
                
                self.logger.debug(f"Parent attribute: {attr_name} with values: {attr_values}")
                
                if attr_name not in attributes_map:
                    attributes_map[attr_name] = set()
                    attr_names.append(attr_name)  # Store name in order
                
                for value in attr_values:
                    attributes_map[attr_name].add(value)

        # Now gather attributes from variations and track which ones are used
        for index, variation_data in variations_data:
            for i in range(1, 10):  # Support up to 10 attributes
                attr_value_key = f'attr_value_{i}'
                
                if attr_value_key in variation_data and variation_data[attr_value_key]:
                    attr_value = variation_data[attr_value_key]
                    
                    # Get attribute name from either variation or parent
                    attr_name_key = f'attr_name_{i}'
                    attr_name = variation_data.get(attr_name_key)
                    
                    # If attr_name is None in the variation but we have a value, 
                    # use the corresponding name from parent if available
                    if attr_name is None and i-1 < len(attr_names):
                        attr_name = attr_names[i-1]
                    
                    if attr_name:  # Only proceed if we have a name
                        self.logger.debug(f"Variation attribute: {attr_name} with value: {attr_value}")
                        
                        # Mark this attribute as used in variations
                        attr_used_in_variations.add(attr_name)
                        
                        if attr_name not in attributes_map:
                            attributes_map[attr_name] = set()
                        
                        attributes_map[attr_name].add(attr_value)
    
        # If no attributes found in parent or variations, this is an error
        if not attributes_map:
            raise ValueError("No attributes found for variable product")
        
        self.logger.debug(f"Attributes used in variations: {attr_used_in_variations}")
        
        # Ensure prices are strings
        regular_price = str(parent_data.get('regular_price', '0')) if parent_data.get('regular_price') is not None else None
        sale_price = str(parent_data.get('sale_price', '')) if parent_data.get('sale_price') is not None else None
        
        # Create attributes list for the Product constructor
        product_attributes = []
        
        # Convert attribute map to attribute objects
        for attr_name, attr_values in attributes_map.items():
            # Is this a global attribute?
            is_global = attr_name.startswith('pa_')
            attr_id = None
            
            if is_global:
                try:
                    # Get the global attribute ID
                    attr_slug = attr_name[3:] if is_global else attr_name
                    attr_obj = self.client.attributes.get_attribute_by_slug(attr_slug)
                    if attr_obj:
                        attr_id = attr_obj['id']
                except Exception as e:
                    self.logger.warning(f"Could not find global attribute: {attr_name}, error: {str(e)}")
            
            # Check if this attribute is used in variations
            is_variation_attr = attr_name in attr_used_in_variations
            
            # Create attribute object
            attribute = ProductAttribute(
                name=attr_name,
                options=list(attr_values),  # Convert set to list
                variation=is_variation_attr,  # Only mark as variation if actually used in variations
                is_global=is_global,
                id=attr_id,
                global_slug=attr_name if is_global else None
            )
            
            product_attributes.append(attribute)
        
        self.logger.debug(f"Creating variable product with {len(product_attributes)} attributes " +
                         f"({sum(1 for a in product_attributes if a.variation)} variation attributes)")
        
        # Create the variable product with attributes
        product = Product(
            name=parent_data.get('name', ''),
            type='variable',
            description=parent_data.get('description', ''),
            short_description=parent_data.get('short_description', ''),
            attributes=product_attributes  # Add attributes directly in the constructor
        )
        
        self.logger.debug(f"Set basic fields for variable product: SKU={product.sku}, Regular Price={product.regular_price}, Sale Price={product.sale_price}")
        
        # Set basic fields
        product.sku = parent_data.get('sku')
        product.regular_price = regular_price
        
        if sale_price:
            product.sale_price = sale_price
            
        if parent_data.get('status'):
            product.status = parent_data.get('status')
        
        if parent_data.get('manage_stock') is not None:
            product.manage_stock = self._parse_bool(parent_data.get('manage_stock'))
            
        if parent_data.get('stock_quantity'):
            product.stock_quantity = int(parent_data.get('stock_quantity'))
            
        if parent_data.get('stock_status'):
            product.stock_status = parent_data.get('stock_status')
        
        # Add dimensions and weight
        self._add_dimensions_and_weight(product, parent_data)
            
        # Add categories
        self._add_categories(product, parent_data)
        
        # Add images for the parent product
        self._add_images(product, parent_data)
        
        # Create the variable product first
        try:
            created_product = self.client.products.create_product(product)
            self.current_variable_product = {
                "id": created_product['id'],
                "data": created_product,
                "variations": []
            }
            
            self.created_products.append({
                "id": created_product['id'],
                "name": created_product['name'],
                "type": "variable",
                "sku": created_product.get('sku', '')
            })
            
            self.logger.info(f"Created variable product: {created_product['name']} (ID: {created_product['id']}) with {len(product_attributes)} attributes")
            
            # Now create all the variations
            for index, variation_data in variations_data:
                try:
                    self._process_variation(variation_data)
                except Exception as e:
                    self.logger.error(f"Row {index+2}: Error processing variation: {str(e)}")
                    self.failed_products.append({
                        "row": index + 2,
                        "error": f"Error processing variation: {str(e)}",
                        "data": variation_data
                    })
            
        except Exception as e:
            self.logger.error(f"Failed to create variable product: {str(e)}")
            raise
    
    def _process_variation(self, product_data: Dict) -> None:
        """Process a product variation from CSV data"""
        if not self.current_variable_product:
            raise ValueError("No parent variable product found for this variation")
        
        # Get parent information
        parent_data = self.current_variable_product["data"]
        parent_id = self.current_variable_product["id"]
        
        # Infer attribute names from the parent if missing in the variation
        parent_attributes = {}
        
        # Extract attribute names from parent
        attr_names = []
        for i in range(1, 10):  # Support up to 10 attributes
            attr_name_key = f'attr_name_{i}'
            if attr_name_key in parent_data and parent_data[attr_name_key]:
                attr_names.append(parent_data[attr_name_key])
    
        # Ensure prices are strings
        # Use sale_price as regular_price if regular_price is None
        if product_data.get('regular_price') is not None:
            regular_price = str(product_data['regular_price'])
        elif product_data.get('sale_price') is not None:
            regular_price = str(product_data['sale_price'])
        else:
            # If both are None, use parent regular price
            regular_price = str(parent_data.get('regular_price', '0'))
        
        sale_price = str(product_data.get('sale_price', '')) if product_data.get('sale_price') is not None else None
        
        # Extract attribute values from the variation row
        variation_attributes = []
        
        # Loop through all possible attribute columns and match with parent attribute names
        for i in range(1, 10):  # Support up to 10 attributes
            attr_name_key = f'attr_name_{i}'
            attr_value_key = f'attr_value_{i}'
            
            # Only process if we have a value for this attribute
            if attr_value_key in product_data and product_data[attr_value_key]:
                # Get attribute name from either variation or parent
                attr_name = product_data.get(attr_name_key)
                
                # If attr_name is None in the variation but we have a value, 
                # use the corresponding name from parent if available
                if attr_name is None and i-1 < len(attr_names):
                    attr_name = attr_names[i-1]
                
                if attr_name:  # Only proceed if we have a name
                    attr_value = product_data[attr_value_key]
                    
                    self.logger.debug(f"Processing variation attribute: {attr_name}={attr_value}")
                    
                    # Skip empty values
                    if not attr_value:
                        continue
                    
                    # Add the attribute to variation attributes
                    if attr_name.startswith('pa_'):
                        # For global attributes, try to get the ID
                        try:
                            attr_slug = attr_name[3:]
                            attr_obj = self.client.attributes.get_attribute_by_slug(attr_slug)
                            if attr_obj:
                                variation_attributes.append({
                                    "id": attr_obj['id'],
                                    "name": attr_name,
                                    "option": attr_value
                                })
                            else:
                                variation_attributes.append({
                                    "name": attr_name,
                                    "option": attr_value
                                })
                        except:
                            variation_attributes.append({
                                "name": attr_name,
                                "option": attr_value
                            })
                    else:
                        variation_attributes.append({
                            "name": attr_name,
                            "option": attr_value
                        })
    
        self.logger.debug(f"Creating variation with attributes: {variation_attributes}")
        
        # Create the variation
        variation = ProductVariation(
            attributes=variation_attributes,
            regular_price=regular_price,
            sale_price=sale_price,
            sku=product_data.get('sku'),
            stock_quantity=int(product_data.get('stock_quantity', 0)) if product_data.get('stock_quantity') else None,
            manage_stock=self._parse_bool(product_data.get('manage_stock', False))
        )
        
        # Add dimensions and weight
        self._add_dimensions_and_weight_to_variation(variation, product_data)
        
        # Add images to the variation
        self._add_images_to_variation(variation, product_data)
        
        # Create the variation
        try:
            created_variation = self.client.products.create_variation(parent_id, variation)
            
            # Store the variation reference
            self.current_variable_product["variations"].append({
                "id": created_variation['id'],
                "attributes": variation_attributes
            })
            
            self.logger.info(f"Created variation for product ID {parent_id}: {created_variation['id']}")
        except Exception as e:
            self.logger.error(f"Failed to create variation: {str(e)}")
            raise
    
    def _add_dimensions_and_weight(self, product: Product, product_data: Dict) -> None:
        """Add dimensions and weight to a product if present in data"""
        # Add dimensions dictionary if any dimension data exists
        has_dimensions = any(product_data.get(dim) for dim in ['length', 'width', 'height'])
        
        if has_dimensions:
            dimensions = {}
            if 'length' in product_data and product_data['length']:
                dimensions['length'] = str(product_data['length'])
            if 'width' in product_data and product_data['width']:
                dimensions['width'] = str(product_data['width'])
            if 'height' in product_data and product_data['height']:
                dimensions['height'] = str(product_data['height'])
            
            # Add dimensions to product
            setattr(product, '_dimensions', dimensions)
        
        # Add weight if present
        if 'weight' in product_data and product_data['weight']:
            setattr(product, '_weight', str(product_data['weight']))
    
    def _add_dimensions_and_weight_to_variation(self, variation: ProductVariation, product_data: Dict) -> None:
        """Add dimensions and weight to a variation if present in data"""
        # Add dimensions dictionary if any dimension data exists
        has_dimensions = any(product_data.get(dim) for dim in ['length', 'width', 'height'])
        
        if has_dimensions:
            dimensions = {}
            if 'length' in product_data and product_data['length']:
                dimensions['length'] = str(product_data['length'])
            if 'width' in product_data and product_data['width']:
                dimensions['width'] = str(product_data['width'])
            if 'height' in product_data and product_data['height']:
                dimensions['height'] = str(product_data['height'])
            
            # Add dimensions to variation
            setattr(variation, '_dimensions', dimensions)
        
        # Add weight if present
        if 'weight' in product_data and product_data['weight']:
            setattr(variation, '_weight', str(product_data['weight']))
    
    def _add_categories(self, product: Product, product_data: Dict) -> None:
        """Add categories to a product"""
        # Look for category_# columns
        for i in range(1, 6):  # Support up to 5 categories
            cat_key = f'category_{i}'
            include_hierarchy_key = f'include_hierarchy_{i}'
            
            if cat_key in product_data and product_data[cat_key]:
                category = product_data[cat_key]
                include_hierarchy = self._parse_bool(product_data.get(include_hierarchy_key, False))
                
                self.logger.debug(f"Adding category '{category}' to product (include_hierarchy={include_hierarchy})")
                
                try:
                    # Add the category to the product
                    product.add_category(
                        category=category,
                        include_hierarchy=include_hierarchy,
                        client=self.client
                    )
                except Exception as e:
                    self.logger.warning(f"Could not add category '{category}': {str(e)}")
    
    def _add_attributes(self, product: Product, product_data: Dict, for_variation: bool = False) -> None:
        """Add attributes to a product"""
        # Extract attributes from the data
        for i in range(1, 10):  # Support up to 10 attributes
            attr_name_key = f'attr_name_{i}'
            attr_value_key = f'attr_value_{i}'
            attr_variation_key = f'attr_var_{i}'
            
            if attr_name_key in product_data and product_data[attr_name_key]:
                attr_name = product_data[attr_name_key]
                
                # Split values by comma
                attr_values = []
                if attr_value_key in product_data and product_data[attr_value_key]:
                    attr_values = str(product_data[attr_value_key]).split(',')
                    attr_values = [v.strip() for v in attr_values if v.strip()]
                
                # Check if it's for variation
                is_variation = True  # Default to true for attributes in CSV
                if attr_variation_key in product_data:
                    is_variation = self._parse_bool(product_data[attr_variation_key])
                
                # Skip if this is a variation attribute but we're not processing for variations
                if is_variation and not for_variation:
                    continue
                    
                # Skip if this is not a variation attribute but we're processing for variations
                if not is_variation and for_variation:
                    continue
                
                if attr_values:
                    # Is this a global attribute?
                    is_global = attr_name.startswith('pa_')
                    attr_id = None
                    
                    if is_global:
                        try:
                            # Extract slug and get attribute ID
                            attr_slug = attr_name[3:]  # Remove pa_ prefix
                            attr_obj = self.client.attributes.get_attribute_by_slug(attr_slug)
                            if attr_obj:
                                attr_id = attr_obj['id']
                        except Exception as e:
                            self.logger.warning(f"Could not find global attribute: {attr_name}, error: {str(e)}")
                            
                    # Create attribute object
                    attribute = ProductAttribute(
                        name=attr_name,
                        options=attr_values,
                        variation=is_variation,
                        is_global=is_global,
                        id=attr_id,
                        global_slug=attr_name if is_global else None
                    )
                    
                    # Add to product
                    try:
                        product.add_attribute(attribute)
                    except Exception as e:
                        self.logger.warning(f"Could not add attribute {attr_name}: {str(e)}")
    
    def _add_images(self, product: Product, product_data: Dict) -> None:
        """Add images to a product"""
        # Look for image_# columns
        for i in range(1, 6):  # Support up to 5 images
            image_key = f'image_{i}'
            
            if image_key in product_data and product_data[image_key]:
                image_path_or_url = product_data[image_key]
                
                try:
                    # Upload and add the image
                    product.add_image_from_path_or_url(
                        client=self.client,
                        path_or_url=image_path_or_url,
                        alt_text=f"Image {i} for {product_data.get('name', 'product')}"
                    )
                except Exception as e:
                    self.logger.warning(f"Could not add image {image_path_or_url}: {str(e)}")
    
    def _add_images_to_variation(self, variation: ProductVariation, product_data: Dict) -> None:
        """Add images to a variation"""
        # Look for image_# columns
        for i in range(1, 6):  # Support up to 5 images
            image_key = f'image_{i}'
            
            if image_key in product_data and product_data[image_key]:
                image_path_or_url = product_data[image_key]
                
                try:
                    # Upload and add the image
                    variation.add_image_from_path_or_url(
                        client=self.client,
                        path_or_url=image_path_or_url,
                        alt_text=f"Image {i} for {product_data.get('sku', 'variation')}"
                    )
                    
                    # We only need one image for variations, so break after first successful one
                    break
                except Exception as e:
                    self.logger.warning(f"Could not add image {image_path_or_url}: {str(e)}")
    
    def _parse_bool(self, value) -> bool:
        """Parse a boolean value from various formats"""
        if isinstance(value, bool):
            return value
        if isinstance(value, (int, float)):
            return bool(value)
        if isinstance(value, str):
            return value.lower() in ('true', 'yes', '1', 't', 'y')
        return False

# Add a simple example that runs when the file is executed directly
if __name__ == "__main__":
    print("CSV Product Importer module")
    print("This module is not meant to be run directly.")
    print("Please import it into your application and use the CSVProductImporter class.")
    print("Example usage:")
    print("from woo_client import WooClient")
    print("from models import CSVProductImporter")
    print("client = WooClient(...)")
    print("importer = CSVProductImporter(client)")
    print("results = importer.import_from_file('products.csv')")
