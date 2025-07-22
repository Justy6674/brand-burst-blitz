import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ErrorMessageProps {
  title?: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  helpLink?: {
    label: string;
    url: string;
  };
  variant?: 'default' | 'destructive';
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = "Something went wrong",
  message,
  action,
  helpLink,
  variant = 'destructive',
  className,
}) => {
  return (
    <Alert variant={variant} className={cn("", className)}>
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="mt-2">
        <p className="mb-3">{message}</p>
        <div className="flex gap-2">
          {action && (
            <Button
              size="sm"
              variant="outline"
              onClick={action.onClick}
              className="h-8"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              {action.label}
            </Button>
          )}
          {helpLink && (
            <Button
              size="sm"
              variant="ghost"
              asChild
              className="h-8"
            >
              <a href={helpLink.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-3 h-3 mr-1" />
                {helpLink.label}
              </a>
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};

export const NetworkErrorMessage: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => (
  <ErrorMessage
    title="Connection Error"
    message="Unable to connect to our servers. Please check your internet connection and try again."
    action={onRetry ? { label: "Try Again", onClick: onRetry } : undefined}
    helpLink={{
      label: "Network Help",
      url: "https://docs.lovable.dev/troubleshooting/network-issues"
    }}
  />
);

export const ValidationErrorMessage: React.FC<{ errors: string[] }> = ({ errors }) => (
  <ErrorMessage
    title="Please fix the following errors:"
    message={errors.map((error, index) => `• ${error}`).join('\n')}
    variant="default"
  />
);