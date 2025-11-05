"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { database } from "@/lib/mock-data";
import type { Project, Epic, Task, User } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, User as UserIcon } from "lucide-react";
import Link from "next/link";

type TaskStatus = "todo" | "progress" | "done";

export default function BoardPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.projectId as string;

  const [project, setProject] = useState<Project | null>(null);
  const [epics, setEpics] = useState<Epic[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [notFound, setNotFound] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Load project
    const proj = database.getProjectById(projectId);
    if (!proj) {
      setNotFound(true);
      toast.error("Project does not exist");
      return;
    }
    // Prepare all data first
    const projectEpics = database.getEpicsByProjectId(projectId);
    const projectTasks = database.getTasksByProjectId(projectId);
    const allUsers = Object.values(database.users);

    // Defer state updates to next tick to avoid cascading renders
    setTimeout(() => {
      setProject(proj);
      setEpics(projectEpics);
      setTasks(projectTasks);
      setUsers(allUsers);
    }, 0);

    // Track analytics
    database.addEvent({
      type: "task_created",
      projectId,
    });
  }, [projectId, router]);

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    const task = database.getTaskById(taskId);
    if (!task) return;

    const updatedTask = {
      ...task,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };
    database.setTask(updatedTask);

    setTasks((prev) => prev.map((t) => (t.id === taskId ? updatedTask : t)));

    if (newStatus === "done") {
      database.addEvent({
        type: "task_completed",
        projectId,
        taskId,
      });
      toast.success("Task completed!");
    }
  };

  const handleAssign = (taskId: string, userId: string | null) => {
    const task = database.getTaskById(taskId);
    if (!task) return;

    const updatedTask = {
      ...task,
      assigneeId: userId || undefined,
      updatedAt: new Date().toISOString(),
    };
    database.setTask(updatedTask);

    setTasks((prev) => prev.map((t) => (t.id === taskId ? updatedTask : t)));

    if (userId) {
      database.addEvent({
        type: "task_assigned",
        projectId,
        taskId,
        userId,
      });
    }
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTask(taskId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    if (!draggedTask) return;

    handleStatusChange(draggedTask, targetStatus);
    setDraggedTask(null);
  };

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter((task) => task.status === status);
  };

  const getAssigneeName = (userId?: string) => {
    if (!userId) return null;
    const user = users.find((u) => u.id === userId);
    return user?.name || "Unknown";
  };

  const columns: Array<{ id: TaskStatus; title: string }> = [
    { id: "todo", title: "To Do" },
    { id: "progress", title: "In Progress" },
    { id: "done", title: "Done" },
  ];

  if (!project) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="mx-auto max-w-7xl">
          {!notFound ? (
            <p>Loading...</p>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Project không tồn tại hoặc dữ liệu trống.</p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => router.back()}>Quay lại</Button>
                <Button
                  onClick={async () => {
                    try {
                      await fetch("/api/debug/seed", { method: "POST" });
                      toast.success("Đã seed demo dữ liệu. Đang tải lại...");
                      location.reload();
                    } catch (e) {
                      toast.error("Seed dữ liệu thất bại");
                    }
                  }}
                >
                  Seed demo dữ liệu
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push("/space")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{project.title}</h1>
              <p className="text-sm text-muted-foreground">{project.brief}</p>
            </div>
          </div>
        </div>

        {/* Epics Section */}
        {epics.length > 0 && (
          <div className="mb-6">
            <h2 className="mb-4 text-lg font-semibold">Epics</h2>
            <div className="flex flex-wrap gap-2">
              {epics.map((epic) => {
                const epicTasks = tasks.filter((t) => t.epicId === epic.id);
                return (
                  <Badge key={epic.id} variant="outline" className="text-sm">
                    {epic.title} ({epicTasks.length})
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        {/* Kanban Board */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {columns.map((column) => {
            const columnTasks = getTasksByStatus(column.id);
            return (
              <div
                key={column.id}
                className="flex flex-col"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column.id)}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">
                      {column.title} ({columnTasks.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 min-h-[400px]">
                    {columnTasks.map((task) => {
                      const epic = epics.find((e) => e.id === task.epicId);
                      const hints = database.getHintsByTaskId(task.id);
                      const firstHint = hints[0];

                      return (
                        <Card
                          key={task.id}
                          className="cursor-pointer transition-shadow hover:shadow-md"
                          draggable
                          onDragStart={(e) => handleDragStart(e, task.id)}
                        >
                          <CardContent className="p-4">
                            <div className="space-y-2">
                              <Link
                                href={`/space/task/${task.id}`}
                                className="block"
                              >
                                <h3 className="font-medium text-sm">
                                  {task.title}
                                </h3>
                                {task.description && (
                                  <p className="text-xs text-muted-foreground line-clamp-2">
                                    {task.description}
                                  </p>
                                )}
                                {firstHint && (
                                  <p className="text-xs text-muted-foreground mt-1 italic">
                                    💡 {firstHint.content.substring(0, 50)}...
                                  </p>
                                )}
                              </Link>

                              {epic && (
                                <Badge variant="outline" className="text-xs">
                                  {epic.title}
                                </Badge>
                              )}

                              <div className="flex items-center justify-between gap-2">
                                <Select
                                  value={task.assigneeId || "unassigned"}
                                  onValueChange={(value) =>
                                    handleAssign(
                                      task.id,
                                      value === "unassigned" ? null : value
                                    )
                                  }
                                >
                                  <SelectTrigger className="h-8 text-xs">
                                    <SelectValue>
                                      {task.assigneeId ? (
                                        <span className="flex items-center gap-1">
                                          <UserIcon className="h-3 w-3" />
                                          {getAssigneeName(task.assigneeId)}
                                        </span>
                                      ) : (
                                        "Assign"
                                      )}
                                    </SelectValue>
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="unassigned">
                                      Unassigned
                                    </SelectItem>
                                    {users.map((user) => (
                                      <SelectItem key={user.id} value={user.id}>
                                        {user.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                    {columnTasks.length === 0 && (
                      <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
                        No tasks
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
