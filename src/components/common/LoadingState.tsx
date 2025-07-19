import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  fullScreen?: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = "Loading...",
  size = 'md',
  className,
  fullScreen = false,
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const containerClasses = fullScreen
    ? 'fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50'
    : 'flex items-center justify-center p-8';

  return (
    <div className={cn(containerClasses, className)}>
      <div className="flex flex-col items-center space-y-2">
        <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
};

interface InlineLoadingProps {
  message?: string;
  size?: 'sm' | 'md';
}

export const InlineLoading: React.FC<InlineLoadingProps> = ({
  message,
  size = 'sm',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
  };

  return (
    <div className="flex items-center space-x-2">
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
      {message && <span className="text-sm text-muted-foreground">{message}</span>}
    </div>
  );
};