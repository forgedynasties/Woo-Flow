import React from 'react';
import ProductCard from './ProductCard';
import './ProductPreview.css';

const ProductPreview = ({ products, isLoading }) => {
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading products...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="empty-state">
        <span className="material-icons">inventory_2</span>
        <p>No products to preview. Upload a CSV file to see products here.</p>
      </div>
    );
  }

  return (
    <div className="product-preview">
      <div className="product-grid">
        {products.map((product, index) => (
          <ProductCard key={`product-${index}`} product={product} />
        ))}
      </div>
    </div>
  );
};

export default ProductPreview;
