import React from 'react';
import './Header.css';

const Header = ({ title, isApiConfigured, onRefresh }) => {
  return (
    <header className="app-header">
      <div className="header-title">
        <h1>{title}</h1>
      </div>
      
      <div className="header-actions">
        {isApiConfigured && (
          <button onClick={onRefresh} className="header-button">
            <span className="material-icons">refresh</span>
            <span className="button-text">Refresh</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
