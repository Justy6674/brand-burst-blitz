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
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      {/* Welcome Header */}
      <div className="space-y-2">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight">
          Welcome back{profile?.full_name ? `, ${profile.full_name}` : ''}!
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Here's your JB-SaaS content automation dashboard
        </p>
      </div>

      {/* System Status Alert */}
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <CardTitle className="text-amber-800">System Status</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-amber-700">
            The JB-SaaS platform is currently under active development. Many features are being built and may have limited functionality.
          </p>
        </CardContent>
      </Card>

      {/* Account Information */}
      <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Account Status</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-lg font-semibold">{user?.email}</p>
              <Badge variant={userRole?.role === 'trial' ? 'secondary' : 'default'}>
                {userRole?.role || 'Loading...'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profile</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {profile?.full_name || 'No name set'}
              </p>
              <Link to="/dashboard/business-settings">
                <Button variant="outline" size="sm">
                  Edit Profile
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Link to="/dashboard/create">
                <Button size="sm" className="w-full">
                  <Zap className="h-4 w-4 mr-2" />
                  Create Content
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feature Status Grid */}
      <div className="space-y-4">
        <h2 className="text-lg md:text-xl font-semibold">Feature Status</h2>
        <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Content Creation</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm">Available</span>
              </div>
              <Link to="/dashboard/create">
                <Button variant="outline" size="sm" className="mt-2 w-full">
                  Try Now
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Content Library</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm">Available</span>
              </div>
              <Link to="/dashboard/posts">
                <Button variant="outline" size="sm" className="mt-2 w-full">
                  View Posts
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Templates</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm">Available</span>
              </div>
              <Link to="/dashboard/templates">
                <Button variant="outline" size="sm" className="mt-2 w-full">
                  Browse
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Social Media</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <span className="text-sm">In Development</span>
              </div>
              <Link to="/dashboard/social">
                <Button variant="outline" size="sm" className="mt-2 w-full">
                  Preview
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Analytics</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <span className="text-sm">In Development</span>
              </div>
              <Link to="/dashboard/analytics">
                <Button variant="outline" size="sm" className="mt-2 w-full">
                  Preview
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Calendar</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <span className="text-sm">In Development</span>
              </div>
              <Link to="/dashboard/calendar">
                <Button variant="outline" size="sm" className="mt-2 w-full">
                  Preview
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Competitors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <span className="text-sm">In Development</span>
              </div>
              <Link to="/dashboard/competitors">
                <Button variant="outline" size="sm" className="mt-2 w-full">
                  Preview
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Daily Diary</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm">Available</span>
              </div>
              <Link to="/dashboard/diary">
                <Button variant="outline" size="sm" className="mt-2 w-full">
                  <PenTool className="h-3 w-3 mr-1" />
                  Write Entry
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Business Settings</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm">Available</span>
              </div>
              <Link to="/dashboard/business-settings">
                <Button variant="outline" size="sm" className="mt-2 w-full">
                  Configure
                </Button>
              </Link>
            </CardContent>
          </Card>
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
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span className="text-sm">Account created successfully</span>
            </div>
            
            <div className="flex items-center space-x-3">
              {profile?.full_name ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />
              )}
              <div className="flex items-center space-x-2">
                <span className="text-sm">Complete your profile</span>
                {!profile?.full_name && (
                  <Link to="/dashboard/business-settings">
                    <Button size="sm" variant="outline">
                      Complete
                    </Button>
                  </Link>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />
              <div className="flex items-center space-x-2">
                <span className="text-sm">Create your first content</span>
                <Link to="/dashboard/create">
                  <Button size="sm" variant="outline">
                    Create
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