// src/components/Topbar.js
import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import { Sun, Moon } from 'lucide-react';
import { AppContext } from '../App';
import { theme as customTheme } from '../theme';

const Topbar = ({ user }) => {
  const [open, setOpen] = useState(false);
  const { theme, toggleTheme } = useContext(AppContext);
  const navigate = useNavigate();
  const currentTheme = customTheme[theme];

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <header className={`${currentTheme.foreground} ${currentTheme.text} shadow-md sticky top-0 z-40`}>
      <div className="flex items-center justify-between p-4 max-w-7xl mx-auto">
        <h1 className={`text-xl md:text-2xl font-bold ${currentTheme.primary}`}>FinTrack 💰</h1>

        <nav className="hidden md:flex gap-6 items-center">
          <Link to="/" className={`hover:${currentTheme.primary} transition`}>Dashboard</Link>
          <Link to="/income" className={`hover:${currentTheme.primary} transition`}>Income</Link>
          <Link to="/expenses" className={`hover:${currentTheme.primary} transition`}>Expenses</Link>
        </nav>

        <div className="flex items-center gap-4">
          <span className={`hidden sm:inline text-sm ${currentTheme.subtext}`}>Hi, {user?.username || 'User'}</span>
          <button onClick={toggleTheme} title="Toggle Theme" className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button
            onClick={handleLogout}
            className="hidden md:block bg-red-500 px-4 py-2 rounded-lg text-white font-semibold hover:bg-red-600 transition"
          >
            Sign Out
          </button>
          <div className="md:hidden">
            <button onClick={() => setOpen(!open)}>
              {open ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <nav className={`flex flex-col md:hidden gap-4 px-4 pb-4 ${currentTheme.foreground} border-t border-gray-200 dark:border-gray-700`}>
          <Link to="/" onClick={() => setOpen(false)} className={`py-2 hover:${currentTheme.primary}`}>Dashboard</Link>
          <Link to="/income" onClick={() => setOpen(false)} className={`py-2 hover:${currentTheme.primary}`}>Income</Link>
          <Link to="/expenses" onClick={() => setOpen(false)} className={`py-2 hover:${currentTheme.primary}`}>Expenses</Link>
          <button
            onClick={() => {
              setOpen(false);
              handleLogout();
            }}
            className="mt-2 bg-red-500 px-4 py-2 rounded-lg text-white font-semibold hover:bg-red-600 transition w-fit"
          >
            Sign Out
          </button>
        </nav>
      )}
    </header>
  );
};

export default Topbar;