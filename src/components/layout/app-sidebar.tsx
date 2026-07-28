"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  LayoutDashboard,
  ListChecks,
  Send,
  Workflow,
  Inbox,
  Users,
  BarChart3,
  Settings,
  Zap,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const mainNav = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "AI Finder", href: "/finder", icon: Search },
  { title: "Lead Lists", href: "/lists", icon: ListChecks },
  { title: "Sequences", href: "/sequences", icon: Workflow },
  { title: "Campaigns", href: "/campaigns", icon: Send },
  { title: "Inbox", href: "/inbox", icon: Inbox },
];

const manageNav = [
  { title: "Senders", href: "/senders", icon: Users },
  { title: "Analytics", href: "/analytics", icon: BarChart3 },
  { title: "Settings", href: "/settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border px-4 py-3">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Zap className="h-4 w-4" />
          </div>
          <div>
            <span className="text-base font-semibold tracking-tight">Hospitami</span>
            <span className="ml-1 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              AI
            </span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Outreach</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton render={<Link href={item.href} />} isActive={pathname.startsWith(item.href)}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Manage</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {manageNav.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton render={<Link href={item.href} />} isActive={pathname.startsWith(item.href)}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground">
          <div className="h-6 w-6 rounded-full bg-muted" />
          <span className="truncate">Workspace</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
