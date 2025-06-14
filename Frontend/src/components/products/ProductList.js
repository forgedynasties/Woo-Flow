import React from 'react';
import './ProductList.css';

const ProductList = ({ products, isLoading, page, totalPages, onPageChange, onRefresh }) => {
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading products...</p>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="empty-state">
        <span className="material-icons">inventory_2</span>
        <p>No products found in your store.</p>
        <button className="secondary-button" onClick={onRefresh}>
          <span className="material-icons">refresh</span>
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="product-list-container">
      <div className="product-list-header">
        <h3>Store Products</h3>
        <button className="secondary-button" onClick={onRefresh}>
          <span className="material-icons">refresh</span>
          Refresh
        </button>
      </div>
      
      <div className="product-table-container">
        <table className="product-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>SKU</th>
              <th>Price</th>
              <th>Type</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id}>
                <td className="product-image-cell">
                  {product.images && product.images.length > 0 ? (
                    <img src={product.images[0].src} alt={product.name} />
                  ) : (
                    <div className="no-image">
                      <span className="material-icons">image_not_supported</span>
                    </div>
                  )}
                </td>
                <td>{product.name}</td>
                <td>{product.sku || 'No SKU'}</td>
                <td>
                  {product.price ? (
                    <>
                      <span className="product-price">${product.price}</span>
                      {product.sale_price && (
                        <span className="product-sale-price">${product.sale_price}</span>
                      )}
                    </>
                  ) : (
                    'N/A'
                  )}
                </td>
                <td>
                  <span className={`product-type-badge ${product.type}`}>
                    {product.type}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${product.status}`}>
                    {product.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="pagination">
        <button 
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="pagination-button"
        >
          <span className="material-icons">navigate_before</span>
        </button>
        
        <span className="page-info">Page {page} of {totalPages}</span>
        
        <button 
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="pagination-button"
        >
          <span className="material-icons">navigate_next</span>
        </button>
      </div>
    </div>
  );
};

export default ProductList;
