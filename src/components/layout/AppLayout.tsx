import React from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';
import { BusinessProfileProvider } from '@/contexts/BusinessProfileContext';
import { BusinessThemeProvider } from '@/contexts/BusinessThemeContext';
import { QuickAddFAB } from '@/components/common/QuickAddFAB';

const AppLayout = () => {
  return (
    <BusinessProfileProvider>
      <BusinessThemeProvider>
        <SidebarProvider>
          <div className="min-h-screen flex w-full bg-background">
            <AppSidebar />
            <div className="flex-1 flex flex-col">
              <AppHeader />
              <main className="flex-1 overflow-hidden">
                <Outlet />
              </main>
            </div>
            <QuickAddFAB />
          </div>
        </SidebarProvider>
      </BusinessThemeProvider>
    </BusinessProfileProvider>
  );
};

export default AppLayout;