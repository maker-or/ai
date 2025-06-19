// ThemeCategorySection.tsx
import React from "react";
import { Theme, ThemeCategory } from "../../themes/types";
import { ThemeCircle } from "./ThemeCircle";

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
  themes,
}) => {
  if (themes.length === 0) return null;

  return (
    <div className="w-full flex flex-col items-center">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-foreground mb-2">
          {category.name}
        </h3>
      </div>

      <div className="flex flex-row flex-wrap justify-center items-end gap-8 w-full">
        {themes.map((theme, index) => (
          <ThemeCircle key={theme.id} theme={theme} size="lg" index={index} />
        ))}
      </div>
    </div>
  );
};
