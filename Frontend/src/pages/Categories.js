import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { fetchCategories } from '../api/categoryApi';
import './Categories.css';

const Categories = ({ apiConfig }) => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (apiConfig.api_key) {
      loadCategories();
    }
  }, [apiConfig]);

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const result = await fetchCategories(apiConfig);
      // Convert flat list to hierarchical structure
      const hierarchical = buildCategoryTree(result);
      setCategories(hierarchical);
    } catch (error) {
      toast.error(`Failed to load categories: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Build hierarchical tree from flat categories array
  const buildCategoryTree = (flatCategories) => {
    const idMapping = flatCategories.reduce((acc, category) => {
      acc[category.id] = category;
      return acc;
    }, {});

    const root = [];
    
    flatCategories.forEach(category => {
      // Handle the root element
      if (!category.parent) {
        root.push(category);
        return;
      }
      
      // Add current category to its parent's `children` array
      if (idMapping[category.parent]) {
        if (!idMapping[category.parent].children) {
          idMapping[category.parent].children = [];
        }
        idMapping[category.parent].children.push(category);
      }
    });

    return root;
  };

  return (
    <div className="categories-page">
      <div className="page-header">
        <h2 className="page-title">Categories</h2>
      </div>

      <div className="categories-container card">
        <div className="categories-header">
          <h3>Product Categories</h3>
          <button className="secondary-button" onClick={loadCategories}>
            <span className="material-icons">refresh</span>
            Refresh
          </button>
        </div>

        {isLoading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading categories...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="empty-state">
            <span className="material-icons">category</span>
            <p>No categories found in your store.</p>
          </div>
        ) : (
          <div className="category-tree">
            <table className="category-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Slug</th>
                  <th>Count</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {renderCategoryRows(categories)}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// Recursive function to render category rows with proper indentation
const renderCategoryRows = (categories, level = 0) => {
  return categories.flatMap(category => {
    const rows = [
      <tr key={category.id}>
        <td>
          <div className="category-name" style={{ paddingLeft: `${level * 20}px` }}>
            {level > 0 && <span className="category-indent">└</span>}
            {category.name}
          </div>
        </td>
        <td>{category.slug}</td>
        <td>{category.count}</td>
        <td>
          {category.description ? (
            <div className="category-description">{category.description}</div>
          ) : (
            <span className="no-description">No description</span>
          )}
        </td>
      </tr>
    ];
    
    if (category.children && category.children.length > 0) {
      rows.push(...renderCategoryRows(category.children, level + 1));
    }
    
    return rows;
  });
};

export default Categories;
