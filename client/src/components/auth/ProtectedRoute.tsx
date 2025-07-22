import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

const AuthErrorRecovery: React.FC<{ 
  error: string; 
  onClearError: () => void; 
  onForceReset: () => void; 
}> = ({ error, onClearError, onForceReset }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Authentication Error
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              This usually happens when your session has expired or there's an issue with stored authentication data.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Button onClick={onClearError} variant="outline" className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            
            <Button onClick={onForceReset} variant="destructive" className="w-full">
              Clear Session & Sign In
            </Button>
          </div>

          <div className="text-xs text-muted-foreground bg-muted p-3 rounded">
            <p><strong>Still having issues?</strong></p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Clear your browser cache and cookies</li>
              <li>Try signing in using incognito/private mode</li>
              <li>Disable browser extensions that might interfere</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true 
}) => {
  const { user, loading, authError, clearAuthError, forceAuthReset } = useAuth();
  const location = useLocation();

  // Show auth error recovery UI if there's an auth error
  if (authError) {
    return (
      <AuthErrorRecovery 
        error={authError}
        onClearError={clearAuthError}
        onForceReset={forceAuthReset}
      />
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Authenticating...</p>
          <p className="text-xs text-muted-foreground">
            If this takes more than 10 seconds, there might be a session issue.
          </p>
        </div>
      </div>
    );
  }

  // Handle authentication requirements
  if (requireAuth && !user) {
    // Prevent redirect loops by checking if we're already on auth page
    if (location.pathname === '/auth') {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Authentication Required</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Please sign in to access this page.
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }
    
    // Redirect to auth page with the current location
    console.log('🔒 Redirecting unauthenticated user to /auth from:', location.pathname);
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (!requireAuth && user) {
    // User is logged in but trying to access public route (like auth page)
    const from = (location.state as any)?.from?.pathname || '/dashboard';
    console.log('↩️ Redirecting authenticated user to:', from);
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;