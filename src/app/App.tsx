import React, { useState, useEffect } from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { FinanceProvider } from './context/FinanceContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { Login } from './pages/Login';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const authenticated = localStorage.getItem('finbee_authenticated');
    if (authenticated === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLoginSuccess = (userData: any) => {
    setIsAuthenticated(true);
  };

  return (
    <ThemeProvider>
      <LanguageProvider>
        {!isAuthenticated ? (
          <Login onLoginSuccess={handleLoginSuccess} />
        ) : (
          <FinanceProvider>
            <RouterProvider router={router} />
          </FinanceProvider>
        )}
      </LanguageProvider>
    </ThemeProvider>
  );
}
