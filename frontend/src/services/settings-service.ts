import { apiRequest } from './api-client';

export interface ApiSettings {
  backend_url?: string;
}

export interface ApiTestResult {
  status: string;
  message: string;
  details?: {
    backend?: {
      status: 'ok' | 'error';
      message: string;
      responseTime?: number;
    };
    products?: {
      status: 'ok' | 'error';
      message: string;
      responseTime?: number;
      data?: any;
    };
  };
}

export async function getApiSettings(): Promise<ApiSettings> {
  return apiRequest<ApiSettings>('/settings');
}

export async function testConnection(): Promise<{status: string; message: string}> {
  return apiRequest<{status: string; message: string}>('/health');
}

export async function testConnectionDetails(): Promise<ApiTestResult> {
  try {
    const startTime = performance.now();
    const healthResult = await apiRequest<{status: string; message: string}>('/health');
    const backendResponseTime = performance.now() - startTime;
    
    // Test product operations to verify full functionality
    let productTest: { status: 'ok' | 'error', message: string, responseTime?: number, data?: any } = 
      { status: 'error', message: 'Not tested' };

    if (healthResult.status === 'ok') {
      try {
        const productStartTime = performance.now();
        
        // First, try to get products list
        const productsResult = await apiRequest<any>('/products?per_page=1');
        
        // Then try to create a test product
        const testProduct = {
          name: 'Test Product - ' + new Date().toISOString(),
          type: 'simple',
          regular_price: '10.00',
          description: 'Test product created for connection testing',
          short_description: 'Test product',
          status: 'draft' // Create as draft to avoid affecting live store
        };
        
        const createResult = await apiRequest<any>('/products', {
          method: 'POST',
          body: JSON.stringify(testProduct)
        });
        
        // Clean up - delete the test product
        if (createResult && createResult.id) {
          await apiRequest<any>(`/products/${createResult.id}`, {
            method: 'DELETE'
          });
        }
        
        productTest = {
          status: 'ok',
          message: `Product operations successful. Can read products and create/delete test products.`,
          responseTime: performance.now() - productStartTime,
          data: {
            products_count: productsResult?.length || 0,
            test_product_created: createResult?.id || 'N/A'
          }
        };
      } catch (err) {
        productTest = {
          status: 'error',
          message: err instanceof Error ? err.message : 'Failed to perform product operations'
        };
      }
    }
    
    return {
      status: healthResult.status === 'ok' && productTest.status === 'ok' ? 'ok' : 'error',
      message: healthResult.status === 'ok' && productTest.status === 'ok' 
        ? 'All tests passed successfully' 
        : 'Some tests failed',
      details: {
        backend: {
          status: healthResult.status === 'ok' ? 'ok' : 'error',
          message: healthResult.message || 'Backend is healthy',
          responseTime: backendResponseTime
        },
        products: productTest
      }
    };
  } catch (err) {
    return {
      status: 'error',
      message: err instanceof Error ? err.message : 'Failed to test connection',
      details: {
        backend: {
          status: 'error',
          message: err instanceof Error ? err.message : 'Could not connect to backend API'
        }
      }
    };
  }
}
