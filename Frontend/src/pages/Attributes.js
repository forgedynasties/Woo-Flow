import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { fetchAttributes } from '../api/attributeApi';
import './Attributes.css';

const Attributes = ({ apiConfig }) => {
  const [attributes, setAttributes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedAttribute, setExpandedAttribute] = useState(null);

  useEffect(() => {
    if (apiConfig.api_key) {
      loadAttributes();
    }
  }, [apiConfig]);

  const loadAttributes = async () => {
    setIsLoading(true);
    try {
      const result = await fetchAttributes(apiConfig);
      setAttributes(result);
    } catch (error) {
      toast.error(`Failed to load attributes: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAttributeExpand = (attributeId) => {
    if (expandedAttribute === attributeId) {
      setExpandedAttribute(null);
    } else {
      setExpandedAttribute(attributeId);
    }
  };

  return (
    <div className="attributes-page">
      <div className="page-header">
        <h2 className="page-title">Attributes</h2>
      </div>

      <div className="attributes-container card">
        <div className="attributes-header">
          <h3>Product Attributes</h3>
          <button className="secondary-button" onClick={loadAttributes}>
            <span className="material-icons">refresh</span>
            Refresh
          </button>
        </div>

        {isLoading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading attributes...</p>
          </div>
        ) : attributes.length === 0 ? (
          <div className="empty-state">
            <span className="material-icons">tune</span>
            <p>No attributes found in your store.</p>
          </div>
        ) : (
          <div className="attributes-list">
            {attributes.map(attribute => (
              <div 
                key={attribute.id} 
                className={`attribute-item ${expandedAttribute === attribute.id ? 'expanded' : ''}`}
              >
                <div 
                  className="attribute-header" 
                  onClick={() => toggleAttributeExpand(attribute.id)}
                >
                  <div className="attribute-name">
                    <span className="material-icons">label</span>
                    {attribute.name}
                  </div>
                  <div className="attribute-meta">
                    <span className="attribute-slug">Slug: {attribute.slug}</span>
                    <span className="attribute-count">
                      {attribute.terms ? attribute.terms.length : 0} terms
                    </span>
                    <span className="material-icons expand-icon">
                      {expandedAttribute === attribute.id ? 'expand_less' : 'expand_more'}
                    </span>
                  </div>
                </div>
                
                {expandedAttribute === attribute.id && attribute.terms && (
                  <div className="attribute-terms">
                    <table className="terms-table">
                      <thead>
                        <tr>
                          <th>Term</th>
                          <th>Slug</th>
                          <th>Count</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attribute.terms.map(term => (
                          <tr key={term.id}>
                            <td>{term.name}</td>
                            <td>{term.slug}</td>
                            <td>{term.count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Attributes;
