import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  LoadingSpinner, 
  LoadingDots, 
  HealthcareLoading,
  LoadingProgress
} from './loading-states';
import { useLoadingStates, LoadingOperation } from '@/hooks/useLoadingStates';
import { 
  X, 
  Minimize2, 
  Shield, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Activity,
  Heart,
  Lock,
  Database,
  Wifi,
  Settings
} from 'lucide-react';

interface GlobalLoadingOverlayProps {
  showOverlay?: boolean;
  allowMinimize?: boolean;
  allowCancel?: boolean;
  className?: string;
}

export const GlobalLoadingOverlay: React.FC<GlobalLoadingOverlayProps> = ({
  showOverlay = true,
  allowMinimize = true,
  allowCancel = false,
  className = ''
}) => {
  const {
    isLoading,
    operations,
    globalProgress,
    totalOperations,
    completedOperations,
    stopAllLoading,
    getOperationsByCategory,
    getStats
  } = useLoadingStates();

  const [isMinimized, setIsMinimized] = React.useState(false);
  const [showDetails, setShowDetails] = React.useState(false);

  if (!isLoading || !showOverlay) {
    return null;
  }

  const operationsArray = Array.from(operations.values());
  const healthcareOps = getOperationsByCategory('healthcare');
  const complianceOps = getOperationsByCategory('compliance');
  const criticalOps = operationsArray.filter(op => op.complianceLevel === 'critical');
  const sensitiveOps = operationsArray.filter(op => op.sensitive);
  const stats = getStats();

  const getOperationIcon = (operation: LoadingOperation) => {
    switch (operation.category) {
      case 'healthcare': return <Heart className="h-4 w-4 text-red-600" />;
      case 'compliance': return <Shield className="h-4 w-4 text-orange-600" />;
      case 'auth': return <Lock className="h-4 w-4 text-purple-600" />;
      case 'data': return <Database className="h-4 w-4 text-blue-600" />;
      case 'network': return <Wifi className="h-4 w-4 text-green-600" />;
      default: return <Settings className="h-4 w-4 text-gray-600" />;
    }
  };

  const getOperationStatusColor = (operation: LoadingOperation) => {
    const elapsed = Date.now() - operation.startTime;
    const timeout = operation.timeout || 30000;
    
    if (elapsed > timeout * 0.8) return 'text-red-600'; // Near timeout
    if (elapsed > timeout * 0.5) return 'text-orange-600'; // Half timeout
    return 'text-green-600'; // Normal
  };

  const getComplianceBadgeColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (isMinimized) {
    return (
      <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
        <Card className="w-80 border-2 border-blue-200 bg-blue-50">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <LoadingSpinner size="sm" message="" />
                  <div className="absolute -top-1 -right-1">
                    <Badge variant="secondary" className="text-xs px-1">
                      {totalOperations}
                    </Badge>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {totalOperations} operation{totalOperations !== 1 ? 's' : ''} running
                  </p>
                  <p className="text-xs text-gray-600">
                    {globalProgress.toFixed(0)}% complete
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMinimized(false)}
                  className="h-6 w-6 p-0"
                >
                  <Activity className="h-3 w-3" />
                </Button>
                {allowCancel && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={stopAllLoading}
                    className="h-6 w-6 p-0 text-red-600 hover:text-red-800"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
            
            <Progress value={globalProgress} className="h-1 mt-2" />
            
            {(criticalOps.length > 0 || sensitiveOps.length > 0) && (
              <div className="flex items-center space-x-2 mt-2">
                {criticalOps.length > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    <AlertTriangle className="h-2 w-2 mr-1" />
                    {criticalOps.length} Critical
                  </Badge>
                )}
                {sensitiveOps.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    <Lock className="h-2 w-2 mr-1" />
                    {sensitiveOps.length} Sensitive
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${className}`}>
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                {healthcareOps.length > 0 ? (
                  <Heart className="h-6 w-6 text-red-600 animate-pulse" />
                ) : (
                  <LoadingSpinner size="md" message="" />
                )}
              </div>
              <div>
                <CardTitle className="text-lg">
                  {healthcareOps.length > 0 ? 'Healthcare Operations' : 'Processing Operations'}
                </CardTitle>
                <CardDescription>
                  {totalOperations} operation{totalOperations !== 1 ? 's' : ''} in progress
                  {completedOperations > 0 && ` • ${completedOperations} completed`}
                </CardDescription>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {allowMinimize && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMinimized(true)}
                  className="h-8 w-8 p-0"
                >
                  <Minimize2 className="h-4 w-4" />
                </Button>
              )}
              {allowCancel && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={stopAllLoading}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-800"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 max-h-96 overflow-y-auto">
          {/* Global Progress */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Overall Progress</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">{globalProgress.toFixed(0)}%</span>
                <Badge variant="outline" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  {Math.round(stats.averageDuration / 1000)}s avg
                </Badge>
              </div>
            </div>
            <Progress value={globalProgress} className="h-3" />
          </div>

          {/* Priority Operations (Critical/Healthcare) */}
          {(criticalOps.length > 0 || healthcareOps.length > 0 || complianceOps.length > 0) && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <Shield className="h-4 w-4 text-red-600" />
                Priority Operations
              </h4>
              
              <div className="space-y-2">
                {[...criticalOps, ...healthcareOps, ...complianceOps]
                  .filter((op, index, arr) => arr.findIndex(o => o.id === op.id) === index) // Remove duplicates
                  .slice(0, 3) // Show max 3 priority operations
                  .map((operation) => (
                    <div key={operation.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      {getOperationIcon(operation)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {operation.label}
                          </p>
                          <div className="flex items-center space-x-2">
                            {operation.complianceLevel && (
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${getComplianceBadgeColor(operation.complianceLevel)}`}
                              >
                                {operation.complianceLevel}
                              </Badge>
                            )}
                            {operation.sensitive && (
                              <Badge variant="outline" className="text-xs">
                                <Lock className="h-2 w-2 mr-1" />
                                Sensitive
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        {operation.progress !== undefined ? (
                          <div className="mt-2">
                            <Progress value={operation.progress} className="h-1" />
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                              <span>{operation.progress.toFixed(0)}% complete</span>
                              {operation.estimatedTime && (
                                <span>~{operation.estimatedTime}</span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="mt-1">
                            <LoadingDots message="" />
                            {operation.estimatedTime && (
                              <p className="text-xs text-gray-500 mt-1">
                                Estimated: {operation.estimatedTime}
                              </p>
                            )}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">
                            {Math.round((Date.now() - operation.startTime) / 1000)}s elapsed
                          </span>
                          <span className={`text-xs ${getOperationStatusColor(operation)}`}>
                            {operation.timeout && (Date.now() - operation.startTime) > operation.timeout * 0.8
                              ? 'Taking longer than expected'
                              : 'Running normally'
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Other Operations Summary */}
          {operationsArray.length > 3 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-800">
                  Other Operations ({operationsArray.length - 3})
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-xs"
                >
                  {showDetails ? 'Hide Details' : 'Show Details'}
                </Button>
              </div>

              {showDetails && (
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {operationsArray
                    .filter(op => ![...criticalOps, ...healthcareOps, ...complianceOps].some(pOp => pOp.id === op.id))
                    .map((operation) => (
                      <div key={operation.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                        {getOperationIcon(operation)}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-800 truncate">
                            {operation.label}
                          </p>
                          {operation.progress !== undefined && (
                            <div className="mt-1">
                              <Progress value={operation.progress} className="h-1" />
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {Math.round((Date.now() - operation.startTime) / 1000)}s
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* Healthcare Security Notice */}
          {(healthcareOps.length > 0 || sensitiveOps.length > 0) && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  Healthcare Data Protection Active
                </span>
              </div>
              <p className="text-xs text-blue-700 mt-1">
                Sensitive healthcare information is being processed with end-to-end encryption 
                and full compliance monitoring.
              </p>
            </div>
          )}

          {/* Operation Statistics */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t">
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-900">{stats.activeOperations}</p>
              <p className="text-xs text-gray-600">Active Operations</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-900">{stats.completedOperations}</p>
              <p className="text-xs text-gray-600">Completed</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 