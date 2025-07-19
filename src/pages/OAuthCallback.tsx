import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorMessage } from '@/components/common/ErrorMessage';

export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');
        const platform = searchParams.get('platform') || 'facebook';

        if (error) {
          throw new Error(`OAuth error: ${error}`);
        }

        if (!code || !state) {
          throw new Error('Missing authorization code or state parameter');
        }

        // Call the OAuth callback function
        const { data, error: callbackError } = await supabase.functions.invoke('social-oauth-callback', {
          body: {
            code,
            state,
            platform
          }
        });

        if (callbackError) {
          throw callbackError;
        }

        if (data?.success) {
          setStatus('success');
          setMessage(`Successfully connected ${data.account.name} to ${platform}`);
          
          // Notify parent window
          window.opener?.postMessage({
            type: 'OAUTH_SUCCESS',
            platform,
            account: data.account
          }, window.location.origin);
          
          // Close popup after a brief delay
          setTimeout(() => {
            window.close();
          }, 2000);
        } else {
          throw new Error('Failed to complete authentication');
        }

      } catch (error) {
        console.error('OAuth callback error:', error);
        setStatus('error');
        setMessage(error.message || 'Authentication failed');
        
        // Notify parent window of error
        window.opener?.postMessage({
          type: 'OAUTH_ERROR',
          error: error.message || 'Authentication failed'
        }, window.location.origin);
        
        // Close popup after delay
        setTimeout(() => {
          window.close();
        }, 3000);
      }
    };

    handleCallback();
  }, [searchParams]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <LoadingState message="Completing authentication..." />
          <p className="text-muted-foreground">Please wait while we connect your account</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <ErrorMessage 
            message={message}
            action={{
              label: "Close Window",
              onClick: () => window.close()
            }}
          />
          <p className="text-center text-sm text-muted-foreground mt-4">
            This window will close automatically in a few seconds.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-4">
        <div className="text-green-600 text-6xl">✓</div>
        <h1 className="text-2xl font-bold text-green-600">Success!</h1>
        <p className="text-muted-foreground">{message}</p>
        <p className="text-sm text-muted-foreground">
          This window will close automatically.
        </p>
      </div>
    </div>
  );
}