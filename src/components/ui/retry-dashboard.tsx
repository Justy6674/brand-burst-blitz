import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useRetryMechanism } from '@/hooks/useRetryMechanism';
import { 
  RefreshCw, 
  X, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Heart,
  Shield,
  Lock,
  Database,
  Wifi,
  Settings,
  BarChart3,
  Timer,
  Target,
  Activity
} from 'lucide-react';

interface RetryDashboardProps {
  showInline?: boolean;
  compact?: boolean;
  className?: string;
}

export const RetryDashboard: React.FC<RetryDashboardProps> = ({
  showInline = false,
  compact = false,
  className = ''
}) => {
  const {
    activeRetries,
    totalRetries,
    successfulRetries,
    failedRetries,
    operations,
    cancelRetry,
    cancelAllRetries,
    getRetryStats,
    getPendingRetries,
    getTimeUntilRetry
  } = useRetryMechanism();

  const [currentTime, setCurrentTime] = useState(Date.now());
  const stats = getRetryStats();
  const pendingRetries = getPendingRetries();

  // Update current time every second for countdown displays
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'healthcare': return <Heart className="h-4 w-4 text-red-600" />;
      case 'compliance': return <Shield className="h-4 w-4 text-orange-600" />;
      case 'auth': return <Lock className="h-4 w-4 text-purple-600" />;
      case 'data': return <Database className="h-4 w-4 text-blue-600" />;
      case 'network': return <Wifi className="h-4 w-4 text-green-600" />;
      default: return <Settings className="h-4 w-4 text-gray-600" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'healthcare': return 'bg-red-100 text-red-800 border-red-300';
      case 'compliance': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'auth': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'data': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'network': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const formatTimeRemaining = (timeUntil: number) => {
    if (timeUntil <= 0) return 'Retrying now...';
    
    const seconds = Math.ceil(timeUntil / 1000);
    if (seconds < 60) return `${seconds}s`;
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getProgressValue = (attempts: number, maxAttempts: number) => {
    return (attempts / maxAttempts) * 100;
  };

  // Compact view for minimized display
  if (compact) {
    return (
      <div className={`${className}`}>
        {activeRetries > 0 ? (
          <Alert className="border-orange-200 bg-orange-50">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <AlertDescription className="flex items-center justify-between">
              <span className="text-sm">
                {activeRetries} operation{activeRetries !== 1 ? 's' : ''} retrying
              </span>
              <Badge variant="outline" className="text-xs">
                {stats.successRate.toFixed(0)}% success rate
              </Badge>
            </AlertDescription>
          </Alert>
        ) : (
          <div className="text-xs text-gray-500 text-center py-2">
            No active retries
          </div>
        )}
      </div>
    );
  }

  // Inline view for embedding in other components
  if (showInline && activeRetries === 0) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Statistics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{activeRetries}</p>
                <p className="text-xs text-gray-600">Active Retries</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{successfulRetries}</p>
                <p className="text-xs text-gray-600">Successful</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{failedRetries}</p>
                <p className="text-xs text-gray-600">Failed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.successRate.toFixed(0)}%
                </p>
                <p className="text-xs text-gray-600">Success Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Retry Operations */}
      {activeRetries > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-orange-600" />
                <CardTitle className="text-lg">Active Retry Operations</CardTitle>
              </div>
              {activeRetries > 1 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={cancelAllRetries}
                  className="text-red-600 hover:text-red-800"
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel All
                </Button>
              )}
            </div>
            <CardDescription>
              Operations currently being retried with automatic backoff
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {pendingRetries.map((retry) => {
              const timeUntil = getTimeUntilRetry(retry.id);
              const progressValue = getProgressValue(retry.attempts, retry.maxAttempts);
              
              return (
                <div key={retry.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getCategoryIcon(retry.category || 'general')}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {retry.label}
                        </h4>
                        <p className="text-xs text-gray-600">
                          Attempt {retry.attempts + 1} of {retry.maxAttempts}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getCategoryColor(retry.category || 'general')}`}
                      >
                        {retry.category || 'general'}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => cancelRetry(retry.id)}
                        className="h-6 w-6 p-0 text-red-600 hover:text-red-800"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Retry Progress</span>
                      <span>{retry.attempts}/{retry.maxAttempts} attempts</span>
                    </div>
                    <Progress 
                      value={progressValue} 
                      className={`h-2 ${progressValue > 80 ? 'bg-red-100' : 'bg-orange-100'}`}
                    />
                  </div>

                  {/* Next Retry Countdown */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-xs text-gray-600">
                      <Timer className="h-3 w-3" />
                      <span>Next attempt: {formatTimeRemaining(timeUntil)}</span>
                    </div>
                    
                    {retry.lastError && (
                      <Badge variant="destructive" className="text-xs">
                        <AlertTriangle className="h-2 w-2 mr-1" />
                        {retry.lastError.code || 'Error'}
                      </Badge>
                    )}
                  </div>

                  {/* Healthcare/Compliance Specific Info */}
                  {(retry.category === 'healthcare' || retry.category === 'compliance') && (
                    <Alert className="bg-blue-50 border-blue-200">
                      <Shield className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-xs text-blue-700">
                        {retry.category === 'healthcare' 
                          ? 'Healthcare operation - Patient data protection protocols active'
                          : 'Compliance operation - Regulatory adherence monitoring active'
                        }
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Retry Statistics by Category */}
      {Object.keys(stats.categoryStats).length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <span>Retry Statistics by Category</span>
            </CardTitle>
            <CardDescription>
              Current retry distribution across operation types
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(stats.categoryStats).map(([category, count]) => (
                <div key={category} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  {getCategoryIcon(category)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900 capitalize">
                        {category}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {count}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {((count / activeRetries) * 100).toFixed(0)}% of active retries
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overall Performance Metrics */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <span>Performance Metrics</span>
          </CardTitle>
          <CardDescription>
            System-wide retry performance and reliability statistics
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Success Rate</span>
                <span className="text-sm font-medium text-gray-900">
                  {stats.successRate.toFixed(1)}%
                </span>
              </div>
              <Progress 
                value={stats.successRate} 
                className={`h-2 ${stats.successRate >= 80 ? 'bg-green-100' : stats.successRate >= 60 ? 'bg-yellow-100' : 'bg-red-100'}`}
              />
              <p className="text-xs text-gray-500">
                {successfulRetries} successful out of {totalRetries} total attempts
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Average Attempts</span>
                <span className="text-sm font-medium text-gray-900">
                  {stats.averageAttempts.toFixed(1)}
                </span>
              </div>
              <Progress 
                value={(stats.averageAttempts / 5) * 100} 
                className="h-2"
              />
              <p className="text-xs text-gray-500">
                Per operation before success or failure
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active Operations</span>
                <span className="text-sm font-medium text-gray-900">
                  {activeRetries}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {activeRetries > 0 ? (
                  <RefreshCw className="h-4 w-4 text-orange-600 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                )}
                <span className="text-xs text-gray-500">
                  {activeRetries > 0 ? 'Operations retrying' : 'All operations stable'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* No Active Retries Message */}
      {activeRetries === 0 && totalRetries > 0 && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">
            All operations are running smoothly. No retry mechanisms currently active.
            {stats.successRate >= 95 && (
              <span className="block mt-1 text-xs">
                🎉 Excellent system reliability with {stats.successRate.toFixed(0)}% success rate!
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* First Time User Info */}
      {totalRetries === 0 && (
        <Alert className="bg-blue-50 border-blue-200">
          <Shield className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-700">
            <strong>Retry System Active:</strong> Failed operations will automatically retry with 
            intelligent backoff strategies. Healthcare and compliance operations receive priority 
            handling with enhanced security monitoring.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}; 