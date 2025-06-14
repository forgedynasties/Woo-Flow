from typing import List, Dict, Union, Any, Optional
from .base_client import BaseWooClient

# Fix the relative import
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from models import Product, ProductVariation


class ProductClient(BaseWooClient):
    """Client for managing WooCommerce products"""

    def get_products(self, per_page: int = 10, **kwargs) -> List[Dict[str, Any]]:
        """Get a list of products from the store
        
        Args:
            per_page: Number of products per page
            **kwargs: Additional query parameters
            
        Returns:
            List of product data dictionaries
        """
        params = {'per_page': per_page, **kwargs}
        return self._make_request('GET', '/products', params=params)
    
    def get_products_as_models(self, per_page: int = 10, **kwargs) -> List[Product]:
        """Get a list of products as Product models"""
        products_data = self.get_products(per_page=per_page, **kwargs)
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
    
    def get_variations(self, parent_id: int, per_page: int = 10, **kwargs) -> List[Dict[str, Any]]:
        """Get variations for a variable product
        
        Args:
            parent_id: The ID of the parent product
            per_page: Number of variations per page
            **kwargs: Additional query parameters
            
        Returns:
            List of variation data dictionaries
        """
        params = {'per_page': per_page, **kwargs}
        return self._make_request('GET', f'/products/{parent_id}/variations', params=params)
    
    def get_variation(self, parent_id: int, variation_id: int) -> Dict[str, Any]:
        """Get a specific variation by ID
        
        Args:
            parent_id: The ID of the parent product
            variation_id: The ID of the variation
            
        Returns:
            Variation data dictionary
        """
        return self._make_request('GET', f'/products/{parent_id}/variations/{variation_id}')
    
    def update_variation(self, parent_id: int, variation_id: int, 
                        variation_data: Union[Dict[str, Any], ProductVariation]) -> Dict[str, Any]:
        """Update a product variation
        
        Args:
            parent_id: The ID of the parent product
            variation_id: The ID of the variation to update
            variation_data: Updated variation data
            
        Returns:
            Updated variation data
        """
        if isinstance(variation_data, ProductVariation):
            data = variation_data.to_dict()
        else:
            data = variation_data.copy()
        
        return self._make_request('PUT', f'/products/{parent_id}/variations/{variation_id}', data=data)
    
    def delete_variation(self, parent_id: int, variation_id: int, force: bool = False) -> Dict[str, Any]:
        """Delete a product variation
        
        Args:
            parent_id: The ID of the parent product
            variation_id: The ID of the variation to delete
            force: Whether to permanently delete the variation
            
        Returns:
            Deleted variation data
        """
        params = {'force': force}
        return self._make_request('DELETE', f'/products/{parent_id}/variations/{variation_id}', params=params)
