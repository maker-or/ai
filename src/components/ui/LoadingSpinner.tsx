import { FC } from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
  message?: string;
}

export const LoadingSpinner: FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  fullScreen = false,
  message = 'Loading...'
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const containerClasses = fullScreen 
    ? 'fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50'
    : 'flex items-center justify-center p-4';

  return (
    <div className={containerClasses} role="status" aria-label={message}>
      <div className="flex flex-col items-center gap-3">
        <div 
          className={`animate-spin rounded-full border-2 border-border border-t-primary ${sizeClasses[size]}`}
          aria-hidden="true"
        />
        {message && (
          <p className="text-sm text-theme-chat-assistant-text animate-pulse">
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

// Fast loading skeleton for immediate feedback
export const LoadingSkeleton: FC<{ lines?: number }> = ({ lines = 3 }) => (
  <div className="animate-pulse space-y-3" role="status" aria-label="Loading content">
    {Array.from({ length: lines }).map((_, i) => (
      <div key={i} className="h-4 bg-muted rounded-md" style={{ width: `${Math.random() * 40 + 60}%` }} />
    ))}
  </div>
);

export default LoadingSpinner;
