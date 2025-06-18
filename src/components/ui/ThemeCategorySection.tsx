import React from 'react';
import { Theme, ThemeCategory } from '../../themes/types';
import { ThemeCircle } from './ThemeCircle';

interface ThemeCategorySectionProps {
  category: {
    id: ThemeCategory;
    name: string;
    description: string;
  };
  themes: Theme[];
}

export const ThemeCategorySection: React.FC<ThemeCategorySectionProps> = ({
  category,
  themes
}) => {
  if (themes.length === 0) return null;

  return (
    <div className="w-full flex flex-col items-center">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-foreground mb-2">
          {category.name}
        </h3>
        <p className="text-muted text-sm">
          {category.description}
        </p>
      </div>
      
      <div className="flex justify-center items-center gap-8 w-full">
        {themes.map((theme, index) => (
          <div key={theme.id} className="flex justify-center">
            <ThemeCircle
              theme={theme}
              size="lg"
              index={index}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
