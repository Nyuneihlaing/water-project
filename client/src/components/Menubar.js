// src/components/MenuBar.js
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function MenuBar() {
  const location = useLocation();

  // Helper function to apply active class
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-blue-500 p-4">
      <ul className="flex space-x-6 justify-center">
        <li>
          <Link
            to="/"
            className={`text-white font-semibold px-4 py-2 rounded ${isActive('/') ? 'bg-blue-700' : 'hover:bg-blue-600'}`}
          >
            Calculator
          </Link>
        </li>
        <li>
          <Link
            to="/history"
            className={`text-white font-semibold px-4 py-2 rounded ${isActive('/history') ? 'bg-blue-700' : 'hover:bg-blue-600'}`}
          >
            History
          </Link>
        </li>
        <li>
          <Link
            to="/options"
            className={`text-white font-semibold px-4 py-2 rounded ${isActive('/options') ? 'bg-blue-700' : 'hover:bg-blue-600'}`}
          >
            Options
          </Link>
        </li>
      </ul>
    </nav>
  );
}

export default MenuBar;