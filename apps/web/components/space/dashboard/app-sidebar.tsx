"use client";

import * as React from "react";
import {
  Command,
  LifeBuoy,
  Send,
  Star,
  Clock,
  ListTodo,
  Users,
  Folder,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { NavMain } from "@/components/space/dashboard/nav-main";
import { NavProjects } from "@/components/space/dashboard/nav-projects";
import { NavSecondary } from "@/components/space/dashboard/nav-secondary";
import { NavUser } from "@/components/space/dashboard/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";

const personalNav: { title: string; url: string; icon: LucideIcon }[] = [
  { title: "My Tasks", url: "/space/tasks", icon: ListTodo },
  { title: "Starred", url: "/space/starred", icon: Star },
  { title: "Recently Viewed", url: "/space/recent", icon: Clock },
];

const data = {
  user: {
    name: "Guest User",
    email: "guest@example.com",
    avatar: "https://github.com/shadcn.png",
  },
  workspace: {
    name: "Student Workspace",
  },
  navSecondary: [
    { title: "Help", url: "/help", icon: LifeBuoy },
    { title: "Feedback", url: "/feedback", icon: Send },
  ],
  projects: [
    { name: "E-commerce Mugs", url: "/space/board/proj_demo_1", icon: Folder },
    { name: "Study Planner", url: "/space/board/proj_demo_2", icon: Folder },
    { name: "Blog Platform", url: "/space/board/proj_demo_3", icon: Folder },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/space">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Mengo</span>
                  <span className="truncate text-xs">Home</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {/* Group 1: Personal Focus */}
        <NavMain label="Personal Focus" items={personalNav} />

        {/* Group 2: Workspace Context */}
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupLabel>{data.workspace.name}</SidebarGroupLabel>
        </SidebarGroup>
        <NavProjects projects={data.projects} />
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <a href="/space/members">
                  <Users />
                  <span>Members</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {/* Group 3: Support (Bottom-Aligned) */}
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        {/* Group 4: Account (Bottom-Most) */}
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
