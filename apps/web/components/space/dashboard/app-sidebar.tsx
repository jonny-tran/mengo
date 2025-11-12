"use client";

import * as React from "react";
import {
  Command,
  LifeBuoy,
  Send,
  Star,
  Clock,
  ListTodo,
  Calendar,
  Users,
  StickyNote,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { NavMain } from "@/components/space/dashboard/nav-main";
import { NavSecondary } from "@/components/space/dashboard/nav-secondary";
import { NavSupport } from "@/components/space/dashboard/nav-support";
import { NavCommunication } from "@/components/space/dashboard/nav-communication";
import { NavUser } from "@/components/space/dashboard/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";

import type { AuthInfoResponse } from "@mengo/api-client/types";

const personalNav: { title: string; url: string; icon: LucideIcon }[] = [
  { title: "My Tasks", url: "/space/my-tasks", icon: ListTodo },
  { title: "Starred", url: "/space/starred", icon: Star },
  { title: "Recently Viewed", url: "/space/recent", icon: Clock },
];

const studentNav: { title: string; url: string; icon: LucideIcon }[] = [
  { title: "Calendar", url: "/space/calendar", icon: Calendar },
  { title: "Members", url: "/space/members", icon: Users },
  { title: "Notes", url: "/space/notes", icon: StickyNote },
];

const data = {
  navSupport: [
    { title: "Help", url: "/help", icon: LifeBuoy },
    { title: "Feedback", url: "/feedback", icon: Send },
  ],
};

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & { user: AuthInfoResponse }) {
  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]! bg-linear-to-b from-primary/15 via-accent/12 to-secondary/15 backdrop-blur-sm border-r"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/space">
                <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Mengo</span>
                  <span className="truncate text-xs">Personal</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="scrollbar-hide">
        {/* Group 1: Personal Focus */}
        <NavMain label="Personal Focus" items={personalNav} />

        {/* Group 2: Student Workspace */}
        <NavSecondary label="Student Workspace" items={studentNav} />

        {/* Group 3: Communication */}
        <NavCommunication
          label="Communication"
          textChannels={[
            { title: "general", url: "/space/chat/general" },
            { title: "random", url: "/space/chat/random" },
            { title: "mentors", url: "/space/chat/mentors" },
          ]}
          voiceChannels={[
            { title: "Daily Standup", url: "/space/voice/standup" },
            { title: "Mentor Room", url: "/space/voice/mentor-room" },
          ]}
        />

        {/* Group 4: Support (Bottom-Aligned) */}
        <NavSupport items={data.navSupport} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        {/* Group 5: Account (Bottom-Most) */}
        <NavUser
          user={{
            name: user.name ?? user.email,
            email: user.email,
            avatar: user.avatar ?? undefined,
          }}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
