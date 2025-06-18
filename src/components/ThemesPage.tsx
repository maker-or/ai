import React from "react";
import { Button } from "./ui/button";
import { ArrowLeft } from "lucide-react";
import { useTheme } from "../hooks/useTheme";
import { themeCategories } from "../themes";
import { ThemeCategorySection } from "./ui/ThemeCategorySection";

interface ThemesPageProps {
  onBack: () => void;
}

export const ThemesPage: React.FC<ThemesPageProps> = ({ onBack }) => {
  const { themes, getThemesByCategory, currentTheme } = useTheme();

  return (
    <div className="min-h-screen bg-theme-bg-primary animate-in fade-in duration-500">
      {/* Header */}
      <header className="bg-theme-bg-secondary border-b border-theme-border-primary sticky top-0 z-10 backdrop-blur-sm animate-in slide-in-from-top duration-300">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="text-theme-text-secondary hover:text-theme-text-primary transition-colors duration-200"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-theme-text-primary">
                Choose Your Theme
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Current Theme Preview */}
        <div
          className="mb-8 p-6 bg-theme-bg-secondary rounded-lg border border-theme-border-primary animate-in slide-in-from-bottom duration-400"
          style={{ animationDelay: "100ms" }}
        >
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-full border-4 border-theme-primary flex-shrink-0 transition-all duration-300 hover:scale-105"
              style={{
                background:
                  currentTheme.preview.gradient ||
                  (currentTheme.preview.secondary
                    ? `linear-gradient(135deg, ${currentTheme.preview.primary} 0%, ${currentTheme.preview.secondary} 100%)`
                    : currentTheme.preview.primary),
              }}
            />
            <div>
              <h2 className="text-lg font-semibold text-theme-text-primary">
                {currentTheme.name}
              </h2>
              <p className="text-theme-text-secondary text-sm">
                {currentTheme.description || `${currentTheme.category} theme`}
              </p>
              <p className="text-theme-text-muted text-xs mt-1 flex items-center gap-1">
                <span className="w-2 h-2 bg-theme-success rounded-full animate-pulse"></span>
                Applied to entire interface
              </p>
            </div>
          </div>
        </div>

        {/* Theme Categories */}
        <div className="space-y-12 flex flex-col  items-center justify-center"> 
          {themeCategories.map((category, categoryIndex) => (
            <div
              key={category.id}
              className="animate-in flex items-center justify-center slide-in-from-bottom duration-500 w-full"
              style={{ animationDelay: `${200 + categoryIndex * 100}ms` }}
            >
              <ThemeCategorySection
                category={category}
                themes={getThemesByCategory(category.id)}
              />
            </div>
          ))}
        </div>

        {/* Footer Info */}
      </main>
    </div>
  );
};
