import { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import { ThemeContextType } from '../themes/types';

/**
 * Custom hook to access theme context
 * Provides theme state and functions for theme management
 */
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error(
      'useTheme must be used within a ThemeProvider. ' +
      'Make sure you have wrapped your app with <ThemeProvider>.'
    );
  }
  
  return context;
};

/**
 * Hook to get current theme colors directly
 * Useful for components that only need color values
 */
export const useThemeColors = () => {
  const { currentTheme } = useTheme();
  return currentTheme.colors;
};

/**
 * Hook to check if current theme is dark
 * Useful for conditional rendering based on theme type
 */

/**
 * Hook to get theme preview colors
 * Useful for theme selector components
 */
export const useThemePreview = () => {
  const { currentTheme } = useTheme();
  return currentTheme.preview;
};
