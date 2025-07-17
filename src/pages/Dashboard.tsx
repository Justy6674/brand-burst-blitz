import React from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  PenTool, 
  Calendar, 
  BarChart3, 
  Users, 
  Settings,
  Plus,
  Sparkles,
  TrendingUp,
  FileText,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  LogOut,
  Bell
} from 'lucide-react';

const Dashboard = () => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-white/10 bg-card/50 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gradient-primary">JBSAAS</h1>
                <p className="text-sm text-muted-foreground">AI Content Automation</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <Badge variant="secondary" className="bg-success/20 text-success border-success/30">
                Trial
              </Badge>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            Welcome back, {user?.user_metadata?.business_name || user?.email?.split('@')[0]}!
          </h2>
          <p className="text-muted-foreground">
            Manage your AI-powered content and social media automation
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="glass hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Posts Created</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-success">+0%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card className="glass hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Scheduled Posts</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Ready to publish
              </p>
            </CardContent>
          </Card>

          <Card className="glass hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Engagement</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Total interactions
              </p>
            </CardContent>
          </Card>

          <Card className="glass hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Connected Accounts</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Social platforms
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Quick Actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <Card className="glass-strong">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sparkles className="h-5 w-5 mr-2 text-primary" />
                  Quick Actions
                </CardTitle>
                <CardDescription>
                  Get started with AI-powered content creation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button className="h-20 bg-gradient-primary hover:scale-105 transition-all flex-col gap-2">
                    <PenTool className="h-6 w-6" />
                    Create Blog Post
                  </Button>
                  <Button className="h-20 bg-gradient-to-r from-secondary to-primary hover:scale-105 transition-all flex-col gap-2">
                    <Instagram className="h-6 w-6" />
                    Social Media Post
                  </Button>
                  <Button className="h-20 bg-gradient-to-r from-success to-secondary hover:scale-105 transition-all flex-col gap-2">
                    <Calendar className="h-6 w-6" />
                    Schedule Content
                  </Button>
                  <Button className="h-20 bg-gradient-to-r from-warning to-success hover:scale-105 transition-all flex-col gap-2">
                    <BarChart3 className="h-6 w-6" />
                    View Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="glass">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Your latest content and interactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No activity yet</p>
                  <p className="text-sm">Start creating content to see your activity here</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Connected Platforms */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-lg">Connected Platforms</CardTitle>
                <CardDescription>
                  Connect your social media accounts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border border-white/10 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Facebook className="h-5 w-5 text-blue-500" />
                    <span className="text-sm">Facebook</span>
                  </div>
                  <Button size="sm" variant="outline">Connect</Button>
                </div>
                <div className="flex items-center justify-between p-3 border border-white/10 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Instagram className="h-5 w-5 text-pink-500" />
                    <span className="text-sm">Instagram</span>
                  </div>
                  <Button size="sm" variant="outline">Connect</Button>
                </div>
                <div className="flex items-center justify-between p-3 border border-white/10 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Linkedin className="h-5 w-5 text-blue-400" />
                    <span className="text-sm">LinkedIn</span>
                  </div>
                  <Button size="sm" variant="outline">Connect</Button>
                </div>
                <div className="flex items-center justify-between p-3 border border-white/10 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Twitter className="h-5 w-5 text-blue-400" />
                    <span className="text-sm">Twitter</span>
                  </div>
                  <Button size="sm" variant="outline">Connect</Button>
                </div>
              </CardContent>
            </Card>

            {/* Upgrade Card */}
            <Card className="glass border-primary/30 bg-gradient-to-br from-primary/10 to-secondary/10">
              <CardHeader>
                <CardTitle className="text-lg text-gradient-primary">
                  Upgrade to Pro
                </CardTitle>
                <CardDescription>
                  Unlock unlimited AI content generation and advanced features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm mb-4">
                  <li className="flex items-center">
                    <Sparkles className="h-4 w-4 text-primary mr-2" />
                    Unlimited AI posts
                  </li>
                  <li className="flex items-center">
                    <Calendar className="h-4 w-4 text-primary mr-2" />
                    Advanced scheduling
                  </li>
                  <li className="flex items-center">
                    <BarChart3 className="h-4 w-4 text-primary mr-2" />
                    Analytics & insights
                  </li>
                </ul>
                <Button className="w-full bg-gradient-primary hover:scale-105 transition-all">
                  Upgrade Now
                </Button>
              </CardContent>
            </Card>

            {/* Help & Support */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-lg">Need Help?</CardTitle>
                <CardDescription>
                  Get started with our resources
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="ghost" className="w-full justify-start">
                  📚 Documentation
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  🎥 Video Tutorials
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  💬 Contact Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;