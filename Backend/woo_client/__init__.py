from typing import Dict
from .base_client import BaseWooClient
from .product_client import ProductClient


class WooClient(BaseWooClient):
    """Main WooCommerce API client that delegates to specialized clients"""
    
    def __init__(self, api_key: str, api_secret: str, store_url: str, verify_ssl: bool = True):
        """Initialize the WooClient with API credentials and create sub-clients"""
        super().__init__(api_key, api_secret, store_url, verify_ssl)
        
        # Initialize sub-clients
        self.products = ProductClient(api_key, api_secret, store_url, verify_ssl)
    
    def get_store_info(self) -> Dict:
        """Get information about the WooCommerce store"""
        return self._make_request('GET', '')
    
    def get_orders(self, per_page: int = 10) -> Dict:
        """Get a list of orders from the store"""
        params = {'per_page': per_page}
        return self._make_request('GET', '/orders', params=params)


# Make it easier to import the classes directly
__all__ = ['WooClient', 'BaseWooClient', 'ProductClient']
