import { apiRequest } from './api-client';

export interface Category {
  id: number;
  name: string;
  parent: number;
  count: number;
  slug?: string;
  description?: string;
}

export async function fetchCategories(perPage: number = 100, parent?: number) {
  return apiRequest<Category[]>('/categories', {
    params: {
      per_page: perPage,
      ...(parent !== undefined ? { parent } : {})
    }
  });
}

export async function deleteCategory(id: number) {
  return apiRequest<{ id: number; deleted: boolean }>(`/categories/${id}?force=true`, {
    method: 'DELETE',
  });
}

export async function updateCategory(id: number, data: Partial<Category>) {
  return apiRequest<Category>(`/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
} 