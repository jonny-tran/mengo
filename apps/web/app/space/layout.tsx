import React from "react";

import { AppSidebar } from "@/components/space/dashboard/app-sidebar";
import { BreadcrumbProvider } from "@/components/space/dashboard/breadcrumb-context";
import { SiteHeader } from "@/components/space/dashboard/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { requireStudentUser } from "@/lib/auth/session";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireStudentUser();

  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <SidebarProvider className="flex flex-col min-h-screen">
        <BreadcrumbProvider>
          <SiteHeader />
          <div className="flex flex-1">
            <AppSidebar user={user} />
            <SidebarInset>
              <div className="flex flex-1 flex-col gap-4">{children}</div>
            </SidebarInset>
          </div>
        </BreadcrumbProvider>
      </SidebarProvider>
    </div>
  );
}
