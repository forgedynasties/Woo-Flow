import requests

# Disable SSL verification for a specific request
response = requests.get(
    "http://localhost:8000/api/products",
    headers={"X-API-Key": "your_api_key"},
    params={"verify_ssl": False}
)

# Or update the global setting
requests.post(
    "http://localhost:8000/api/settings/ssl",
    headers={"X-API-Key": "your_api_key"},
    json={"verify_ssl": False}
)
