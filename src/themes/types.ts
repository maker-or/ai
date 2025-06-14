export interface ThemeColors {
  // Background colors
  background: {
    primary: string;    // Main background
    secondary: string;  // Card/panel backgrounds
    sidebar: string;    // Sidebar background
    chat: string;       // Chat area background
  };
  
  // Text colors
  text: {
    primary: string;    // Main text
    secondary: string;  // Secondary text
    muted: string;      // Muted/disabled text
    inverse: string;    // Text on dark backgrounds
  };
  
  // UI element colors
  border: {
    primary: string;    // Main borders
    secondary: string;  // Subtle borders
    focus: string;      // Focus states
  };
  
  // Interactive colors
  primary: {
    DEFAULT: string;    // Primary buttons, links
    hover: string;      // Hover state
    active: string;     // Active/pressed state
  };
  
  // Chat-specific colors
  chat: {
    userBubble: string;      // User message background
    assistantBubble: string; // Assistant message background
    userText: string;        // User message text
    assistantText: string;   // Assistant message text
  };
  
  // Status colors
  accent: {
    DEFAULT: string;
    hover: string;
  };
  
  success: string;
  warning: string;
  error: string;
}

export interface Theme {
  id: string;
  name: string;
  category: 'light' | 'dark' | 'colorful';
  description?: string;
  colors: ThemeColors;
  // Preview color for theme selector circles
  preview: {
    primary: string;
    secondary?: string;
    gradient?: string;
  };
}

export type ThemeCategory = 'light' | 'dark' | 'colorful';

export interface ThemeContextType {
  currentTheme: Theme;
  setTheme: (themeId: string) => void;
  themes: Theme[];
  getThemesByCategory: (category: ThemeCategory) => Theme[];
}
