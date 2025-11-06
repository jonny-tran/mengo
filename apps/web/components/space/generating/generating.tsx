"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import {
  Sparkles,
  CheckCircle2,
  Loader2,
  Brain,
  Layers,
  ListChecks,
  Lightbulb,
  Rocket,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { Epic, Hint, Project, Task } from "@/lib/mock-data";
import { database } from "@/lib/mock-data";

interface GeneratingProps {
  open: boolean;
  briefContent?: string;
}

type StepStatus = "pending" | "active" | "completed";

interface TaskHints {
  metacognitive: string;
  conceptual: string;
  keywords: string;
}

interface TaskData {
  id: string;
  title: string;
  description?: string;
  hints?: TaskHints;
}

interface EpicData {
  id: string;
  title: string;
  tasks: TaskData[];
}

interface PlanResponse {
  epics: EpicData[];
}

interface GenerationStep {
  id: string;
  label: string;
  description: string;
  icon: typeof Sparkles;
}

const GENERATION_STEPS: GenerationStep[] = [
  {
    id: "analyze",
    label: "Analyze brief",
    description: "Analyzing your project requirements...",
    icon: Brain,
  },
  {
    id: "epics",
    label: "Create epics",
    description: "Organizing features into epics...",
    icon: Layers,
  },
  {
    id: "tasks",
    label: "Create tasks",
    description: "Breaking down into specific tasks...",
    icon: ListChecks,
  },
  {
    id: "hints",
    label: "Create hints",
    description: "Generating learning hints...",
    icon: Lightbulb,
  },
  {
    id: "finalize",
    label: "Finalize",
    description: "Finalizing the plan...",
    icon: Rocket,
  },
];

const TIPS_POOL = [
  "💡 The plan will be organized into clear epics and tasks",
  "🎯 Each task will have 3 levels of hints: metacognitive, conceptual, keywords",
  "✨ You can edit the plan after it's created",
  "📚 The hints will help you learn more effectively",
  "🚀 You'll be redirected to the board once completed",
];

