import React from 'react';
import { AlertTriangle, Clock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ComingSoonBannerProps {
  feature?: string;
  showIcon?: boolean;
  variant?: 'default' | 'warning' | 'info';
  className?: string;
}

export const ComingSoonBanner: React.FC<ComingSoonBannerProps> = ({
  feature = "This feature",
  showIcon = true,
  variant = "info",
  className = ""
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'warning':
        return 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200';
      case 'info':
        return 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-200';
      default:
        return 'border-muted bg-muted/50 text-muted-foreground';
    }
  };

  return (
    <Alert className={`${getVariantStyles()} ${className}`}>
      {showIcon && (
        variant === 'warning' ? 
          <AlertTriangle className="h-4 w-4" /> : 
          <Clock className="h-4 w-4" />
      )}
      <AlertDescription>
        <strong>{feature}</strong> is coming soon! We're working hard to bring you this feature.
        <br />
        <span className="text-sm opacity-75">
          Members can access the dashboard and existing features during our development phase.
        </span>
      </AlertDescription>
    </Alert>
  );
};