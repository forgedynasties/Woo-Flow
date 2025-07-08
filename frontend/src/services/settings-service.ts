import { apiRequest } from './api-client';

export interface ApiSettings {
  wc_url: string;
  wc_key: string;
  verify_ssl: boolean;
  api_key?: string;
  wc_secret?: string;
  wp_secret?: string;
}

export interface SSLSettings {
  verify_ssl: boolean;
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
    woocommerce?: {
      status: 'ok' | 'error';
      message: string;
      responseTime?: number;
      data?: any;
    };
    wordpress?: {
      status: 'ok' | 'error';
      message: string;
      responseTime?: number;
    };
  };
}

export async function getApiSettings(): Promise<ApiSettings> {
  return apiRequest<ApiSettings>('/settings');
}

export async function updateSslSettings(settings: SSLSettings): Promise<ApiSettings> {
  return apiRequest<ApiSettings>('/settings/ssl', {
    method: 'POST',
    body: JSON.stringify(settings)
  });
}

export async function testConnection(): Promise<{status: string; message: string}> {
  return apiRequest<{status: string; message: string}>('/health');
}

export async function testConnectionDetails(): Promise<ApiTestResult> {
  try {
    const startTime = performance.now();
    const healthResult = await apiRequest<{status: string; message: string}>('/health');
    const backendResponseTime = performance.now() - startTime;
    
    // Test WooCommerce connection if backend is available
    let woocommerceTest: { status: 'ok' | 'error', message: string, responseTime?: number, data?: any } = 
      { status: 'error', message: 'Not tested' };
    let wordpressTest: { status: 'ok' | 'error', message: string, responseTime?: number } = 
      { status: 'error', message: 'Not tested' };
    
    if (healthResult.status === 'ok') {
      try {
        const wcStartTime = performance.now();
        // Use /store/info for WooCommerce connection test
        const wcResult = await apiRequest<any>('/store/info');
        woocommerceTest = {
          status: 'ok',
          message: 'WooCommerce connection successful',
          responseTime: performance.now() - wcStartTime,
          data: wcResult
        };
      } catch (err) {
        woocommerceTest = {
          status: 'error',
          message: err instanceof Error ? err.message : 'Failed to connect to WooCommerce API'
        };
      }
      
      try {
        const wpStartTime = performance.now();
        // Use /media with a dummy payload for WordPress/media connection test
        const wpResult = await apiRequest<any>('/media', {
          method: 'POST',
          body: JSON.stringify({ url: 'https://windsoruk.co.uk/wp-content/uploads/1-49-2048x2048.jpg' })
        });
        wordpressTest = {
          status: 'ok',
          message: 'WordPress media connection successful',
          responseTime: performance.now() - wpStartTime
        };
      } catch (err) {
        wordpressTest = {
          status: 'error',
          message: err instanceof Error ? err.message : 'Failed to connect to WordPress'
        };
      }
    }
    
    return {
      status: healthResult.status,
      message: healthResult.message,
      details: {
        backend: {
          status: healthResult.status === 'ok' ? 'ok' : 'error',
          message: healthResult.message || 'Backend is healthy',
          responseTime: backendResponseTime
        },
        woocommerce: woocommerceTest,
        wordpress: wordpressTest
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
