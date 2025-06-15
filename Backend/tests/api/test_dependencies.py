import pytest
from unittest.mock import patch, MagicMock
from fastapi import HTTPException

from api.dependencies import get_woo_client, get_settings
from api.models import Settings

@pytest.fixture
def mock_settings():
    return Settings(
        wc_key="test_key",
        wc_secret="test_secret",
        wc_url="https://example.com",
        verify_ssl=True
    )

@patch("api.dependencies.WooClient")
def test_get_woo_client_with_default_ssl(mock_woo_client, mock_settings):
    """Test that get_woo_client uses settings.verify_ssl by default"""
    # Call the function
    get_woo_client(True, mock_settings)
    
    # Check that WooClient was initialized with verify_ssl=True
    mock_woo_client.assert_called_once_with(
        api_key="test_key",
        api_secret="test_secret",
        store_url="https://example.com",
        wp_username=None,
        wp_password=None,
        verify_ssl=True
    )

@patch("api.dependencies.WooClient")
def test_get_woo_client_with_override_ssl_false(mock_woo_client, mock_settings):
    """Test that get_woo_client respects verify_ssl override"""
    # Call the function with verify_ssl=False
    get_woo_client(True, mock_settings, verify_ssl=False)
    
    # Check that WooClient was initialized with verify_ssl=False
    mock_woo_client.assert_called_once_with(
        api_key="test_key",
        api_secret="test_secret",
        store_url="https://example.com",
        wp_username=None,
        wp_password=None,
        verify_ssl=False
    )

@patch("api.dependencies.WooClient")
def test_get_woo_client_with_override_ssl_true(mock_woo_client, mock_settings):
    """Test that verify_ssl=True override works when settings is False"""
    # Modify settings
    mock_settings.verify_ssl = False
    
    # Call the function with verify_ssl=True
    get_woo_client(True, mock_settings, verify_ssl=True)
    
    # Check that WooClient was initialized with verify_ssl=True
    mock_woo_client.assert_called_once_with(
        api_key="test_key",
        api_secret="test_secret",
        store_url="https://example.com",
        wp_username=None,
        wp_password=None,
        verify_ssl=True
    )
