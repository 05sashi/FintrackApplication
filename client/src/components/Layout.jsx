// src/components/Layout.js
import React, { useContext } from 'react';
import { AppContext } from '../App';
import { theme as customTheme } from '../theme';
import Topbar from './Topbar';

const Layout = ({ children }) => {
  const { theme, user } = useContext(AppContext);
  const currentTheme = customTheme[theme];

  return (
    <div className={`min-h-screen ${currentTheme.background} ${currentTheme.text}`}>
      <Topbar user={user} />
      <main className="p-4 md:p-8 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
};

export default Layout;