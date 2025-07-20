import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/auth/AuthProvider';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { Link } from 'react-router-dom';
import { 
  User, 
  Settings, 
  FileText, 
  Users, 
  Calendar,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Zap,
  BookOpen,
  PenTool
} from 'lucide-react';

export const SimpleDashboard = () => {
  const { user } = useAuth();
  const { profile, userRole, loading: profileLoading } = useUserProfile();

  return (
    <div className="space-y-4 md:space-y-6 p-3 md:p-6 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="space-y-2">
        <h1 className="text-lg md:text-2xl lg:text-3xl font-bold tracking-tight">
          Welcome back{profile?.full_name ? `, ${profile.full_name}` : ''}!
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Here's your JB-SaaS content automation dashboard
        </p>
      </div>

      {/* Account Information */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">Account Status</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-base md:text-lg font-semibold truncate">{user?.email}</p>
            <Badge variant={userRole?.role === 'trial' ? 'secondary' : 'default'}>
              {userRole?.role || 'Loading...'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">Profile</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground truncate">
              {profile?.full_name || 'No name set'}
            </p>
            <Link to="/dashboard/business-settings">
              <Button variant="outline" size="sm" className="w-full">
                Edit Profile
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Link to="/dashboard/create">
              <Button size="sm" className="w-full">
                <Zap className="h-4 w-4 mr-2" />
                Create Content
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Feature Status Grid */}
      <div className="space-y-4">
        <h2 className="text-lg md:text-xl font-semibold">Available Features</h2>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium">Content Creation</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm">Functional</span>
              </div>
              <Link to="/dashboard/create">
                <Button variant="outline" size="sm" className="w-full">
                  Create Now
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium">Content Library</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm">Functional</span>
              </div>
              <Link to="/dashboard/posts">
                <Button variant="outline" size="sm" className="w-full">
                  View Posts
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium">Content Hub</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm">Functional</span>
              </div>
              <Link to="/dashboard/diary">
                <Button variant="outline" size="sm" className="w-full">
                  <PenTool className="h-3 w-3 mr-1" />
                  Open Hub
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium">Business Settings</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm">Functional</span>
              </div>
              <Link to="/dashboard/business-settings">
                <Button variant="outline" size="sm" className="w-full">
                  Configure
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-3">
          <h3 className="text-base font-medium text-muted-foreground">Coming Soon</h3>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            
            <Card className="opacity-75">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium">Social Media</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <span className="text-sm">Beta</span>
                </div>
                <Button variant="outline" size="sm" className="w-full" disabled>
                  Coming Soon
                </Button>
              </CardContent>
            </Card>

            <Card className="opacity-75">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium">Analytics</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <span className="text-sm">Beta</span>
                </div>
                <Button variant="outline" size="sm" className="w-full" disabled>
                  Coming Soon
                </Button>
              </CardContent>
            </Card>

            <Card className="opacity-75">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium">Calendar</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <span className="text-sm">Beta</span>
                </div>
                <Button variant="outline" size="sm" className="w-full" disabled>
                  Coming Soon
                </Button>
              </CardContent>
            </Card>

            <Card className="opacity-75">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium">Competitors</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <span className="text-sm">Beta</span>
                </div>
                <Button variant="outline" size="sm" className="w-full" disabled>
                  Coming Soon
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Getting Started */}
      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>
            Complete these steps to make the most of JB-SaaS
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-3" role="status" aria-label="Account creation status">
              <CheckCircle2 className="h-5 w-5 text-green-500" aria-hidden="true" />
              <span className="text-sm">Account created successfully</span>
            </div>
            
            <div className="flex items-center space-x-3" role="status" aria-label="Profile completion status">
              {profile?.full_name ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" aria-hidden="true" />
              ) : (
                <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" aria-hidden="true" />
              )}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1">
                <span className="text-sm">Complete your profile</span>
                {!profile?.full_name && (
                  <Link to="/dashboard/business-settings">
                    <Button size="sm" variant="outline">
                      Complete Now
                    </Button>
                  </Link>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-3" role="status" aria-label="Content creation status">
              <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" aria-hidden="true" />
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1">
                <span className="text-sm">Create your first content</span>
                <Link to="/dashboard/create">
                  <Button size="sm" variant="outline">
                    Create Content
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};