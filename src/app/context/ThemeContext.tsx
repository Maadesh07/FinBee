import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  actualTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem('finbee_userSettings');
      if (saved) {
        const settings = JSON.parse(saved);
        return settings.theme || 'system';
      }
      return 'system';
    } catch {
      return 'system';
    }
  });

  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const getSystemTheme = (): 'light' | 'dark' => {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    };

    const applyTheme = (newTheme: Theme) => {
      const root = document.documentElement;

      if (newTheme === 'system') {
        const systemTheme = getSystemTheme();
        setActualTheme(systemTheme);
        if (systemTheme === 'dark') {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      } else {
        setActualTheme(newTheme);
        if (newTheme === 'dark') {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      }
    };

    applyTheme(theme);

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);

    // Update localStorage immediately
    try {
      const saved = localStorage.getItem('finbee_userSettings');
      if (saved) {
        const settings = JSON.parse(saved);
        settings.theme = newTheme;
        localStorage.setItem('finbee_userSettings', JSON.stringify(settings));
      } else {
        // Create new settings if none exist
        const newSettings = {
          emailNotifications: true,
          pushNotifications: false,
          budgetAlerts: true,
          weeklyReport: true,
          currency: 'RM',
          theme: newTheme,
          language: 'English',
        };
        localStorage.setItem('finbee_userSettings', JSON.stringify(newSettings));
      }
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, actualTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
