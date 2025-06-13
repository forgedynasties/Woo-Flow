import requests
import json
import base64
import warnings
from urllib3.exceptions import InsecureRequestWarning
from typing import Dict, Any, Optional


class BaseWooClient:
    """Base class for WooCommerce API clients"""

    def __init__(self, api_key: str, api_secret: str, store_url: str, 
                 wp_username: Optional[str] = None, wp_password: Optional[str] = None, 
                 verify_ssl: bool = True):
        """Initialize the base client with API credentials and store URL

        Args:
            api_key (str): The WooCommerce API key
            api_secret (str): The WooCommerce API secret
            store_url (str): The URL of the WooCommerce store
            wp_username (str, optional): WordPress username for REST API
            wp_password (str, optional): WordPress application password for REST API
            verify_ssl (bool): Whether to verify SSL certificates
        """
        self.api_key = api_key
        self.api_secret = api_secret
        self.wp_username = wp_username
        self.wp_password = wp_password
        
        # Ensure store_url doesn't end with a slash
        self.store_url = store_url.rstrip('/')
        # Construct the API base URL
        self.api_base_url = f"{self.store_url}/wp-json/wc/v3"
        self.wp_api_base_url = f"{self.store_url}/wp-json/wp/v2"
        
        # Create auth headers
        self._wc_auth_header = self._create_auth_header(api_key, api_secret)
        self._wp_auth_header = self._create_wp_auth_header(wp_username, wp_password) if wp_username and wp_password else None
        
        # SSL verification setting
        self.verify_ssl = verify_ssl
        
        # Suppress SSL warnings if verify_ssl is False
        if not verify_ssl:
            warnings.simplefilter('ignore', InsecureRequestWarning)

    def _create_auth_header(self, api_key: str, api_secret: str) -> Dict[str, str]:
        """Create the HTTP Basic Auth header using the WooCommerce API key and secret"""
        auth_string = f"{api_key}:{api_secret}"
        auth_bytes = auth_string.encode('ascii')
        auth_b64 = base64.b64encode(auth_bytes).decode('ascii')
        return {'Authorization': f'Basic {auth_b64}'}
    
    def _create_wp_auth_header(self, username: str, password: str) -> Dict[str, str]:
        """Create the HTTP Basic Auth header using WordPress username and application password"""
        auth_string = f"{username}:{password}"
        auth_bytes = auth_string.encode('ascii')
        auth_b64 = base64.b64encode(auth_bytes).decode('ascii')
        return {'Authorization': f'Basic {auth_b64}'}

    def _make_request(self, method: str, endpoint: str, params: Optional[Dict] = None, data: Optional[Dict] = None, 
                      wordpress_api: bool = False, is_multipart: bool = False, files: Optional[Dict] = None) -> Any:
        """Make a request to the WooCommerce API or WordPress API

        Args:
            method: HTTP method (GET, POST, etc.)
            endpoint: API endpoint (e.g., /products)
            params: Query parameters
            data: Body data for POST/PUT requests
            wordpress_api: Whether to use the WordPress API instead of WooCommerce API
            is_multipart: Whether the request should be sent as multipart/form-data
            files: Files to upload in multipart/form-data requests

        Returns:
            JSON response from the API

        Raises:
            Exception: If the API returns a non-200 status code
        """
        # Choose the appropriate base URL and auth header
        if wordpress_api:
            base_url = self.wp_api_base_url
            # Use WordPress auth if available, otherwise fall back to WooCommerce auth
            auth_header = self._wp_auth_header if self._wp_auth_header else self._wc_auth_header
        else:
            base_url = self.api_base_url
            auth_header = self._wc_auth_header
            
        url = f"{base_url}{endpoint}"
        
        # Set headers based on request type
        if is_multipart:
            headers = {**auth_header}  # Don't set Content-Type for multipart requests
        else:
            headers = {**auth_header, 'Content-Type': 'application/json'}
        
        # Handle the request data based on type
        if data and not is_multipart:
            data = json.dumps(data)
        
        response = requests.request(
            method=method,
            url=url,
            headers=headers,
            params=params,
            data=data,
            files=files,
            verify=self.verify_ssl
        )
        
        if response.status_code < 200 or response.status_code >= 300:
            raise Exception(f"API request failed with status {response.status_code}: {response.text}")
        
        return response.json() if response.text else {}
