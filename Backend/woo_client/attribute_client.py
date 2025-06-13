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

    def get_attribute_by_name(self, name: str) -> Optional[Dict[str, Any]]:
        """Get an attribute by its name
        
        Args:
            name: The name of the attribute to find
            
        Returns:
            The attribute if found, None otherwise
        """
        attributes = self.get_attributes(per_page=100)
        for attr in attributes:
            if attr['name'].lower() == name.lower():
                return attr
        return None

    def get_or_create_attribute(self, name: str) -> Dict[str, Any]:
        """Get an existing attribute or create it if it doesn't exist
        
        Args:
            name: The name of the attribute to get or create
            
        Returns:
            The existing or newly created attribute
        """
        # Try to find existing attribute
        existing = self.get_attribute_by_name(name)
        if existing:
            return existing
            
        # Create new attribute if not found
        return self.create_attribute(name)

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

    def get_term_by_name(self, attribute_id: int, name: str) -> Optional[Dict[str, Any]]:
        """Get a term by its name for a specific attribute
        
        Args:
            attribute_id: The ID of the attribute
            name: The name of the term to find
            
        Returns:
            The term if found, None otherwise
        """
        terms = self.get_attribute_terms(attribute_id, per_page=100)
        for term in terms:
            if term['name'].lower() == name.lower():
                return term
        return None

    def get_or_create_term(self, attribute_id: int, name: str) -> Dict[str, Any]:
        """Get an existing term or create it if it doesn't exist
        
        Args:
            attribute_id: The ID of the attribute
            name: The name of the term to get or create
            
        Returns:
            The existing or newly created term
        """
        # Try to find existing term
        existing = self.get_term_by_name(attribute_id, name)
        if existing:
            return existing
            
        # Create new term if not found
        return self.create_attribute_term(attribute_id, name)

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