"use client";

import ProtectedRoute from "@/components/core/protected-route";
import { SidebarProvider } from "@/components/ui/sidebar";
import React from "react";
import AppSidebar from "../ui/app-sidebar";

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