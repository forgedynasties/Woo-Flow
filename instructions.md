# Integrating FastAPI Backend API with Next.js Frontend

This guide explains how to connect and consume your FastAPI backend API from the Next.js frontend in this project.

---

## 1. Prerequisites
- FastAPI backend running (see `/Backend`)
- Node.js and npm installed
- Backend API URL (default: `http://localhost:8000`)

---

## 2. Configure API Base URL
1. In `frontend/woo-flow`, create a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```
2. Use this variable in your frontend code to reference the backend API.

---

## 3. Example: Fetching Data from the API

### Create a Service File
- Example: `src/services/product-service.ts`

```ts
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function fetchProducts() {
  const res = await fetch(`${API_URL}/products`);
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
}
```

### Use the Service in a Component
- Example: `src/app/products/page.tsx`

```tsx
import { fetchProducts } from '@/services/product-service';

export default async function ProductsPage() {
  const products = await fetchProducts();
  return (
    <div>
      <h1>Products</h1>
      <ul>
        {products.map((p: any) => (
          <li key={p.id}>{p.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

---

## 4. CORS Setup in Backend
Ensure your FastAPI backend allows requests from the frontend:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 5. Running Both Servers
- **Backend:**
  ```bash
  cd Backend
  uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
  ```
- **Frontend:**
  ```bash
  cd frontend/woo-flow
  npm install
  npm run dev
  ```

---

## 6. Making Other API Requests
- Use the same pattern for POST, PUT, DELETE, etc.:

```ts
export async function createProduct(data: any) {
  const res = await fetch(`${API_URL}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create product');
  return res.json();
}
```

---

## 7. Troubleshooting
- **CORS errors:** Check backend CORS settings.
- **API not reachable:** Ensure both servers are running and URLs/ports match.
- **Env variables not loading:** Restart `npm run dev` after editing `.env.local`.

---

## 8. References
- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [Next.js Docs](https://nextjs.org/docs)
- [CORS Middleware](https://fastapi.tiangolo.com/tutorial/cors/)

---

You are now ready to integrate your FastAPI backend with your Next.js frontend! 