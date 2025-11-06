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
import { cn } from "@/lib/utils";
import { Clock, Circle, CheckCircle2 } from "lucide-react";

export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high";

export interface TaskItem {
  id: string;
  title: string;
  projectName: string;
  status: TaskStatus;
  priority: TaskPriority;
}

const statusConfig = {
  todo: {
    icon: Circle,
    label: "To Do",
    gradient: "from-blue-500/20 via-blue-400/15 to-cyan-500/20",
    borderColor: "border-blue-500/30",
    textColor: "text-blue-600 dark:text-blue-400",
  },
  in_progress: {
    icon: Clock,
    label: "In Progress",
    gradient: "from-amber-500/20 via-amber-400/15 to-orange-500/20",
    borderColor: "border-amber-500/30",
    textColor: "text-amber-600 dark:text-amber-400",
  },
  done: {
    icon: CheckCircle2,
    label: "Done",
    gradient: "from-green-500/20 via-green-400/15 to-emerald-500/20",
    borderColor: "border-green-500/30",
    textColor: "text-green-600 dark:text-green-400",
  },
};

const priorityConfig = {
  low: {
    variant: "secondary" as const,
    className: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30",
  },
  medium: {
    variant: "default" as const,
    className: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30",
  },
  high: {
    variant: "destructive" as const,
    className: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30",
  },
};

export function TaskCard({ task }: { task: TaskItem }) {
  const status = statusConfig[task.status];
  const priority = priorityConfig[task.priority];
  const StatusIcon = status.icon;

  return (
    <Card 
      className={cn(
        "group relative overflow-hidden transition-all duration-300",
        "hover:shadow-2xl hover:-translate-y-1",
        "border-primary/20 hover:border-primary/40",
        "bg-gradient-to-br",
        status.gradient,
        "backdrop-blur-sm"
      )}
    >
      {/* Animated gradient overlay on hover */}
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
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
        }}
      />

      <CardHeader className="relative z-10 pb-3">
        <div className="flex items-start justify-between gap-3 mb-2">
          <CardTitle className="text-lg font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2 flex-1">
            {task.title}
          </CardTitle>
          <StatusIcon className={cn(
            "h-5 w-5 shrink-0 mt-0.5 transition-transform duration-300 group-hover:scale-110",
            status.textColor
          )} />
        </div>
        <CardDescription className="text-sm font-medium text-foreground/70 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
          {task.projectName}
        </CardDescription>
      </CardHeader>

      <CardContent className="relative z-10 py-0">
        <div className="h-1 w-full bg-background/50 rounded-full overflow-hidden">
          <div 
            className={cn(
              "h-full transition-all duration-500",
              task.status === "done" ? "w-full bg-green-500" :
              task.status === "in_progress" ? "w-2/3 bg-amber-500" :
              "w-0 bg-blue-500"
            )}
          />
        </div>
      </CardContent>

      <CardFooter className="relative z-10 flex items-center justify-between gap-2 pt-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge 
            variant="outline" 
            className={cn(
              "capitalize text-xs font-semibold transition-all duration-200",
              "group-hover:scale-105",
              status.borderColor,
              status.textColor
            )}
          >
            {status.label}
          </Badge>
          <Badge 
            variant={priority.variant}
            className={cn(
              "capitalize text-xs font-semibold transition-all duration-200",
              "group-hover:scale-105",
              priority.className
            )}
          >
            {task.priority}
          </Badge>
        </div>
      </CardFooter>
    </Card>
  );
}

export default TaskCard;


