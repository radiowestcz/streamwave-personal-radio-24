
import React from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import MainNav from './MainNav';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <SidebarProvider>
      <div className="flex w-full min-h-screen">
        <MainNav />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
