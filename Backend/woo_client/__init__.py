from typing import Dict, Optional
from .base_client import BaseWooClient
from .product_client import ProductClient
from .attribute_client import AttributeClient
from .media_client import MediaClient


class WooClient(BaseWooClient):
    """Main WooCommerce API client that delegates to specialized clients"""
    
    def __init__(self, api_key: str, api_secret: str, store_url: str, 
                 wp_username: Optional[str] = None, wp_password: Optional[str] = None,
                 verify_ssl: bool = True):
        """Initialize the WooClient with API credentials and create sub-clients

        Args:
            api_key: WooCommerce API key
            api_secret: WooCommerce API secret
            store_url: Store URL
            wp_username: WordPress username (used for media uploads)
            wp_password: WordPress application password (used for media uploads)
            verify_ssl: Whether to verify SSL certificates
        """
        super().__init__(
            api_key=api_key, 
            api_secret=api_secret, 
            store_url=store_url,
            wp_username=wp_username,
            wp_password=wp_password,
            verify_ssl=verify_ssl
        )
        
        # Initialize sub-clients
        self.products = ProductClient(api_key, api_secret, store_url, verify_ssl=verify_ssl)
        self.attributes = AttributeClient(api_key, api_secret, store_url, verify_ssl=verify_ssl)
        self.media = MediaClient(
            api_key=api_key, 
            api_secret=api_secret, 
            store_url=store_url,
            wp_username=wp_username,
            wp_password=wp_password,
            verify_ssl=verify_ssl
        )
    
    def get_store_info(self) -> Dict:
        """Get information about the WooCommerce store"""
        return self._make_request('GET', '')
    
    def get_orders(self, per_page: int = 10) -> Dict:
        """Get a list of orders from the store"""
        params = {'per_page': per_page}
        return self._make_request('GET', '/orders', params=params)


# Make it easier to import the classes directly
__all__ = ['WooClient', 'BaseWooClient', 'ProductClient', 'AttributeClient', 'MediaClient']
