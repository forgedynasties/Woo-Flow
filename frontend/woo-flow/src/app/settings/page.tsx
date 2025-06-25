"use client";

import { useState, FC, ChangeEvent } from 'react';

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

  const [showWcSecret, setShowWcSecret] = useState(false);
  const [showWpSecret, setShowWpSecret] = useState(false);
  const [showFastApiKey, setShowFastApiKey] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = () => {
    // In a real app, you would post this to your backend
    console.log('Saving settings:', settings);
    // You could also save to localStorage for persistence
    localStorage.setItem('woo-flow-settings', JSON.stringify(settings));
    alert('Settings saved!');
  };

  const handleTestConnection = () => {
    console.log('Testing connection with:', settings);
    alert('Testing connection...');
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
            <button onClick={handleTestConnection} className="px-4 py-2 bg-muted text-muted-foreground rounded-md hover:bg-opacity-80">
              Test Connection
            </button>
            <button onClick={handleSave} className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-opacity-80">
              Save Settings
            </button>
          </div>
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
        onClick={onToggle}
        className="absolute inset-y-0 right-0 px-3 flex items-center text-muted-foreground"
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