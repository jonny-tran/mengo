"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { database } from "@/lib/mock-data";
import type { Team, Task, Project } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { AlertCircle, Upload, Plus } from "lucide-react";
import Link from "next/link";

interface StuckTeam {
  team: Team;
  stuckTasks: Array<{
    task: Task;
    project: Project;
    daysOld: number;
  }>;
  completedTasks: number;
  totalTasks: number;
  lastActivity?: Date;
}

interface ProjectProgress {
  project: Project;
  teamName: string;
  completedTasks: number;
  totalTasks: number;
  status: "On Track" | "Stuck";
}

interface ProjectSummary {
  project: Project;
  totalTeams: number;
  averageProgress: number;
}

interface StudentData {
  name: string;
  email: string;
  assignedTeam: string;
}

export default function InstructorDashboard() {
  const router = useRouter();
  const [stuckTeams, setStuckTeams] = useState<StuckTeam[]>([]);
  const [projectProgress, setProjectProgress] = useState<ProjectProgress[]>([]);
  const [projectSummaries, setProjectSummaries] = useState<ProjectSummary[]>(
    []
  );
  const [students, setStudents] = useState<StudentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if admin mode is enabled
    const isAdmin = localStorage.getItem("mengo_admin") === "true";
    if (!isAdmin) {
      toast.error("Instructor access required");
      router.push("/space/guest");
      return;
    }

    loadData();
  }, [router]);

  const loadData = () => {
    const allTeams = Object.values(database.teams);

    // Calculate stuck teams and project progress
    const stuck: StuckTeam[] = [];
    const progress: ProjectProgress[] = [];
    const now = new Date();
    const stuckThresholdDays = 3;

    allTeams.forEach((team) => {
      // Get all tasks for projects owned by team members
      const allTasks = Object.values(database.tasks);
      const teamTasks = allTasks.filter((task) => {
        const project = database.getProjectById(task.projectId);
        if (!project) return false;

        // Check if project belongs to team members
        const teamMemberEmails = team.memberEmails;
        const projectOwner = database.getUserById(project.ownerId);
        return projectOwner && teamMemberEmails.includes(projectOwner.email);
      });

      const stuckTasksForTeam: StuckTeam["stuckTasks"] = [];
      let completedTasks = 0;
      const totalTasks = teamTasks.length;
      let lastActivity: Date | undefined;

      teamTasks.forEach((task) => {
        const taskDate = new Date(task.createdAt);
        const daysOld = Math.floor(
          (now.getTime() - taskDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        const comments = database.getCommentsByTaskId(task.id);
        const updateDate = new Date(task.updatedAt);

        if (task.status === "done") {
          completedTasks++;
        }

        if (!lastActivity || updateDate > lastActivity) {
          lastActivity = updateDate;
        }

        // Stuck if: age > threshold AND no comments AND status is not done
        if (
          daysOld > stuckThresholdDays &&
          comments.length === 0 &&
          task.status !== "done"
        ) {
          const project = database.getProjectById(task.projectId);
          if (project) {
            stuckTasksForTeam.push({
              task,
              project,
              daysOld,
            });
          }
        }
      });

      // Check if team is stuck (0 tasks completed OR no activity in 3+ days)
      const daysSinceActivity = lastActivity
        ? Math.floor(
            (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
          )
        : 999;

      if (completedTasks === 0 || daysSinceActivity >= stuckThresholdDays) {
        stuck.push({
          team,
          stuckTasks: stuckTasksForTeam,
          completedTasks,
          totalTasks,
          lastActivity,
        });
      }

      // Add project progress data
      const projectsByTeam = new Map<
        string,
        { project: Project; tasks: Task[] }
      >();
      teamTasks.forEach((task) => {
        const project = database.getProjectById(task.projectId);
        if (project) {
          const existing = projectsByTeam.get(project.id);
          if (existing) {
            existing.tasks.push(task);
          } else {
            projectsByTeam.set(project.id, { project, tasks: [task] });
          }
        }
      });

      projectsByTeam.forEach(({ project, tasks }) => {
        const projectCompleted = tasks.filter(
          (t) => t.status === "done"
        ).length;
        const projectTotal = tasks.length;
        const projectStatus =
          projectCompleted === 0 || daysSinceActivity >= stuckThresholdDays
            ? "Stuck"
            : "On Track";

        progress.push({
          project,
          teamName: team.name,
          completedTasks: projectCompleted,
          totalTasks: projectTotal,
          status: projectStatus,
        });
      });
    });

    setStuckTeams(stuck);
    setProjectProgress(progress);

    // Calculate project summaries
    const projectMap = new Map<string, ProjectSummary>();
    progress.forEach((p) => {
      const existing = projectMap.get(p.project.id);
      if (existing) {
        existing.totalTeams++;
        existing.averageProgress =
          (existing.averageProgress * (existing.totalTeams - 1) +
            (p.completedTasks / p.totalTasks) * 100) /
          existing.totalTeams;
      } else {
        projectMap.set(p.project.id, {
          project: p.project,
          totalTeams: 1,
          averageProgress: (p.completedTasks / p.totalTasks) * 100,
        });
      }
    });
    setProjectSummaries(Array.from(projectMap.values()));

    // Generate student data from teams
    const studentList: StudentData[] = [];
    allTeams.forEach((team) => {
      team.memberEmails.forEach((email) => {
        const user = Object.values(database.users).find(
          (u) => u.email === email
        );
        studentList.push({
          name: user?.name || email.split("@")[0],
          email,
          assignedTeam: team.name,
        });
      });
    });
    setStudents(studentList);

    setIsLoading(false);
  };

  const handleImportCSV = () => {
    toast.info("CSV import feature coming soon");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="mx-auto max-w-7xl">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Instructor Dashboard</h1>
          <p className="text-muted-foreground">
            Triage center to monitor teams and projects
          </p>
        </div>

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab - Triage Center */}
          <TabsContent value="dashboard" className="space-y-6 mt-6">
            {/* Stuck Teams Alert */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  Stuck Teams Alert ({stuckTeams.length})
                </CardTitle>
                <CardDescription>
                  Teams with 0 tasks completed or no activity in 3+ days
                </CardDescription>
              </CardHeader>
              <CardContent>
                {stuckTeams.length > 0 ? (
                  <div className="space-y-4">
                    {stuckTeams.map((stuckTeam) => {
                      // Find a project for this team to link to
                      const teamProject = projectProgress.find(
                        (p) => p.teamName === stuckTeam.team.name
                      )?.project;
                      const boardLink = teamProject
                        ? `/space/board/${teamProject.id}`
                        : "#";

                      return (
                        <Card
                          key={stuckTeam.team.id}
                          className="border-destructive/20"
                        >
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center justify-between">
                              <span>{stuckTeam.team.name}</span>
                              <Link href={boardLink}>
                                <Button variant="outline" size="sm">
                                  View Board
                                </Button>
                              </Link>
                            </CardTitle>
                            <CardDescription>
                              Instructor: {stuckTeam.team.instructorEmail}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <div className="flex items-center gap-4 text-sm">
                                <span className="text-muted-foreground">
                                  Tasks: {stuckTeam.completedTasks}/
                                  {stuckTeam.totalTasks} completed
                                </span>
                                {stuckTeam.lastActivity && (
                                  <span className="text-muted-foreground">
                                    Last activity:{" "}
                                    {Math.floor(
                                      (new Date().getTime() -
                                        stuckTeam.lastActivity.getTime()) /
                                        (1000 * 60 * 60 * 24)
                                    )}{" "}
                                    days ago
                                  </span>
                                )}
                              </div>
                              {stuckTeam.stuckTasks.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-sm font-medium mb-2">
                                    {stuckTeam.stuckTasks.length} stuck task(s):
                                  </p>
                                  {stuckTeam.stuckTasks
                                    .slice(0, 3)
                                    .map(({ task, project, daysOld }) => (
                                      <div
                                        key={task.id}
                                        className="flex items-center justify-between rounded-md border p-2 mb-2"
                                      >
                                        <div className="flex-1">
                                          <Link
                                            href={`/space/task/${task.id}`}
                                            className="font-medium hover:underline text-sm"
                                          >
                                            {task.title}
                                          </Link>
                                          <p className="text-xs text-muted-foreground">
                                            {project.title} • {daysOld} days old
                                          </p>
                                        </div>
                                        <Badge variant="destructive">
                                          {task.status}
                                        </Badge>
                                      </div>
                                    ))}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No stuck teams found. All teams are making progress! 🎉
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Overall Project Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Overall Project Progress</CardTitle>
                <CardDescription>
                  Overall progress of all projects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project Name</TableHead>
                      <TableHead>Team Name</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projectProgress.length > 0 ? (
                      projectProgress.map((p) => (
                        <TableRow key={`${p.project.id}-${p.teamName}`}>
                          <TableCell className="font-medium">
                            <Link
                              href={`/space/board/${p.project.id}`}
                              className="hover:underline"
                            >
                              {p.project.title}
                            </Link>
                          </TableCell>
                          <TableCell>{p.teamName}</TableCell>
                          <TableCell>
                            {p.completedTasks}/{p.totalTasks} Tasks
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                p.status === "On Track"
                                  ? "outline"
                                  : "destructive"
                              }
                            >
                              {p.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="text-center text-muted-foreground"
                        >
                          No projects found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6 mt-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Projects</h2>
                <p className="text-muted-foreground">
                  Manage all active projects
                </p>
              </div>
              <Link href="/space">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Project
                </Button>
              </Link>
            </div>

            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project Name</TableHead>
                      <TableHead>Total Teams</TableHead>
                      <TableHead>Average Progress</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projectSummaries.length > 0 ? (
                      projectSummaries.map((summary) => (
                        <TableRow key={summary.project.id}>
                          <TableCell className="font-medium">
                            <Link
                              href={`/instructor/dashboard/project/${summary.project.id}`}
                              className="hover:underline"
                            >
                              {summary.project.title}
                            </Link>
                          </TableCell>
                          <TableCell>{summary.totalTeams}</TableCell>
                          <TableCell>
                            {summary.averageProgress.toFixed(1)}%
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className="text-center text-muted-foreground"
                        >
                          No projects found. Create a new project to get
                          started.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-6 mt-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Students</h2>
                <p className="text-muted-foreground">
                  Manage student list and team assignments
                </p>
              </div>
              <Button onClick={handleImportCSV}>
                <Upload className="h-4 w-4 mr-2" />
                Import Student Roster (CSV)
              </Button>
            </div>

            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Assigned Team</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.length > 0 ? (
                      students.map((student, index) => (
                        <TableRow key={`${student.email}-${index}`}>
                          <TableCell className="font-medium">
                            {student.name}
                          </TableCell>
                          <TableCell>{student.email}</TableCell>
                          <TableCell>{student.assignedTeam}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className="text-center text-muted-foreground"
                        >
                          No students found. Import a CSV roster to get started.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
