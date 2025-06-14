import React from 'react';
import './Sidebar.css';

const Sidebar = ({ currentPage, onNavigate }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'products', label: 'Products', icon: 'inventory_2' },
    { id: 'categories', label: 'Categories', icon: 'category' },
    { id: 'attributes', label: 'Attributes', icon: 'tune' },
    { id: 'tags', label: 'Tags', icon: 'local_offer' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h1 className="sidebar-title">WooKit</h1>
      </div>
      
      <nav className="sidebar-nav">
        <ul>
          {menuItems.map(item => (
            <li 
              key={item.id}
              className={currentPage === item.id ? 'active' : ''}
              onClick={() => onNavigate(item.id)}
            >
              <span className="material-icons">{item.icon}</span>
              <span className="menu-label">{item.label}</span>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="sidebar-footer">
        <p>WooKit v1.0.0</p>
      </div>
    </div>
  );
};

export default Sidebar;
