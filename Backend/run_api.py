import os
import uvicorn
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Debug prints
print("\nEnvironment variables:")
print(f"API_KEY: {os.getenv('API_KEY')}")
print(f"WC_KEY: {os.getenv('WC_KEY')}")
print(f"WC_SECRET: {os.getenv('WC_SECRET')}")
print(f"WC_URL: {os.getenv('WC_URL')}")
print(f"WP_USERNAME: {os.getenv('WP_USERNAME')}")
print(f"WP_SECRET: {'*' * len(os.getenv('WP_SECRET', '')) if os.getenv('WP_SECRET') else 'Not set'}")

# Get port from environment or use default
port = int(os.getenv("API_PORT", "8000"))
host = os.getenv("API_HOST", "0.0.0.0")
reload = os.getenv("API_RELOAD", "true").lower() == "true"

if __name__ == "__main__":
    print(f"\nStarting Woo-Kit API on {host}:{port}")
    print(f"Debug mode: {'enabled' if reload else 'disabled'}")
    print("Press Ctrl+C to exit")
    
    uvicorn.run(
        "api.main:app", 
        host=host, 
        port=port, 
        reload=reload,
        log_level="info"
    )
