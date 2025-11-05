"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { database } from "@/lib/mock-data";
import type { Project, Epic, Task, Hint } from "@/lib/mock-data";
import Link from "next/link";
import { BreadcrumbSetter } from "@/components/space/dashboard/breadcrumb-context";

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
  const [brief, setBrief] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

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
    if (!brief.trim()) {
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
          brief: brief.trim(),
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
        brief: brief.trim(),
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
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-4xl">
        <BreadcrumbSetter items={[{ label: "Workspace", href: "/space" }]} />
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">Mengo</h1>
          <p className="text-muted-foreground">
            Transform project briefs into plans with AI-generated epics, tasks
            and hints
          </p>
        </div>

        <Card>
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
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              className="min-h-32"
              disabled={isGenerating}
            />

            <div className="flex gap-2">
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !brief.trim()}
                className="flex-1"
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
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-base">{project.title}</CardTitle>
                    <CardDescription>
                      {project.brief.substring(0, 100)}...
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
