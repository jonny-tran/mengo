"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { database } from "@/lib/mock-data";
import type { Task, Hint, Comment, User } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  ArrowLeft,
  Edit2,
  Save,
  X,
  CheckCircle2,
  Circle,
  Clock,
  User as UserIcon,
  FileText,
  Lightbulb,
  MessageSquare,
  Sparkles,
  BookOpen,
  Hash,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function TaskPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = params.taskId as string;

  const [task, setTask] = useState<Task | null>(null);
  const [hints, setHints] = useState<Hint[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [editContent, setEditContent] = useState("");
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notFound, setNotFound] = useState<boolean>(false);
  const [originalBrief, setOriginalBrief] = useState<string>("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingHintId, setEditingHintId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Load all data first
    const taskData = database.getTaskById(taskId);
    const taskHints = database.getHintsByTaskId(taskId);
    const taskComments = database.getCommentsByTaskId(taskId);
    const allUsers = Object.values(database.users);

    // Use setTimeout to defer state updates and avoid cascading renders
    setTimeout(() => {
      if (!taskData) {
        setNotFound(true);
        toast.error("Task does not exist");
        return;
      }

      setTask(taskData);
      setHints(taskHints);
      setComments(taskComments);
      setUsers(allUsers);

      // Load original brief from localStorage
      const briefKey = `mengo_brief_${taskData.projectId}`;
      const storedBrief = localStorage.getItem(briefKey);
      if (storedBrief) {
        setOriginalBrief(storedBrief);
      } else {
        // Fallback: try to get from project data
        const projectKey = `mengo_project_${taskData.projectId}`;
        const projectData = localStorage.getItem(projectKey);
        if (projectData) {
          try {
            const parsed = JSON.parse(projectData);
            if (parsed.briefContent) {
              setOriginalBrief(parsed.briefContent);
            }
          } catch (e) {
            console.error("Error parsing project data:", e);
          }
        }
      }

      // Track hint viewed
      database.addEvent({
        type: "hint_viewed",
        taskId,
      });
    }, 0);
  }, [taskId, router]);

  const handleHintEdit = (hintId: string) => {
    const hint = hints.find((h) => h.id === hintId);
    if (hint) {
      setEditingHintId(hintId);
      setEditContent(hint.content);
      setIsEditDialogOpen(true);
    }
  };

  const handleHintSave = (hintId: string) => {
    database.updateHint(hintId, { content: editContent });
    const updatedHints = database.getHintsByTaskId(taskId);
    setHints(updatedHints);
    setEditingHintId(null);
    setEditContent("");
    setIsEditDialogOpen(false);
    toast.success("Hint has been updated");
  };

  const handleHintCancel = () => {
    setEditingHintId(null);
    setEditContent("");
    setIsEditDialogOpen(false);
  };

  const handleStatusChange = (newStatus: "todo" | "progress" | "done") => {
    if (!task) return;

    const updatedTask = {
      ...task,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };
    database.setTask(updatedTask);
    setTask(updatedTask);

    if (newStatus === "done") {
      database.addEvent({
        type: "task_completed",
        projectId: task.projectId,
        taskId,
      });
      toast.success("Task completed!");
    }
  };

  const handleAssign = (userId: string | null) => {
    if (!task) return;

    const updatedTask = {
      ...task,
      assigneeId: userId || undefined,
      updatedAt: new Date().toISOString(),
    };
    database.setTask(updatedTask);
    setTask(updatedTask);

    if (userId) {
      database.addEvent({
        type: "task_assigned",
        projectId: task.projectId,
        taskId,
        userId,
      });
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !task) return;

    setIsSubmitting(true);
    const guestUserId = "guest_user";

    const comment: Comment = {
      id: `comment_${Date.now()}`,
      taskId,
      userId: guestUserId,
      content: newComment.trim(),
      createdAt: new Date().toISOString(),
    };

    database.setComment(comment);
    const updatedComments = database.getCommentsByTaskId(taskId);
    setComments(updatedComments);
    setNewComment("");
    setIsSubmitting(false);
    toast.success("Comment has been added");
  };

  const getAssigneeName = (userId?: string) => {
    if (!userId) return null;
    const user = users.find((u) => u.id === userId);
    return user?.name || "Unknown";
  };

  const getCommentAuthorName = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    return user?.name || "Guest";
  };

  const hintLevelLabels: Record<string, string> = {
    metacognitive: "Metacognitive",
    conceptual: "Conceptual",
    keywords: "Keywords",
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "done":
        return <CheckCircle2 className="h-4 w-4" />;
      case "progress":
        return <Clock className="h-4 w-4" />;
      default:
        return <Circle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "done":
        return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20";
      case "progress":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20";
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20";
    }
  };

  const getHintIcon = (level: string) => {
    switch (level) {
      case "metacognitive":
        return <Sparkles className="h-4 w-4" />;
      case "conceptual":
        return <BookOpen className="h-4 w-4" />;
      case "keywords":
        return <Hash className="h-4 w-4" />;
      default:
        return <Lightbulb className="h-4 w-4" />;
    }
  };

  if (!task) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
        <div className="mx-auto max-w-4xl">
          {!notFound ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading task...</p>
            </div>
          ) : (
            <Card className="border-destructive/20">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                    <AlertCircle className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <CardTitle>Task does not exist</CardTitle>
                    <CardDescription>
                      Task does not exist or data is empty.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.back()}
                    className="gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Go back
                  </Button>
                  <Button
                    size="sm"
                    onClick={async () => {
                      try {
                        await fetch("/api/debug/seed", { method: "POST" });
                        toast.success("Demo data seeded. Reloading...");
                        location.reload();
                      } catch {
                        toast.error("Failed to seed data");
                      }
                    }}
                    className="gap-2"
                  >
                    <Sparkles className="h-4 w-4" />
                    Seed demo data
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header with Back Button */}
        <div className="mb-6 flex items-center gap-4">
          <Link href={`/space/board/${task.projectId}`}>
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Board
            </Button>
          </Link>
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Column */}
          <div className="space-y-6 lg:col-span-2">
            {/* Task Card */}
            <Card className="border-2 shadow-lg transition-shadow hover:shadow-xl">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <CardTitle className="text-2xl font-bold leading-tight">
                      {task.title}
                    </CardTitle>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        className={`flex items-center gap-1.5 border px-3 py-1 ${getStatusColor(task.status)}`}
                      >
                        {getStatusIcon(task.status)}
                        <span className="capitalize">{task.status}</span>
                      </Badge>
                      {task.assigneeId && (
                        <Badge
                          variant="outline"
                          className="flex items-center gap-1.5 px-3 py-1"
                        >
                          <UserIcon className="h-3.5 w-3.5" />
                          <span>{getAssigneeName(task.assigneeId)}</span>
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {task.description && (
                  <div className="space-y-2 rounded-lg bg-muted/50 p-4">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <h3 className="font-semibold text-sm">Description</h3>
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {task.description}
                    </p>
                  </div>
                )}

                <Separator />

                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Status:</span>
                  </div>
                  <Select
                    value={task.status}
                    onValueChange={handleStatusChange}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">
                        <div className="flex items-center gap-2">
                          <Circle className="h-3 w-3" />
                          To Do
                        </div>
                      </SelectItem>
                      <SelectItem value="progress">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          In Progress
                        </div>
                      </SelectItem>
                      <SelectItem value="done">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-3 w-3" />
                          Done
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Assign to:</span>
                  </div>
                  <Select
                    value={task.assigneeId || "unassigned"}
                    onValueChange={(value) =>
                      handleAssign(value === "unassigned" ? null : value)
                    }
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue>
                        {task.assigneeId
                          ? getAssigneeName(task.assigneeId)
                          : "Unassigned..."}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-5 w-5">
                              <AvatarFallback className="text-xs">
                                {user.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span>{user.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Comments */}
            <Card className="border-2 shadow-lg transition-shadow hover:shadow-xl">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Comments</CardTitle>
                    <CardDescription className="mt-1">
                      Discuss and collaborate on this task
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3 rounded-lg border-2 bg-muted/30 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Add new comment</span>
                  </div>
                  <Textarea
                    placeholder="Write your comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-24 resize-none"
                    disabled={isSubmitting}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                        handleAddComment();
                      }
                    }}
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      Press Ctrl/Cmd + Enter to submit
                    </p>
                    <Button
                      onClick={handleAddComment}
                      disabled={!newComment.trim() || isSubmitting}
                      size="sm"
                      className="gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <MessageSquare className="h-3.5 w-3.5" />
                          Post comment
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  {comments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <MessageSquare className="h-12 w-12 text-muted-foreground/50 mb-3" />
                      <p className="text-sm font-medium text-muted-foreground">
                        No comments yet
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Be the first to comment!
                      </p>
                    </div>
                  ) : (
                    comments.map((comment, index) => (
                      <div key={comment.id}>
                        <div className="group flex gap-3 rounded-lg border-2 border-border bg-card p-4 transition-all hover:border-primary/20 hover:shadow-sm">
                          <Avatar className="h-9 w-9 shrink-0">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                              {getCommentAuthorName(comment.userId)
                                .charAt(0)
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm">
                                {getCommentAuthorName(comment.userId)}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(comment.createdAt).toLocaleString(
                                  "en-US",
                                  {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </span>
                            </div>
                            <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                              {comment.content}
                            </p>
                          </div>
                        </div>
                        {index < comments.length - 1 && (
                          <Separator className="my-4" />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Column */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Original Project Brief */}
              <Card className="border-2 shadow-lg">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        Original Project Brief
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Context for this task
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {originalBrief ? (
                    <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                      <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                        {originalBrief}
                      </p>
                    </ScrollArea>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No brief available
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* 3-Level Hints */}
              <Card className="border-2 shadow-lg">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Lightbulb className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        Hints (Editable)
                      </CardTitle>
                      <CardDescription className="mt-1">
                        3-level hint system
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {hints.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Lightbulb className="h-10 w-10 text-muted-foreground/50 mb-2" />
                      <p className="text-xs font-medium text-muted-foreground">
                        No hints available
                      </p>
                    </div>
                  ) : (
                    <Accordion type="single" collapsible className="w-full">
                      {hints.map((hint, index) => (
                        <AccordionItem key={hint.id} value={hint.id}>
                          <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center gap-2.5 flex-1">
                              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary shrink-0">
                                {getHintIcon(hint.level)}
                              </div>
                              <div className="text-left">
                                <p className="font-semibold text-sm">
                                  {hintLevelLabels[hint.level] || hint.level}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Level {index + 1}
                                </p>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-3 pt-2">
                              <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap pl-9">
                                {hint.content}
                              </p>
                              <Dialog
                                open={
                                  isEditDialogOpen && editingHintId === hint.id
                                }
                                onOpenChange={(open) => {
                                  if (!open) {
                                    handleHintCancel();
                                  } else {
                                    setIsEditDialogOpen(true);
                                  }
                                }}
                              >
                                <DialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleHintEdit(hint.id)}
                                    className="gap-1.5 w-full"
                                  >
                                    <Edit2 className="h-3.5 w-3.5" />
                                    Edit
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2">
                                      <Lightbulb className="h-5 w-5 text-primary" />
                                      Edit{" "}
                                      {hintLevelLabels[hint.level] ||
                                        hint.level}{" "}
                                      Hint
                                    </DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4 py-4">
                                    <Textarea
                                      value={editContent}
                                      onChange={(e) =>
                                        setEditContent(e.target.value)
                                      }
                                      className="min-h-32 text-sm"
                                      placeholder="Enter hint content..."
                                    />
                                    <div className="flex gap-2 justify-end">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleHintCancel}
                                        className="gap-1.5"
                                      >
                                        <X className="h-3.5 w-3.5" />
                                        Cancel
                                      </Button>
                                      <Button
                                        size="sm"
                                        onClick={() => handleHintSave(hint.id)}
                                        className="gap-1.5"
                                      >
                                        <Save className="h-3.5 w-3.5" />
                                        Save
                                      </Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
