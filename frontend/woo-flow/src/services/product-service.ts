const API_URL = process.env.NEXT_PUBLIC_API_URL;

import { apiRequest, uploadFile } from './api-client';

export interface Product {
  id: number;
  name: string;
  type?: string;
  sku?: string;
  regular_price?: string;
  sale_price?: string;
  description?: string;
  short_description?: string;
  manage_stock?: boolean;
  stock_quantity?: number;
  stock_status?: string;
  categories?: Array<{id: number, name: string}>;
  images?: Array<{id: number, src: string}>;
  [key: string]: any;
}

interface ProductsResponse {
  products: Product[];
}

interface ImportCsvResponse {
  created: Product[];
  failed: Array<{row: number, error: string}>;
}

export async function fetchProducts(
  page: number = 1,
  perPage: number = 10,
  search?: string,
  category?: number,
  status?: string
) {
  return apiRequest<Product[]>('/products', {
    params: {
      page,
      per_page: perPage,
      search,
      category,
      status
    }
  });
}

export async function getProductById(id: number) {
  return apiRequest<Product>(`/products/${id}`);
}

export async function createProduct(productData: Partial<Product>) {
  return apiRequest<Product>('/products', {
    method: 'POST',
    body: JSON.stringify(productData)
  });
}

export async function updateProduct(id: number, productData: Partial<Product>) {
  return apiRequest<Product>(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(productData)
  });
}

export async function deleteProduct(id: number, force: boolean = false) {
  return apiRequest<{id: number; deleted: boolean}>(`/products/${id}`, {
    method: 'DELETE',
    params: { force }
  });
}

export async function importProductsFromCsv(file: File): Promise<ImportCsvResponse> {
  return uploadFile<ImportCsvResponse>('/products/upload/csv', file);
}

// Product variations
export async function fetchProductVariations(productId: number, page: number = 1, perPage: number = 10) {
  return apiRequest<Product[]>(`/products/${productId}/variations`, {
    params: { page, per_page: perPage }
  });
}

export async function getVariationById(productId: number, variationId: number) {
  return apiRequest<Product>(`/products/${productId}/variations/${variationId}`);
}

export async function createVariation(productId: number, variationData: Partial<Product>) {
  return apiRequest<Product>(`/products/${productId}/variations`, {
    method: 'POST',
    body: JSON.stringify(variationData)
  });
}

export async function updateVariation(productId: number, variationId: number, variationData: Partial<Product>) {
  return apiRequest<Product>(`/products/${productId}/variations/${variationId}`, {
    method: 'PUT',
    body: JSON.stringify(variationData)
  });
}

export async function deleteVariation(productId: number, variationId: number, force: boolean = false) {
  return apiRequest<{id: number; deleted: boolean}>(`/products/${productId}/variations/${variationId}`, {
    method: 'DELETE',
    params: { force }
  });
}

export async function getProductCount() {
  const res = await apiRequest<{ count: number }>("/products/count");
  return res.count;
}

export async function getCategoryCount() {
  const res = await apiRequest<{ count: number }>("/categories/count");
  return res.count;
}