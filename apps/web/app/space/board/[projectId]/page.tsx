"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
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
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Lightbulb, Sparkles, Eye, Plus } from "lucide-react";
import Link from "next/link";
import {
  BOARD_COLOR_VARIANTS,
  DEFAULT_BOARD_COLUMNS,
  type BoardColumnConfig,
  createColumnId,
} from "@/lib/board/constants";

interface TaskData {
  id: string;
  title: string;
  description?: string;
  sprintId?: string;
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
    project?: {
      title?: string;
      description?: string;
    };
    epics: EpicData[];
    sprints?: SprintData[];
  };
  board?: {
    columns: BoardColumnConfig[];
    taskStatuses: Record<string, string>;
  };
  briefContent: string;
  createdAt: string;
}

interface TaskWithStatus extends TaskData {
  epicId: string;
  epicTitle: string;
  status: string;
}

type TaskStatus = string;

interface SprintData {
  id: string;
  name: string;
  goal: string;
  tasks: string[];
}

interface ColumnAppearance {
  cardGradient: string;
  cardBorder: string;
  headerBg: string;
  badgeBg: string;
}

function TaskCard({
  task,
  epicTitle,
  status,
  projectId,
  onMentorClick,
  appearance,
}: {
  task: TaskData;
  epicTitle: string;
  status: TaskStatus;
  projectId: string;
  onMentorClick: (task: TaskData) => void;
  appearance: ColumnAppearance;
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
          border-l-4 ${appearance.cardBorder}
          bg-gradient-to-br ${appearance.cardGradient}
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

  const [columns, setColumns] = useState<BoardColumnConfig[]>(DEFAULT_BOARD_COLUMNS);
  const [selectedSprintId, setSelectedSprintId] = useState<string>("all");
  const [isColumnDialogOpen, setIsColumnDialogOpen] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [tasks, setTasks] = useState<TaskWithStatus[]>([]);
  const [activeTask, setActiveTask] = useState<TaskData | null>(null);
  const [isMentorDialogOpen, setIsMentorDialogOpen] = useState(false);
  const [notFound, setNotFound] = useState<boolean>(false);

  const columnAppearanceMap = useMemo(() => {
    const variantsCount = BOARD_COLOR_VARIANTS.length;
    return columns.reduce<Record<string, ColumnAppearance>>((acc, column, index) => {
      acc[column.id] = BOARD_COLOR_VARIANTS[index % variantsCount];
      return acc;
    }, {});
  }, [columns]);

  const persistBoardState = useCallback(
    (nextTasks: TaskWithStatus[], nextColumns?: BoardColumnConfig[]) => {
      if (typeof window === "undefined") return;
      setProjectData((prev) => {
        if (!prev) return prev;
        const columnsToSave =
          nextColumns ??
          prev.board?.columns ??
          DEFAULT_BOARD_COLUMNS.map((column) => ({ ...column }));
        const taskStatuses = nextTasks.reduce<Record<string, string>>((acc, task) => {
          acc[task.id] = task.status;
          return acc;
        }, {});
        const updatedData: ProjectData = {
          ...prev,
          board: {
            columns: columnsToSave,
            taskStatuses,
          },
        };
        const storageKey = `mengo_project_${projectId}`;
        localStorage.setItem(storageKey, JSON.stringify(updatedData));
        return updatedData;
      });
    },
    [projectId]
  );

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

      const resolvedColumns =
        data.board?.columns && data.board.columns.length > 0
          ? data.board.columns
          : DEFAULT_BOARD_COLUMNS.map((column) => ({ ...column }));
      const fallbackStatus = resolvedColumns[0]?.id ?? "todo";
      const storedStatuses = data.board?.taskStatuses ?? {};

      const transformedTasks: TaskWithStatus[] = [];

      data.plan.epics.forEach((epic) => {
        epic.tasks.forEach((task) => {
          const statusFromStorage =
            storedStatuses[task.id] && resolvedColumns.find((column) => column.id === storedStatuses[task.id])
              ? storedStatuses[task.id]
              : fallbackStatus;
          transformedTasks.push({
            ...task,
            epicId: epic.id,
            epicTitle: epic.title,
            status: statusFromStorage,
          });
        });
      });

      const normalizedBoard = {
        columns: resolvedColumns,
        taskStatuses: transformedTasks.reduce<Record<string, string>>((acc, task) => {
          acc[task.id] = task.status;
          return acc;
        }, {}),
      };

      const normalizedData: ProjectData = {
        ...data,
        board: normalizedBoard,
      };

      const initialSprintId =
        data.plan.sprints && data.plan.sprints.length > 0 ? data.plan.sprints[0].id : "all";

      // Defer state updates to avoid cascading renders
      setTimeout(() => {
        setColumns(resolvedColumns);
        setProjectData(normalizedData);
        setTasks(transformedTasks);
        setSelectedSprintId(initialSprintId);
        localStorage.setItem(storageKey, JSON.stringify(normalizedData));
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
    return tasks.filter((task) => {
      if (task.status !== status) return false;
      if (selectedSprintId === "all") return true;
      return task.sprintId === selectedSprintId;
    });
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
      setTasks((prev) => {
        const updatedTasks = prev.map((task) =>
          task.id === activeTask.id ? { ...task, status: overStatus } : task
        );
        persistBoardState(updatedTasks);
        return updatedTasks;
      });
    }
  };

  const handleMentorClick = (task: TaskData) => {
    setActiveTask(task);
    setIsMentorDialogOpen(true);
  };

  const handleAddColumn = () => {
    const trimmed = newColumnTitle.trim();
    if (!trimmed) {
      toast.error("Please enter a column name");
      return;
    }

    const duplicate = columns.some(
      (column) => column.title.toLowerCase() === trimmed.toLowerCase()
    );
    if (duplicate) {
      toast.error("Column name already exists");
      return;
    }

    const newColumn = {
      id: createColumnId(trimmed),
      title: trimmed,
    };

    setColumns((prev) => {
      const updatedColumns = [...prev, newColumn];
      persistBoardState(tasks, updatedColumns);
      return updatedColumns;
    });
    setNewColumnTitle("");
    setIsColumnDialogOpen(false);
    toast.success("New column added to your board");
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

  const planProject = projectData.plan.project;
  const projectTitle =
    planProject?.title && planProject.title.trim().length > 0
      ? planProject.title.trim()
      : `${projectData.briefContent.slice(0, 60)}${
          projectData.briefContent.length > 60 ? "..." : ""
        }`;
  const projectDescription =
    planProject?.description && planProject.description.trim().length > 0
      ? planProject.description.trim()
      : projectData.briefContent;
  const sprints = projectData.plan.sprints ?? [];
  const hasSprints = sprints.length > 0;
  const sprintSelectValue = hasSprints ? selectedSprintId : "all";
  const selectedSprint =
    sprintSelectValue === "all"
      ? null
      : sprints.find((sprint) => sprint.id === sprintSelectValue) || null;

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
        {/* Section 1: Project Title & Sprint Controls */}
        <div className="mb-8 space-y-6 p-6 md:p-8 rounded-2xl bg-gradient-to-br from-card/80 via-card/70 to-card/60 backdrop-blur-md border border-white/30 dark:border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
          {/* Decorative gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
          <div className="relative z-10">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => router.push("/space")}
                  className="
                    hover:bg-accent transition-all duration-300 hover:scale-110 hover:shadow-lg
                    bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shrink-0
                    border-white/40 dark:border-white/30 shadow-sm
                  "
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold gradient-title break-words flex-1 leading-tight">
                      {projectTitle}
                    </h1>
                    <Button
                      variant="default"
                      size="sm"
                      className="gap-2 shrink-0 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                      onClick={() => setIsColumnDialogOpen(true)}
                    >
                      <Plus className="h-4 w-4" />
                      Add column
                    </Button>
                  </div>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed line-clamp-3 mb-3">
                    {projectDescription}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="w-1 h-1 rounded-full bg-primary/60" />
                    <span>Created {new Date(projectData.createdAt).toLocaleDateString("vi-VN")}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-[minmax(0,260px)_1fr] mt-6 pt-6 border-t border-white/10 dark:border-white/5">
              <div className="space-y-2">
                <Label className="text-xs uppercase text-muted-foreground tracking-wide font-semibold">
                  View sprint
                </Label>
                {hasSprints ? (
                  <Select value={sprintSelectValue} onValueChange={setSelectedSprintId}>
                    <SelectTrigger className="bg-background/90 backdrop-blur-sm border-white/20 shadow-sm hover:shadow-md transition-shadow">
                      <SelectValue placeholder="Select sprint" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All sprints</SelectItem>
                      {sprints.map((sprint) => (
                        <SelectItem key={sprint.id} value={sprint.id}>
                          {sprint.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="text-sm text-muted-foreground border border-dashed border-primary/20 rounded-lg p-4 bg-primary/5">
                    Sprint timeline will appear once the AI plan includes sprints.
                  </div>
                )}
              </div>
              {hasSprints && (
                <Card className="bg-gradient-to-br from-card/90 via-card/80 to-card/70 backdrop-blur-sm border-white/20 shadow-md hover:shadow-lg transition-all duration-300">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                      {selectedSprint ? (
                        <>
                          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                          Current sprint: {selectedSprint.name}
                        </>
                      ) : (
                        "Overview: All sprints"
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {selectedSprint ? (
                      <>
                        <p className="text-sm text-foreground leading-relaxed">
                          {selectedSprint.goal}
                        </p>
                        <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                          <Badge variant="secondary" className="text-xs">
                            {selectedSprint.tasks.length} {selectedSprint.tasks.length === 1 ? "task" : "tasks"}
                          </Badge>
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Showing every task across the roadmap. Select a sprint to
                        focus on a two-week milestone.
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>

        {/* AI-Kanban Board: Status Columns */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="overflow-x-auto overflow-y-hidden scroll-smooth pb-4 -mx-4 md:-mx-8 px-4 md:px-8 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-primary/20 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-primary/30">
            <div className="flex gap-4 sm:gap-6 min-w-max pb-2">
              {columns.map((column) => {
                const columnTasks = getTasksByStatus(column.id);
                const taskIds = columnTasks.map((t) => t.id);
                const appearance =
                  columnAppearanceMap[column.id] ?? BOARD_COLOR_VARIANTS[0];

                return (
                  <DroppableColumn key={column.id} status={column.id}>
                    <div className="flex flex-col h-full w-[320px] sm:w-[360px] lg:w-[380px] transform transition-all duration-300 hover:scale-[1.02] shrink-0">
                      <Card className="h-full flex flex-col bg-gradient-to-br from-card/90 via-card/85 to-card/80 backdrop-blur-md border-white/30 dark:border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 group">
                        <CardHeader
                          className={`pb-4 rounded-t-lg border-b-2 ${appearance.headerBg} relative overflow-hidden`}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          <CardTitle className="text-sm sm:text-base font-bold flex items-center justify-between gradient-title relative z-10">
                            <span className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                              {column.title}
                            </span>
                            <Badge
                              variant="secondary"
                              className={`ml-2 font-semibold transition-all duration-300 ${appearance.badgeBg} shadow-sm`}
                            >
                              {columnTasks.length}
                            </Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 p-0 bg-gradient-to-b from-transparent via-transparent to-muted/10">
                          <ScrollArea className="h-[calc(100vh-300px)] sm:h-[calc(100vh-270px)] px-3 sm:px-4 pb-4 [&>[data-radix-scroll-area-viewport]]:pr-2">
                            <SortableContext
                              items={taskIds}
                              strategy={verticalListSortingStrategy}
                            >
                              <div className="space-y-3 py-1">
                                {columnTasks.map((task) => (
                                  <TaskCard
                                    key={task.id}
                                    task={task}
                                    epicTitle={task.epicTitle}
                                    status={task.status}
                                    projectId={projectId}
                                    onMentorClick={handleMentorClick}
                                    appearance={appearance}
                                  />
                                ))}
                                {columnTasks.length === 0 && (
                                  <div
                                    className={`
                                  flex h-32 items-center justify-center text-sm text-muted-foreground 
                                  border-2 border-dashed rounded-xl transition-all duration-300 mx-1
                                  hover:border-primary/40 hover:bg-primary/10 backdrop-blur-sm
                                  ${activeTask ? "border-primary/60 bg-primary/15 shadow-md" : "border-muted/50"}
                                `}
                                  >
                                    <span className="flex items-center gap-2">
                                      <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                                      No tasks
                                    </span>
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
          </div>

          <DragOverlay>
            {activeTask ? (
              <div className="transform rotate-2 sm:rotate-3 scale-105 sm:scale-110 transition-transform duration-200">
                <Card
                  className="
                  opacity-98 shadow-2xl border-l-4 border-l-primary 
                  bg-gradient-to-br from-primary/15 via-primary/10 to-secondary/10
                  backdrop-blur-xl border-white/30 dark:border-white/20
                  animate-pulse ring-2 ring-primary/30
                "
                >
                  <CardContent className="p-4 space-y-2">
                    <h3 className="font-bold text-xs sm:text-sm text-primary">
                      {activeTask.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      <span>Dragging...</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        {/* Column Dialog */}
        <Dialog open={isColumnDialogOpen} onOpenChange={setIsColumnDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create a custom column</DialogTitle>
              <DialogDescription>
                Add another workflow stage so your Kanban board matches the way
                you ship software.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="columnName">Column name</Label>
                <Input
                  id="columnName"
                  placeholder="e.g. Code Review"
                  value={newColumnTitle}
                  onChange={(event) => setNewColumnTitle(event.target.value)}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Tip: Keep names action-oriented like “Ready for QA” or “Awaiting
                Demo”.
              </p>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setIsColumnDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddColumn}>Save column</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
