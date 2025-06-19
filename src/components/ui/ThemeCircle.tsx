import React, { useState } from "react";
import { Theme } from "../../themes/types";
import { useTheme } from "../../hooks/useTheme";
import { ThemePreviewTooltip } from "./ThemePreviewTooltip";
import { toast } from "sonner";

interface ThemeCircleProps {
  theme: Theme;
  size?: "sm" | "md" | "lg";
  className?: string;
  index?: number; // For staggered animations
}

export const ThemeCircle: React.FC<ThemeCircleProps> = ({
  theme,
  size = "md",
  className = "",
  index = 0,
}) => {
  const { currentTheme, setTheme } = useTheme();
  const [isChanging, setIsChanging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const isSelected = currentTheme.id === theme.id;

  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-20 h-20",
  };

  const handleClick = async () => {
    if (currentTheme.id === theme.id) return; // Don't change if already selected

    setIsChanging(true);
    setIsHovered(false); // Hide tooltip during change

    // Add a slight delay for visual feedback
    setTimeout(() => {
      setTheme(theme.id);
      setIsChanging(false);

      // Show success notification
      toast.success(`Theme changed to ${theme.name}`, {
        description: theme.description || `Applied ${theme.category} theme`,
        duration: 2000,
      });
    }, 150);
  };

  // Create circle style based on theme preview
  const circleStyle: React.CSSProperties = {
    background: theme.preview.gradient || theme.preview.primary,
  };

  // If theme has secondary color, create a split circle
  if (theme.preview.secondary && !theme.preview.gradient) {
    circleStyle.background = `linear-gradient(135deg, ${theme.preview.primary} 0%, ${theme.preview.secondary} 100%)`;
  }

  return (
    <div
      className="flex  flex-col justify-center items-center gap-2 animate-in fade-in slide-in-from-bottom-4 relative"
      style={{
        animationDelay: `${index * 50}ms`, // Staggered animation
        animationDuration: "400ms",
        animationFillMode: "both",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Theme Preview Tooltip */}
      <ThemePreviewTooltip theme={theme} isVisible={isHovered && !isSelected} />
      <button
        onClick={handleClick}
        disabled={isChanging}
        className={`
          ${sizeClasses[size]}
          rounded-full
          border-4
          transition-all
          duration-300
          cursor-pointer
          transform
          hover:scale-110
          hover:shadow-xl
          hover:shadow-primary/20
          focus:outline-none
          focus:ring-4
          focus:ring-primary/30
          focus:scale-105
          active:scale-95
          disabled:opacity-70
          disabled:cursor-not-allowed
          ${
            isSelected
              ? "border-primary shadow-xl ring-4 ring-primary/30 scale-105"
              : "border-border hover:border-primary/50"
          }
          ${isChanging ? "animate-pulse scale-95" : ""}
          ${className}
        `}
        style={circleStyle}
        aria-label={`Select ${theme.name} theme`}
        aria-pressed={isSelected}
        title={theme.description || theme.name}
      >
        {/* Loading spinner for theme change */}
        {isChanging && (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        )}

        {/* Checkmark for selected theme */}
        {isSelected && !isChanging && (
          <div className="w-full h-full flex items-center justify-center animate-in zoom-in duration-200">
            <svg
              className="w-6 h-6 text-white drop-shadow-lg"
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
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
      </button>

      <div className="text-center w-40 min-h-[56px] flex flex-col items-center justify-start">
        <p
          className={`text-sm font-medium transition-colors duration-200 ${
            isSelected ? "text-primary font-semibold" : "text-foreground"
          }`}
        >
          {theme.name}
        </p>
      </div>
    </div>
  );
};
