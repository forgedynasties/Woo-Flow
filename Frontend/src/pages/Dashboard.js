import React from 'react';
import StatCard from '../components/stats/StatCard';
import './Dashboard.css';

const Dashboard = ({ stats, isLoading }) => {
  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading store statistics...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="dashboard-empty">
        <p>No statistics available. Please check your API configuration.</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <h2 className="page-title">Store Overview</h2>
      
      <div className="stats-grid">
        <StatCard 
          title="Products"
          value={stats.products.total}
          icon="inventory_2"
          color="#4a6cf7"
          details={[
            { label: 'Simple', value: stats.products.simple },
            { label: 'Variable', value: stats.products.variable },
            { label: 'Grouped', value: stats.products.grouped },
            { label: 'External', value: stats.products.external },
          ]}
        />
        
        <StatCard 
          title="Categories"
          value={stats.categories.total}
          icon="category"
          color="#6a53ff"
          details={[
            { label: 'Parent Categories', value: stats.categories.parent },
            { label: 'Child Categories', value: stats.categories.children },
          ]}
        />
        
        <StatCard 
          title="Attributes"
          value={stats.attributes.total}
          icon="tune"
          color="#ffa70f"
          details={[
            { label: 'Global Attributes', value: stats.attributes.global },
            { label: 'Local Attributes', value: stats.attributes.local },
          ]}
        />
        
        <StatCard 
          title="Tags"
          value={stats.tags.total}
          icon="local_offer"
          color="#00cc8c"
        />
      </div>
      
      <div className="dashboard-sections">
        <div className="dashboard-section card">
          <h3 className="section-title">Recent Products</h3>
          {stats.products.recent && stats.products.recent.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Price</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.products.recent.map(product => (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td>{product.type}</td>
                    <td>${product.price}</td>
                    <td>
                      <span className={`status-badge ${product.status}`}>
                        {product.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="empty-message">No recent products found</p>
          )}
        </div>
        
        <div className="dashboard-section card">
          <h3 className="section-title">Popular Categories</h3>
          {stats.categories.popular && stats.categories.popular.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Products</th>
                  <th>Slug</th>
                </tr>
              </thead>
              <tbody>
                {stats.categories.popular.map(category => (
                  <tr key={category.id}>
                    <td>{category.name}</td>
                    <td>{category.count}</td>
                    <td>{category.slug}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="empty-message">No categories found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
