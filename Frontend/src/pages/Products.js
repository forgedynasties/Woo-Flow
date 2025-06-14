import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import CSVImporter from '../components/products/CSVImporter';
import ProductList from '../components/products/ProductList';
import ProductStats from '../components/products/ProductStats';
import { fetchProducts, fetchProductStats } from '../api/productApi';
import './Products.css';

const Products = ({ apiConfig, refreshStats }) => {
  const [activeTab, setActiveTab] = useState('list');
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadProducts();
    loadProductStats();
  }, [apiConfig, page]);

  const loadProducts = async () => {
    if (!apiConfig.api_key) return;
    
    setIsLoading(true);
    try {
      const result = await fetchProducts(apiConfig, page);
      setProducts(result.products);
      setTotalPages(result.totalPages);
    } catch (error) {
      toast.error(`Failed to load products: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const loadProductStats = async () => {
    if (!apiConfig.api_key) return;
    
    try {
      const stats = await fetchProductStats(apiConfig);
      setStats(stats);
    } catch (error) {
      console.error('Failed to load product stats:', error);
    }
  };

  const handleImportSuccess = () => {
    toast.success('Products imported successfully!');
    loadProducts();
    loadProductStats();
    refreshStats && refreshStats();
  };

  const tabs = [
    { id: 'list', label: 'Product List' },
    { id: 'import', label: 'Import Products' },
    { id: 'stats', label: 'Product Statistics' },
  ];

  return (
    <div className="products-page">
      <div className="page-header">
        <h2 className="page-title">Products</h2>
      </div>
      
      <div className="tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="tab-content">
        {activeTab === 'list' && (
          <ProductList 
            products={products} 
            isLoading={isLoading}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            onRefresh={loadProducts}
          />
        )}
        
        {activeTab === 'import' && (
          <CSVImporter 
            apiConfig={apiConfig} 
            onImportSuccess={handleImportSuccess} 
          />
        )}
        
        {activeTab === 'stats' && (
          <ProductStats stats={stats} isLoading={isLoading} />
        )}
      </div>
    </div>
  );
};

export default Products;
