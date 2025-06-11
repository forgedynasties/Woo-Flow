import pytest
from unittest.mock import patch, MagicMock
import json

# Import modules (will work thanks to conftest.py)
from woo_client.product_client import ProductClient
from models.product import Product


@pytest.fixture
def client():
    """Create a ProductClient instance for testing"""
    return ProductClient("test_key", "test_secret", "https://example.com", verify_ssl=False)


@pytest.fixture
def mock_response():
    """Create a mock response object"""
    mock = MagicMock()
    mock.status_code = 200
    return mock


@patch('woo_client.base_client.requests.request')
def test_get_products(mock_request, client, mock_response):
    """Test getting products from the API"""
    # Mock response data
    response_data = [
        {
            "id": 1,
            "name": "Test Product 1",
            "type": "simple",
            "regular_price": "19.99"
        },
        {
            "id": 2,
            "name": "Test Product 2",
            "type": "simple",
            "regular_price": "29.99"
        }
    ]
    
    # Configure mock response
    mock_response.json.return_value = response_data
    mock_response.text = json.dumps(response_data)
    mock_request.return_value = mock_response

    # Call the method
    products = client.get_products()
    
    # Print helpful info during test
    print(f"\n✓ Retrieved {len(products)} products")
    
    # Verify the request was made correctly
    mock_request.assert_called_once_with(
        method='GET',
        url='https://example.com/wp-json/wc/v3/products',
        headers={'Authorization': 'Basic dGVzdF9rZXk6dGVzdF9zZWNyZXQ=', 'Content-Type': 'application/json'},
        params={'per_page': 10},
        data=None,
        verify=False
    )

    # Verify the products were returned
    assert len(products) == 2
    assert products[0]["id"] == 1
    assert products[0]["name"] == "Test Product 1"
    assert products[1]["id"] == 2
    assert products[1]["name"] == "Test Product 2"


@patch('woo_client.base_client.requests.request')
def test_get_product_by_id(mock_request, client, mock_response):
    """Test getting a specific product by ID"""
    # Mock response data
    response_data = {
        "id": 42,
        "name": "Specific Product",
        "type": "simple",
        "regular_price": "42.00",
        "description": "This is a test product",
        "short_description": "A test product"
    }
    
    # Configure mock response
    mock_response.json.return_value = response_data
    mock_response.text = json.dumps(response_data)
    mock_request.return_value = mock_response

    # Call the method
    product = client.get_product_by_id(42)
    
    # Print helpful info during test
    print(f"\n✓ Found product: '{product['name']}' (${product['regular_price']})")
    
    # Verify the request
    mock_request.assert_called_once_with(
        method='GET',
        url='https://example.com/wp-json/wc/v3/products/42',
        headers={'Authorization': 'Basic dGVzdF9rZXk6dGVzdF9zZWNyZXQ=', 'Content-Type': 'application/json'},
        params=None,
        data=None,
        verify=False
    )

    # Verify the product data
    assert product["id"] == 42
    assert product["name"] == "Specific Product"
    assert product["regular_price"] == "42.00"


@patch('woo_client.base_client.requests.request')
def test_create_product(mock_request, client, mock_response):
    """Test creating a product"""
    # Mock response data
    response_data = {
        "id": 999,
        "name": "New Product",
        "type": "simple",
        "regular_price": "99.99",
        "description": "A new product",
        "short_description": "New product"
    }
    
    # Configure mock response
    mock_response.status_code = 201
    mock_response.json.return_value = response_data
    mock_response.text = json.dumps(response_data)
    mock_request.return_value = mock_response

    # Product data
    product_data = {
        "name": "New Product",
        "type": "simple", 
        "regular_price": "99.99",
        "description": "A new product",
        "short_description": "New product"
    }

    # Call the method
    created_product = client.create_product(product_data)
    
    # Print helpful info during test
    print(f"\n✓ Created: '{created_product['name']}' - ID: {created_product['id']}")
    
    # Verify the request
    mock_request.assert_called_once_with(
        method='POST',
        url='https://example.com/wp-json/wc/v3/products',
        headers={'Authorization': 'Basic dGVzdF9rZXk6dGVzdF9zZWNyZXQ=', 'Content-Type': 'application/json'},
        params=None,
        data=json.dumps(product_data),
        verify=False
    )

    # Verify the created product
    assert created_product["id"] == 999
    assert created_product["name"] == "New Product"
    assert created_product["regular_price"] == "99.99"


