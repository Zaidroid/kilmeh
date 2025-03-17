import React, { createContext, useContext, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * Logo component based on the Arabic letter keys from the screenshot
 */
export const Logo: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme } = useTheme();
  
  return (
    <div className={`flex justify-center gap-1 ${className}`}>
      {['ك', 'ل', 'م', 'ه'].map((letter, index) => (
        <motion.div 
          key={index}
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center text-white text-base sm:text-lg font-bold shadow-sm"
          style={{
            background: theme === 'light' 
              ? 'linear-gradient(145deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.8))'
              : 'linear-gradient(145deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.9))',
            border: theme === 'light'
              ? '1px solid rgba(30, 41, 59, 0.5)'
              : '1px solid rgba(30, 41, 59, 0.7)'
          }}
          whileHover={{ 
            scale: 1.05,
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.15)'
          }}
        >
          <span className="filter drop-shadow-sm">{letter}</span>
        </motion.div>
      ))}
    </div>
  );
};

/**
 * Provides theme context to the application, allowing toggling between light and dark modes.
 */
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = window.localStorage.getItem('theme');
    return (savedTheme as Theme) || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    window.localStorage.setItem('theme', theme);
  }, [theme]);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
};

/**
 * Hook to access the theme context.
 * @throws {Error} If used outside of a ThemeProvider.
 */
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
