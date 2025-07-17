import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
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
  Target
} from 'lucide-react';

const navigationItems = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Create Content',
    url: '/create',
    icon: PenTool,
  },
  {
    title: 'Posts',
    url: '/posts',
    icon: FileText,
  },
  {
    title: 'Calendar',
    url: '/calendar',
    icon: Calendar,
  },
  {
    title: 'Analytics',
    url: '/analytics',
    icon: BarChart3,
  },
];

const toolsItems = [
  {
    title: 'AI Generator',
    url: '/ai-generator',
    icon: Sparkles,
  },
  {
    title: 'Competitors',
    url: '/dashboard/competitors',
    icon: Users,
  },
  {
    title: 'Templates',
    url: '/templates',
    icon: Target,
  },
  {
    title: 'Media Library',
    url: '/media',
    icon: Image,
  },
  {
    title: 'Social Accounts',
    url: '/social-accounts',
    icon: Instagram,
  },
];

const settingsItems = [
  {
    title: 'Business Profile',
    url: '/profile',
    icon: Target,
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

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? 'bg-primary/20 text-primary border-primary/30 font-medium' 
      : 'hover:bg-muted/50 border-transparent';

  return (
    <Sidebar className={collapsed ? 'w-14' : 'w-60'} collapsible="icon">
      <div className="border-b border-white/10 p-4 flex items-center gap-3">
        <div className="flex items-center gap-3 flex-1">
          <img 
            src="/jbsaaslogo.png" 
            alt="JB SAAS Logo" 
            className="w-8 h-8 flex-shrink-0"
          />
          {!collapsed && (
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-gradient-primary truncate">JBSAAS</h1>
              <p className="text-xs text-muted-foreground truncate">AI Content Platform</p>
            </div>
          )}
        </div>
        <SidebarTrigger className="ml-auto" />
      </div>

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
              {settingsItems.map((item) => (
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