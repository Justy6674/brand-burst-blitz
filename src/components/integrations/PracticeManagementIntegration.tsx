import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { usePracticeManagementIntegration } from '@/hooks/usePracticeManagementIntegration';
import { useHealthcareAuth } from '@/hooks/useHealthcareAuth';
import { 
  Settings, CheckCircle, AlertTriangle, Zap, Clock, 
  Users, Calendar, Database, Shield, Sync, Plus,
  Wifi, WifiOff, Star, TrendingUp, ExternalLink,
  Monitor, Brain, Activity, Award
} from 'lucide-react';

export const PracticeManagementIntegration = () => {
  const { user } = useHealthcareAuth();
  const {
    systems,
    integrationStatuses,
    selectedSystem,
    isLoading,
    connectSystem,
    disconnectSystem,
    syncData,
    testConnection,
    getIntegrationRecommendations,
    getConnectedSystems,
    getIntegrationStatus,
    setSelectedSystem
  } = usePracticeManagementIntegration();

  const [connectionDialogOpen, setConnectionDialogOpen] = useState(false);
  const [credentials, setCredentials] = useState<Record<string, string>>({});

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'complex': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-600';
      case 'pending': return 'text-yellow-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <Wifi className="h-4 w-4 text-green-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'failed': return <WifiOff className="h-4 w-4 text-red-600" />;
      default: return <WifiOff className="h-4 w-4 text-gray-400" />;
    }
  };

  const handleConnect = async () => {
    if (!selectedSystem) return;
    
    const result = await connectSystem(selectedSystem.id, credentials);
    if (result.success) {
      setConnectionDialogOpen(false);
      setCredentials({});
    }
  };

  const handleDisconnect = async (systemId: string) => {
    await disconnectSystem(systemId);
  };

  const recommendations = getIntegrationRecommendations();
  const connectedSystems = getConnectedSystems();

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Practice Management Integration</h1>
          <p className="text-gray-600 mt-1">
            Connect your healthcare content platform with Australian practice management software
          </p>
        </div>
        <Button onClick={() => setConnectionDialogOpen(true)} disabled={isLoading}>
          <Plus className="mr-2 h-4 w-4" />
          Add Integration
        </Button>
      </div>

      {/* Integration Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Connected Systems</p>
                <p className="text-3xl font-bold text-green-600">{connectedSystems.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Patients</p>
                <p className="text-3xl font-bold text-blue-600">
                  {connectedSystems.reduce((sum, system) => sum + (system.patient_count || 0), 0)}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Sync Status</p>
                <p className="text-lg font-bold text-gray-900">
                  {connectedSystems.length > 0 ? 'Active' : 'Inactive'}
                </p>
              </div>
              <Sync className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Last Sync</p>
                <p className="text-sm font-bold text-gray-900">
                  {connectedSystems.length > 0 
                    ? new Date(connectedSystems[0]?.last_sync || '').toLocaleDateString()
                    : 'Never'
                  }
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="systems" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="systems">Available Systems</TabsTrigger>
          <TabsTrigger value="connected">Connected Systems</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="sync">Data Sync</TabsTrigger>
        </TabsList>

        <TabsContent value="systems" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {systems.map((system) => {
              const integrationStatus = getIntegrationStatus(system.id);
              
              return (
                <Card key={system.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{system.name}</CardTitle>
                        <CardDescription className="text-sm">{system.provider}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(integrationStatus?.status || 'not_configured')}
                        <Badge variant="outline">
                          {system.market_share}% market
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600">{system.description}</p>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Integration:</span>
                        <Badge className={getComplexityColor(system.integration_complexity)}>
                          {system.integration_complexity}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>API Available:</span>
                        <span>{system.api_available ? '✅' : '❌'}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Webhooks:</span>
                        <span>{system.webhook_support ? '✅' : '❌'}</span>
                      </div>
                    </div>

                    <div>
                      <h5 className="font-semibold text-sm mb-2">Key Features:</h5>
                      <div className="flex flex-wrap gap-1">
                        {system.supported_features.slice(0, 3).map((feature, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                        {system.supported_features.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{system.supported_features.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      {integrationStatus?.status === 'connected' ? (
                        <div className="space-y-2">
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => handleDisconnect(system.id)}
                          >
                            <WifiOff className="mr-2 h-4 w-4" />
                            Disconnect
                          </Button>
                          <div className="text-xs text-center text-gray-500">
                            Connected • {integrationStatus.patient_count} patients
                          </div>
                        </div>
                      ) : (
                        <Button
                          className="w-full"
                          onClick={() => {
                            setSelectedSystem(system);
                            setConnectionDialogOpen(true);
                          }}
                          disabled={!system.api_available}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          {system.api_available ? 'Connect' : 'API Not Available'}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="connected" className="space-y-6">
          {connectedSystems.length > 0 ? (
            <div className="space-y-6">
              {connectedSystems.map((connectedSystem) => (
                <Card key={connectedSystem.system_id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          {connectedSystem.system?.name}
                        </CardTitle>
                        <CardDescription>
                          Connected and syncing • Last sync: {new Date(connectedSystem.last_sync!).toLocaleString()}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => syncData(connectedSystem.system_id)}
                          disabled={isLoading}
                        >
                          <Sync className="mr-2 h-4 w-4" />
                          Sync Now
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDisconnect(connectedSystem.system_id)}
                        >
                          Disconnect
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <h4 className="font-semibold mb-2">Sync Statistics</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Patients:</span>
                            <span className="font-medium">{connectedSystem.patient_count?.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Appointments:</span>
                            <span className="font-medium">{connectedSystem.appointment_count?.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Sync Frequency:</span>
                            <span className="font-medium capitalize">{connectedSystem.sync_frequency}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">Data Types Synced</h4>
                        <div className="flex flex-wrap gap-1">
                          {connectedSystem.data_types_synced.map((dataType, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {dataType}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">System Features</h4>
                        <div className="flex flex-wrap gap-1">
                          {connectedSystem.system?.compliance_features.slice(0, 3).map((feature, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    {connectedSystem.errors.length > 0 && (
                      <Alert className="mt-4 border-orange-200 bg-orange-50">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Recent Issues:</strong>
                          <ul className="mt-1 list-disc list-inside">
                            {connectedSystem.errors.map((error, index) => (
                              <li key={index} className="text-sm">{error}</li>
                            ))}
                          </ul>
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Database className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">No Connected Systems</h3>
                <p className="text-gray-600 mb-4">
                  Connect to your practice management software to sync patient data and streamline workflows
                </p>
                <Button onClick={() => setConnectionDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Connect First System
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Recommended Integrations for Your Practice
              </CardTitle>
              <CardDescription>
                Based on your practice type ({user?.practice_type}) and specialty ({user?.profession_type?.replace('_', ' ')})
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recommendations.length > 0 ? (
                <div className="space-y-4">
                  {recommendations.map((rec, index) => {
                    const system = systems.find(s => s.id === rec.system_id);
                    if (!system) return null;
                    
                    return (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-start gap-4">
                          <div className={`w-3 h-3 rounded-full mt-2 ${
                            rec.priority === 'high' ? 'bg-red-500' : 
                            rec.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                          }`} />
                          <div>
                            <h4 className="font-semibold">{system.name}</h4>
                            <p className="text-sm text-gray-600">{rec.reason}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {rec.priority} priority
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {system.market_share}% market share
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSelectedSystem(system);
                            setConnectionDialogOpen(true);
                          }}
                        >
                          Learn More
                        </Button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Award className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">No specific recommendations available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sync" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Data Synchronization
              </CardTitle>
              <CardDescription>
                Manage data sync between your practice management system and content platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              {connectedSystems.length > 0 ? (
                <div className="space-y-6">
                  <Alert className="border-blue-200 bg-blue-50">
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Privacy & Compliance:</strong> All data synchronization follows Australian Privacy Laws and AHPRA guidelines. 
                      Patient consent is required before any marketing communications.
                    </AlertDescription>
                  </Alert>

                  {connectedSystems.map((system) => (
                    <div key={system.system_id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold">{system.system?.name} Sync</h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => syncData(system.system_id)}
                          disabled={isLoading}
                        >
                          <Sync className="mr-2 h-4 w-4" />
                          {isLoading ? 'Syncing...' : 'Sync Now'}
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-medium mb-2">Available Data Types</h5>
                          <div className="space-y-2">
                            {system.data_types_synced.map((dataType, index) => (
                              <div key={index} className="flex items-center justify-between">
                                <span className="text-sm">{dataType}</span>
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h5 className="font-medium mb-2">Sync Settings</h5>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Frequency:</span>
                              <Badge variant="outline">{system.sync_frequency}</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span>Last Sync:</span>
                              <span>{new Date(system.last_sync!).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Status:</span>
                              <Badge className="bg-green-100 text-green-800">Active</Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Sync className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold mb-2">No Systems Connected</h3>
                  <p className="text-gray-600">Connect to a practice management system to enable data synchronization</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Connection Dialog */}
      <Dialog open={connectionDialogOpen} onOpenChange={setConnectionDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Connect to {selectedSystem?.name}
            </DialogTitle>
            <DialogDescription>
              Enter your {selectedSystem?.name} credentials to establish the integration
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {selectedSystem && (
              <>
                <Alert className="border-blue-200 bg-blue-50">
                  <Shield className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    Your credentials are encrypted and stored securely. We only access data necessary for content synchronization.
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  <div>
                    <Label htmlFor="server_url">Server URL</Label>
                    <Input
                      id="server_url"
                      placeholder="https://your-practice.bestpractice.com.au"
                      value={credentials.server_url || ''}
                      onChange={(e) => setCredentials(prev => ({ ...prev, server_url: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      placeholder="Your system username"
                      value={credentials.username || ''}
                      onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="password">Password / API Key</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Your system password or API key"
                      value={credentials.password || ''}
                      onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <h5 className="font-medium text-sm">Integration Details:</h5>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Complexity:</span>
                      <Badge className={getComplexityColor(selectedSystem.integration_complexity)}>
                        {selectedSystem.integration_complexity}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Market Share:</span>
                      <span>{selectedSystem.market_share}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>API Support:</span>
                      <span>{selectedSystem.api_available ? '✅' : '❌'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setConnectionDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleConnect}
                    disabled={isLoading || !credentials.username || !credentials.password}
                  >
                    {isLoading ? (
                      <>
                        <Monitor className="mr-2 h-4 w-4 animate-pulse" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Connect
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 