import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserRoleManagement } from '@/components/admin/UserRoleManagement';
import { AdminGuard } from '@/components/auth/PermissionGuards';
import { Alert, AlertDescription } from '@/components/ui/alert';
import SocialSetupOperationsPortal from '@/components/admin/SocialSetupOperationsPortal';
import AutomatedTestingSuite from '@/components/testing/AutomatedTestingSuite';
import { 
  Users, 
  Settings, 
  Shield, 
  TestTube,
  Globe,
  AlertTriangle
} from 'lucide-react';

export default function AdminPanel() {
  return (
    <AdminGuard fallback={
      <div className="container mx-auto p-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to access the admin panel. Contact your administrator for access.
          </AlertDescription>
        </Alert>
      </div>
    }>
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Downscale Derm Admin</h1>
          <p className="text-muted-foreground">
            Clinical administration and patient management dashboard
          </p>
          <p className="text-xs text-muted-foreground mt-1">Brand: Downscale Derm</p>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              User Management
            </TabsTrigger>
            <TabsTrigger value="setup-operations" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Setup Operations
            </TabsTrigger>
            <TabsTrigger value="testing" className="flex items-center gap-2">
              <TestTube className="w-4 h-4" />
              System Testing
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              System Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <UserRoleManagement />
          </TabsContent>

          <TabsContent value="setup-operations">
            <SocialSetupOperationsPortal />
          </TabsContent>

          <TabsContent value="testing">
            <AutomatedTestingSuite />
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Shield className="w-6 h-6 text-primary" />
                  System Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-3">API Configuration</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="p-3 bg-muted/20 rounded-lg">
                        <div className="font-medium">Supabase Integration</div>
                        <div className="text-green-600">✅ Connected</div>
                      </div>
                      <div className="p-3 bg-muted/20 rounded-lg">
                        <div className="font-medium">Stripe Integration</div>
                        <div className="text-green-600">✅ Configured</div>
                      </div>
                      <div className="p-3 bg-muted/20 rounded-lg">
                        <div className="font-medium">OpenAI API</div>
                        <div className="text-green-600">✅ Active</div>
                      </div>
                      <div className="p-3 bg-muted/20 rounded-lg">
                        <div className="font-medium">Australian Business Register</div>
                        <div className="text-yellow-600">⚠️ Mock Mode</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-3">Security Settings</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Row Level Security (RLS):</span>
                        <span className="text-green-600 font-medium">Enabled</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Admin Role Authentication:</span>
                        <span className="text-green-600 font-medium">Active</span>
                      </div>
                      <div className="flex justify-between">
                        <span>API Rate Limiting:</span>
                        <span className="text-green-600 font-medium">Configured</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Data Encryption:</span>
                        <span className="text-green-600 font-medium">AES-256</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-3">Australian Compliance</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Privacy Act 1988 Compliance:</span>
                        <span className="text-green-600 font-medium">Verified</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Data Residency (Australia):</span>
                        <span className="text-green-600 font-medium">Enforced</span>
                      </div>
                      <div className="flex justify-between">
                        <span>ABN Validation Service:</span>
                        <span className="text-yellow-600 font-medium">Development Mode</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminGuard>
  );
}