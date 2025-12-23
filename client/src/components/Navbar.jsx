import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ user, onLogout }) => {
  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">
          MERN Blog
        </Link>
        <div className="flex space-x-4">
          <Link to="/" className="hover:text-blue-200">
            Home
          </Link>
          {user ? (
            <>
              <Link to="/create" className="hover:text-blue-200">
                Create Post
              </Link>
              <span>Welcome, {user.name}</span>
              <button onClick={onLogout} className="hover:text-blue-200">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-blue-200">
                Login
              </Link>
              <Link to="/register" className="hover:text-blue-200">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;