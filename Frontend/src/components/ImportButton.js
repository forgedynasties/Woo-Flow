import React from 'react';
import './ImportButton.css';

const ImportButton = ({ onClick, isLoading, progress = 0, disabled = false }) => {
  return (
    <div className="import-button-container">
      <button 
        className={`import-button ${isLoading ? 'loading' : ''}`}
        onClick={onClick}
        disabled={disabled || isLoading}
      >
        {isLoading ? 'Importing...' : 'Import Products'}
      </button>
      
      {isLoading && (
        <div className="progress-container">
          <div className="progress-bar" style={{ width: `${progress}%` }}></div>
          <span className="progress-text">{progress}%</span>
        </div>
      )}
    </div>
  );
};

export default ImportButton;
