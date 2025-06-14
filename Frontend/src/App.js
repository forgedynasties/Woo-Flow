import React, { useState, useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Categories from './pages/Categories';
import Attributes from './pages/Attributes';
import Tags from './pages/Tags';
import Settings from './pages/Settings';
import { fetchStoreStats } from './api/statsApi';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [storeStats, setStoreStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiConfig, setApiConfig] = useState(() => {
    // Load API config from localStorage if available
    const savedConfig = localStorage.getItem('wookit_api_config');
    return savedConfig ? JSON.parse(savedConfig) : {
      api_key: '',
      api_secret: '',
      store_url: '',
      wp_username: '',
      wp_password: ''
    };
  });
  
  // Check if API is configured
  const isApiConfigured = Boolean(
    apiConfig.api_key && 
    apiConfig.api_secret && 
    apiConfig.store_url
  );

  useEffect(() => {
    if (isApiConfigured) {
      loadStoreStats();
    } else {
      setIsLoading(false);
    }
  }, [isApiConfigured]);

  const loadStoreStats = async () => {
    setIsLoading(true);
    try {
      const stats = await fetchStoreStats(apiConfig);
      setStoreStats(stats);
    } catch (error) {
      console.error('Failed to load store stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveApiConfig = (config) => {
    localStorage.setItem('wookit_api_config', JSON.stringify(config));
    setApiConfig(config);
  };

  // Render the current page based on navigation
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard stats={storeStats} isLoading={isLoading} />;
      case 'products':
        return <Products apiConfig={apiConfig} refreshStats={loadStoreStats} />;
      case 'categories':
        return <Categories apiConfig={apiConfig} />;
      case 'attributes':
        return <Attributes apiConfig={apiConfig} />;
      case 'tags':
        return <Tags apiConfig={apiConfig} />;
      case 'settings':
        return <Settings apiConfig={apiConfig} onSaveConfig={saveApiConfig} />;
      default:
        return <Dashboard stats={storeStats} isLoading={isLoading} />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar 
        currentPage={currentPage} 
        onNavigate={setCurrentPage} 
      />
      
      <div className="main-content">
        <Header 
          title={currentPage.charAt(0).toUpperCase() + currentPage.slice(1)} 
          isApiConfigured={isApiConfigured}
          onRefresh={loadStoreStats}
        />
        
        <div className="page-container">
          {!isApiConfigured && currentPage !== 'settings' ? (
            <div className="api-not-configured">
              <h2>WooCommerce API Not Configured</h2>
              <p>Please go to Settings and configure your WooCommerce API credentials.</p>
              <button 
                className="primary-button" 
                onClick={() => setCurrentPage('settings')}
              >
                Go to Settings
              </button>
            </div>
          ) : (
            renderPage()
          )}
        </div>
      </div>
      
      <ToastContainer position="bottom-right" />
    </div>
  );
}

export default App;

