from fastapi import APIRouter, Depends, HTTPException, status, Path, Query, File, UploadFile, Form
from typing import List, Dict, Any, Optional
import tempfile
import os

from woo_client import WooClient
from api.dependencies import get_woo_client
from api.models import MediaUpload, MediaResponse

router = APIRouter()

@router.post("", response_model=MediaResponse, status_code=status.HTTP_201_CREATED)
async def create_media_from_url(
    media_data: MediaUpload,
    woo_client: WooClient = Depends(get_woo_client)
):
    """Create a new media item from URL or file path"""
    try:
        if media_data.url:
            # Create media from URL
            media = woo_client.media.create_media_from_url(
                image_url=media_data.url,
                alt_text=media_data.alt_text,
                title=media_data.title
            )
        elif media_data.file_path:
            # Create media from file path
            media = woo_client.media.create_media_from_file(
                file_path=media_data.file_path,
                alt_text=media_data.alt_text,
                title=media_data.title
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Either url or file_path must be provided"
            )
        # Ensure 'src' field is present in the response
        if isinstance(media, dict):
            if 'src' not in media:
                # Try to map from 'source_url' or nested fields
                if 'source_url' in media:
                    media['src'] = media['source_url']
                elif 'guid' in media and isinstance(media['guid'], dict) and 'rendered' in media['guid']:
                    media['src'] = media['guid']['rendered']
                else:
                    media['src'] = ''
        return media
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create media: {str(e)}"
        )

@router.post("/upload", response_model=MediaResponse, status_code=status.HTTP_201_CREATED)
async def upload_media(
    file: UploadFile = File(...),
    alt_text: Optional[str] = Form(None),
    title: Optional[str] = Form(None),
    woo_client: WooClient = Depends(get_woo_client)
):
    """Upload a media file directly"""
    try:
        # Create temporary file
        with tempfile.NamedTemporaryFile(delete=False) as temp_file:
            temp_file.write(await file.read())
            temp_file_path = temp_file.name
        
        try:
            # Upload the file
            media = woo_client.media.create_media_from_file(
                file_path=temp_file_path,
                alt_text=alt_text or file.filename,
                title=title or file.filename
            )
            # Ensure 'src' field is present in the response
            if isinstance(media, dict):
                if 'src' not in media:
                    if 'source_url' in media:
                        media['src'] = media['source_url']
                    elif 'guid' in media and isinstance(media['guid'], dict) and 'rendered' in media['guid']:
                        media['src'] = media['guid']['rendered']
                    else:
                        media['src'] = ''
            return media
        finally:
            # Clean up temporary file
            os.unlink(temp_file_path)
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to upload media: {str(e)}"
        )

@router.get("/{media_id}", response_model=MediaResponse)
async def get_media(
    media_id: int = Path(..., ge=1),
    woo_client: WooClient = Depends(get_woo_client)
):
    """Get a specific media item by ID"""
    try:
        media = woo_client.media.get_media(media_id)
        # Ensure 'src' field is present in the response
        if isinstance(media, dict):
            if 'src' not in media:
                if 'source_url' in media:
                    media['src'] = media['source_url']
                elif 'guid' in media and isinstance(media['guid'], dict) and 'rendered' in media['guid']:
                    media['src'] = media['guid']['rendered']
                else:
                    media['src'] = ''
        return media
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Media with ID {media_id} not found: {str(e)}"
        )

@router.delete("/{media_id}", response_model=Dict[str, Any])
async def delete_media(
    media_id: int = Path(..., ge=1),
    force: bool = Query(False),
    woo_client: WooClient = Depends(get_woo_client)
):
    """Delete a media item"""
    try:
        result = woo_client.media.delete_media(media_id, force=force)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to delete media: {str(e)}"
        )
