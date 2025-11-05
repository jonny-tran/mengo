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
import { ArrowLeft, Edit2, Save, X } from "lucide-react";
import Link from "next/link";

export default function TaskPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = params.taskId as string;

  const [task, setTask] = useState<Task | null>(null);
  const [hints, setHints] = useState<Hint[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [editingHint, setEditingHint] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Load all data first
    const taskData = database.getTaskById(taskId);
    if (!taskData) {
      toast.error("Task does not exist");
      router.push("/space");
      return;
    }

    const taskHints = database.getHintsByTaskId(taskId);
    const taskComments = database.getCommentsByTaskId(taskId);
    const allUsers = Object.values(database.users);

    // Use setTimeout to defer state updates and avoid cascading renders
    setTimeout(() => {
      setTask(taskData);
      setHints(taskHints);
      setComments(taskComments);
      setUsers(allUsers);
    }, 0);

    // Track hint viewed
    database.addEvent({
      type: "hint_viewed",
      taskId,
    });
  }, [taskId, router]);

  const handleHintEdit = (hintId: string) => {
    const hint = hints.find((h) => h.id === hintId);
    if (hint) {
      setEditingHint(hintId);
      setEditContent(hint.content);
    }
  };

  const handleHintSave = (hintId: string) => {
    database.updateHint(hintId, { content: editContent });
    const updatedHints = database.getHintsByTaskId(taskId);
    setHints(updatedHints);
    setEditingHint(null);
    setEditContent("");
    toast.success("Hint has been updated");
  };

  const handleHintCancel = () => {
    setEditingHint(null);
    setEditContent("");
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

  if (!task) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="mx-auto max-w-4xl">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Link href={`/space/board/${task.projectId}`}>
            <Button variant="outline">Back to Board</Button>
          </Link>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="mb-2">{task.title}</CardTitle>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant={
                      task.status === "done"
                        ? "default"
                        : task.status === "progress"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {task.status}
                  </Badge>
                  {task.assigneeId && (
                    <Badge variant="outline">
                      Assigned to: {getAssigneeName(task.assigneeId)}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {task.description && (
              <div>
                <h3 className="mb-2 font-semibold">Description</h3>
                <p className="text-sm text-muted-foreground">
                  {task.description}
                </p>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <Select value={task.status} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="progress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={task.assigneeId || "unassigned"}
                onValueChange={(value) =>
                  handleAssign(value === "unassigned" ? null : value)
                }
              >
                <SelectTrigger className="w-48">
                  <SelectValue>
                    {task.assigneeId
                      ? `Assigned: ${getAssigneeName(task.assigneeId)}`
                      : "Assign to..."}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* 3-Level Hints */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Hints (Editable)</CardTitle>
            <CardDescription>
              3-level hint scaffold: Metacognitive → Conceptual → Keywords
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {hints.map((hint) => (
              <div key={hint.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">
                    {hintLevelLabels[hint.level] || hint.level}
                  </h3>
                  {editingHint !== hint.id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleHintEdit(hint.id)}
                    >
                      <Edit2 className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                  )}
                </div>
                {editingHint === hint.id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="min-h-20"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleHintSave(hint.id)}>
                        <Save className="h-3 w-3 mr-1" />
                        Save
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleHintCancel}
                      >
                        <X className="h-3 w-3 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {hint.content}
                  </p>
                )}
              </div>
            ))}
            {hints.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No hints available for this task.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Comments */}
        <Card>
          <CardHeader>
            <CardTitle>Comments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-20"
                disabled={isSubmitting}
              />
              <Button
                onClick={handleAddComment}
                disabled={!newComment.trim() || isSubmitting}
                size="sm"
              >
                {isSubmitting ? "Adding..." : "Add Comment"}
              </Button>
            </div>

            <div className="space-y-3">
              {comments.map((comment) => (
                <div key={comment.id} className="border-l-2 pl-4 py-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">
                      {getCommentAuthorName(comment.userId)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(comment.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
              ))}
              {comments.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No comments yet. Be the first to comment!
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
