import React, { useState } from 'react';
import './StatCard.css';

const StatCard = ({ title, value, icon, color, details = [] }) => {
  const [showDetails, setShowDetails] = useState(false);
  
  return (
    <div className="stat-card" style={{ '--card-color': color }}>
      <div className="stat-card-header">
        <div className="stat-icon" style={{ backgroundColor: `${color}20` }}>
          <span className="material-icons" style={{ color }}>{icon}</span>
        </div>
        
        <div className="stat-info">
          <h3 className="stat-title">{title}</h3>
          <p className="stat-value">{value}</p>
        </div>
        
        {details.length > 0 && (
          <button 
            className="details-toggle"
            onClick={() => setShowDetails(!showDetails)}
          >
            <span className="material-icons">
              {showDetails ? 'expand_less' : 'expand_more'}
            </span>
          </button>
        )}
      </div>
      
      {showDetails && details.length > 0 && (
        <div className="stat-details">
          {details.map((detail, index) => (
            <div key={index} className="detail-item">
              <span className="detail-label">{detail.label}</span>
              <span className="detail-value">{detail.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StatCard;
