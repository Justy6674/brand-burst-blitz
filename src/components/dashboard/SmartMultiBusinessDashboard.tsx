import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBusinessProfile } from '@/hooks/useBusinessProfile';
import { Plus, Settings, Globe, BarChart3, FileText, Zap, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

interface BusinessDashboardProps {
  onCreateBusiness?: () => void;
  onSetupIntegration?: (businessId: string) => void;
}

export const SmartMultiBusinessDashboard: React.FC<BusinessDashboardProps> = ({
  onCreateBusiness,
  onSetupIntegration
}) => {
  const { currentProfile, businessProfiles, switchBusiness } = useBusinessProfile();
  const [selectedView, setSelectedView] = useState<'overview' | 'integration' | 'content' | 'analytics'>('overview');

  // Mock data - in real implementation, this would come from the database
  const getBusinessStats = (businessId: string) => ({
    posts: Math.floor(Math.random() * 50) + 1,
    views: Math.floor(Math.random() * 10000) + 100,
    integrationStatus: ['connected', 'pending', 'not_setup'][Math.floor(Math.random() * 3)],
    lastPublished: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleDateString()
  });

  const getPlatformIcon = (industry: string) => {
    switch (industry) {
      case 'ecommerce': return '🛍️';
      case 'technology': return '💻';
      case 'health': return '🏥';
      case 'finance': return '💰';
      case 'education': return '📚';
      default: return '🏢';
    }
  };

  const getIntegrationStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Connected</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Setup Required</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800"><AlertTriangle className="w-3 h-3 mr-1" />Not Setup</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Business Switcher */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Business Dashboard</h1>
          <p className="text-muted-foreground">
            Manage all your businesses and their blog integrations in one place
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Business Switcher - Google Style */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Active Business:</span>
            <Select value={currentProfile?.id || ''} onValueChange={switchBusiness}>
              <SelectTrigger className="w-64">
                <SelectValue>
                  {currentProfile && (
                    <div className="flex items-center gap-2">
                      <span>{getPlatformIcon(currentProfile.industry || 'general')}</span>
                      <span className="font-medium">{currentProfile.business_name}</span>
                      <Badge variant="outline" className="text-xs">
                        {currentProfile.industry || 'General'}
                      </Badge>
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {businessProfiles.map((business) => (
                  <SelectItem key={business.id} value={business.id}>
                    <div className="flex items-center gap-2">
                      <span>{getPlatformIcon(business.industry || 'general')}</span>
                      <span className="font-medium">{business.business_name}</span>
                      <Badge variant="outline" className="text-xs">
                        {business.industry || 'General'}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button onClick={onCreateBusiness} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Business
          </Button>
        </div>
      </div>

      {/* Quick Stats Cards */}
      {currentProfile && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {(() => {
            const stats = getBusinessStats(currentProfile.id);
            return (
              <>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Published Posts</p>
                        <p className="text-2xl font-bold">{stats.posts}</p>
                      </div>
                      <FileText className="w-8 h-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Views</p>
                        <p className="text-2xl font-bold">{stats.views.toLocaleString()}</p>
                      </div>
                      <BarChart3 className="w-8 h-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Integration</p>
                        <div className="mt-1">
                          {getIntegrationStatusBadge(stats.integrationStatus)}
                        </div>
                      </div>
                      <Globe className="w-8 h-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Last Published</p>
                        <p className="text-sm font-medium">{stats.lastPublished}</p>
                      </div>
                      <Clock className="w-8 h-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>
              </>
            );
          })()}
        </div>
      )}

      {/* Main Dashboard Content */}
      {currentProfile ? (
        <div className="space-y-6">
          {/* View Selector */}
          <div className="flex gap-2">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'integration', label: 'Integration Setup', icon: Globe },
              { id: 'content', label: 'Content Manager', icon: FileText },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 }
            ].map(({ id, label, icon: Icon }) => (
              <Button
                key={id}
                variant={selectedView === id ? 'default' : 'outline'}
                onClick={() => setSelectedView(id as any)}
                className="flex items-center gap-2"
              >
                <Icon className="w-4 h-4" />
                {label}
              </Button>
            ))}
          </div>

          {/* Content based on selected view */}
          {selectedView === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Common tasks for {currentProfile.business_name}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => onSetupIntegration?.(currentProfile.id)}
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Setup Blog Integration
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <FileText className="w-4 h-4 mr-2" />
                    Create New Blog Post
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Settings className="w-4 h-4 mr-2" />
                    Business Settings
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Latest updates for {currentProfile.business_name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-2 rounded border">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Blog post published</p>
                        <p className="text-xs text-muted-foreground">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded border">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Integration updated</p>
                        <p className="text-xs text-muted-foreground">1 day ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded border">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Analytics report ready</p>
                        <p className="text-xs text-muted-foreground">3 days ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {selectedView === 'integration' && (
            <Card>
              <CardHeader>
                <CardTitle>Integration Setup for {currentProfile.business_name}</CardTitle>
                <CardDescription>
                  Configure how your blog integrates with your website platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Globe className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Ready to Setup Integration?</h3>
                  <p className="text-muted-foreground mb-4">
                    Configure your blog to work perfectly with your website platform
                  </p>
                  <Button onClick={() => onSetupIntegration?.(currentProfile.id)}>
                    Start Integration Setup
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        /* No Business Selected State */
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Plus className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">No Businesses Yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first business profile to start managing your blog content
              </p>
              <Button onClick={onCreateBusiness} size="lg">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Business
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Businesses Overview */}
      {businessProfiles.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>All Your Businesses</CardTitle>
            <CardDescription>
              Quick overview of all your business profiles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {businessProfiles.map((business) => {
                const stats = getBusinessStats(business.id);
                return (
                  <Card key={business.id} className={`cursor-pointer transition-all hover:shadow-md ${currentProfile?.id === business.id ? 'ring-2 ring-primary' : ''}`}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getPlatformIcon(business.industry || 'general')}</span>
                          <div>
                            <h4 className="font-medium">{business.business_name}</h4>
                            <p className="text-xs text-muted-foreground">{business.industry || 'General'}</p>
                          </div>
                        </div>
                        {getIntegrationStatusBadge(stats.integrationStatus)}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-muted-foreground">Posts</p>
                          <p className="font-medium">{stats.posts}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Views</p>
                          <p className="font-medium">{stats.views.toLocaleString()}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};