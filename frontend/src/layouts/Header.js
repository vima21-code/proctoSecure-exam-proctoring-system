import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-gray-800 text-white p-4 flex items-center justify-between">
      <Link to="/" className="flex items-center">
        {/* The logo is referenced directly from the public folder */}
        <img src="/logo.png" alt="Logo" className="h-8 w-auto mr-2" />
        <span className="text-xl font-bold">My App</span>
      </Link>
      <nav>
        <Link to="/about" className="mr-4 hover:text-gray-300">About</Link>
        <Link to="/contact" className="hover:text-gray-300">Contact</Link>
      </nav>
    </header>
  );
};

export default Header;