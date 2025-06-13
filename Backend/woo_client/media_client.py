from typing import List, Dict, Any, Optional, BinaryIO, Union
import os
import mimetypes
import base64
from .base_client import BaseWooClient


class MediaClient(BaseWooClient):
    """Client for managing WooCommerce media/images"""

    def get_media(self, per_page: int = 10) -> List[Dict[str, Any]]:
        """Get a list of media items from WordPress"""
        params = {'per_page': per_page}
        return self._make_request('GET', '/media', params=params, wordpress_api=True)
    
    def get_media_item(self, media_id: int) -> Dict[str, Any]:
        """Get a specific media item by ID"""
        return self._make_request('GET', f'/media/{media_id}', wordpress_api=True)
    
    def create_media_from_url(self, image_url: str, alt_text: str = None, title: str = None) -> Dict[str, Any]:
        """Create a media item from an external URL
        
        Args:
            image_url: The URL of the image to upload
            alt_text: Optional alt text for the image
            title: Optional title for the image
            
        Returns:
            The created media item data
        """
        data = {
            'source_url': image_url,
        }
        
        if alt_text:
            data['alt_text'] = alt_text
            
        if title:
            data['title'] = title
            
        return self._make_request('POST', '/media', data=data, wordpress_api=True)
    
    def create_media_from_file(self, file_path: str, alt_text: str = None, title: str = None) -> Dict[str, Any]:
        """Create a media item from a local file
        
        Args:
            file_path: The path to the local image file
            alt_text: Optional alt text for the image
            title: Optional title for the image
            
        Returns:
            The created media item data
        """
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")
            
        # Get the filename and mime type
        filename = os.path.basename(file_path)
        mime_type, _ = mimetypes.guess_type(file_path)
        
        if not mime_type or not mime_type.startswith('image/'):
            raise ValueError(f"File is not a valid image: {file_path}")
            
        # Read the file and encode to base64
        with open(file_path, 'rb') as img_file:
            content = base64.b64encode(img_file.read()).decode('utf-8')
            
        # Create the media item
        data = {
            'file': {
                'name': filename,
                'type': mime_type,
                'bits': content
            }
        }
        
        if alt_text:
            data['alt_text'] = alt_text
            
        if title:
            data['title'] = title or filename
            
        return self._make_request('POST', '/media', data=data, wordpress_api=True)
    
    def delete_media(self, media_id: int, force: bool = False) -> Dict[str, Any]:
        """Delete a media item
        
        Args:
            media_id: The ID of the media item to delete
            force: Whether to bypass trash and delete permanently
            
        Returns:
            The deleted media item data
        """
        params = {'force': force}
        return self._make_request('DELETE', f'/media/{media_id}', params=params, wordpress_api=True)
    
    def update_media(self, media_id: int, data: Dict[str, Any]) -> Dict[str, Any]:
        """Update a media item
        
        Args:
            media_id: The ID of the media item to update
            data: The data to update
            
        Returns:
            The updated media item data
        """
        return self._make_request('POST', f'/media/{media_id}', data=data, wordpress_api=True)
