import React from "react";
import { AppSidebar } from "@/components/space/dashboard/app-sidebar";
import { SiteHeader } from "@/components/space/dashboard/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { BreadcrumbProvider } from "@/components/space/dashboard/breadcrumb-context";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <SidebarProvider className="flex flex-col min-h-screen">
        <BreadcrumbProvider>
          <SiteHeader />
          <div className="flex flex-1">
            <AppSidebar />
            <SidebarInset>
              <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
            </SidebarInset>
          </div>
        </BreadcrumbProvider>
      </SidebarProvider>
    </div>
  );
}
