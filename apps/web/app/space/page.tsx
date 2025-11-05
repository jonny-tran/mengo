"use client";

import { BreadcrumbSetter } from "@/components/space/dashboard/breadcrumb-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Epic, Hint, Project, Task } from "@/lib/mock-data";
import { database } from "@/lib/mock-data";
import { ALL_PROMPT_TEMPLATES } from "@/lib/prompt-templates";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ShoppingCart,
  BookOpen,
  PenSquare,
  Sparkles,
  Blocks,
  Layout,
  NotebookPen,
} from "lucide-react";

interface HintData {
  level?: "metacognitive" | "conceptual" | "keywords";
  content: string;
}

interface TaskData {
  title: string;
  description?: string;
  hints?: HintData[];
}

interface EpicData {
  title: string;
  tasks: TaskData[];
}

interface PlanResponse {
  project_title: string;
  epics: EpicData[];
}

export default function AppDashboardPage() {
  const router = useRouter();
  const [briefContent, setBriefContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [templateOpen, setTemplateOpen] = useState(false);

  // No hard limit for brief length

  const handleTextareaKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (
      (e.ctrlKey || e.metaKey) &&
      e.key === "Enter" &&
      !isGenerating &&
      briefContent.trim()
    ) {
      e.preventDefault();
      void handleGenerate();
    }
  };

  // Hotkey: Alt + T (and fallback Ctrl + /) to open template palette
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isAltT =
        e.altKey && (e.key.toLowerCase() === "t" || e.code === "KeyT");
      const isCtrlSlash = e.ctrlKey && (e.key === "/" || e.code === "Slash");
      if (isAltT || isCtrlSlash) {
        e.preventDefault();
        setTemplateOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Group templates by category for palette
  const templatesByCategory = useMemo(() => {
    const map = new Map<string, typeof ALL_PROMPT_TEMPLATES>();
    ALL_PROMPT_TEMPLATES.forEach((t) => {
      const list = map.get(t.category) ?? [];
      list.push(t);
      map.set(t.category, list);
    });
    return map;
  }, []);

  const categoryIcon = (cat: string) => {
    const lower = cat.toLowerCase();
    if (lower.includes("mini-app")) return Blocks;
    if (lower.includes("frontend")) return Layout;
    if (lower.includes("fullstack")) return NotebookPen;
    return Sparkles;
  };

  const formatRelativeTime = (iso: string) => {
    const diffMs = Date.now() - new Date(iso).getTime();
    const sec = Math.floor(diffMs / 1000);
    const min = Math.floor(sec / 60);
    const hr = Math.floor(min / 60);
    const day = Math.floor(hr / 24);
    if (day > 0) return `${day}d ago`;
    if (hr > 0) return `${hr}h ago`;
    if (min > 0) return `${min}m ago`;
    return "just now";
  };

  const ProjectBadgeIcon = ({ title }: { title: string }) => {
    const lower = title.toLowerCase();
    const Icon = /e-?commerce|shop|mug/.test(lower)
      ? ShoppingCart
      : /study|planner|learn/.test(lower)
        ? BookOpen
        : /blog|write|editor/.test(lower)
          ? PenSquare
          : Sparkles;
    return (
      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-primary">
        <Icon size={12} />
      </span>
    );
  };

  // Mock lịch sử projects của người dùng (tạm thời hard-code tại đây)
  const recentProjects: Array<
    Pick<Project, "id" | "title" | "brief" | "createdAt">
  > = [
    {
      id: "proj_demo_1",
      title: "E-commerce Mugs",
      brief: "Build a mini e-commerce for mugs with cart and checkout",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    },
    {
      id: "proj_demo_2",
      title: "Study Planner",
      brief: "Create a study planner with tasks, hints and progress tracking",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    },
    {
      id: "proj_demo_3",
      title: "Blog Platform",
      brief: "Simple blog with editor, tags, and public sharing",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
    },
  ];

  const handleGenerate = async () => {
    if (!briefContent.trim()) {
      toast.error("Please enter a project brief");
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch("/api/llm/generate?latency=800", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          brief: briefContent.trim(),
          template: "default",
          simulate_success: true,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate plan");
      }

      const plan: PlanResponse = await response.json();

      const projectId = `proj_${Date.now()}`;
      const guestUserId = "guest_user";

      if (!database.getUserById(guestUserId)) {
        database.setUser({
          id: guestUserId,
          name: "Guest User",
          email: "guest@example.com",
          role: "team_lead",
        });
      }

      const project: Project = {
        id: projectId,
        title: plan.project_title,
        brief: briefContent.trim(),
        ownerId: guestUserId,
        createdAt: new Date().toISOString(),
      };

      database.setProject(project);

      let taskOrder = 0;
      plan.epics.forEach((epicData: EpicData, epicIndex: number) => {
        const epic: Epic = {
          id: `epic_${projectId}_${epicIndex}`,
          projectId,
          title: epicData.title,
          order: epicIndex,
          createdAt: new Date().toISOString(),
        };
        database.setEpic(epic);

        epicData.tasks.forEach((taskData: TaskData) => {
          const task: Task = {
            id: `task_${projectId}_${taskOrder}`,
            projectId,
            epicId: epic.id,
            title: taskData.title,
            description: taskData.description || "",
            status: "todo",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          database.setTask(task);

          const hintLevels: Array<"metacognitive" | "conceptual" | "keywords"> =
            ["metacognitive", "conceptual", "keywords"];

          (taskData.hints || []).forEach(
            (hintData: HintData, hintIndex: number) => {
              const level = hintLevels[hintIndex] || hintData.level;
              const hint: Hint = {
                id: `hint_${task.id}_${hintIndex}`,
                taskId: task.id,
                level,
                content: hintData.content || "",
                editableBy: [guestUserId],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };
              database.setHint(hint);
            }
          );

          if (!taskData.hints || taskData.hints.length === 0) {
            hintLevels.forEach((level, hintIndex) => {
              const hint: Hint = {
                id: `hint_${task.id}_${hintIndex}`,
                taskId: task.id,
                level,
                content: `Default ${level} hint for ${taskData.title}`,
                editableBy: [guestUserId],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };
              database.setHint(hint);
            });
          }

          taskOrder++;
        });
      });

      database.addEvent({
        type: "plan_created",
        projectId,
        userId: guestUserId,
      });

      toast.success("Plan created successfully!");
      router.push(`/space/board/${projectId}`);
    } catch (error) {
      console.error("Error generating plan:", error);
      toast.error("Unable to create plan. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background page-gradient-bg p-4 md:p-8">
      <div className="mx-auto max-w-4xl">
        <BreadcrumbSetter items={[{ label: "Workspace", href: "/space" }]} />
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 gradient-title tracking-tight leading-[1.2] md:leading-[1.15] pb-1 md:pb-1.5">
            Task by Task
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Turn vague ideas into clear, actionable plans with organized epics,
            detailed tasks, and helpful hints.
          </p>
        </div>

        {/* Premium Card with mesh gradient, soft shadow, and border */}
        <Card className="mesh-gradient-bg shadow-2xl border border-primary/20 rounded-2xl transition-all duration-200">
          <CardHeader>
            <CardTitle>Paste Project Brief</CardTitle>
            <CardDescription>
              Enter your project brief and let Mengo create a plan with epics,
              tasks and 3-level hints
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Example: Build a mini e-commerce platform to sell mugs with cart and checkout..."
              value={briefContent}
              onChange={(e) => setBriefContent(e.target.value)}
              onKeyDown={handleTextareaKeyDown}
              className="min-h-32 focus-visible:ring-2 focus-visible:ring-primary/40"
              disabled={isGenerating}
              aria-label="Project brief input"
            />
            <div className="flex items-center justify-start text-xs text-muted-foreground">
              <span>Tip: Press Ctrl/⌘ + Enter to generate</span>
            </div>

            {/* Command Palette */}
            <CommandDialog open={templateOpen} onOpenChange={setTemplateOpen}>
              <div className="px-3 pt-3 pb-2">
                <div className="text-base font-semibold flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" /> Choose a
                  template
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Search by name or browse categories. Press Enter to insert.
                </p>
              </div>
              <CommandInput placeholder="Search templates..." />
              <CommandList>
                <CommandEmpty>No templates found.</CommandEmpty>
                {Array.from(templatesByCategory.entries()).map(
                  ([cat, items], idx) => {
                    const Icon = categoryIcon(cat);
                    return (
                      <div key={cat}>
                        {idx > 0 && <CommandSeparator />}
                        <CommandGroup heading={cat}>
                          {items.map((t) => (
                            <CommandItem
                              key={t.title}
                              value={`${cat} ${t.title}`}
                              onSelect={() => {
                                setBriefContent(t.prompt);
                                setTemplateOpen(false);
                              }}
                              className="items-start gap-3"
                            >
                              <Icon className="mt-0.5 h-4 w-4 text-primary" />
                              <div className="flex flex-col gap-1">
                                <span className="text-sm font-medium">
                                  {t.title}
                                </span>
                                <span className="text-xs text-muted-foreground line-clamp-2">
                                  {t.content}
                                </span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </div>
                    );
                  }
                )}
              </CommandList>
              <div className="px-3 py-2 border-t text-[11px] text-muted-foreground flex items-center gap-2">
                <span>Tip:</span>
                <kbd className="rounded border bg-muted px-1.5 py-0.5">Alt</kbd>
                <span>+</span>
                <kbd className="rounded border bg-muted px-1.5 py-0.5">T</kbd>
                <span>or</span>
                <kbd className="rounded border bg-muted px-1.5 py-0.5">
                  Ctrl
                </kbd>
                <span>+</span>
                <kbd className="rounded border bg-muted px-1.5 py-0.5">/</kbd>
                <span>to open quickly</span>
              </div>
            </CommandDialog>

            <div className="flex gap-2 items-center">
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !briefContent.trim()}
                className="flex-1"
                aria-label="Generate plan"
              >
                {isGenerating ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Creating plan...
                  </>
                ) : (
                  "Generate Plan"
                )}
              </Button>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setTemplateOpen(true)}
                      aria-label="Open template picker"
                      className="shrink-0"
                    >
                      <Sparkles size={16} className="mr-2" /> Use template
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Press Alt + T (or Ctrl + /)</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {isGenerating && (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Your recent projects</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recentProjects.map((project) => (
              <Link key={project.id} href={`/space/board/${project.id}`}>
                <Card className="cursor-pointer transition-all duration-200 hover:-translate-y-0.5 border border-primary/20 bg-linear-to-br from-primary/10 to-secondary/10 hover:from-primary/20 hover:to-secondary/20 gradient-border">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center justify-between">
                      <span className="flex items-center gap-2 min-w-0">
                        <ProjectBadgeIcon title={project.title} />
                        <span className="line-clamp-1 gradient-title">
                          {project.title}
                        </span>
                      </span>
                      <span className="text-xs text-muted-foreground font-normal">
                        {formatRelativeTime(project.createdAt)}
                      </span>
                    </CardTitle>
                    <CardDescription className="line-clamp-3">
                      {project.brief}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
            {recentProjects.length === 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    No recent projects
                  </CardTitle>
                  <CardDescription>
                    Start by pasting a brief above to generate your first plan.
                  </CardDescription>
                </CardHeader>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
