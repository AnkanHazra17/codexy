"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import React from "react";
import AppSidebar from "../sidebar/app-sidebar";
import ProtectedRoute from "@/modules/auth/route-guards/protected-route";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      {(session) => (
        <SidebarProvider>
          <AppSidebar session={session} />
          {children}
        </SidebarProvider>
      )}
    </ProtectedRoute>
  );
}