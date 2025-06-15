import React, { useRef, useEffect } from 'react';
import Chart from 'chart.js/auto';
import './ProductStats.css';

const ProductStats = ({ stats, isLoading }) => {
  const productTypesChartRef = useRef(null);
  const stockStatusChartRef = useRef(null);
  let productTypesChart = null;
  let stockStatusChart = null;

  useEffect(() => {
    if (stats && !isLoading) {
      // Clean up previous charts if they exist
      if (productTypesChart) productTypesChart.destroy();
      if (stockStatusChart) stockStatusChart.destroy();

      // Create product types pie chart
      if (productTypesChartRef.current) {
        const ctx = productTypesChartRef.current.getContext('2d');
        productTypesChart = new Chart(ctx, {
          type: 'pie',
          data: {
            labels: Object.keys(stats.typeBreakdown).map(type => 
              `${type.charAt(0).toUpperCase() + type.slice(1)} (${stats.typeBreakdown[type]})`
            ),
            datasets: [{
              data: Object.values(stats.typeBreakdown),
              backgroundColor: [
                '#6366F1', // Indigo for Simple
                '#8B5CF6', // Purple for Variable
                '#F59E0B', // Amber for Grouped
                '#10B981', // Emerald for External
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

      // Create stock status pie chart
      if (stockStatusChartRef.current) {
        const ctx = stockStatusChartRef.current.getContext('2d');
        stockStatusChart = new Chart(ctx, {
          type: 'pie',
          data: {
            labels: [
              `In Stock (${stats.stockStatus.instock})`,
              `Out of Stock (${stats.stockStatus.outofstock})`,
              `On Backorder (${stats.stockStatus.onbackorder})`
            ],
            datasets: [{
              data: [
                stats.stockStatus.instock,
                stats.stockStatus.outofstock,
                stats.stockStatus.onbackorder
              ],
              backgroundColor: [
                '#10B981', // Emerald for In Stock
                '#F59E0B', // Amber for Out of Stock
                '#F97316', // Orange for On Backorder
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
    }

    // Cleanup on unmount
    return () => {
      if (productTypesChart) productTypesChart.destroy();
      if (stockStatusChart) stockStatusChart.destroy();
    };
  }, [stats, isLoading]);

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

  return (
    <div className="product-stats">
      <div className="stats-grid">
        <div className="stats-card">
          <h3>Product Types</h3>
          <div className="chart-container">
            <canvas ref={productTypesChartRef}></canvas>
          </div>
        </div>

        <div className="stats-card">
          <h3>Stock Status</h3>
          <div className="chart-container">
            <canvas ref={stockStatusChartRef}></canvas>
          </div>
        </div>

        <div className="stats-card">
          <h3>Price Range</h3>
          <div className="bar-chart">
            {Object.entries(stats.priceRanges).map(([range, count]) => (
              <div className="bar-item" key={range}>
                <div className="bar-label">{range}</div>
                <div className="bar-wrapper">
                  <div 
                    className="bar" 
                    style={{ 
                      width: `${count * 100 / Math.max(...Object.values(stats.priceRanges))}%` 
                    }}
                  ></div>
                </div>
                <div className="bar-value">{count}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="stats-card">
          <h3>Status Distribution</h3>
          <div className="bar-chart">
            {Object.entries(stats.statusBreakdown).map(([status, count]) => (
              <div className="bar-item" key={status}>
                <div className="bar-label">{status.charAt(0).toUpperCase() + status.slice(1)}</div>
                <div className="bar-wrapper">
                  <div 
                    className="bar" 
                    style={{ 
                      width: `${count * 100 / Math.max(...Object.values(stats.statusBreakdown))}%`,
                      backgroundColor: getStatusColor(status)
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
  );
};

// Helper function to get color based on status
const getStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case 'publish': return '#10B981';
    case 'draft': return '#F59E0B';
    case 'pending': return '#F97316';
    default: return '#6366F1';
  }
};

export default ProductStats;
