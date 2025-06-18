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
    <div className="mb-8 item-center justify-center">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-foreground mb-2">
          {category.name}
        </h3>
        <p className="text-muted text-sm">
          {category.description}
        </p>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 justify-center place-items-center">
        {themes.map((theme, index) => (
          <ThemeCircle
            key={theme.id}
            theme={theme}
            size="lg"
            index={index} // Pass index for staggered animations
          />
        ))}
      </div>
    </div>
  );
};
