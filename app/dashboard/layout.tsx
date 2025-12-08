'use client';

import { AppSidebar } from "@/app/components/app-sidebar"
import { SiteHeader } from "@/app/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import ProtectedRoute from '@/app/components/ProtectedRoute';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="flex-1">
          <SiteHeader />
          <div className="flex-1">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
}