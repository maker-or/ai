import { Theme } from './types';

export const darkTheme: Theme = {
  id: 'dark',
  name: 'Default Dark',
  category: 'dark',
  description: 'Modern dark theme for low-light environments',
  colors: {
    background: {
      primary: '#0f0f0f',
      secondary: '#171717',
      sidebar: '#0a0a0a',
      chat: '#0f0f0f',
    },
    text: {
      primary: '#f5f5f5',
      secondary: '#a3a3a3',
      muted: '#737373',
      inverse: '#0f0f0f',
    },
    border: {
      primary: '#262626',
      secondary: '#171717',
      focus: '#3b82f6',
    },
    primary: {
      DEFAULT: '#f5f5f5',
      hover: '#d4d4d4',
      active: '#a3a3a3',
    },
    chat: {
      userBubble: '#3b82f6',
      assistantBubble: '#262626',
      userText: '#f5f5f5',
      assistantText: '#f5f5f5',
    },
    accent: {
      DEFAULT: '#8b5cf6',
      hover: '#7c3aed',
    },
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
  },
  preview: {
    primary: '#0f0f0f',
    secondary: '#3b82f6',
  },
};

export const trueDarkTheme: Theme = {
  id: 'true-dark',
  name: 'True Dark',
  category: 'dark',
  description: 'Pure black theme optimized for OLED displays',
  colors: {
    background: {
      primary: '#000000',
      secondary: '#0a0a0a',
      sidebar: '#000000',
      chat: '#000000',
    },
    text: {
      primary: '#ffffff',
      secondary: '#d4d4d4',
      muted: '#a3a3a3',
      inverse: '#000000',
    },
    border: {
      primary: '#171717',
      secondary: '#0a0a0a',
      focus: '#3b82f6',
    },
    primary: {
      DEFAULT: '#ffffff',
      hover: '#f5f5f5',
      active: '#d4d4d4',
    },
    chat: {
      userBubble: '#3b82f6',
      assistantBubble: '#171717',
      userText: '#ffffff',
      assistantText: '#ffffff',
    },
    accent: {
      DEFAULT: '#8b5cf6',
      hover: '#7c3aed',
    },
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
  },
  preview: {
    primary: '#000000',
    secondary: '#3b82f6',
  },
};

export const warmDarkTheme: Theme = {
  id: 'warm-dark',
  name: 'Warm Dark',
  category: 'dark',
  description: 'Cozy dark theme with warm undertones',
  colors: {
    background: {
      primary: '#1c1917',
      secondary: '#292524',
      sidebar: '#0c0a09',
      chat: '#1c1917',
    },
    text: {
      primary: '#fafaf9',
      secondary: '#d6d3d1',
      muted: '#a8a29e',
      inverse: '#1c1917',
    },
    border: {
      primary: '#44403c',
      secondary: '#292524',
      focus: '#ea580c',
    },
    primary: {
      DEFAULT: '#fafaf9',
      hover: '#f5f5f4',
      active: '#e7e5e4',
    },
    chat: {
      userBubble: '#ea580c',
      assistantBubble: '#44403c',
      userText: '#fafaf9',
      assistantText: '#fafaf9',
    },
    accent: {
      DEFAULT: '#f97316',
      hover: '#ea580c',
    },
    success: '#16a34a',
    warning: '#eab308',
    error: '#dc2626',
  },
  preview: {
    primary: '#1c1917',
    secondary: '#ea580c',
  },
};
