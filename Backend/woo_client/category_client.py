from typing import List, Dict, Any, Optional
from .base_client import BaseWooClient


class CategoryClient(BaseWooClient):
    """Client for managing WooCommerce product categories"""

    def get_categories(self, per_page: int = 100) -> List[Dict[str, Any]]:
        """Get a list of product categories
        
        Args:
            per_page: Number of categories to retrieve per page
            
        Returns:
            List of category objects
        """
        params = {'per_page': per_page}
        return self._make_request('GET', '/products/categories', params=params)
    
    def get_category(self, category_id: int) -> Dict[str, Any]:
        """Get a specific category by ID
        
        Args:
            category_id: The ID of the category to retrieve
            
        Returns:
            Category object
        """
        return self._make_request('GET', f'/products/categories/{category_id}')
    
    def get_category_by_slug(self, slug: str) -> Optional[Dict[str, Any]]:
        """Get a category by its slug
        
        Args:
            slug: The slug of the category to find
            
        Returns:
            Category object or None if not found
        """
        params = {'slug': slug}
        categories = self._make_request('GET', '/products/categories', params=params)
        return categories[0] if categories else None
    
    def get_or_create_category(self, name: str, slug: str = None, parent: int = None) -> Dict[str, Any]:
        """Get an existing category by slug or create it if it doesn't exist
        
        Args:
            name: Category name
            slug: Category slug (optional, will be generated from name)
            parent: Parent category ID (optional)
            
        Returns:
            Category object
        """
        # Generate slug from name if not provided
        if not slug:
            slug = name.lower().replace(' ', '-')
            
        # Try to find by slug
        existing = self.get_category_by_slug(slug)
        if existing:
            return existing
            
        # Create new category
        return self.create_category(name=name, slug=slug, parent=parent)
    
    def create_category(self, name: str, slug: str = None, parent: int = None, 
                      description: str = "", image: Dict[str, Any] = None) -> Dict[str, Any]:
        """Create a new product category
        
        Args:
            name: Category name
            slug: Category slug (optional)
            parent: Parent category ID (optional)
            description: Category description (optional)
            image: Category image object with ID (optional)
            
        Returns:
            Created category object
        """
        data = {
            "name": name,
            "description": description
        }
        
        if slug:
            data["slug"] = slug
            
        if parent:
            data["parent"] = parent
            
        if image:
            data["image"] = image
            
        return self._make_request('POST', '/products/categories', data=data)
    
    def update_category(self, category_id: int, data: Dict[str, Any]) -> Dict[str, Any]:
        """Update an existing category
        
        Args:
            category_id: ID of the category to update
            data: Updated category data
            
        Returns:
            Updated category object
        """
        return self._make_request('PUT', f'/products/categories/{category_id}', data=data)
    
    def delete_category(self, category_id: int, force: bool = False) -> Dict[str, Any]:
        """Delete a category
        
        Args:
            category_id: ID of the category to delete
            force: Whether to permanently delete (True) or move to trash (False)
            
        Returns:
            Deleted category object
        """
        params = {'force': force}
        return self._make_request('DELETE', f'/products/categories/{category_id}', params=params)
    
    def get_category_hierarchy(self, category_id: int) -> List[Dict[str, Any]]:
        """Get the full hierarchy (ancestors) of a category
        
        Args:
            category_id: ID of the category
            
        Returns:
            List of parent categories, ordered from root to immediate parent
        """
        category = self.get_category(category_id)
        hierarchy = []
        
        # If category has a parent, recursively get its hierarchy
        parent_id = category.get('parent')
        if parent_id:
            hierarchy.extend(self.get_category_hierarchy(parent_id))
            
        # Add current category to hierarchy
        hierarchy.append(category)
        
        return hierarchy
    
    def get_or_create_category_tree(self, path: str, delimiter: str = "/") -> Dict[str, Any]:
        """Get or create a category tree from a path string
        
        Args:
            path: Category path (e.g., "Electronics/Computers/Laptops")
            delimiter: Delimiter used in the path (default: "/")
            
        Returns:
            The leaf category object
        """
        if not path:
            raise ValueError("Category path cannot be empty")
            
        path_parts = path.split(delimiter)
        current_parent = None
        current_category = None
        
        # Process each part of the path
        for part in path_parts:
            part = part.strip()
            if not part:
                continue
                
            # Try to find or create this category level with the current parent
            current_category = self.get_or_create_category(
                name=part,
                parent=current_parent
            )
            
            # Update parent for next iteration
            current_parent = current_category['id']
            
        return current_category
