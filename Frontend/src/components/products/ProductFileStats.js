import React, { useRef, useEffect } from 'react';
import Chart from 'chart.js/auto';
import './ProductFileStats.css';

const ProductFileStats = ({ products }) => {
  const typeChartRef = useRef(null);
  let typeChart = null;

  // Calculate stats
  const totalProducts = products.length;
  
  // Count product types
  const typeCount = products.reduce((acc, product) => {
    const type = product.type || 'unknown';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});
  
  // Count total variations
  const totalVariations = products.reduce((sum, product) => {
    return sum + (product.variations ? product.variations.length : 0);
  }, 0);
  
  // Calculate price ranges
  const prices = products.map(product => Number(product.regular_price) || 0).filter(price => price > 0);
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;
  const avgPrice = prices.length ? (prices.reduce((sum, price) => sum + price, 0) / prices.length).toFixed(2) : 0;
  
  // Calculate price ranges for chart
  const priceRanges = {
    'Under $10': 0,
    '$10 - $50': 0,
    '$50 - $100': 0,
    'Over $100': 0
  };
  
  prices.forEach(price => {
    if (price < 10) priceRanges['Under $10']++;
    else if (price < 50) priceRanges['$10 - $50']++;
    else if (price < 100) priceRanges['$50 - $100']++;
    else priceRanges['Over $100']++;
  });

  useEffect(() => {
    // Clean up previous chart if it exists
    if (typeChart) typeChart.destroy();

    // Create product types pie chart
    if (typeChartRef.current && Object.keys(typeCount).length > 0) {
      const ctx = typeChartRef.current.getContext('2d');
      typeChart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: Object.keys(typeCount).map(type => 
            `${type.charAt(0).toUpperCase() + type.slice(1)} (${typeCount[type]})`
          ),
          datasets: [{
            data: Object.values(typeCount),
            backgroundColor: [
              '#6366F1', // Indigo for Simple
              '#8B5CF6', // Purple for Variable
              '#F59E0B', // Amber for Grouped
              '#10B981', // Emerald for External
              '#6B7280', // Gray for unknown
            ],
            borderWidth: 0,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                usePointStyle: true,
                padding: 20
              }
            }
          }
        }
      });
    }

    // Cleanup on unmount
    return () => {
      if (typeChart) typeChart.destroy();
    };
  }, [products]);

  return (
    <div className="product-file-stats">
      <h3>Product File Summary</h3>
      
      <div className="file-stats-grid">
        <div className="stats-overview">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-label">Total Products</div>
              <div className="stat-value">{totalProducts}</div>
            </div>
            
            <div className="stat-item">
              <div className="stat-label">Total Variations</div>
              <div className="stat-value">{totalVariations}</div>
            </div>
            
            <div className="stat-item">
              <div className="stat-label">Price Range</div>
              <div className="stat-value">${minPrice} - ${maxPrice}</div>
            </div>
            
            <div className="stat-item">
              <div className="stat-label">Average Price</div>
              <div className="stat-value">${avgPrice}</div>
            </div>
          </div>
        </div>
        
        <div className="chart-section">
          <div className="chart-container">
            <h4>Product Types</h4>
            <div className="pie-chart-container">
              <canvas ref={typeChartRef}></canvas>
            </div>
          </div>
          
          <div className="chart-container">
            <h4>Price Range</h4>
            <div className="bar-chart">
              {Object.entries(priceRanges).map(([range, count]) => (
                <div className="bar-item" key={range}>
                  <div className="bar-label">{range}</div>
                  <div className="bar-wrapper">
                    <div 
                      className="bar" 
                      style={{ 
                        width: `${count * 100 / Math.max(...Object.values(priceRanges), 1)}%` 
                      }}
                    ></div>
                  </div>
                  <div className="bar-value">{count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductFileStats;
