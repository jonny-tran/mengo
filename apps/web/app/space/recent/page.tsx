"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import EmptyState from "@/components/empty-state";
import AddAppDialog from "@/components/space/recent/add-app-dialog";
import AppCard, { type AppItem } from "@/components/space/recent/app-card";
import SprintSummaryCard, {
  type SprintOverviewItem,
} from "@/components/space/recent/sprint-summary-card";
import { BreadcrumbSetter } from "@/components/space/dashboard/breadcrumb-context";
import { Clock, FolderKanban, Layout, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type ActivityType = "Project" | "Task";

interface RecentActivityItem {
  id: string;
  title: string;
  type: ActivityType;
  lastViewed: string;
}

const mockRecentActivity: RecentActivityItem[] = [
  {
    id: "ra1",
    title: "E-commerce Mugs",
    type: "Project",
    lastViewed: "1 hour ago",
  },
  {
    id: "ra2",
    title: "Implement cart flow",
    type: "Task",
    lastViewed: "2 hours ago",
  },
  {
    id: "ra3",
    title: "Study Planner",
    type: "Project",
    lastViewed: "Yesterday",
  },
];

const mockApps: AppItem[] = [
  {
    id: "app1",
    name: "Portfolio",
    description: "Personal portfolio site",
    url: "https://example.com/portfolio",
  },
  {
    id: "app2",
    name: "Blog",
    description: "Markdown-based blog",
    url: "https://blog.example.com",
  },
];

const mockSprintOverviews: SprintOverviewItem[] = [
  {
    id: "s1",
    sprintName: "Sprint 14 - Checkout",
    progress: 72,
    status: "On Track",
  },
  {
    id: "s2",
    sprintName: "Sprint 15 - Search",
    progress: 38,
    status: "At Risk",
  },
  {
    id: "s3",
    sprintName: "Sprint 13 - Auth",
    progress: 100,
    status: "Completed",
  },
];

function RecentPage() {
  return (
    <div className="min-h-screen bg-background page-gradient-bg p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <BreadcrumbSetter
          items={[
            { label: "Workspace", href: "/space" },
            { label: "Recent", href: "/space/recent" },
          ]}
        />

        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-2 gradient-title tracking-tight leading-[1.2]">
            Recent Activity
          </h1>
          <p className="text-muted-foreground text-lg">
            Track your recent projects, tasks, and sprint progress
          </p>
        </div>

        <Tabs defaultValue="recent" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-background/50 backdrop-blur-sm border border-primary/20 p-1">
            <TabsTrigger
              value="recent"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/20 data-[state=active]:to-secondary/20 data-[state=active]:text-foreground transition-all"
            >
              <Clock className="h-4 w-4 mr-2" />
              Recent
            </TabsTrigger>
            <TabsTrigger
              value="my-apps"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/20 data-[state=active]:to-secondary/20 data-[state=active]:text-foreground transition-all"
            >
              <Layout className="h-4 w-4 mr-2" />
              My Apps
            </TabsTrigger>
            <TabsTrigger
              value="my-tasks-overview"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/20 data-[state=active]:to-secondary/20 data-[state=active]:text-foreground transition-all"
            >
              <FolderKanban className="h-4 w-4 mr-2" />
              Tasks Overview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recent" className="mt-6">
            {mockRecentActivity.length === 0 ? (
              <EmptyState message="No recent activity." />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                {mockRecentActivity.map((activity) => (
                  <Card
                    key={activity.id}
                    className={cn(
                      "group relative overflow-hidden transition-all duration-300",
                      "hover:shadow-2xl hover:-translate-y-1",
                      "border-primary/20 hover:border-primary/40",
                      activity.type === "Project"
                        ? "bg-gradient-to-br from-purple-500/20 via-purple-400/15 to-pink-500/20"
                        : "bg-gradient-to-br from-blue-500/20 via-blue-400/15 to-cyan-500/20",
                      "backdrop-blur-sm"
                    )}
                  >
                    {/* Gradient overlay on hover */}
                    <div
                      className={cn(
                        "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                        "bg-gradient-to-br from-primary/10 via-transparent to-secondary/10"
                      )}
                    />

                    {/* Shine effect */}
                    <div
                      className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
                      style={{
                        background:
                          "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
                      }}
                    />

                    <CardHeader className="relative z-10">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <CardTitle className="text-lg font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2 flex-1">
                          {activity.title}
                        </CardTitle>
                        {activity.type === "Project" ? (
                          <FolderKanban className="h-5 w-5 shrink-0 mt-0.5 text-purple-600 dark:text-purple-400 transition-transform duration-300 group-hover:scale-110" />
                        ) : (
                          <Sparkles className="h-5 w-5 shrink-0 mt-0.5 text-blue-600 dark:text-blue-400 transition-transform duration-300 group-hover:scale-110" />
                        )}
                      </div>
                    </CardHeader>
                    <CardFooter className="relative z-10 flex items-center justify-between gap-2 pt-0">
                      <Badge
                        variant="outline"
                        className={cn(
                          "capitalize text-xs font-semibold transition-all duration-200",
                          "group-hover:scale-105",
                          activity.type === "Project"
                            ? "border-purple-500/30 text-purple-600 dark:text-purple-400"
                            : "border-blue-500/30 text-blue-600 dark:text-blue-400"
                        )}
                      >
                        {activity.type}
                      </Badge>
                      <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {activity.lastViewed}
                      </span>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="my-apps" className="mt-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold gradient-title">My Apps</h2>
                <p className="text-muted-foreground text-sm mt-1">
                  Manage your deployed applications
                </p>
              </div>
              <AddAppDialog />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
              {mockApps.map((app) => (
                <AppCard key={app.id} app={app} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="my-tasks-overview" className="mt-6 space-y-4">
            <div className="mb-4">
              <h2 className="text-2xl font-bold gradient-title mb-1">
                Sprint Overview
              </h2>
              <p className="text-muted-foreground text-sm">
                Track progress across all active sprints
              </p>
            </div>
            {mockSprintOverviews.map((sprint) => (
              <SprintSummaryCard key={sprint.id} sprint={sprint} />
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default RecentPage;
