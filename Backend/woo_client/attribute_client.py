from typing import List, Dict, Any, Optional
from .base_client import BaseWooClient


class AttributeClient(BaseWooClient):
    """Client for managing WooCommerce global attributes"""

    def get_attributes(self, per_page: int = 10) -> List[Dict[str, Any]]:
        """Get a list of global attributes"""
        params = {'per_page': per_page}
        return self._make_request('GET', '/products/attributes', params=params)

    def get_attribute(self, attribute_id: int) -> Dict[str, Any]:
        """Get a specific global attribute by ID"""
        return self._make_request('GET', f'/products/attributes/{attribute_id}')

    def create_attribute(self, name: str, slug: str = None) -> Dict[str, Any]:
        """Create a new global attribute
        
        Args:
            name: The attribute name
            slug: Optional slug (will be generated from name if not provided)
        """
        data = {
            'name': name,
            'slug': slug or f'pa_{name.lower().replace(" ", "_")}'
        }
        return self._make_request('POST', '/products/attributes', data=data)

    def update_attribute(self, attribute_id: int, data: Dict[str, Any]) -> Dict[str, Any]:
        """Update an existing global attribute"""
        return self._make_request('PUT', f'/products/attributes/{attribute_id}', data=data)

    def delete_attribute(self, attribute_id: int, force: bool = False) -> Dict[str, Any]:
        """Delete a global attribute"""
        params = {'force': force}
        return self._make_request('DELETE', f'/products/attributes/{attribute_id}', params=params)

    def get_attribute_terms(self, attribute_id: int, per_page: int = 10) -> List[Dict[str, Any]]:
        """Get terms for a specific attribute"""
        params = {'per_page': per_page}
        return self._make_request('GET', f'/products/attributes/{attribute_id}/terms', params=params)

    def create_attribute_term(self, attribute_id: int, name: str, slug: str = None) -> Dict[str, Any]:
        """Create a new term for an attribute
        
        Args:
            attribute_id: The ID of the attribute
            name: The term name
            slug: Optional slug (will be generated from name if not provided)
        """
        data = {
            'name': name,
            'slug': slug or name.lower().replace(" ", "-")
        }
        return self._make_request('POST', f'/products/attributes/{attribute_id}/terms', data=data)

    def update_attribute_term(self, attribute_id: int, term_id: int, data: Dict[str, Any]) -> Dict[str, Any]:
        """Update an existing attribute term"""
        return self._make_request('PUT', f'/products/attributes/{attribute_id}/terms/{term_id}', data=data)

    def delete_attribute_term(self, attribute_id: int, term_id: int, force: bool = False) -> Dict[str, Any]:
        """Delete an attribute term"""
        params = {'force': force}
        return self._make_request('DELETE', f'/products/attributes/{attribute_id}/terms/{term_id}', params=params) 