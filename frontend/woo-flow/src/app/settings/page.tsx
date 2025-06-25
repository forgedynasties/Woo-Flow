"use client";

import { useState, FC, ChangeEvent, useEffect } from 'react';
import { getApiSettings, updateSslSettings, testConnection, testConnectionDetails, ApiTestResult } from '@/services/settings-service';

// Define the shape of the settings state
interface Settings {
  wcUrl: string;
  wcKey: string;
  wcSecret: string;
  wpUsername: string;
  wpSecret: string;
  verifySsl: boolean;
  fastApiKey: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    wcUrl: '',
    wcKey: '',
    wcSecret: '',
    wpUsername: '',
    wpSecret: '',
    verifySsl: true,
    fastApiKey: '',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{success: boolean; message: string} | null>(null);
  const [detailedTestResult, setDetailedTestResult] = useState<ApiTestResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showWcSecret, setShowWcSecret] = useState(false);
  const [showWpSecret, setShowWpSecret] = useState(false);
  const [showFastApiKey, setShowFastApiKey] = useState(false);
  
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        const apiSettings = await getApiSettings();
        
        // Map API settings to form state
        setSettings(prev => ({
          ...prev,
          wcUrl: apiSettings.wc_url || '',
          wcKey: apiSettings.wc_key || '',
          wcSecret: '',
          wpSecret: '',
          verifySsl: apiSettings.verify_ssl,
          fastApiKey: ''
        }));
      } catch (err) {
        console.error('Failed to load settings:', err);
        setError(err instanceof Error ? err.message : 'Failed to load settings');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSettings();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    
    try {
      // Only save SSL settings for now, as backend does not support updating secrets via API
      await updateSslSettings({ verify_ssl: settings.verifySsl });
      
      // In a real app, you might also save to localStorage for persistence
      localStorage.setItem('woo-flow-settings', JSON.stringify(settings));
      
      setTestResult({
        success: true,
        message: 'Settings saved successfully!'
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
      setTestResult({
        success: false,
        message: 'Failed to save settings'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async (detailed: boolean = false) => {
    setIsTesting(true);
    setTestResult(null);
    setDetailedTestResult(null);
    
    try {
      if (detailed) {
        // Run detailed test
        const result = await testConnectionDetails();
        
        setDetailedTestResult(result);
        setTestResult({
          success: result.status === 'ok',
          message: result.status === 'ok' 
            ? 'Connection tests completed. See details below.' 
            : `Connection failed: ${result.message}`
        });
      } else {
        // Simple test
        const result = await testConnection();
        
        setTestResult({
          success: result.status === 'ok',
          message: result.status === 'ok' 
            ? 'Connection successful!' 
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
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Settings Form Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* WooCommerce Settings */}
          <div className="bg-card p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-medium mb-4">WooCommerce API</h2>
            <div className="space-y-4">
              <InputField label="Store URL" name="wcUrl" value={settings.wcUrl} onChange={handleInputChange} placeholder="https://example.com" />
              <InputField label="Consumer Key" name="wcKey" value={settings.wcKey} onChange={handleInputChange} placeholder="ck_..." />
              <SecretInputField 
                label="Consumer Secret" 
                name="wcSecret" 
                value={settings.wcSecret} 
                onChange={handleInputChange} 
                placeholder="cs_..."
                show={showWcSecret}
                onToggle={() => setShowWcSecret(!showWcSecret)}
              />
              <p className="text-xs text-zinc-500">For security, secrets are never shown. Enter a new value to update, or leave blank to keep the current value.</p>
            </div>
          </div>
          
          {/* WordPress Settings */}
          <div className="bg-card p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-medium mb-4">WordPress Application Password</h2>
            <div className="space-y-4">
              <InputField label="WordPress Username" name="wpUsername" value={settings.wpUsername} onChange={handleInputChange} placeholder="admin" />
              <SecretInputField 
                label="Application Password" 
                name="wpSecret" 
                value={settings.wpSecret} 
                onChange={handleInputChange} 
                placeholder="xxxx xxxx xxxx xxxx"
                show={showWpSecret}
                onToggle={() => setShowWpSecret(!showWpSecret)}
              />
              <p className="text-xs text-zinc-500">For security, secrets are never shown. Enter a new value to update, or leave blank to keep the current value.</p>
            </div>
          </div>

          {/* Backend and SSL Settings */}
          <div className="bg-card p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-medium mb-4">Backend & SSL</h2>
            <div className="space-y-4">
              <SecretInputField 
                label="Backend API Key" 
                name="fastApiKey" 
                value={settings.fastApiKey} 
                onChange={handleInputChange} 
                placeholder="Your FastAPI secret key"
                show={showFastApiKey}
                onToggle={() => setShowFastApiKey(!showFastApiKey)}
              />
              <p className="text-xs text-zinc-500">For security, secrets are never shown. Enter a new value to update, or leave blank to keep the current value.</p>
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  name="verifySsl" 
                  checked={settings.verifySsl} 
                  onChange={handleInputChange} 
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="verifySsl" className="ml-2 block text-sm">Verify SSL Certificate</label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <button 
              onClick={() => handleTestConnection(true)} 
              className="px-4 py-2 bg-muted text-muted-foreground rounded-md hover:bg-opacity-80 flex items-center"
              disabled={isTesting || isLoading}
              title="Run comprehensive connection test with detailed results"
            >
              {isTesting ? 'Testing...' : 'Advanced Test'}
            </button>
            <button 
              onClick={() => handleTestConnection(false)} 
              className="px-4 py-2 bg-muted text-muted-foreground rounded-md hover:bg-opacity-80 flex items-center"
              disabled={isTesting || isLoading}
            >
              {isTesting ? 'Testing...' : 'Basic Test'}
            </button>
            <button 
              onClick={handleSave} 
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-opacity-80 flex items-center"
              disabled={isSaving || isLoading}
            >
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
          
          {testResult && (
            <div className={`mt-4 p-4 rounded-md ${testResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              <p className="flex items-center">
                <span className="material-icons mr-2">{testResult.success ? 'check_circle' : 'error'}</span>
                {testResult.message}
              </p>
            </div>
          )}

          {detailedTestResult && (
            <div className="mt-4 p-4 bg-zinc-50 rounded-lg border border-zinc-200">
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
                        Backend API
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

                {/* WooCommerce API Status */}
                {detailedTestResult.details?.woocommerce && (
                  <div className="bg-white p-3 rounded-md border border-zinc-100">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium flex items-center">
                        <span className={`material-icons mr-2 text-sm ${
                          detailedTestResult.details.woocommerce.status === 'ok' 
                            ? 'text-green-500' 
                            : 'text-red-500'
                        }`}>
                          {detailedTestResult.details.woocommerce.status === 'ok' ? 'check_circle' : 'error'}
                        </span>
                        WooCommerce API
                      </h4>
                      <span className="text-xs text-zinc-500">
                        {detailedTestResult.details.woocommerce.responseTime 
                          ? `${Math.round(detailedTestResult.details.woocommerce.responseTime)}ms` 
                          : ''}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-700 mt-1">
                      {detailedTestResult.details.woocommerce.message}
                    </p>
                    {detailedTestResult.details.woocommerce.data && (
                      <div className="mt-2 text-xs">
                        <details>
                          <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                            View WooCommerce API Response
                          </summary>
                          <pre className="mt-2 p-2 bg-zinc-50 rounded overflow-x-auto text-xs">
                            {JSON.stringify(detailedTestResult.details.woocommerce.data, null, 2)}
                          </pre>
                        </details>
                      </div>
                    )}
                  </div>
                )}

                {/* WordPress API Status */}
                {detailedTestResult.details?.wordpress && (
                  <div className="bg-white p-3 rounded-md border border-zinc-100">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium flex items-center">
                        <span className={`material-icons mr-2 text-sm ${
                          detailedTestResult.details.wordpress.status === 'ok' 
                            ? 'text-green-500' 
                            : 'text-red-500'
                        }`}>
                          {detailedTestResult.details.wordpress.status === 'ok' ? 'check_circle' : 'error'}
                        </span>
                        WordPress API
                      </h4>
                      <span className="text-xs text-zinc-500">
                        {detailedTestResult.details.wordpress.responseTime 
                          ? `${Math.round(detailedTestResult.details.wordpress.responseTime)}ms` 
                          : ''}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-700 mt-1">
                      {detailedTestResult.details.wordpress.message}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-3 text-xs text-zinc-500">
                <p>
                  If you're experiencing API connection issues, check:
                </p>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>Your API keys are correctly entered</li>
                  <li>The WordPress website is accessible</li>
                  <li>WooCommerce REST API is enabled</li>
                  <li>{settings.verifySsl ? 'SSL certificate is valid' : 'Consider enabling SSL verification for security'}</li>
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

// Helper components for form fields
interface InputFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
}

const InputField: FC<InputFieldProps> = ({ label, name, value, onChange, placeholder }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium mb-1">{label}</label>
    <input
      type="text"
      name={name}
      id={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-3 py-2 bg-input border border-zinc-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
    />
  </div>
);

interface SecretInputFieldProps extends InputFieldProps {
  show: boolean;
  onToggle: () => void;
}

const SecretInputField: FC<SecretInputFieldProps> = ({ label, name, value, onChange, placeholder, show, onToggle }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium mb-1">{label}</label>
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        name={name}
        id={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-3 py-2 bg-input border border-zinc-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <button 
        type="button"
        onClick={value === '********' ? undefined : onToggle}
        className="absolute inset-y-0 right-0 px-3 flex items-center text-muted-foreground"
        disabled={value === '********'}
        tabIndex={value === '********' ? -1 : 0}
        aria-disabled={value === '********'}
      >
        <span className="material-icons text-base">{show ? 'visibility_off' : 'visibility'}</span>
      </button>
    </div>
  </div>
);

// Guide Component
const ApiGuide: FC = () => (
  <div className="bg-card p-6 rounded-lg shadow-sm space-y-6">
    <h3 className="text-lg font-medium flex items-center gap-2">
      <span className="material-icons text-primary">help_outline</span>
      How to get API Keys
    </h3>
    
    <div>
      <h4 className="font-semibold mb-2">1. WooCommerce API Keys</h4>
      <ol className="list-decimal list-inside text-sm space-y-1 text-muted-foreground">
        <li>Go to <b>WooCommerce &gt; Settings &gt; Advanced &gt; REST API</b>.</li>
        <li>Click <b>Add key</b>.</li>
        <li>Give a description, choose a user, and set <b>Permissions</b> to <b>Read/Write</b>.</li>
        <li>Click <b>Generate API key</b>.</li>
        <li>Copy your <b>Consumer key</b> and <b>Consumer secret</b>.</li>
      </ol>
    </div>

    <div>
      <h4 className="font-semibold mb-2">2. WordPress Application Password</h4>
      <ol className="list-decimal list-inside text-sm space-y-1 text-muted-foreground">
        <li>Go to <b>Users &gt; Profile</b> in your WordPress admin.</li>
        <li>Scroll down to <b>Application Passwords</b>.</li>
        <li>Enter a name for the new password (e.g., "Woo Flow").</li>
        <li>Click <b>Add New Application Password</b>.</li>
        <li>Copy the generated password (e.g., <code>xxxx xxxx xxxx xxxx</code>).</li>
        <li>This password will not be shown again, so save it securely.</li>
      </ol>
    </div>
    
    <div>
      <h4 className="font-semibold mb-2">3. Backend API Key</h4>
      <p className="text-sm text-muted-foreground">
        This is a secret key you define in your backend's configuration to secure its API. Ensure the key here matches the one in your backend.
      </p>
    </div>
  </div>
);