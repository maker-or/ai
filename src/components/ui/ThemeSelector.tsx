import React from 'react';
import { useTheme } from '../../hooks/useTheme';

interface ThemeSelectorProps {
  className?: string;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ className = '' }) => {
  const { currentTheme, themes, setTheme } = useTheme();

  return (
    <div className={`theme-selector ${className}`}>
      <label htmlFor="theme-select" className="block text-sm font-medium mb-2">
        Choose Theme:
      </label>
      <select
        id="theme-select"
        value={currentTheme.id}
        onChange={(e) => setTheme(e.target.value)}
        className="block w-full px-3 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
      >
        {themes.map((theme) => (
          <option key={theme.id} value={theme.id}>
            {theme.name} ({theme.category})
          </option>
        ))}
      </select>
      <p className="mt-1 text-xs text-muted">
        Current: {currentTheme.name}
      </p>
    </div>
  );
};
