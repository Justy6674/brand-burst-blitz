import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useUserRoles } from '@/hooks/useUserRoles';
import { BusinessSwitcher } from '@/components/business/BusinessSwitcher';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  PenTool,
  Calendar,
  BarChart3,
  Settings,
  Image,
  Users,
  Sparkles,
  FileText,
  Instagram,
  Zap,
  Target,
  Network,
  ShieldCheck,
  BookOpen,
  Edit3,
  Globe,
  Copy,
  MessageSquare,
  CreditCard
} from 'lucide-react';

const navigationItems = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Content Hub',
    url: '/dashboard/diary',
    icon: BookOpen,
  },
  {
    title: 'Create Content',
    url: '/dashboard/create',
    icon: PenTool,
  },
  {
    title: 'Posts',
    url: '/dashboard/posts',
    icon: FileText,
  },
  {
    title: 'Calendar',
    url: '/dashboard/calendar',
    icon: Calendar,
  },
  {
    title: 'Analytics',
    url: '/dashboard/analytics',
    icon: BarChart3,
  },
];

const toolsItems = [
  {
    title: 'AI Generator',
    url: '/dashboard/create',
    icon: Sparkles,
  },
  {
    title: 'Copy-Paste Workflow',
    url: '/dashboard/copy-paste-workflow',
    icon: Copy,
  },
  {
    title: 'Competitors',
    url: '/dashboard/competitors',
    icon: Users,
  },
  {
    title: 'Templates',
    url: '/dashboard/templates',
    icon: Target,
  },
  {
    title: 'Media Library',
    url: '/media',
    icon: Image,
  },
  {
    title: 'Social Accounts',
    url: '/dashboard/social',
    icon: Instagram,
  },
  {
    title: 'Slack Setup',
    url: '/dashboard/slack-setup',
    icon: MessageSquare,
    description: 'Connect your practice Slack for notifications'
  },
  {
    title: 'Blog Embed',
    url: '/dashboard/blog-embed',
    icon: Globe,
  },
  {
    title: 'Validation System',
    url: '/dashboard/validation',
    icon: ShieldCheck,
  },
];

const settingsItems = [
  {
    title: 'Business Profile',
    url: '/dashboard/business-settings',
    icon: Target,
  },
  {
    title: 'Billing & Subscription',
    url: '/dashboard/billing',
    icon: CreditCard,
    description: 'Manage your subscription and billing'
  },
  {
    title: 'Cross-Business',
    url: '/dashboard/cross-business',
    icon: Network,
  },
  {
    title: 'Prompt Library',
    url: '/dashboard/prompts',
    icon: BookOpen,
  },
  {
    title: 'Blog Admin',
    url: '/dashboard/blog-admin',
    icon: Edit3,
    adminOnly: true,
  },
  {
    title: 'Admin Panel',
    url: '/dashboard/admin',
    icon: ShieldCheck,
    adminOnly: true,
  },
  {
    title: 'Automation',
    url: '/automation',
    icon: Zap,
  },
  {
    title: 'Settings',
    url: '/settings',
    icon: Settings,
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === 'collapsed';
  const { isAdmin } = useUserRoles();

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? 'bg-primary/20 text-primary border-primary/30 font-medium' 
      : 'hover:bg-muted/50 border-transparent';

  return (
    <Sidebar className={collapsed ? 'w-14' : 'w-60'} collapsible="icon">
      <div className="border-b border-white/10 p-3 flex items-center gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <img 
            src="/jbsaaslogo.png" 
            alt="JB SAAS Logo" 
            className="w-8 h-8 flex-shrink-0"
          />
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-bold text-gradient-primary truncate">JB-SaaS</h1>
              <p className="text-xs text-muted-foreground truncate">AI Content Platform</p>
            </div>
          )}
        </div>
        <SidebarTrigger className="ml-auto flex-shrink-0" />
      </div>

      {/* Business Switcher in Sidebar */}
      {!collapsed && (
        <div className="p-3 border-b border-white/5">
          <div className="text-xs text-muted-foreground mb-2">Current Business</div>
          <BusinessSwitcher className="w-full" />
        </div>
      )}

      <SidebarContent className="px-2 py-4">
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? 'sr-only' : ''}>
            Main
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
    <NavLink 
                      to={item.url} 
                      end 
                      className={({ isActive }) => 
                        `flex items-center gap-3 px-3 py-2 rounded-lg border transition-all ${getNavCls({ isActive })}`
                      }
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {!collapsed && <span className="truncate">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Tools */}
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? 'sr-only' : ''}>
            Tools
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {toolsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end 
                      className={({ isActive }) => 
                        `flex items-center gap-3 px-3 py-2 rounded-lg border transition-all ${getNavCls({ isActive })}`
                      }
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {!collapsed && <span className="truncate">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings */}
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? 'sr-only' : ''}>
            Settings
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems
                .filter(item => !item.adminOnly || isAdmin)
                .map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end 
                      className={({ isActive }) => 
                        `flex items-center gap-3 px-3 py-2 rounded-lg border transition-all ${getNavCls({ isActive })}`
                      }
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {!collapsed && <span className="truncate">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}