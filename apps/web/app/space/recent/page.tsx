"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import EmptyState from "@/components/empty-state";
import AddAppDialog from "@/components/space/recent/add-app-dialog";
import AppCard, { type AppItem } from "@/components/space/recent/app-card";
import SprintSummaryCard, { type SprintOverviewItem } from "@/components/space/recent/sprint-summary-card";
import { BreadcrumbSetter } from "@/components/space/dashboard/breadcrumb-context";

type ActivityType = "Project" | "Task";

interface RecentActivityItem {
  id: string;
  title: string;
  type: ActivityType;
  lastViewed: string;
}

const mockRecentActivity: RecentActivityItem[] = [
  { id: "ra1", title: "E-commerce Mugs", type: "Project", lastViewed: "1 hour ago" },
  { id: "ra2", title: "Implement cart flow", type: "Task", lastViewed: "2 hours ago" },
  { id: "ra3", title: "Study Planner", type: "Project", lastViewed: "Yesterday" },
];

const mockApps: AppItem[] = [
  { id: "app1", name: "Portfolio", description: "Personal portfolio site", url: "https://example.com/portfolio" },
  { id: "app2", name: "Blog", description: "Markdown-based blog", url: "https://blog.example.com" },
];

const mockSprintOverviews: SprintOverviewItem[] = [
  { id: "s1", sprintName: "Sprint 14 - Checkout", progress: 72, status: "On Track" },
  { id: "s2", sprintName: "Sprint 15 - Search", progress: 38, status: "At Risk" },
  { id: "s3", sprintName: "Sprint 13 - Auth", progress: 100, status: "Completed" },
];

function RecentPage() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        <BreadcrumbSetter items={[{ label: "Workspace", href: "/space" }, { label: "Recent", href: "/space/recent" }]} />

        <Tabs defaultValue="recent" className="mt-4">
          <TabsList>
            <TabsTrigger value="recent">Recent</TabsTrigger>
            <TabsTrigger value="my-apps">My Apps</TabsTrigger>
            <TabsTrigger value="my-tasks-overview">Tasks Overview</TabsTrigger>
          </TabsList>

          <TabsContent value="recent" className="mt-4">
            {mockRecentActivity.length === 0 ? (
              <EmptyState message="No recent activity." />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockRecentActivity.map((activity) => (
                  <Card key={activity.id}>
                    <CardHeader>
                      <CardTitle className="text-base">{activity.title}</CardTitle>
                    </CardHeader>
                    <CardFooter className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="outline">{activity.type}</Badge>
                      <span>{activity.lastViewed}</span>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="my-apps" className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">My Apps</h2>
              <AddAppDialog />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockApps.map((app) => (
                <AppCard key={app.id} app={app} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="my-tasks-overview" className="mt-4 space-y-3">
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
