import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient

from api.main import app
from api.models import Settings

def test_update_ssl_settings(client):
    """Test updating SSL verification settings"""
    # Prepare test data
    ssl_settings = {"verify_ssl": False}
    
    # Make the request
    response = client.post("/api/settings/ssl", json=ssl_settings)
    
    # Assertions
    assert response.status_code == 200
    assert response.json()["verify_ssl"] is False
    
    # Test changing back to True
    ssl_settings = {"verify_ssl": True}
    response = client.post("/api/settings/ssl", json=ssl_settings)
    
    # Assertions
    assert response.status_code == 200
    assert response.json()["verify_ssl"] is True

def test_api_requests_with_ssl_override(client, mock_woo_client):
    """Test making API requests with verify_ssl parameter"""
    # Prepare mock data
    mock_products = [
        {"id": 1, "name": "Test Product"}
    ]
    
    # Set up the mock
    mock_instance = MagicMock()
    mock_instance.products.get_products.return_value = mock_products
    mock_woo_client.return_value = mock_instance
    
    # Make the request with verify_ssl=False
    response = client.get("/api/products?verify_ssl=false")
    
    # Assertions
    assert response.status_code == 200
    
    # Verify that WooClient was created with verify_ssl=False
    mock_woo_client.assert_called_with(
        auth_valid=True, 
        settings=pytest.ANY, 
        verify_ssl=False
    )
