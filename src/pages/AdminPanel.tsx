import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserRoleManagement } from "@/components/admin/UserRoleManagement";
import { AdminGuard } from "@/components/auth/PermissionGuards";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

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
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground">
            Manage users, roles, and system configuration
          </p>
        </div>

        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="audit">Audit Logs</TabsTrigger>
            <TabsTrigger value="system">System Settings</TabsTrigger>
            <TabsTrigger value="analytics">Admin Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <UserRoleManagement />
          </TabsContent>

          <TabsContent value="audit" className="space-y-4">
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">Audit Logs</h3>
              <p className="text-muted-foreground">Coming soon - Track system changes and user activities</p>
            </div>
          </TabsContent>

          <TabsContent value="system" className="space-y-4">
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">System Settings</h3>
              <p className="text-muted-foreground">Coming soon - Configure system-wide settings</p>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">Admin Analytics</h3>
              <p className="text-muted-foreground">Coming soon - System-wide analytics and insights</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminGuard>
  );
}