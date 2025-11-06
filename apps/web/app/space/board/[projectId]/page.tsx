"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";
import { ArrowLeft, Lightbulb, Sparkles, Eye } from "lucide-react";
import Link from "next/link";

interface TaskData {
  id: string;
  title: string;
  description?: string;
  hints?: {
    metacognitive?: string;
    conceptual?: string;
    keywords?: string;
  };
}

interface EpicData {
  id: string;
  title: string;
  tasks: TaskData[];
}

interface ProjectData {
  plan: {
    epics: EpicData[];
  };
  briefContent: string;
  createdAt: string;
}

interface TaskWithStatus extends TaskData {
  epicId: string;
  epicTitle: string;
  status: "todo" | "progress" | "done";
}

type TaskStatus = "todo" | "progress" | "done";

// Status-based gradient configurations
const statusGradients = {
  todo: "from-blue-50/80 via-indigo-50/60 to-purple-50/40 dark:from-blue-950/30 dark:via-indigo-950/20 dark:to-purple-950/10",
  progress:
    "from-amber-50/80 via-orange-50/60 to-yellow-50/40 dark:from-amber-950/30 dark:via-orange-950/20 dark:to-yellow-950/10",
  done: "from-emerald-50/80 via-green-50/60 to-teal-50/40 dark:from-emerald-950/30 dark:via-green-950/20 dark:to-teal-950/10",
};

const statusBorders = {
  todo: "border-l-blue-500 dark:border-l-blue-400",
  progress: "border-l-amber-500 dark:border-l-amber-400",
  done: "border-l-emerald-500 dark:border-l-emerald-400",
};

