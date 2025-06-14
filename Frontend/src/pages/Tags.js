import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { fetchTags } from '../api/tagApi';
import './Tags.css';

const Tags = ({ apiConfig }) => {
  const [tags, setTags] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (apiConfig.api_key) {
      loadTags();
    }
  }, [apiConfig]);

  const loadTags = async () => {
    setIsLoading(true);
    try {
      const result = await fetchTags(apiConfig);
      setTags(result);
    } catch (error) {
      toast.error(`Failed to load tags: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter tags based on search term
  const filteredTags = searchTerm 
    ? tags.filter(tag => 
        tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tag.slug.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : tags;

  return (
    <div className="tags-page">
      <div className="page-header">
        <h2 className="page-title">Tags</h2>
      </div>

      <div className="tags-container card">
        <div className="tags-header">
          <h3>Product Tags</h3>
          <button className="secondary-button" onClick={loadTags}>
            <span className="material-icons">refresh</span>
            Refresh
          </button>
        </div>

        <div className="tags-search">
          <div className="search-input">
            <span className="material-icons">search</span>
            <input
              type="text"
              placeholder="Search tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button 
                className="clear-search"
                onClick={() => setSearchTerm('')}
              >
                <span className="material-icons">close</span>
              </button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading tags...</p>
          </div>
        ) : tags.length === 0 ? (
          <div className="empty-state">
            <span className="material-icons">local_offer</span>
            <p>No tags found in your store.</p>
          </div>
        ) : filteredTags.length === 0 ? (
          <div className="empty-state">
            <span className="material-icons">search_off</span>
            <p>No tags match your search.</p>
          </div>
        ) : (
          <div className="tags-grid">
            {filteredTags.map(tag => (
              <div key={tag.id} className="tag-item">
                <div className="tag-name">{tag.name}</div>
                <div className="tag-meta">
                  <span className="tag-slug">{tag.slug}</span>
                  <span className="tag-count">{tag.count} products</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Tags;
