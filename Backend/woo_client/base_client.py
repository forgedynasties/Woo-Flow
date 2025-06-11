import requests
import json
import base64
import warnings
from urllib3.exceptions import InsecureRequestWarning
from typing import Dict, Any, Optional


class BaseWooClient:
    """Base class for WooCommerce API clients"""

    def __init__(self, api_key: str, api_secret: str, store_url: str, verify_ssl: bool = True):
        """Initialize the base client with API credentials and store URL

        Args:
            api_key (str): The WooCommerce API key
            api_secret (str): The WooCommerce API secret
            store_url (str): The URL of the WooCommerce store
            verify_ssl (bool): Whether to verify SSL certificates
        """
        self.api_key = api_key
        self.api_secret = api_secret
        # Ensure store_url doesn't end with a slash
        self.store_url = store_url.rstrip('/')
        # Construct the API base URL
        self.api_base_url = f"{self.store_url}/wp-json/wc/v3"
        # Create auth header for HTTP Basic Auth
        self._auth_header = self._create_auth_header(api_key, api_secret)
        # SSL verification setting
        self.verify_ssl = verify_ssl
        
        # Suppress SSL warnings if verify_ssl is False
        if not verify_ssl:
            warnings.simplefilter('ignore', InsecureRequestWarning)

    def _create_auth_header(self, api_key: str, api_secret: str) -> Dict[str, str]:
        """Create the HTTP Basic Auth header using the API key and secret"""
        auth_string = f"{api_key}:{api_secret}"
        auth_bytes = auth_string.encode('ascii')
        auth_b64 = base64.b64encode(auth_bytes).decode('ascii')
        return {'Authorization': f'Basic {auth_b64}'}

    def _make_request(self, method: str, endpoint: str, params: Optional[Dict] = None, data: Optional[Dict] = None) -> Any:
        """Make a request to the WooCommerce API

        Args:
            method: HTTP method (GET, POST, etc.)
            endpoint: API endpoint (e.g., /products)
            params: Query parameters
            data: Body data for POST/PUT requests

        Returns:
            JSON response from the API

        Raises:
            Exception: If the API returns a non-200 status code
        """
        url = f"{self.api_base_url}{endpoint}"
        headers = {**self._auth_header, 'Content-Type': 'application/json'}
        
        response = requests.request(
            method=method,
            url=url,
            headers=headers,
            params=params,
            data=json.dumps(data) if data else None,
            verify=self.verify_ssl
        )
        
        if response.status_code < 200 or response.status_code >= 300:
            raise Exception(f"API request failed with status {response.status_code}: {response.text}")
        
        return response.json() if response.text else {}
