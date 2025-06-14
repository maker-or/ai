import { Theme } from './types';

export const lightTheme: Theme = {
  id: 'light',
  name: 'Default Light',
  category: 'light',
  description: 'Clean and bright theme for daytime use',
  colors: {
    background: {
      primary: '#ffffff',
      secondary: '#f8fafc',
      sidebar: '#f1f5f9',
      chat: '#ffffff',
    },
    text: {
      primary: '#171717',
      secondary: '#64748b',
      muted: '#94a3b8',
      inverse: '#ffffff',
    },
    border: {
      primary: '#e2e8f0',
      secondary: '#f1f5f9',
      focus: '#3b82f6',
    },
    primary: {
      DEFAULT: '#0c0c0c',
      hover: '#374151',
      active: '#1f2937',
    },
    chat: {
      userBubble: '#3b82f6',
      assistantBubble: '#f1f5f9',
      userText: '#ffffff',
      assistantText: '#171717',
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
    primary: '#ffffff',
    secondary: '#3b82f6',
  },
};

export const warmLightTheme: Theme = {
  id: 'warm-light',
  name: 'Warm Light',
  category: 'light',
  description: 'Warm and cozy light theme with beige tones',
  colors: {
    background: {
      primary: '#fefcf9',
      secondary: '#faf7f2',
      sidebar: '#f5f1ea',
      chat: '#fefcf9',
    },
    text: {
      primary: '#292524',
      secondary: '#78716c',
      muted: '#a8a29e',
      inverse: '#fefcf9',
    },
    border: {
      primary: '#e7e5e4',
      secondary: '#f5f1ea',
      focus: '#ea580c',
    },
    primary: {
      DEFAULT: '#292524',
      hover: '#44403c',
      active: '#57534e',
    },
    chat: {
      userBubble: '#ea580c',
      assistantBubble: '#f5f1ea',
      userText: '#fefcf9',
      assistantText: '#292524',
    },
    accent: {
      DEFAULT: '#d97706',
      hover: '#ea580c',
    },
    success: '#16a34a',
    warning: '#eab308',
    error: '#dc2626',
  },
  preview: {
    primary: '#fefcf9',
    secondary: '#ea580c',
  },
};

export const coolLightTheme: Theme = {
  id: 'cool-light',
  name: 'Cool Light',
  category: 'light',
  description: 'Fresh and cool light theme with blue-gray tones',
  colors: {
    background: {
      primary: '#f8fafc',
      secondary: '#f1f5f9',
      sidebar: '#e2e8f0',
      chat: '#f8fafc',
    },
    text: {
      primary: '#0f172a',
      secondary: '#475569',
      muted: '#64748b',
      inverse: '#f8fafc',
    },
    border: {
      primary: '#cbd5e1',
      secondary: '#e2e8f0',
      focus: '#0ea5e9',
    },
    primary: {
      DEFAULT: '#0f172a',
      hover: '#334155',
      active: '#475569',
    },
    chat: {
      userBubble: '#0ea5e9',
      assistantBubble: '#e2e8f0',
      userText: '#f8fafc',
      assistantText: '#0f172a',
    },
    accent: {
      DEFAULT: '#0ea5e9',
      hover: '#0284c7',
    },
    success: '#059669',
    warning: '#d97706',
    error: '#dc2626',
  },
  preview: {
    primary: '#f8fafc',
    secondary: '#0ea5e9',
  },
};