export function Generating({ open, briefContent }: GeneratingProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [tips, setTips] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const updateProgressForStep = useCallback(
    (stepIndex: number, totalSteps: number) => {
      // Calculate progress based on current step
      const baseProgress = (stepIndex / totalSteps) * 100;
      // Add some incremental progress within the step
      const incrementalProgress = (1 / totalSteps) * 50; // 50% of step progress
      setProgress(Math.min(baseProgress + incrementalProgress, 100));
    },
    []
  );

  const handleGeneratePlan = useCallback(async () => {
    if (!briefContent?.trim()) {
      toast.error("Please provide a project brief");
      return;
    }

    setIsGenerating(true);
    setCurrentStep(0);
    setProgress(0);
    toast.loading("Generating project plan...", { id: "generating" });

    try {
      // Step 1: Analyze brief
      setCurrentStep(0);
      updateProgressForStep(0, GENERATION_STEPS.length);

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          briefContent: briefContent.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to generate plan");
      }

      // Step 2: Create epics
      setCurrentStep(1);
      updateProgressForStep(1, GENERATION_STEPS.length);

      const plan: PlanResponse = await response.json();

      // Generate unique project ID
      const projectId = `proj_${crypto.randomUUID()}`;
      const guestUserId = "guest_user";

      // Ensure guest user exists
      if (!database.getUserById(guestUserId)) {
        database.setUser({
          id: guestUserId,
          name: "Guest User",
          email: "guest@example.com",
          role: "team_lead",
        });
      }

      // Generate project title from first epic or use brief preview
      const projectTitle =
        plan.epics.length > 0
          ? plan.epics[0].title
          : briefContent.trim().slice(0, 50) +
            (briefContent.trim().length > 50 ? "..." : "");

      const project: Project = {
        id: projectId,
        title: projectTitle,
        brief: briefContent.trim(),
        ownerId: guestUserId,
        createdAt: new Date().toISOString(),
      };

      database.setProject(project);

      // Step 3: Create tasks
      setCurrentStep(2);
      updateProgressForStep(2, GENERATION_STEPS.length);

      // Process epics and tasks
      plan.epics.forEach((epicData: EpicData, epicIndex: number) => {
        const epic: Epic = {
          id: epicData.id || `epic_${projectId}_${epicIndex}`,
          projectId,
          title: epicData.title,
          order: epicIndex,
          createdAt: new Date().toISOString(),
        };
        database.setEpic(epic);

        epicData.tasks.forEach((taskData: TaskData, taskIndex: number) => {
          const task: Task = {
            id: taskData.id || `task_${projectId}_${epicIndex}_${taskIndex}`,
            projectId,
            epicId: epic.id,
            title: taskData.title,
            description: taskData.description || "",
            status: "todo",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          database.setTask(task);

          // Process hints from API response
          if (taskData.hints) {
            const hintLevels: Array<
              "metacognitive" | "conceptual" | "keywords"
            > = ["metacognitive", "conceptual", "keywords"];

            hintLevels.forEach((level, hintIndex) => {
              const hintContent = taskData.hints?.[level] || "";
              if (hintContent) {
                const hint: Hint = {
                  id: `hint_${task.id}_${hintIndex}`,
                  taskId: task.id,
                  level,
                  content: hintContent,
                  editableBy: [guestUserId],
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                };
                database.setHint(hint);
              }
            });
          }
        });
      });

      // Step 4: Create hints (already done above, but we update step)
      setCurrentStep(3);
      updateProgressForStep(3, GENERATION_STEPS.length);

      // Save raw plan data to localStorage for backup
      if (typeof window !== "undefined") {
        localStorage.setItem(
          `mengo_project_${projectId}`,
          JSON.stringify({
            plan,
            briefContent: briefContent.trim(),
            createdAt: new Date().toISOString(),
          })
        );
      }

      database.addEvent({
        type: "plan_created",
        projectId,
        userId: guestUserId,
      });

      // Step 5: Finalize
      setCurrentStep(4);
      setProgress(100);

      toast.success("Project plan generated successfully!", {
        id: "generating",
      });

      // Redirect after a short delay to show completion
      setTimeout(() => {
        router.push(`/space/board/${projectId}`);
      }, 500);
    } catch (error) {
      console.error("Error generating plan:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to generate plan. Please try again.";
      toast.error(errorMessage, { id: "generating" });
      setIsGenerating(false);
      setProgress(0);
      setCurrentStep(0);
    }
  }, [briefContent, router, updateProgressForStep]);

  useEffect(() => {
    if (!open) {
      // Reset state when closed - use setTimeout to avoid synchronous setState
      const timeoutId = setTimeout(() => {
        setCurrentStep(0);
        setProgress(0);
        setTips([]);
        setIsGenerating(false);
      }, 0);
      return () => clearTimeout(timeoutId);
    }

    // If briefContent is provided, start generating immediately
    if (open && briefContent?.trim() && !isGenerating) {
      void handleGeneratePlan();
    }

    // Show tips while generating
    if (isGenerating) {
      const tipsInterval = setInterval(() => {
        const randomTip =
          TIPS_POOL[Math.floor(Math.random() * TIPS_POOL.length)];
        setTips((prev) => {
          if (prev.length >= 3) {
            return [randomTip, prev[0], prev[1]];
          }
          return [randomTip, ...prev];
        });
      }, 3000);

      return () => clearInterval(tipsInterval);
    }
  }, [open, briefContent, isGenerating, handleGeneratePlan]);

  const getStepStatus = (index: number): StepStatus => {
    if (index < currentStep) return "completed";
    if (index === currentStep) return "active";
    return "pending";
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Dark backdrop to hide underlying content */}
      <div className="absolute inset-0 bg-background/95 backdrop-blur-sm" />

      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-linear-to-br from-primary/40 via-background/90 to-secondary/40">
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-linear-to-br from-primary/50 via-primary/30 to-secondary/50 animate-pulse" />

        {/* Floating gradient orbs - more visible */}
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: "4s" }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/30 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: "5s", animationDelay: "1s" }}
        />

        {/* Animated mesh pattern - more visible */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.15) 0%, transparent 50%),
              radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.15) 0%, transparent 50%),
              radial-gradient(circle at 40% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)
            `,
            backgroundSize: "100% 100%",
            animation: "pulse 6s ease-in-out infinite",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center p-4 md:p-6">
        <div className="w-full max-w-5xl h-full flex flex-col justify-center space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-4">
              <div className="relative shrink-0">
                {/* Main spinner with glow effect */}
                <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl animate-pulse" />
                <Spinner className="relative h-10 w-10 md:h-12 md:w-12 text-primary" />
                <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-5 w-5 md:h-6 md:w-6 text-primary animate-pulse" />
              </div>
              <div className="text-center min-w-0 flex-1">
                <h1 className="text-4xl md:text-5xl font-extrabold mb-4 gradient-title tracking-tight leading-[1.2] md:leading-[1.15] pb-1 md:pb-1.5 w-full">
                  Creating project plan
                </h1>
                <p className="text-base md:text-lg text-muted-foreground w-full">
                  Please wait a moment...
                </p>
              </div>
            </div>
          </div>

          {/* Progress Section */}
          <div className="space-y-2 bg-card/60 backdrop-blur-sm rounded-xl border border-primary/20 p-4 md:p-5 shadow-xl">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted-foreground font-medium">
                Progress
              </span>
              <span className="font-bold text-primary text-base md:text-lg">
                {Math.round(progress)}%
              </span>
            </div>
            <Progress value={progress} className="h-2.5 md:h-3 shadow-inner" />
          </div>

          {/* Steps Grid */}
          <div className="space-y-2 md:space-y-3">
            <h2 className="text-lg md:text-xl font-semibold text-center text-muted-foreground">
              Steps in progress
            </h2>
            <div className="grid gap-2 md:gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
              {GENERATION_STEPS.map((step, index) => {
                const status = getStepStatus(index);
                const Icon = step.icon;
                const isActive = status === "active";
                const isCompleted = status === "completed";

                return (
                  <div
                    key={step.id}
                    className={cn(
                      "relative group p-3 md:p-4 rounded-lg md:rounded-xl border transition-all duration-500",
                      "backdrop-blur-sm",
                      isActive
                        ? "border-primary/50 bg-primary/10 shadow-lg shadow-primary/20 scale-105"
                        : isCompleted
                          ? "border-primary/30 bg-primary/5 shadow-md"
                          : "border-border/50 bg-muted/30 opacity-60",
                      "hover:border-primary/40 hover:shadow-md transition-all"
                    )}
                  >
                    {/* Glow effect for active step */}
                    {isActive && (
                      <div className="absolute inset-0 bg-primary/10 rounded-lg md:rounded-xl blur-xl animate-pulse" />
                    )}

                    {/* Content */}
                    <div className="relative z-10 space-y-1.5 md:space-y-2">
                      <div className="flex items-center gap-2 md:gap-3">
                        <div className="relative shrink-0">
                          {isCompleted ? (
                            <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                          ) : isActive ? (
                            <>
                              <Loader2 className="h-5 w-5 md:h-6 md:w-6 text-primary animate-spin" />
                              <div className="absolute inset-0 bg-primary/20 rounded-full blur-md animate-pulse" />
                            </>
                          ) : (
                            <div className="h-5 w-5 md:h-6 md:w-6 rounded-full border-2 border-muted-foreground/30" />
                          )}
                        </div>
                        <Icon
                          className={cn(
                            "h-4 w-4 md:h-5 md:w-5 transition-colors shrink-0",
                            isActive || isCompleted
                              ? "text-primary"
                              : "text-muted-foreground"
                          )}
                        />
                      </div>
                      <div>
                        <h3
                          className={cn(
                            "font-semibold text-xs md:text-sm transition-colors line-clamp-1",
                            isActive || isCompleted
                              ? "text-foreground"
                              : "text-muted-foreground"
                          )}
                        >
                          {step.label}
                        </h3>
                        {(isActive || isCompleted) && (
                          <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 md:mt-1 line-clamp-2">
                            {step.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Animated progress bar for active step */}
                    {isActive && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 md:h-1 bg-primary/20 rounded-b-lg md:rounded-b-xl overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full animate-pulse"
                          style={{
                            width: "60%",
                            animation: "shimmer 2s ease-in-out infinite",
                          }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tips Section - Compact */}
          {tips.length > 0 && (
            <div className="bg-card/60 backdrop-blur-sm rounded-xl border border-primary/20 p-3 md:p-4 shadow-xl space-y-2">
              <h3 className="text-sm md:text-base font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 md:h-5 md:w-5 text-primary shrink-0" />
                <span>Helpful tips</span>
              </h3>
              <div className="space-y-1 md:space-y-1.5">
                {tips.slice(0, 2).map((tip, index) => (
                  <div
                    key={index}
                    className="text-xs md:text-sm text-muted-foreground animate-in fade-in slide-in-from-right-4 line-clamp-2"
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    {tip}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Brief Preview - Compact */}
          {briefContent && (
            <div className="bg-card/60 backdrop-blur-sm rounded-xl border border-primary/20 p-3 md:p-4 shadow-xl">
              <p className="text-xs md:text-sm font-semibold text-muted-foreground mb-2">
                Your brief:
              </p>
              <div className="relative">
                <p className="text-xs md:text-sm bg-muted/50 p-2 md:p-3 rounded-lg border border-primary/10 line-clamp-2">
                  {briefContent}
                </p>
                {/* Decorative corner */}
                <div className="absolute top-0 right-0 w-6 h-6 md:w-8 md:h-8 border-t border-r border-primary/20 rounded-tr-lg" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
