"use client";

import React from "react";
import { SidebarIcon } from "lucide-react";

import { SearchForm } from "@/components/space/dashboard/search-form";
import { useBreadcrumb } from "@/components/space/dashboard/breadcrumb-context";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useSidebar } from "@/components/ui/sidebar";

export function SiteHeader() {
  const { toggleSidebar } = useSidebar();
  const { items } = useBreadcrumb();

  return (
    <header className="sticky top-0 z-50 flex w-full items-center border-b bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-(--header-height) w-full items-center gap-2 px-4">
        <Button
          className="h-8 w-8"
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
        >
          <SidebarIcon />
        </Button>
        <Separator orientation="vertical" className="mr-2 h-4" />
        {items.length > 0 ? (
          <Breadcrumb className="hidden sm:block">
            <BreadcrumbList>
              {items.map((item, idx) => {
                const isLast = idx === items.length - 1;
                return (
                  <React.Fragment key={`bc-frag-${idx}`}>
                    <BreadcrumbItem>
                      {isLast ? (
                        <BreadcrumbPage>{item.label}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink href={item.href || "#"}>
                          {item.label}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                    {!isLast && <BreadcrumbSeparator />}
                  </React.Fragment>
                );
              })}
            </BreadcrumbList>
          </Breadcrumb>
        ) : null}
        <SearchForm className="w-full sm:ml-auto sm:w-auto" />
      </div>
    </header>
  );
}