function TaskCard({
  task,
  epicTitle,
  status,
  projectId,
  onMentorClick,
}: {
  task: TaskData;
  epicTitle: string;
  status: TaskStatus;
  projectId: string;
  onMentorClick: (task: TaskData) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "task",
      task,
      status,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || undefined,
    opacity: isDragging ? 0.6 : 1,
  };

  const hasHints =
    task.hints &&
    (task.hints.metacognitive || task.hints.conceptual || task.hints.keywords);

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card
        className={`
          group cursor-grab active:cursor-grabbing transition-all duration-300 ease-out
          hover:shadow-xl hover:shadow-black/5 hover:scale-[1.02] hover:-translate-y-1
          border-l-4 ${statusBorders[status]}
          bg-gradient-to-br ${statusGradients[status]}
          backdrop-blur-sm border-white/20 dark:border-white/10
          ${isDragging ? "shadow-2xl shadow-black/20 scale-105 rotate-2" : ""}
        `}
      >
        <CardContent className="p-4 space-y-3">
          {/* Header with Epic Badge and Mentor Button */}
          <div className="flex items-start justify-between gap-2">
            <Badge
              variant="outline"
              className="text-xs font-medium bg-muted/50 hover:bg-muted transition-colors"
            >
              {epicTitle}
            </Badge>
            <div className="flex items-center gap-1">
              {hasHints && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-amber-100/80 dark:hover:bg-amber-900/40 hover:scale-110"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMentorClick(task);
                  }}
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <Lightbulb className="h-4 w-4 text-amber-500" />
                </Button>
              )}
            </div>
          </div>

          {/* Task Title */}
          <h3 className="font-semibold text-sm leading-tight text-foreground group-hover:text-primary transition-colors duration-200">
            {task.title}
          </h3>

          {/* Task Description */}
          {task.description && (
            <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
              {task.description}
            </p>
          )}

          {/* Hint Indicator */}
          {hasHints && (
            <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 pt-1 group-hover:text-amber-500 transition-colors duration-200">
              <Sparkles className="h-3 w-3 animate-pulse" />
              <span>AI Mentor hints available</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/50">
            <Link
              href={`/space/board/${projectId}/task/${task.id}`}
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-105"
              >
                <Eye className="h-3 w-3 mr-1.5" />
                View details
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MentorDialog({
  task,
  open,
  onOpenChange,
}: {
  task: TaskData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!task || !task.hints) return null;

  const hints = task.hints;
  const hintItems = [
    {
      level: "metacognitive",
      title: "💭 Hint 1: How should I think about this?",
      content: hints.metacognitive || "",
    },
    {
      level: "conceptual",
      title: "📚 Hint 2: What concept should I review?",
      content: hints.conceptual || "",
    },
    {
      level: "keywords",
      title: "🔍 Hint 3: What keywords can I search?",
      content: hints.keywords || "",
    },
  ].filter((item) => item.content);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-card/95 backdrop-blur-md border-white/20 dark:border-white/10">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="rounded-full bg-amber-100 dark:bg-amber-900/30 p-2">
              <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <span>AI Mentor - {task.title}</span>
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <Accordion type="single" collapsible className="w-full">
            {hintItems.map((item, index) => (
              <AccordionItem key={index} value={`hint-${index}`}>
                <AccordionTrigger className="text-left font-medium">
                  {item.title}
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {item.content}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          {hintItems.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">
                No hints available for this task.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function BoardPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.projectId as string;

  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [tasks, setTasks] = useState<TaskWithStatus[]>([]);
  const [activeTask, setActiveTask] = useState<TaskData | null>(null);
  const [isMentorDialogOpen, setIsMentorDialogOpen] = useState(false);
  const [notFound, setNotFound] = useState<boolean>(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // More responsive drag activation
      },
    })
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Load project data from localStorage
    const storageKey = `mengo_project_${projectId}`;
    const stored = localStorage.getItem(storageKey);

    if (!stored) {
      setTimeout(() => {
        setNotFound(true);
        toast.error("Project not found in localStorage");
      }, 0);
      return;
    }

    try {
      const data: ProjectData = JSON.parse(stored);

      // Transform epics and tasks
      const transformedTasks: TaskWithStatus[] = [];

      data.plan.epics.forEach((epic) => {
        epic.tasks.forEach((task) => {
          transformedTasks.push({
            ...task,
            epicId: epic.id,
            epicTitle: epic.title,
            status: "todo" as TaskStatus, // Default status
          });
        });
      });

      // Defer state updates to avoid cascading renders
      setTimeout(() => {
        setProjectData(data);
        setTasks(transformedTasks);
      }, 0);
    } catch (error) {
      console.error("Error parsing project data:", error);
      setTimeout(() => {
        setNotFound(true);
        toast.error("Error reading project data");
      }, 0);
    }
  }, [projectId]);

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter((task) => task.status === status);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const taskData = active.data.current?.task as TaskData;
    if (taskData) {
      setActiveTask(taskData);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeTask = active.data.current?.task as TaskData;
    const activeStatus = active.data.current?.status as TaskStatus;
    const overStatus = over.data.current?.status as TaskStatus;

    if (!activeTask || !activeStatus) return;

    // If dropped on a different status column
    if (overStatus && overStatus !== activeStatus) {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === activeTask.id ? { ...task, status: overStatus } : task
        )
      );
      saveToLocalStorage();
    }
  };

  const saveToLocalStorage = () => {
    if (!projectData) return;

    // Update tasks in epics structure
    const updatedEpics = projectData.plan.epics.map((epic) => ({
      ...epic,
      tasks: epic.tasks.map((task) => task),
    }));

    const updatedData: ProjectData = {
      ...projectData,
      plan: {
        epics: updatedEpics,
      },
    };

    const storageKey = `mengo_project_${projectId}`;
    localStorage.setItem(storageKey, JSON.stringify(updatedData));
  };

  const handleMentorClick = (task: TaskData) => {
    setActiveTask(task);
    setIsMentorDialogOpen(true);
  };

  if (!projectData) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="mx-auto max-w-7xl">
          {!notFound ? (
            <div className="flex items-center justify-center h-screen">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Project not found or data is empty.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => router.back()}>
                  Back to space
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  const columns: Array<{ id: TaskStatus; title: string }> = [
    { id: "todo", title: "To Do" },
    { id: "progress", title: "In Progress" },
    { id: "done", title: "Done" },
  ];

  // Column header styling based on status
  const columnHeaderStyles = {
    todo: "bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border-blue-200/50 dark:border-blue-800/50",
    progress:
      "bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-200/50 dark:border-amber-800/50",
    done: "bg-gradient-to-r from-emerald-500/10 to-green-500/10 border-emerald-200/50 dark:border-emerald-800/50",
  };

  // Enhanced drop zone detection
  const getDropZoneStyle = (columnId: TaskStatus, isOver: boolean) => {
    const baseStyle = "transition-all duration-300 ease-out";
    if (!activeTask) return baseStyle;

    if (isOver) {
      return `${baseStyle} ring-2 ring-primary/50 bg-primary/5 scale-[1.01]`;
    }

    return `${baseStyle} ring-1 ring-border/50`;
  };

  // Create droppable zones for columns
  const DroppableColumn = ({
    children,
    status,
  }: {
    children: React.ReactNode;
    status: TaskStatus;
  }) => {
    const { setNodeRef, isOver } = useDroppable({
      id: status,
      data: { status },
    });

    return (
      <div ref={setNodeRef} className={getDropZoneStyle(status, isOver)}>
        {children}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background page-gradient-bg p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Section 1: Project Title */}
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-4 p-6 rounded-2xl bg-card/60 backdrop-blur-sm border border-white/20 dark:border-white/10 shadow-lg hover:shadow-xl transition-all duration-300">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/space")}
            className="
              hover:bg-accent transition-all duration-300 hover:scale-110 hover:shadow-md
              bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm
              border-white/30 dark:border-white/20
            "
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-bold gradient-title mb-1 break-words">
              {projectData.briefContent.slice(0, 60)}
              {projectData.briefContent.length > 60 ? "..." : ""}
            </h1>
            <p className="text-sm text-muted-foreground">
              Created{" "}
              {new Date(projectData.createdAt).toLocaleDateString("vi-VN")}
            </p>
          </div>
        </div>

        {/* AI-Kanban Board: Status Columns */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
            {columns.map((column) => {
              const columnTasks = getTasksByStatus(column.id);
              const taskIds = columnTasks.map((t) => t.id);

              return (
                <DroppableColumn key={column.id} status={column.id}>
                  <div className="flex flex-col h-full transform transition-all duration-300 hover:scale-[1.005] lg:hover:scale-[1.01]">
                    <Card className="h-full flex flex-col bg-card/80 backdrop-blur-sm border-white/20 dark:border-white/10 shadow-lg hover:shadow-xl transition-shadow duration-300">
                      <CardHeader
                        className={`pb-3 rounded-t-lg border-b ${columnHeaderStyles[column.id]}`}
                      >
                        <CardTitle className="text-sm sm:text-base font-semibold flex items-center justify-between gradient-title">
                          <span>{column.title}</span>
                          <Badge
                            variant="secondary"
                            className={`
                            ml-2 font-normal transition-all duration-200 
                            ${column.id === "todo" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" : ""}
                            ${column.id === "progress" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" : ""}
                            ${column.id === "done" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" : ""}
                          `}
                          >
                            {columnTasks.length}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="flex-1 p-0 bg-gradient-to-b from-transparent to-muted/20">
                        <ScrollArea className="h-[calc(100vh-280px)] sm:h-[calc(100vh-250px)] px-3 sm:px-4 pb-4">
                          <SortableContext
                            items={taskIds}
                            strategy={verticalListSortingStrategy}
                          >
                            <div className="space-y-3">
                              {columnTasks.map((task) => (
                                <TaskCard
                                  key={task.id}
                                  task={task}
                                  epicTitle={task.epicTitle}
                                  status={task.status}
                                  projectId={projectId}
                                  onMentorClick={handleMentorClick}
                                />
                              ))}
                              {columnTasks.length === 0 && (
                                <div
                                  className={`
                                flex h-32 items-center justify-center text-sm text-muted-foreground 
                                border-2 border-dashed rounded-lg transition-all duration-300 mx-1
                                hover:border-primary/30 hover:bg-primary/5
                                ${activeTask ? "border-primary/50 bg-primary/10" : "border-muted"}
                              `}
                                >
                                  <span>No tasks</span>
                                </div>
                              )}
                            </div>
                          </SortableContext>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </div>
                </DroppableColumn>
              );
            })}
          </div>

          <DragOverlay>
            {activeTask ? (
              <div className="transform rotate-2 sm:rotate-3 scale-105 sm:scale-110 transition-transform duration-200">
                <Card
                  className="
                  opacity-95 shadow-2xl border-l-4 border-l-primary 
                  bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10
                  backdrop-blur-md border-white/20 dark:border-white/10
                  animate-pulse
                "
                >
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-xs sm:text-sm text-primary">
                      {activeTask.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Dragging...
                    </p>
                  </CardContent>
                </Card>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        {/* Mentor Dialog */}
        <MentorDialog
          task={activeTask}
          open={isMentorDialogOpen}
          onOpenChange={setIsMentorDialogOpen}
        />
      </div>
    </div>
  );
}
