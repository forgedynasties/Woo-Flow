import React, { useState } from 'react';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const [selectedVariation, setSelectedVariation] = useState(null);
  const hasVariations = product.variations && product.variations.length > 0;

  const handleVariationChange = (event) => {
    const variationId = event.target.value;
    if (variationId === "") {
      setSelectedVariation(null);
    } else {
      const variation = product.variations[parseInt(variationId, 10)];
      setSelectedVariation(variation);
    }
  };

  // Determine which data to display (product or selected variation)
  const displayData = selectedVariation || product;
  
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

  const attributes = formatAttributes(displayData);

  // Create display name for variation
  const getVariationDisplayName = (variation) => {
    const attrParts = [];
    for (let i = 1; i <= 10; i++) {
      if (variation[`attr_value_${i}`]) {
        attrParts.push(variation[`attr_value_${i}`]);
      }
    }
    return attrParts.join(' / ');
  };

  return (
    <div className={`product-card ${product.type}`}>
      <div className="product-header">
        <div className="product-title">
          <h3>{product.name || "Unnamed Product"}</h3>
          <span className="product-sku">{product.sku ? `SKU: ${product.sku}` : ""}</span>
        </div>
        <span className={`product-type ${product.type}`}>{product.type}</span>
      </div>
      
      {hasVariations && (
        <div className="variation-selector">
          <label>
            Variation:
            <select onChange={handleVariationChange} value={selectedVariation ? product.variations.indexOf(selectedVariation) : ""}>
              <option value="">Show parent product</option>
              {product.variations.map((variation, index) => (
                <option key={index} value={index}>
                  {variation.sku || getVariationDisplayName(variation) || `Variation ${index + 1}`}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      <div className="product-details">
        <div className="product-pricing">
          {displayData.regular_price && (
            <span className="regular-price">${displayData.regular_price}</span>
          )}
          {displayData.sale_price && (
            <span className="sale-price">${displayData.sale_price}</span>
          )}
        </div>
        
        {attributes.length > 0 && (
          <div className="product-attributes">
            <h4>Attributes:</h4>
            <ul>
              {attributes.map((attr, index) => (
                <li key={index}>
                  <strong>{attr.name}:</strong> {attr.value}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {displayData.stock_quantity && (
          <div className="product-stock">
            <span className="stock-quantity">Stock: {displayData.stock_quantity}</span>
            <span className={`stock-status ${displayData.stock_status || 'instock'}`}>
              {displayData.stock_status || 'In stock'}
            </span>
          </div>
        )}
      </div>
      
      {displayData.description && (
        <div className="product-description">
          <h4>Description:</h4>
          <p>{displayData.description}</p>
        </div>
      )}
    </div>
  );
};

export default ProductCard;
