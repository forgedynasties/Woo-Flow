# Woo-Flow API Testing Guide

This guide provides comprehensive instructions for testing the Woo-Flow API.

## Test Environment Setup

The test suite uses a dedicated test environment configuration:

- `.env.test` - Contains test credentials and configuration
- `tests/api/conftest.py` - Sets up test fixtures and dependencies

### Test Configuration

The test environment is configured to:

- Disable API key authentication during tests
- Mock WooCommerce client interactions
- Use predefined test credentials

## Running Tests

### Using the run_tests.py Script

The easiest way to run tests is using the provided script:

```bash
python run_tests.py
```

This script:
1. Loads the test environment variables
2. Runs pytest with coverage reports
3. Provides helpful output about the test environment

### Running Tests Directly with pytest

You can also run tests directly with pytest:

```bash
# Load the test environment variables
pytest tests/api -v --cov=api --cov-report=term --cov-report=html:coverage_html
```

### Running Individual Test Files

To run a specific test file:

```bash
pytest tests/api/test_products_api.py -v
```

### Running Individual Test Functions

To run a specific test function:

```bash
pytest tests/api/test_products_api.py::test_get_products -v
```

## Test Structure

### Unit Tests

These tests cover individual API endpoints and functions:

- `test_main.py` - Core API functionality tests
- `test_products_api.py` - Product endpoint tests
- `test_categories_api.py` - Category endpoint tests
- `test_attributes_api.py` - Attribute endpoint tests
- `test_media_api.py` - Media endpoint tests
- `test_store_api.py` - Store information endpoint tests

### Test Fixtures

The main test fixtures are:

- `client` - A FastAPI TestClient with authentication bypass
- `mock_woo_client` - A mock WooClient for testing API endpoints

## Authentication in Tests

By default, API key authentication is disabled in tests by setting `api_key=None` in the test settings.

If you need to test with authentication:

1. Set `API_KEY=test_key` in `.env.test`
2. Update the `test_settings` fixture in `conftest.py`
3. Add API key headers to your test requests:
   ```python
   response = client.get("/api/products", headers={"X-API-Key": "test_key"})
   ```

## Coverage Reports

The test suite generates coverage reports:

- Terminal output shows summary statistics
- HTML reports are generated in `coverage_html/` directory

To view HTML coverage reports, open `coverage_html/index.html` in your browser.

## Common Testing Issues

### Authentication Errors (401 Unauthorized)

If your tests are getting 401 errors:

1. Check that `api_key=None` in the test settings
2. Verify that the client fixture is being used in tests
3. Check that dependency overrides are properly set up

### Dependency Injection Issues

If your tests have problems with dependencies:

1. Make sure `app.dependency_overrides` is properly configured
2. Verify that mock objects are correctly set up
3. Check that all dependencies are properly injected

### Coverage Gaps

If you have low coverage in certain areas:

1. Add tests for missing endpoint functions
2. Test error cases and edge cases
3. Ensure all conditional branches are tested

## Writing New Tests

When adding new API endpoints, follow this pattern:

1. Create an appropriate mock response
2. Set up the mock WooClient
3. Make the API request using the `client` fixture
4. Verify the response status code and content
5. Verify that the mock was called with correct parameters

Example:

```python
def test_new_endpoint(client, mock_woo_client):
    # Prepare mock data
    mock_response = {"id": 1, "name": "Test Item"}
    
    # Set up the mock
    mock_instance = MagicMock()
    mock_instance.some_method.return_value = mock_response
    mock_woo_client.return_value = mock_instance
    
    # Make the request
    response = client.get("/api/new-endpoint")
    
    # Assertions
    assert response.status_code == 200
    assert response.json()["name"] == "Test Item"
    
    # Verify the mock was called correctly
    mock_instance.some_method.assert_called_once()
```
