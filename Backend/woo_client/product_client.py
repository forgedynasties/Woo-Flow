from typing import List, Dict, Union, Any, Optional
from .base_client import BaseWooClient

# Fix the relative import
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from models import Product, ProductVariation


class ProductClient(BaseWooClient):
    """Client for managing WooCommerce products"""

    def get_products(self, per_page: int = 10) -> List[Dict[str, Any]]:
        """Get a list of products from the store"""
        params = {'per_page': per_page}
        return self._make_request('GET', '/products', params=params)
    
    def get_products_as_models(self, per_page: int = 10) -> List[Product]:
        """Get a list of products as Product models"""
        products_data = self.get_products(per_page=per_page)
        return [Product.from_dict(p) for p in products_data]

    def get_product_by_id(self, product_id: int) -> Dict[str, Any]:
        """Get a specific product by ID"""
        return self._make_request('GET', f'/products/{product_id}')
    
    def get_product_as_model(self, product_id: int) -> Product:
        """Get a product by ID and return as a Product model"""
        data = self.get_product_by_id(product_id)
        return Product.from_dict(data)
    
    def create_product(self, product_data: Union[Product, Dict[str, Any]]) -> Dict[str, Any]:
        """Create a new product with given data
        
        Args:
            product_data: Product instance or dict with product data
            
        Returns:
            dict: Created product data from API
        """
        if isinstance(product_data, Product):
            product_data = product_data.to_dict()
            
        return self._make_request('POST', '/products', data=product_data)
    
    def update_product(self, product_id: int, product_data: Union[Product, Dict[str, Any]]) -> Dict[str, Any]:
        """Update an existing product"""
        if isinstance(product_data, Product):
            product_data = product_data.to_dict()
            
        return self._make_request('PUT', f'/products/{product_id}', data=product_data)
    
    def delete_product(self, product_id: int, force: bool = False) -> Dict[str, Any]:
        """Delete a product"""
        params = {'force': force}
        return self._make_request('DELETE', f'/products/{product_id}', params=params)
    
    def create_variation(self, parent_id: int, variation_data: Union[Product, Dict[str, Any], ProductVariation]) -> Dict[str, Any]:
        """Create a new variation for a variable product
        
        Args:
            parent_id: The ID of the parent product
            variation_data: Either a Product object, ProductVariation object, or a dictionary of variation data
        """
        if isinstance(variation_data, Product):
            data = variation_data.to_dict()
        elif isinstance(variation_data, ProductVariation):
            data = variation_data.to_dict()
        else:
            data = variation_data.copy()
            
        # WooCommerce API expects "variation" type
        if isinstance(data, dict):
            data["type"] = "variation"
        
        return self._make_request('POST', f'/products/{parent_id}/variations', data=data)
