import React, { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useSessionTimeout } from '@/hooks/useSessionTimeout';
import { Clock, Shield, AlertTriangle, RefreshCw, LogOut } from 'lucide-react';

interface SessionTimeoutWarningProps {
  onExtendSession?: () => void;
  onLogout?: () => void;
}

export const SessionTimeoutWarning: React.FC<SessionTimeoutWarningProps> = ({
  onExtendSession,
  onLogout
}) => {
  const {
    showWarning,
    timeRemaining,
    isHealthcareProfessional,
    config,
    extendSession,
    forceLogout,
    getTimeUntilTimeout
  } = useSessionTimeout();

  const [countdown, setCountdown] = useState({ minutes: 0, seconds: 0 });

  // Update countdown display
  useEffect(() => {
    if (showWarning) {
      const timer = setInterval(() => {
        const timeLeft = getTimeUntilTimeout();
        setCountdown({ minutes: timeLeft.minutes, seconds: timeLeft.seconds });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [showWarning, getTimeUntilTimeout]);

  const handleExtendSession = () => {
    extendSession();
    onExtendSession?.();
  };

  const handleLogout = () => {
    forceLogout();
    onLogout?.();
  };

  const formatTime = (minutes: number, seconds: number) => {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!showWarning) return null;

  return (
    <Dialog open={showWarning} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Session Timeout Warning
          </DialogTitle>
          <DialogDescription>
            {isHealthcareProfessional
              ? "Your session will expire soon due to healthcare data protection requirements."
              : "Your session will expire soon due to inactivity."
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Countdown Display */}
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-center space-x-2">
                <Clock className="h-6 w-6 text-amber-600" />
                <div className="text-center">
                  <div className="text-2xl font-mono font-bold text-amber-800">
                    {formatTime(countdown.minutes, countdown.seconds)}
                  </div>
                  <div className="text-sm text-amber-600">
                    Time remaining
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Healthcare-specific information */}
          {isHealthcareProfessional && (
            <Alert className="border-blue-200 bg-blue-50">
              <Shield className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Healthcare Data Protection:</strong> Your session automatically expires after{' '}
                {config.timeoutTime} minutes of inactivity to protect patient information and ensure
                AHPRA compliance.
              </AlertDescription>
            </Alert>
          )}

          {/* Session Configuration Info */}
          <div className="flex flex-wrap gap-2 justify-center">
            <Badge variant="outline" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              {config.timeoutTime}min timeout
            </Badge>
            {isHealthcareProfessional && (
              <Badge variant="outline" className="text-xs bg-green-50 border-green-200 text-green-700">
                <Shield className="h-3 w-3 mr-1" />
                Healthcare Protected
              </Badge>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleExtendSession}
              className="flex-1"
              variant="default"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Extend Session
            </Button>
            
            <Button
              onClick={handleLogout}
              variant="outline"
              className="flex-1"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout Now
            </Button>
          </div>

          {/* Additional Information */}
          <div className="text-center text-xs text-gray-500 space-y-1">
            <p>
              {isHealthcareProfessional
                ? "Any activity will extend your session for continued access to patient data."
                : "Click anywhere in the application or press 'Extend Session' to stay logged in."
              }
            </p>
            {isHealthcareProfessional && (
              <p className="text-blue-600">
                Session timeouts are logged for compliance and audit purposes.
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Simplified banner version for non-modal use
export const SessionTimeoutBanner: React.FC = () => {
  const {
    showWarning,
    isHealthcareProfessional,
    extendSession,
    getTimeUntilTimeout
  } = useSessionTimeout();

  const [countdown, setCountdown] = useState({ minutes: 0, seconds: 0 });

  useEffect(() => {
    if (showWarning) {
      const timer = setInterval(() => {
        const timeLeft = getTimeUntilTimeout();
        setCountdown({ minutes: timeLeft.minutes, seconds: timeLeft.seconds });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [showWarning, getTimeUntilTimeout]);

  if (!showWarning) return null;

  return (
    <Alert className="fixed top-4 right-4 w-auto max-w-sm z-50 border-amber-200 bg-amber-50">
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertDescription className="text-amber-800">
        <div className="flex items-center justify-between">
          <div>
            <strong>Session expires in:</strong>{' '}
            <span className="font-mono">
              {countdown.minutes}:{countdown.seconds.toString().padStart(2, '0')}
            </span>
            {isHealthcareProfessional && (
              <div className="text-xs mt-1">
                Healthcare data protection
              </div>
            )}
          </div>
          <Button
            size="sm"
            onClick={extendSession}
            className="ml-3"
          >
            Extend
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}; 