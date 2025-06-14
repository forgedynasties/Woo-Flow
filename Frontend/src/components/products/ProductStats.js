import React from 'react';
import './ProductStats.css';

const ProductStats = ({ stats, isLoading }) => {
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading product statistics...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="empty-state">
        <span className="material-icons">bar_chart</span>
        <p>No product statistics available.</p>
      </div>
    );
  }

  // Create charts and graphs here - for now we'll use simple stats display
  return (
    <div className="product-stats">
      <div className="stat-cards-grid">
        <div className="stat-card">
          <h3>Product Types</h3>
          <div className="stat-card-content">
            <div className="pie-chart-placeholder">
              <div className="pie-segment" style={{ 
                '--percent': `${stats.typeBreakdown.simple * 100 / stats.total}%`,
                '--color': '#4a6cf7' 
              }}>
                <span>Simple</span>
              </div>
              <div className="pie-segment" style={{ 
                '--percent': `${stats.typeBreakdown.variable * 100 / stats.total}%`,
                '--color': '#6a53ff' 
              }}>
                <span>Variable</span>
              </div>
              <div className="pie-segment" style={{ 
                '--percent': `${stats.typeBreakdown.grouped * 100 / stats.total}%`,
                '--color': '#ffa70f' 
              }}>
                <span>Grouped</span>
              </div>
              <div className="pie-segment" style={{ 
                '--percent': `${stats.typeBreakdown.external * 100 / stats.total}%`,
                '--color': '#00cc8c' 
              }}>
                <span>External</span>
              </div>
            </div>
            <div className="legend">
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#4a6cf7' }}></div>
                <span>Simple ({stats.typeBreakdown.simple})</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#6a53ff' }}></div>
                <span>Variable ({stats.typeBreakdown.variable})</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#ffa70f' }}></div>
                <span>Grouped ({stats.typeBreakdown.grouped})</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#00cc8c' }}></div>
                <span>External ({stats.typeBreakdown.external})</span>
              </div>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <h3>Price Range</h3>
          <div className="stat-card-content">
            <div className="bar-chart-placeholder">
              {Object.entries(stats.priceRanges).map(([range, count]) => (
                <div className="bar-item" key={range}>
                  <div className="bar-label">{range}</div>
                  <div className="bar" style={{ width: `${count * 100 / stats.total}%` }}></div>
                  <div className="bar-value">{count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <h3>Status Distribution</h3>
          <div className="stat-card-content">
            <div className="bar-chart-placeholder">
              {Object.entries(stats.statusBreakdown).map(([status, count]) => (
                <div className="bar-item" key={status}>
                  <div className="bar-label">{status}</div>
                  <div 
                    className="bar" 
                    style={{ 
                      width: `${count * 100 / stats.total}%`,
                      backgroundColor: status === 'publish' ? '#00cc8c' : 
                                       status === 'draft' ? '#f08c00' : '#ffa70f'
                    }}
                  ></div>
                  <div className="bar-value">{count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <h3>Stock Status</h3>
          <div className="stat-card-content">
            <div className="pie-chart-placeholder">
              <div className="pie-segment" style={{ 
                '--percent': `${stats.stockStatus.instock * 100 / stats.total}%`,
                '--color': '#00cc8c' 
              }}>
                <span>In Stock</span>
              </div>
              <div className="pie-segment" style={{ 
                '--percent': `${stats.stockStatus.outofstock * 100 / stats.total}%`,
                '--color': '#f08c00' 
              }}>
                <span>Out of Stock</span>
              </div>
              <div className="pie-segment" style={{ 
                '--percent': `${stats.stockStatus.onbackorder * 100 / stats.total}%`,
                '--color': '#ffa70f' 
              }}>
                <span>On Backorder</span>
              </div>
            </div>
            <div className="legend">
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#00cc8c' }}></div>
                <span>In Stock ({stats.stockStatus.instock})</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#f08c00' }}></div>
                <span>Out of Stock ({stats.stockStatus.outofstock})</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#ffa70f' }}></div>
                <span>On Backorder ({stats.stockStatus.onbackorder})</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductStats;
