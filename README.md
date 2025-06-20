# Woo-Flow

A powerful toolkit for managing WooCommerce products.

## Components

- **Backend**: Python-based WooCommerce client library and FastAPI server
- **Frontend**: (Coming soon) React-based admin interface

## Backend

The backend consists of two main components:

1. **WooClient Library**: A Python client library for interacting with the WooCommerce REST API
2. **FastAPI Server**: A RESTful API that wraps the WooClient library and provides endpoints for a frontend application

### Setup and Installation

#### Prerequisites

- Python 3.8+
- WooCommerce store with REST API credentials

#### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/woo-flow.git
   cd woo-flow/Backend
   ```

2. Create a virtual environment and activate it:

   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file:

   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

#### Running the API

```bash
python run_api.py
```

The API will be available at http://localhost:8000.

#### Using Docker

1. Build and start the container:

   ```bash
   docker-compose up -d
   ```

2. The API will be available at http://localhost:8000.

### API Documentation

When the API is running, you can access the automatically generated documentation:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## License

[MIT License](LICENSE)