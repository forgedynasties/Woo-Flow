/**
 * Base API client for interacting with the FastAPI backend
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

/**
 * Make an authenticated API request to the FastAPI backend
 */
export async function apiRequest<T>(
  endpoint: string, 
  options: FetchOptions = {}
): Promise<T> {
  // Prepare URL with query parameters if provided
  let url = `${API_URL}${endpoint}`;
  if (options.params) {
    const queryParams = new URLSearchParams();
    Object.entries(options.params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, String(value));
      }
    });
    url += `?${queryParams.toString()}`;
  }

  // Prepare headers with API key
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };
  
  if (API_KEY) {
    headers['X-API-Key'] = API_KEY;
  }

  // Make the request
  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle errors
  if (!response.ok) {
    let errorMessage = `API Error: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorData.message || errorMessage;
    } catch (e) {
      // If error parsing fails, use the default message
    }
    throw new Error(errorMessage);
  }
  
  // Return the data
  if (response.status === 204) { // No content
    return {} as T;
  }
  
  return response.json() as Promise<T>;
}

/**
 * Upload a file to the FastAPI backend
 */
export async function uploadFile<T>(
  endpoint: string,
  file: File,
  fieldName: string = 'file',
  extraFields?: Record<string, string>
): Promise<T> {
  // Create form data
  const formData = new FormData();
  formData.append(fieldName, file);
  
  // Add any extra fields
  if (extraFields) {
    Object.entries(extraFields).forEach(([key, value]) => {
      formData.append(key, value);
    });
  }
  
  // Set up headers (don't include Content-Type as it will be set by the browser)
  const headers: Record<string, string> = {};
  if (API_KEY) {
    headers['X-API-Key'] = API_KEY;
  }
  
  // Make the request
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'POST',
    body: formData,
    headers
  });
  
  // Handle errors
  if (!response.ok) {
    let errorMessage = `API Error: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorData.message || errorMessage;
    } catch (e) {
      // If error parsing fails, use the default message
    }
    throw new Error(errorMessage);
  }
  
  // Return the data
  return response.json() as Promise<T>;
}
