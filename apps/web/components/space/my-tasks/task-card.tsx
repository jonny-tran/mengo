"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high";

export interface TaskItem {
  id: string;
  title: string;
  projectName: string;
  status: TaskStatus;
  priority: TaskPriority;
}

export function TaskCard({ task }: { task: TaskItem }) {
  const priorityVariant =
    task.priority === "high" ? "destructive" : task.priority === "medium" ? "default" : "secondary";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{task.title}</CardTitle>
        <CardDescription>{task.projectName}</CardDescription>
      </CardHeader>
      <CardContent></CardContent>
      <CardFooter className="flex items-center gap-2">
        <Badge variant="outline" className="capitalize">
          {task.status.replace("_", " ")}
        </Badge>
        <Badge variant={priorityVariant as any} className="capitalize">
          {task.priority}
        </Badge>
      </CardFooter>
    </Card>
  );
}

export default TaskCard;


