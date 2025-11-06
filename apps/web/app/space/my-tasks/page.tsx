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
import { Filter, X } from "lucide-react";
import { useState } from "react";

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
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [projectFilter, setProjectFilter] = useState<string>("all");

  const hasActiveFilters = statusFilter !== "all" || priorityFilter !== "all" || projectFilter !== "all";

  const clearFilters = () => {
    setStatusFilter("all");
    setPriorityFilter("all");
    setProjectFilter("all");
  };

  return (
    <div className="min-h-screen bg-background page-gradient-bg p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <BreadcrumbSetter
          items={[
            { label: "Workspace", href: "/space" },
            { label: "My Tasks", href: "/space/my-tasks" },
          ]}
        />
        
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-2 gradient-title tracking-tight leading-[1.2]">
            My Tasks
          </h1>
          <p className="text-muted-foreground text-lg">
            Manage and track all your tasks across projects
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {mockTasks.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                {mockTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            )}
          </main>

          {/* Filter Sidebar */}
          <aside className="w-full lg:w-[360px] shrink-0">
            <Card className="sticky top-20 h-[calc(100vh-5rem)] overflow-hidden border-primary/20 shadow-xl backdrop-blur-sm bg-background/80">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
              <CardHeader className="relative border-b border-border/50 bg-gradient-to-r from-primary/10 via-transparent to-secondary/10">
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-primary" />
                  <CardTitle className="text-xl font-semibold">Filters</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="relative space-y-6 pt-6 overflow-y-auto h-[calc(100%-5rem)]">
                {/* Status Filter */}
                <div className="space-y-3">
                  <Label htmlFor="status" className="text-sm font-semibold text-foreground/80">
                    Status
                  </Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger 
                      id="status"
                      className="bg-background/50 border-primary/20 hover:border-primary/40 transition-colors"
                    >
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="todo">To Do</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="done">Done</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Priority Filter */}
                <div className="space-y-3">
                  <Label htmlFor="priority" className="text-sm font-semibold text-foreground/80">
                    Priority
                  </Label>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger 
                      id="priority"
                      className="bg-background/50 border-primary/20 hover:border-primary/40 transition-colors"
                    >
                      <SelectValue placeholder="All Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Project Filter */}
                <div className="space-y-3">
                  <Label htmlFor="project" className="text-sm font-semibold text-foreground/80">
                    Project
                  </Label>
                  <Select value={projectFilter} onValueChange={setProjectFilter}>
                    <SelectTrigger 
                      id="project"
                      className="bg-background/50 border-primary/20 hover:border-primary/40 transition-colors"
                    >
                      <SelectValue placeholder="All Projects" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Projects</SelectItem>
                      <SelectItem value="alpha">Project Alpha</SelectItem>
                      <SelectItem value="beta">Project Beta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Clear Filters Button */}
                {hasActiveFilters && (
                  <div className="pt-4 border-t border-border/50">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-center gap-2 hover:bg-destructive/10 hover:text-destructive transition-colors"
                      onClick={clearFilters}
                    >
                      <X className="h-4 w-4" />
                      Clear all filters
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default MyTasksPage;
