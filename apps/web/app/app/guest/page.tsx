'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { database } from '@/lib/mock-data';
import type { Project, Epic, Task, Hint } from '@/lib/mock-data';

export default function GuestPage() {
    const router = useRouter();
    const [brief, setBrief] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    const handleGenerate = async () => {
        if (!brief.trim()) {
            toast.error('Vui lòng nhập project brief');
            return;
        }

        setIsGenerating(true);
        
        try {
            // Simulate latency
            const response = await fetch('/api/llm/generate?latency=800', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    brief: brief.trim(),
                    template: 'default',
                    simulate_success: true,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate plan');
            }

            const plan = await response.json();

            // Create project
            const projectId = `proj_${Date.now()}`;
            const guestUserId = 'guest_user';
            
            // Create guest user if doesn't exist
            if (!database.getUserById(guestUserId)) {
                database.setUser({
                    id: guestUserId,
                    name: 'Guest User',
                    email: 'guest@example.com',
                    role: 'team_lead',
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

            // Create epics and tasks
            let taskOrder = 0;
            plan.epics.forEach((epicData: any, epicIndex: number) => {
                const epic: Epic = {
                    id: `epic_${projectId}_${epicIndex}`,
                    projectId,
                    title: epicData.title,
                    order: epicIndex,
                    createdAt: new Date().toISOString(),
                };
                database.setEpic(epic);

                epicData.tasks.forEach((taskData: any) => {
                    const task: Task = {
                        id: `task_${projectId}_${taskOrder}`,
                        projectId,
                        epicId: epic.id,
                        title: taskData.title,
                        description: taskData.description || '',
                        status: 'todo',
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    };
                    database.setTask(task);

                    // Create hints for each task
                    const hintLevels: Array<'metacognitive' | 'conceptual' | 'keywords'> = 
                        ['metacognitive', 'conceptual', 'keywords'];
                    
                    (taskData.hints || []).forEach((hintData: any, hintIndex: number) => {
                        const level = hintLevels[hintIndex] || hintData.level;
                        const hint: Hint = {
                            id: `hint_${task.id}_${hintIndex}`,
                            taskId: task.id,
                            level,
                            content: hintData.content || '',
                            editableBy: [guestUserId],
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                        };
                        database.setHint(hint);
                    });

                    // If no hints provided, create default ones
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

            // Track analytics
            database.addEvent({
                type: 'plan_created',
                projectId,
                userId: guestUserId,
            });

            toast.success('Plan đã được tạo thành công!');
            router.push(`/app/board/${projectId}`);
        } catch (error) {
            console.error('Error generating plan:', error);
            toast.error('Không thể tạo plan. Vui lòng thử lại.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handlePreview = () => {
        if (!brief.trim()) {
            toast.error('Vui lòng nhập project brief');
            return;
        }
        setShowPreview(true);
    };

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="mx-auto max-w-4xl">
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-bold mb-2">Mengo</h1>
                    <p className="text-muted-foreground">
                        Chuyển đổi project brief thành plan với AI-generated epics, tasks và hints
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Paste Project Brief</CardTitle>
                        <CardDescription>
                            Nhập project brief của bạn và để Mengo tạo plan với epics, tasks và 3-level hints
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Textarea
                            placeholder="Ví dụ: Build a mini e-commerce platform to sell mugs with cart and checkout..."
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
                                        Đang tạo plan...
                                    </>
                                ) : (
                                    'Generate Plan'
                                )}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handlePreview}
                                disabled={isGenerating || !brief.trim()}
                            >
                                Preview
                            </Button>
                        </div>

                        {isGenerating && (
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                        )}

                        {showPreview && !isGenerating && (
                            <Card className="mt-4">
                                <CardHeader>
                                    <CardTitle className="text-sm">Preview Brief</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm whitespace-pre-wrap">{brief}</p>
                                </CardContent>
                            </Card>
                        )}
                    </CardContent>
                </Card>

                <div className="mt-8 text-center">
                    <Button
                        variant="outline"
                        onClick={() => {
                            // Simulated admin toggle
                            const isAdmin = localStorage.getItem('mengo_admin') === 'true';
                            if (isAdmin) {
                                router.push('/instructor/dashboard');
                            } else {
                                if (confirm('Bật chế độ Instructor? (Demo only)')) {
                                    localStorage.setItem('mengo_admin', 'true');
                                    router.push('/instructor/dashboard');
                                }
                            }
                        }}
                    >
                        Instructor Dashboard (Simulated)
                    </Button>
                </div>
            </div>
        </div>
    );
}

