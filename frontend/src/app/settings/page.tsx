"use client";

import { useState, FC, useEffect } from 'react';
import { testConnection, testConnectionDetails, ApiTestResult } from '@/services/settings-service';

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{success: boolean; message: string} | null>(null);
  const [detailedTestResult, setDetailedTestResult] = useState<ApiTestResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTestConnection = async (detailed: boolean = false) => {
    setIsTesting(true);
    setTestResult(null);
    setDetailedTestResult(null);
    setError(null);
    
    try {
      if (detailed) {
        // Run detailed test
        const result = await testConnectionDetails();
        
        setDetailedTestResult(result);
        setTestResult({
          success: result.status === 'ok',
          message: result.status === 'ok' 
            ? 'All connection tests passed successfully!' 
            : `Connection tests failed: ${result.message}`
        });
      } else {
        // Simple test
        const result = await testConnection();
        
        setTestResult({
          success: result.status === 'ok',
          message: result.status === 'ok' 
            ? 'Basic connection successful!' 
            : `Connection failed: ${result.message}`
        });
      }
    } catch (err) {
      setTestResult({
        success: false,
        message: err instanceof Error ? err.message : 'Connection failed'
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Settings</h1>
      
      {error && (
        <div className="bg-red-50 text-red-800 p-4 rounded-md">
          <p className="flex items-center">
            <span className="material-icons mr-2">error</span>
            {error}
          </p>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Settings Form Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Connection Testing */}
          <div className="bg-card p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-medium mb-4">API Connection Testing</h2>
            <div className="space-y-4">
              <p className="text-sm text-zinc-600">
                Test your connection to the FastAPI backend. The detailed test will verify that you can 
                read and create products through the API.
              </p>
              
              {/* Action Buttons */}
              <div className="flex gap-2">
                <button 
                  onClick={() => handleTestConnection(false)} 
                  className="px-4 py-2 bg-muted text-muted-foreground rounded-md hover:bg-opacity-80 flex items-center"
                  disabled={isTesting}
                >
                  {isTesting ? 'Testing...' : 'Basic Test'}
                </button>
                <button 
                  onClick={() => handleTestConnection(true)} 
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-opacity-80 flex items-center"
                  disabled={isTesting}
                  title="Test backend API connection and product operations"
                >
                  {isTesting ? 'Testing...' : 'Detailed Test'}
                </button>
              </div>
            </div>
          </div>
          
          {testResult && (
            <div className={`p-4 rounded-md ${testResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              <p className="flex items-center">
                <span className="material-icons mr-2">{testResult.success ? 'check_circle' : 'error'}</span>
                {testResult.message}
              </p>
            </div>
          )}

          {detailedTestResult && (
            <div className="p-4 bg-zinc-50 rounded-lg border border-zinc-200">
              <h3 className="text-md font-medium mb-3">Detailed Connection Test Results</h3>
              
              <div className="space-y-3">
                {/* Backend API Status */}
                {detailedTestResult.details?.backend && (
                  <div className="bg-white p-3 rounded-md border border-zinc-100">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium flex items-center">
                        <span className={`material-icons mr-2 text-sm ${
                          detailedTestResult.details.backend.status === 'ok' 
                            ? 'text-green-500' 
                            : 'text-red-500'
                        }`}>
                          {detailedTestResult.details.backend.status === 'ok' ? 'check_circle' : 'error'}
                        </span>
                        Backend API Health
                      </h4>
                      <span className="text-xs text-zinc-500">
                        {detailedTestResult.details.backend.responseTime 
                          ? `${Math.round(detailedTestResult.details.backend.responseTime)}ms` 
                          : ''}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-700 mt-1">
                      {detailedTestResult.details.backend.message}
                    </p>
                  </div>
                )}

                {/* Product Operations Status */}
                {detailedTestResult.details?.products && (
                  <div className="bg-white p-3 rounded-md border border-zinc-100">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium flex items-center">
                        <span className={`material-icons mr-2 text-sm ${
                          detailedTestResult.details.products.status === 'ok' 
                            ? 'text-green-500' 
                            : 'text-red-500'
                        }`}>
                          {detailedTestResult.details.products.status === 'ok' ? 'check_circle' : 'error'}
                        </span>
                        Product Operations
                      </h4>
                      <span className="text-xs text-zinc-500">
                        {detailedTestResult.details.products.responseTime 
                          ? `${Math.round(detailedTestResult.details.products.responseTime)}ms` 
                          : ''}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-700 mt-1">
                      {detailedTestResult.details.products.message}
                    </p>
                    {detailedTestResult.details.products.data && (
                      <div className="mt-2 text-xs">
                        <details>
                          <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                            View Test Details
                          </summary>
                          <pre className="mt-2 p-2 bg-zinc-50 rounded overflow-x-auto text-xs">
                            {JSON.stringify(detailedTestResult.details.products.data, null, 2)}
                          </pre>
                        </details>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-3 text-xs text-zinc-500">
                <p>
                  If you're experiencing API connection issues, check:
                </p>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>Your API key is correctly configured in the backend (.env file)</li>
                  <li>The FastAPI backend is running on the expected port</li>
                  <li>The frontend API URL is correctly configured (.env.local)</li>
                  <li>WooCommerce credentials are properly set in the backend</li>
                  <li>No firewall or network issues are blocking the connection</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Guide Column */}
        <div className="lg:col-span-1">
          <ApiGuide />
        </div>
      </div>
    </div>
  );
}

// Guide Component
const ApiGuide: FC = () => (
  <div className="bg-card p-6 rounded-lg shadow-sm space-y-6">
    <h3 className="text-lg font-medium flex items-center gap-2">
      <span className="material-icons text-primary">help_outline</span>
      Configuration Guide
    </h3>
    
    <div>
      <h4 className="font-semibold mb-2">Environment Configuration</h4>
      <div className="text-sm text-muted-foreground space-y-2">
        <p>
          The API configuration is managed through environment files:
        </p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>
            <strong>Frontend:</strong> Configure API URL and key in 
            <code className="bg-zinc-100 px-1 py-0.5 rounded mx-1">.env.local</code>
          </li>
          <li>
            <strong>Backend:</strong> Configure WooCommerce credentials in 
            <code className="bg-zinc-100 px-1 py-0.5 rounded mx-1">.env</code>
          </li>
        </ul>
      </div>
    </div>

    <div>
      <h4 className="font-semibold mb-2">Frontend Setup</h4>
      <div className="text-sm text-muted-foreground space-y-2">
        <p>Your <code className="bg-zinc-100 px-1 py-0.5 rounded">.env.local</code> should contain:</p>
        <pre className="bg-zinc-100 p-2 rounded text-xs overflow-x-auto">
{`NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_API_KEY=your_api_key_here`}
        </pre>
      </div>
    </div>
    
    <div>
      <h4 className="font-semibold mb-2">Backend Setup</h4>
      <div className="text-sm text-muted-foreground space-y-2">
        <p>Your backend <code className="bg-zinc-100 px-1 py-0.5 rounded">.env</code> should contain:</p>
        <pre className="bg-zinc-100 p-2 rounded text-xs overflow-x-auto">
{`API_KEY=your_api_key_here
WC_URL=https://your-store.com
WC_KEY=ck_...
WC_SECRET=cs_...
VERIFY_SSL=true`}
        </pre>
      </div>
    </div>

    <div>
      <h4 className="font-semibold mb-2">Testing</h4>
      <div className="text-sm text-muted-foreground space-y-2">
        <p><strong>Basic Test:</strong> Checks if the backend API is reachable</p>
        <p><strong>Detailed Test:</strong> Verifies full functionality by testing product operations (read, create, delete)</p>
      </div>
    </div>
  </div>
);