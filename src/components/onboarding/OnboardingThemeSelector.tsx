import React, { useState } from "react";
import { useTheme } from "../../hooks/useTheme";
import { themeCategories } from "../../themes";
import { Theme } from "../../themes/types";
import { toast } from "sonner";

const OnboardingThemeSelector = () => {
  const { themes, getThemesByCategory, currentTheme, setTheme } = useTheme();
  const [hoveredTheme, setHoveredTheme] = useState<Theme | null>(null);
  const [changingTheme, setChangingTheme] = useState<string | null>(null);

  const handleThemeClick = async (theme: Theme) => {
    if (currentTheme.id === theme.id) return;

    setChangingTheme(theme.id);
    setHoveredTheme(null);

    // Add a slight delay for visual feedback
    setTimeout(() => {
      setTheme(theme.id);
      setChangingTheme(null);

      // Show success notification
      toast.success(`Theme changed to ${theme.name}`, {
        description: theme.description || `Applied ${theme.category} theme`,
        duration: 2000,
      });
    }, 150);
  };

  // Mini Preview Component
  const MiniPreview: React.FC<{ theme: Theme; isVisible: boolean }> = ({
    theme,
    isVisible,
  }) => {
    if (!isVisible) return null;

    return (
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-4 z-50 animate-in fade-in zoom-in duration-200">
        <div className="bg-black backdrop-blur-md border border-white/20 rounded-lg shadow-xl p-3 min-w-[200px]">
          {/* Mock interface preview */}
          <div className="rounded-md p-2 mb-2 bg-theme-bg-primary">
            {/* Mock header */}
            <div
              className="rounded p-1 mb-1 text-xs"
              style={{
                backgroundColor: theme.colors.background.secondary,
                color: theme.colors.text.primary,
              }}
            >
              AI Chat Interface
            </div>

            {/* Mock messages */}
            <div className="space-y-1">
              <div
                className="rounded p-1 text-xs ml-auto max-w-[70%]"
                style={{
                  backgroundColor: theme.colors.chat.userBubble,
                  color: theme.colors.chat.userText,
                }}
              >
                Hello!
              </div>
              <div
                className="rounded p-1 text-xs max-w-[70%]"
                style={{
                  backgroundColor: theme.colors.chat.assistantBubble,
                  color: theme.colors.chat.assistantText,
                }}
              >
                Hi! How can I help?
              </div>
            </div>
          </div>

          {/* Theme info */}
          <div>
            <p className="font-medium text-sm text-white">{theme.name}</p>
            <p className="text-xs text-gray-300">
              {theme.description || `${theme.category} theme`}
            </p>
          </div>
        </div>

        {/* Tooltip arrow */}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-theme-bg-primary flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-4xl w-full text-center">
        {/* Title */}
        <div className="space-y-4 sm:space-y-6 mb-8 sm:mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl  text-white mb-4">
            Choose Your <span className="font-serif italic">Theme</span>
          </h1>
        </div>

        {/* Theme Categories */}
        <div className="space-y-8 sm:space-y-12">
          {themeCategories.map((category, categoryIndex) => {
            const categoryThemes = getThemesByCategory(category.id);

            return (
              <div
                key={category.id}
                className="space-y-4 sm:space-y-6 animate-in slide-in-from-bottom duration-500"
                style={{ animationDelay: `${categoryIndex * 100}ms` }}
              >
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 max-w-3xl mx-auto">
                  {categoryThemes.map((theme, themeIndex) => {
                    const isSelected = currentTheme.id === theme.id;
                    const isChanging = changingTheme === theme.id;
                    const isHovered = hoveredTheme?.id === theme.id;

                    return (
                      <div
                        key={theme.id}
                        className="relative animate-in fade-in slide-in-from-bottom-4"
                        style={{
                          animationDelay: `${categoryIndex * 100 + themeIndex * 50}ms`,
                          animationDuration: "400ms",
                          animationFillMode: "both",
                        }}
                        onMouseEnter={() =>
                          !isSelected && setHoveredTheme(theme)
                        }
                        onMouseLeave={() => setHoveredTheme(null)}
                      >
                        {/* Theme Preview Tooltip */}
                        <MiniPreview
                          theme={theme}
                          isVisible={isHovered && !isSelected}
                        />

                        <button
                          onClick={() => handleThemeClick(theme)}
                          disabled={isChanging}
                          className={`group relative w-12 h-12 sm:w-16 sm:h-16 rounded-full transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-white/30 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed ${
                            isSelected
                              ? "ring-4 ring-white ring-offset-2 ring-offset-slate-800 scale-105 shadow-xl"
                              : "hover:ring-2 hover:ring-white/50 hover:shadow-xl hover:shadow-white/10"
                          } ${isChanging ? "animate-pulse scale-95" : ""}`}
                          style={{
                            background:
                              theme.preview.gradient ||
                              `linear-gradient(135deg, ${theme.preview.primary}, ${theme.preview.secondary})`,
                          }}
                          title={theme.name}
                          aria-label={`Select ${theme.name} theme`}
                          aria-pressed={isSelected}
                        >
                          {/* Loading spinner for theme change */}
                          {isChanging && (
                            <div className="w-full h-full flex items-center justify-center">
                              <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            </div>
                          )}

                          {/* Checkmark for selected theme */}
                          {isSelected && !isChanging && (
                            <div className="w-full h-full flex items-center justify-center animate-in zoom-in duration-200">
                              <svg
                                className="w-4 h-4 sm:w-6 sm:h-6 text-white drop-shadow-lg"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                          )}

                          {/* Subtle shine effect on hover */}
                          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </button>

                        {/* Theme name below circle */}
                        <div className="mt-2">
                          <p
                            className={`text-xs sm:text-sm font-medium transition-colors duration-200 ${
                              isSelected
                                ? "text-white font-semibold"
                                : "text-gray-300"
                            }`}
                          >
                            {theme.name}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Current Theme Preview */}
        <div className="mt-8 sm:mt-12 p-4 sm:p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 max-w-md mx-auto">
          <div className="flex items-center gap-4">
            <div
              className="w-8 h-8 sm:w-12 sm:h-12 rounded-full border-2 border-white/50 flex-shrink-0"
              style={{
                background:
                  currentTheme.preview.gradient ||
                  `linear-gradient(135deg, ${currentTheme.preview.primary}, ${currentTheme.preview.secondary})`,
              }}
            />
            <div className="text-left">
              <h3 className="text-white font-semibold text-sm sm:text-base">
                {currentTheme.name}
              </h3>
              <p className="text-gray-300 text-xs sm:text-sm">
                {currentTheme.description}
              </p>
              <p className="text-gray-400 text-xs mt-1 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                Applied to entire interface
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingThemeSelector;
