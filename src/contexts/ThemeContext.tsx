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
  const [currentTheme, setCurrentTheme] = useState<Theme>(() => {
    // Initialize theme synchronously to avoid flash
    try {
      const savedThemeId = localStorage.getItem(THEME_STORAGE_KEY);
      if (savedThemeId) {
        const savedTheme = getThemeById(savedThemeId);
        // Apply immediately for SSR/hydration consistency
        requestAnimationFrame(() => applyThemeToDocument(savedTheme));
        return savedTheme;
      }
    } catch (error) {
      console.warn('Failed to load theme from localStorage:', error);
    }
    // Apply default theme immediately
    requestAnimationFrame(() => applyThemeToDocument(defaultTheme));
    return defaultTheme;
  });

  // Only run effect for cleanup, theme is already applied
  useEffect(() => {
    // Ensure theme is applied (fallback for edge cases)
    applyThemeToDocument(currentTheme);
  }, []);

  // Optimized function to apply theme CSS variables to document
  const applyThemeToDocument = (theme: Theme) => {
    const root = document.documentElement;
    const { colors } = theme;

    // Batch DOM updates using a single style update
    const cssVars = {
      '--theme-bg-primary': colors.background.primary,
      '--theme-bg-secondary': colors.background.secondary,
      '--theme-bg-sidebar': colors.background.sidebar,
      '--theme-bg-chat': colors.background.chat,
      '--theme-text-primary': colors.text.primary,
      '--theme-text-secondary': colors.text.secondary,
      '--theme-text-muted': colors.text.muted,
      '--theme-text-inverse': colors.text.inverse,
      '--theme-border-primary': colors.border.primary,
      '--theme-border-secondary': colors.border.secondary,
      '--theme-border-focus': colors.border.focus,
      '--theme-primary': colors.primary.DEFAULT,
      '--theme-primary-hover': colors.primary.hover,
      '--theme-primary-active': colors.primary.active,
      '--theme-chat-user-bubble': colors.chat.userBubble,
      '--theme-chat-assistant-bubble': colors.chat.assistantBubble,
      '--theme-chat-user-text': colors.chat.userText,
      '--theme-chat-assistant-text': colors.chat.assistantText,
      '--theme-code-background': colors.code.background,
      '--theme-accent': colors.accent.DEFAULT,
      '--theme-accent-hover': colors.accent.hover,
      '--theme-success': colors.success,
      '--theme-warning': colors.warning,
      '--theme-error': colors.error,
      '--color-light': colors.background.primary,
      '--color-dark': colors.text.primary,
    };

    // Apply all CSS variables in a single batch
    Object.entries(cssVars).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });
  };

  // Function to change theme with optimized transitions
  const setTheme = (themeId: string) => {
    try {
      const newTheme = getThemeById(themeId);
      
      // Add transition effect for smooth theme switching
      document.body.classList.add('theme-transitioning');
      
      // Use requestAnimationFrame for smooth visual updates
      requestAnimationFrame(() => {
        setCurrentTheme(newTheme);
        applyThemeToDocument(newTheme);
        
        // Save to localStorage asynchronously
        setTimeout(() => {
          localStorage.setItem(THEME_STORAGE_KEY, themeId);
          document.body.classList.remove('theme-transitioning');
        }, 300);
      });
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
