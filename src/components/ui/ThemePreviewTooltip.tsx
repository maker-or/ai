import React from 'react';
import { Theme } from '../../themes/types';

interface ThemePreviewTooltipProps {
  theme: Theme;
  isVisible: boolean;
}

export const ThemePreviewTooltip: React.FC<ThemePreviewTooltipProps> = ({
  theme,
  isVisible
}) => {
  if (!isVisible) return null;

  return (
    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50 animate-in fade-in zoom-in duration-200">
      <div className="bg-background border border-border rounded-lg shadow-xl p-3 min-w-[200px]">
        {/* Mock interface preview */}
        <div 
          className="rounded-md p-2 mb-2"
          style={{ 
            backgroundColor: theme.colors.background.primary,
            borderColor: theme.colors.border.primary 
          }}
        >
          {/* Mock header */}
          <div 
            className="rounded p-1 mb-1 text-xs"
            style={{ 
              backgroundColor: theme.colors.background.secondary,
              color: theme.colors.text.primary 
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
                color: theme.colors.chat.userText 
              }}
            >
              Hello!
            </div>
            <div 
              className="rounded p-1 text-xs max-w-[70%]"
              style={{ 
                backgroundColor: theme.colors.chat.assistantBubble,
                color: theme.colors.chat.assistantText 
              }}
            >
              Hi there! How can I help?
            </div>
          </div>
        </div>
        
        {/* Theme info */}
        <div>
          <p className="font-medium text-sm">{theme.name}</p>
          <p className="text-xs text-muted">
            {theme.description || `${theme.category} theme`}
          </p>
        </div>
      </div>
      
      {/* Tooltip arrow */}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2">
        <div 
          className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent"
          style={{ borderTopColor: 'var(--theme-border-primary)' }}
        />
      </div>
    </div>
  );
};
