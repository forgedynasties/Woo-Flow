import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { testApiConnection } from '../api/settingsApi';
import './Settings.css';

const Settings = ({ apiConfig, onSaveConfig }) => {
  const [config, setConfig] = useState(apiConfig);
  const [testing, setTesting] = useState(false);
  const [showSecrets, setShowSecrets] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setConfig(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSave = async () => {
    // Check for required fields
    if (!config.api_key || !config.api_secret || !config.store_url) {
      toast.warning('API Key, API Secret, and Store URL are required');
      return;
    }
    
    // Normalize store URL
    let storeUrl = config.store_url;
    if (!storeUrl.startsWith('http')) {
      storeUrl = `https://${storeUrl}`;
    }
    // Remove trailing slash
    if (storeUrl.endsWith('/')) {
      storeUrl = storeUrl.slice(0, -1);
    }
    
    const updatedConfig = { 
      ...config, 
      store_url: storeUrl 
    };
    
    onSaveConfig(updatedConfig);
    toast.success('API configuration saved successfully');
  };
  
  const handleTestConnection = async () => {
    if (!config.api_key || !config.api_secret || !config.store_url) {
      toast.warning('API Key, API Secret, and Store URL are required');
      return;
    }
    
    try {
      setTesting(true);
      const result = await testApiConnection(config);
      if (result.success) {
        toast.success('Connection successful! API is working correctly.');
      } else {
        toast.error(`Connection failed: ${result.message}`);
      }
    } catch (error) {
      toast.error(`Error testing connection: ${error.message}`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="settings-page">
      <div className="card settings-container">
        <h2 className="section-title">WooCommerce API Settings</h2>
        
        <div className="settings-form">
          <div className="form-group">
            <label htmlFor="store_url">Store URL</label>
            <input
              type="text"
              id="store_url"
              name="store_url"
              value={config.store_url}
              onChange={handleChange}
              placeholder="https://your-store.com"
            />
            <div className="form-help">The URL of your WooCommerce store</div>
          </div>
          
          <div className="form-group">
            <label htmlFor="api_key">API Key</label>
            <div className="password-field">
              <input
                type={showSecrets ? "text" : "password"}
                id="api_key"
                name="api_key"
                value={config.api_key}
                onChange={handleChange}
                placeholder="ck_xxxxxxxxxxxxxxxxxxxxxxxx"
              />
            </div>
            <div className="form-help">Your WooCommerce API consumer key</div>
          </div>
          
          <div className="form-group">
            <label htmlFor="api_secret">API Secret</label>
            <div className="password-field">
              <input
                type={showSecrets ? "text" : "password"}
                id="api_secret"
                name="api_secret"
                value={config.api_secret}
                onChange={handleChange}
                placeholder="cs_xxxxxxxxxxxxxxxxxxxxxxxx"
              />
            </div>
            <div className="form-help">Your WooCommerce API consumer secret</div>
          </div>
          
          <div className="show-secrets-toggle">
            <label>
              <input
                type="checkbox"
                checked={showSecrets}
                onChange={() => setShowSecrets(!showSecrets)}
              />
              Show API keys
            </label>
          </div>
          
          <h3>WordPress API Settings (optional)</h3>
          <div className="form-help settings-note">
            These are needed for media uploads and some advanced features.
          </div>
          
          <div className="form-group">
            <label htmlFor="wp_username">WordPress Username</label>
            <input
              type="text"
              id="wp_username"
              name="wp_username"
              value={config.wp_username}
              onChange={handleChange}
              placeholder="WordPress username"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="wp_password">WordPress App Password</label>
            <div className="password-field">
              <input
                type={showSecrets ? "text" : "password"}
                id="wp_password"
                name="wp_password"
                value={config.wp_password}
                onChange={handleChange}
                placeholder="WordPress application password"
              />
            </div>
            <div className="form-help">
              An <a href="https://make.wordpress.org/core/2020/11/05/application-passwords-integration-guide/" target="_blank" rel="noreferrer">application password</a> created in WordPress admin
            </div>
          </div>
          
          <div className="settings-actions">
            <button 
              className="secondary-button"
              onClick={handleTestConnection}
              disabled={testing}
            >
              {testing ? 'Testing...' : 'Test Connection'}
            </button>
            
            <button 
              className="primary-button"
              onClick={handleSave}
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
      
      <div className="card api-help-container">
        <h3 className="section-title">How to Generate API Keys</h3>
        <ol className="help-steps">
          <li>Log in to your WordPress admin panel</li>
          <li>Navigate to <strong>WooCommerce &gt; Settings &gt; Advanced</strong></li>
          <li>Select the <strong>REST API</strong> tab</li>
          <li>Click <strong>Add Key</strong> to create a new key</li>
          <li>Enter a description (e.g., "WooKit")</li>
          <li>Select a user with admin privileges</li>
          <li>Set permissions to <strong>Read/Write</strong></li>
          <li>Click <strong>Generate API key</strong></li>
          <li>Copy the Consumer Key and Consumer Secret to the fields above</li>
        </ol>
        
        <h3 className="section-title">How to Generate WordPress App Password</h3>
        <ol className="help-steps">
          <li>Log in to your WordPress admin panel</li>
          <li>Navigate to <strong>Users &gt; Profile</strong></li>
          <li>Scroll down to the <strong>Application Passwords</strong> section</li>
          <li>Enter a name for the application (e.g., "WooKit")</li>
          <li>Click <strong>Add New Application Password</strong></li>
          <li>Copy the generated password to the WordPress App Password field above</li>
        </ol>
      </div>
    </div>
  );
};

export default Settings;
