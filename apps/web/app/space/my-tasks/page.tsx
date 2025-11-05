"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import EmptyState from "@/components/empty-state";
import TaskCard, { type TaskItem } from "@/components/space/my-tasks/task-card";
import { BreadcrumbSetter } from "@/components/space/dashboard/breadcrumb-context";

const mockTasks: TaskItem[] = [
  {
    id: "t1",
    title: "Design login page",
    projectName: "Project Alpha",
    status: "in_progress",
    priority: "high",
  },
  {
    id: "t2",
    title: "Setup database schema",
    projectName: "Project Beta",
    status: "todo",
    priority: "medium",
  },
  {
    id: "t3",
    title: "Implement task list",
    projectName: "Project Alpha",
    status: "done",
    priority: "low",
  },
];

function MyTasksPage() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        <BreadcrumbSetter
          items={[
            { label: "Workspace", href: "/space" },
            { label: "My-Tasks", href: "/space/my-tasks" },
          ]}
        />
        <div className="flex gap-6">
          <main className="flex-1">
            <h1 className="text-2xl font-bold mb-4">My Tasks</h1>

            {mockTasks.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            )}
          </main>

          <aside className="w-[320px] shrink-0">
            <Card className="sticky top-16 h-[calc(100vh-4rem)] overflow-auto">
              <CardHeader>
                <CardTitle>Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Filter by Status</Label>
                  <Select>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="todo">To Do</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="done">Done</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Filter by Priority</Label>
                  <Select>
                    <SelectTrigger id="priority">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="project">Filter by Project</Label>
                  <Select>
                    <SelectTrigger id="project">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="alpha">Project Alpha</SelectItem>
                      <SelectItem value="beta">Project Beta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-2">
                  <Button variant="ghost" className="w-full justify-center">
                    Clear all filters
                  </Button>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default MyTasksPage;
