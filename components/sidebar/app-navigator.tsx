"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { APP_NAVIGATOR_ITEMS } from "@/constants/data";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

function AppNavigator() {
  const pathname = usePathname();

  /**
   * Check if a navigation item is active based on the current pathname
   * @param href - The href of the navigation item
   * @returns true if the current pathname matches or starts with the href
   */
  const isActive = (href: string): boolean => {
    // Exact match
    if (pathname === href) {
      return true;
    }

    // For dashboard root, only match exactly
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }

    // For other routes, check if pathname starts with the href
    // This handles sub-routes like /dashboard/repositories/123
    return pathname.startsWith(href + "/") || pathname === href;
  };

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu className="space-y-3">
          {APP_NAVIGATOR_ITEMS.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                tooltip={item.label}
                className={cn(
                  isActive(item.href) &&
                    "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                )}
              >
                <Link href={item.href}>
                  <item.icon className="size-4" />
                  <span className="truncate">{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export default AppNavigator;
