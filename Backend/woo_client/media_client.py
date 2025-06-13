from typing import List, Dict, Any, Optional, BinaryIO, Union
import os
import mimetypes
import base64
import requests
from .base_client import BaseWooClient


class MediaClient(BaseWooClient):
    """Client for managing WordPress media/images"""

    def __init__(self, api_key: str, api_secret: str, store_url: str, 
                 wp_username: Optional[str] = None, wp_password: Optional[str] = None,
                 verify_ssl: bool = True):
        """Initialize the MediaClient with API credentials
        
        Args:
            api_key: WooCommerce API key
            api_secret: WooCommerce API secret
            store_url: Store URL
            wp_username: WordPress username (recommended for media uploads)
            wp_password: WordPress application password (recommended for media uploads)
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
        # First, download the image
        response = requests.get(image_url, verify=self.verify_ssl)
        if response.status_code != 200:
            raise Exception(f"Failed to download image from URL: {image_url}")
            
        # Get the filename from the URL or use a default
        filename = os.path.basename(image_url)
        if not filename or '?' in filename:
            filename = 'image.jpg'
            
        # Get the content type and validate it
        content_type = response.headers.get('content-type', 'image/jpeg')
        if not content_type.startswith('image/'):
            raise ValueError(f"Invalid content type: {content_type}. Only image files are allowed.")
            
        # Ensure the file extension matches the content type
        ext = os.path.splitext(filename)[1].lower()
        if not ext:
            # Add extension based on content type
            if 'jpeg' in content_type or 'jpg' in content_type:
                filename += '.jpg'
            elif 'png' in content_type:
                filename += '.png'
            elif 'gif' in content_type:
                filename += '.gif'
            elif 'webp' in content_type:
                filename += '.webp'
            else:
                filename += '.jpg'  # Default to jpg if we can't determine
        
        # Create multipart form data
        files = {
            'file': (filename, response.content, content_type)
        }
        
        # Add metadata if provided
        data = {}
        if alt_text:
            data['alt_text'] = alt_text
        if title:
            data['title'] = title
            
        return self._make_request('POST', '/media', data=data, files=files, wordpress_api=True, is_multipart=True)
    
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
        
        # For multipart/form-data upload, we need to open the file directly
        with open(file_path, 'rb') as img_file:
            files = {
                'file': (filename, img_file, mime_type)
            }
            
            # Add metadata if provided
            data = {}
            if alt_text:
                data['alt_text'] = alt_text
            if title:
                data['title'] = title or filename
                
            return self._make_request('POST', '/media', data=data, files=files, wordpress_api=True, is_multipart=True)
            
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