@patch('woo_client.base_client.requests.request')
def test_create_product_with_model(mock_request, client, mock_response):
    """Test creating a product using a Product model"""
    # Mock response data
    response_data = {
        "id": 888,
        "name": "Model Product",
        "type": "simple",
        "regular_price": "88.88"
    }
    
    # Configure mock response
    mock_response.status_code = 201
    mock_response.json.return_value = response_data
    mock_response.text = json.dumps(response_data)
    mock_request.return_value = mock_response

    # Create a Product model
    product_model = Product(
        name="Model Product",
        type="simple",
        regular_price="88.88"
    )

    # Convert to dict for verification
    product_dict = product_model.to_dict()

    # Call the method
    created_product = client.create_product(product_model)
    
    # Print helpful info during test
    print(f"\n✓ Created from model: '{created_product['name']}' - ${created_product['regular_price']}")
    
    # Verify the request
    mock_request.assert_called_once_with(
        method='POST',
        url='https://example.com/wp-json/wc/v3/products',
        headers={'Authorization': 'Basic dGVzdF9rZXk6dGVzdF9zZWNyZXQ=', 'Content-Type': 'application/json'},
        params=None,
        data=json.dumps(product_dict),
        verify=False
    )

    # Verify the created product
    assert created_product["id"] == 888
    assert created_product["name"] == "Model Product"
    assert created_product["regular_price"] == "88.88"


@patch('woo_client.base_client.requests.request')
def test_update_product(mock_request, client, mock_response):
    """Test updating a product"""
    # Mock response data
    response_data = {
        "id": 123,
        "name": "Updated Product",
        "type": "simple",
        "regular_price": "199.99"
    }
    
    # Configure mock response
    mock_response.json.return_value = response_data
    mock_response.text = json.dumps(response_data)
    mock_request.return_value = mock_response

    # Update data
    update_data = {
        "name": "Updated Product",
        "regular_price": "199.99"
    }

    # Call the method
    updated_product = client.update_product(123, update_data)
    
    # Print helpful info during test
    print(f"\n✓ Updated: '{updated_product['name']}' - New price: ${updated_product['regular_price']}")
    
    # Verify the request
    mock_request.assert_called_once_with(
        method='PUT',
        url='https://example.com/wp-json/wc/v3/products/123',
        headers={'Authorization': 'Basic dGVzdF9rZXk6dGVzdF9zZWNyZXQ=', 'Content-Type': 'application/json'},
        params=None,
        data=json.dumps(update_data),
        verify=False
    )

    # Verify the updated product
    assert updated_product["id"] == 123
    assert updated_product["name"] == "Updated Product"
    assert updated_product["regular_price"] == "199.99"


@patch('woo_client.base_client.requests.request')
def test_delete_product(mock_request, client, mock_response):
    """Test deleting a product"""
    # Mock response data
    response_data = {
        "id": 456,
        "name": "Deleted Product",
        "deleted": True
    }
    
    # Configure mock response
    mock_response.json.return_value = response_data
    mock_response.text = json.dumps(response_data)
    mock_request.return_value = mock_response

    # Call the method
    result = client.delete_product(456, force=True)
    
    # Print helpful info during test
    print(f"\n✓ Deleted product ID: {result['id']} - '{result['name']}'")
    
    # Verify the request
    mock_request.assert_called_once_with(
        method='DELETE',
        url='https://example.com/wp-json/wc/v3/products/456',
        headers={'Authorization': 'Basic dGVzdF9rZXk6dGVzdF9zZWNyZXQ=', 'Content-Type': 'application/json'},
        params={'force': True},
        data=None,
        verify=False
    )

    # Verify the result
    assert result["id"] == 456
    assert result["deleted"] == True
