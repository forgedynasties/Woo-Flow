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
          <button onClick={onRefresh} className="refresh-button">
            <span className="material-icons">refresh</span>
            Refresh
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
