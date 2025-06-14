import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Theme, ThemeContextType, ThemeCategory } from '../themes/types';
import { themes, defaultTheme, getThemeById, getThemesByCategory } from '../themes';

// Create the context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Local storage key for theme persistence
const THEME_STORAGE_KEY = 'ai-chat-theme';

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>(defaultTheme);

  // Load theme from localStorage on mount
  useEffect(() => {
    try {
      const savedThemeId = localStorage.getItem(THEME_STORAGE_KEY);
      if (savedThemeId) {
        const savedTheme = getThemeById(savedThemeId);
        setCurrentTheme(savedTheme);
        applyThemeToDocument(savedTheme);
      } else {
        // Apply default theme
        applyThemeToDocument(defaultTheme);
      }
    } catch (error) {
      console.warn('Failed to load theme from localStorage:', error);
      applyThemeToDocument(defaultTheme);
    }
  }, []);

  // Function to apply theme CSS variables to document
  const applyThemeToDocument = (theme: Theme) => {
    const root = document.documentElement;
    const { colors } = theme;

    // Add transition effect for smooth theme switching
    root.style.setProperty('--theme-transition', 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)');
    
    // Add a temporary class to enable transitions
    document.body.classList.add('theme-transitioning');

    // Background colors
    root.style.setProperty('--theme-bg-primary', colors.background.primary);
    root.style.setProperty('--theme-bg-secondary', colors.background.secondary);
    root.style.setProperty('--theme-bg-sidebar', colors.background.sidebar);
    root.style.setProperty('--theme-bg-chat', colors.background.chat);

    // Text colors
    root.style.setProperty('--theme-text-primary', colors.text.primary);
    root.style.setProperty('--theme-text-secondary', colors.text.secondary);
    root.style.setProperty('--theme-text-muted', colors.text.muted);
    root.style.setProperty('--theme-text-inverse', colors.text.inverse);

    // Border colors
    root.style.setProperty('--theme-border-primary', colors.border.primary);
    root.style.setProperty('--theme-border-secondary', colors.border.secondary);
    root.style.setProperty('--theme-border-focus', colors.border.focus);

    // Primary colors
    root.style.setProperty('--theme-primary', colors.primary.DEFAULT);
    root.style.setProperty('--theme-primary-hover', colors.primary.hover);
    root.style.setProperty('--theme-primary-active', colors.primary.active);

    // Chat colors
    root.style.setProperty('--theme-chat-user-bubble', colors.chat.userBubble);
    root.style.setProperty('--theme-chat-assistant-bubble', colors.chat.assistantBubble);
    root.style.setProperty('--theme-chat-user-text', colors.chat.userText);
    root.style.setProperty('--theme-chat-assistant-text', colors.chat.assistantText);

    // Accent colors
    root.style.setProperty('--theme-accent', colors.accent.DEFAULT);
    root.style.setProperty('--theme-accent-hover', colors.accent.hover);

    // Status colors
    root.style.setProperty('--theme-success', colors.success);
    root.style.setProperty('--theme-warning', colors.warning);
    root.style.setProperty('--theme-error', colors.error);

    // Legacy variables for backward compatibility
    root.style.setProperty('--color-light', colors.background.primary);
    root.style.setProperty('--color-dark', colors.text.primary);

    // Remove transition class after a delay
    setTimeout(() => {
      document.body.classList.remove('theme-transitioning');
    }, 300);
  };

  // Function to change theme
  const setTheme = (themeId: string) => {
    try {
      const newTheme = getThemeById(themeId);
      setCurrentTheme(newTheme);
      applyThemeToDocument(newTheme);
      
      // Save to localStorage
      localStorage.setItem(THEME_STORAGE_KEY, themeId);
    } catch (error) {
      console.error('Failed to set theme:', error);
    }
  };

  const contextValue: ThemeContextType = {
    currentTheme,
    setTheme,
    themes,
    getThemesByCategory,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme context
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
};

// Export the context for advanced usage
export { ThemeContext };
