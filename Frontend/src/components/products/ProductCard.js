import React, { useState } from 'react';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const [expanded, setExpanded] = useState(false);
  const hasVariations = product.variations && product.variations.length > 0;

  // Format attributes for display
  const formatAttributes = (product) => {
    const attributes = [];
    
    // Check for attribute_X fields in the product data
    for (let i = 1; i <= 10; i++) {
      const nameKey = `attr_name_${i}`;
      const valueKey = `attr_value_${i}`;
      
      if (product[nameKey] && product[valueKey]) {
        attributes.push({
          name: product[nameKey],
          value: product[valueKey]
        });
      }
    }
    
    return attributes;
  };

  // Create display name for variation
  const getVariationDisplayName = (variation) => {
    const attrParts = [];
    for (let i = 1; i <= 10; i++) {
      if (variation[`attr_name_${i}`] && variation[`attr_value_${i}`]) {
        attrParts.push(`${variation[`attr_name_${i}`]}: ${variation[`attr_value_${i}`]}`);
      }
    }
    return attrParts.join(' / ');
  };

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  return (
    <div className={`product-card ${product.type} ${expanded ? 'expanded' : ''}`}>
      <div className="product-card-main">
        <div className="product-card-left">
          <div className="product-header">
            <span className={`product-type ${product.type}`}>{product.type}</span>
            <div className="product-title">
              <h3>{product.name || "Unnamed Product"}</h3>
              <span className="product-sku">{product.sku ? `SKU: ${product.sku}` : ""}</span>
            </div>
          </div>
          
          <div className="product-brief">
            <div className="product-pricing">
              {product.regular_price && (
                <span className="regular-price">${product.regular_price}</span>
              )}
              {product.sale_price && (
                <span className="sale-price">${product.sale_price}</span>
              )}
            </div>
            
            {product.stock_quantity && (
              <div className="product-stock">
                <span className="stock-quantity">Stock: {product.stock_quantity}</span>
                <span className={`stock-status ${product.stock_status || 'instock'}`}>
                  {product.stock_status || 'In stock'}
                </span>
              </div>
            )}
          </div>
        </div>
        
        <div className="product-card-right">
          {hasVariations && (
            <div className="variation-info">
              <span className="variation-count">{product.variations.length} variations</span>
            </div>
          )}
          
          <button className="expand-button" onClick={toggleExpanded}>
            <span className="material-icons">{expanded ? 'expand_less' : 'expand_more'}</span>
          </button>
        </div>
      </div>

      {expanded && (
        <div className="product-card-details">
          {product.attributes && product.attributes.length > 0 && (
            <div className="product-attributes">
              <h4>Product Attributes:</h4>
              <div className="attributes-list">
                {formatAttributes(product).map((attr, index) => (
                  <div key={index} className="attribute-tag">
                    <strong>{attr.name}:</strong> {attr.value}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {product.description && (
            <div className="product-description">
              <h4>Description:</h4>
              <p>{product.description}</p>
            </div>
          )}
          
          {hasVariations && (
            <div className="variations-list">
              <h4>Variations ({product.variations.length}):</h4>
              {product.variations.map((variation, index) => (
                <div key={index} className="variation-item">
                  <div className="variation-header">
                    <span className="variation-name">{getVariationDisplayName(variation) || `Variation ${index + 1}`}</span>
                    <span className="variation-sku">{variation.sku || 'No SKU'}</span>
                  </div>
                  <div className="variation-attributes">
                    {formatAttributes(variation).map((attr, attrIndex) => (
                      <div key={attrIndex} className="variation-attribute">
                        <span className="attribute-name">{attr.name}:</span>
                        <span className="attribute-value">{attr.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="variation-price">
                    {variation.regular_price && <span className="price">${variation.regular_price}</span>}
                    {variation.sale_price && <span className="sale">${variation.sale_price}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductCard;
