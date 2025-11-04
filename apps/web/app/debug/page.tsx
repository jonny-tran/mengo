'use client';

import { useEffect, useState } from 'react';
import { database } from '@/lib/mock-data';
import type { AnalyticsEvent, Project, Team } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { RefreshCw, Download } from 'lucide-react';

export default function DebugPage() {
    const [events, setEvents] = useState<AnalyticsEvent[]>([]);
    const [stats, setStats] = useState<{
        totalEvents: number;
        planCreated: number;
        taskCreated: number;
        hintViewed: number;
        taskCompleted: number;
        taskAssigned: number;
        activationRate: number;
        medianTimeToFirstTask: number;
    } | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        const allEvents = database.events;
        setEvents(allEvents);

        // Calculate statistics
        const planCreated = database.getEventsByType('plan_created').length;
        const taskCreated = database.getEventsByType('task_created').length;
        const hintViewed = database.getEventsByType('hint_viewed').length;
        const taskCompleted = database.getEventsByType('task_completed').length;
        const taskAssigned = database.getEventsByType('task_assigned').length;

        // Calculate activation rate
        const teams = Object.values(database.teams);
        const projects = Object.values(database.projects);
        const activationRate =
            teams.length > 0 ? (planCreated / teams.length) * 100 : 0;

        // Calculate median time to first task
        const completedTasks = database.events.filter((e) => e.type === 'task_completed');
        const timeDiffs: number[] = [];

        completedTasks.forEach((completedEvent) => {
            if (!completedEvent.taskId || !completedEvent.projectId) return;

            const project = projects.find((p) => p.id === completedEvent.projectId);
            if (!project) return;

            const planCreatedEvent = database.events.find(
                (e) => e.type === 'plan_created' && e.projectId === completedEvent.projectId
            );
            if (!planCreatedEvent) return;

            const planTime = new Date(planCreatedEvent.timestamp).getTime();
            const completedTime = new Date(completedEvent.timestamp).getTime();
            const diffHours = (completedTime - planTime) / (1000 * 60 * 60);
            timeDiffs.push(diffHours);
        });

        timeDiffs.sort((a, b) => a - b);
        const medianTime =
            timeDiffs.length > 0
                ? timeDiffs.length % 2 === 0
                    ? (timeDiffs[timeDiffs.length / 2 - 1] + timeDiffs[timeDiffs.length / 2]) / 2
                    : timeDiffs[Math.floor(timeDiffs.length / 2)]
                : 0;

        setStats({
            totalEvents: allEvents.length,
            planCreated,
            taskCreated,
            hintViewed,
            taskCompleted,
            taskAssigned,
            activationRate,
            medianTimeToFirstTask: medianTime,
        });
    };

    const handleSeed = async () => {
        try {
            const response = await fetch('/api/debug/seed?variant=demo', {
                method: 'POST',
            });

            if (!response.ok) {
                throw new Error('Failed to seed database');
            }

            const result = await response.json();
            toast.success(`Database seeded: ${JSON.stringify(result.counts)}`);
            loadData();
        } catch (error) {
            console.error('Error seeding:', error);
            toast.error('Failed to seed database');
        }
    };

    const handleReset = () => {
        if (confirm('Are you sure you want to reset the database? This cannot be undone.')) {
            database.reset();
            toast.success('Database reset');
            loadData();
        }
    };

    const handleExportEvents = () => {
        const csvRows: string[] = [];
        csvRows.push('id,type,userId,projectId,taskId,timestamp,metadata');

        events.forEach((event) => {
            csvRows.push(
                [
                    event.id,
                    event.type,
                    event.userId || '',
                    event.projectId || '',
                    event.taskId || '',
                    event.timestamp,
                    JSON.stringify(event.metadata || {}),
                ]
                    .map((field) => `"${String(field).replace(/"/g, '""')}"`)
                    .join(',')
            );
        });

        const csv = csvRows.join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics_export_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success('Events exported to CSV');
    };

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Debug & Analytics</h1>
                        <p className="text-muted-foreground">
                            View analytics events and acceptance criteria metrics
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={loadData}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh
                        </Button>
                        <Button variant="outline" onClick={handleExportEvents}>
                            <Download className="h-4 w-4 mr-2" />
                            Export Events
                        </Button>
                    </div>
                </div>

                {/* Acceptance Criteria */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Success Metrics & Acceptance Criteria</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {stats ? (
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium">Activation Rate</p>
                                    <p className="text-2xl font-bold">
                                        {stats.activationRate.toFixed(1)}%
                                    </p>
                                    <Badge
                                        variant={
                                            stats.activationRate >= 70 ? 'default' : 'destructive'
                                        }
                                    >
                                        Target: ≥70%
                                    </Badge>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium">Median Time to First Task</p>
                                    <p className="text-2xl font-bold">
                                        {stats.medianTimeToFirstTask.toFixed(1)}h
                                    </p>
                                    <Badge
                                        variant={
                                            stats.medianTimeToFirstTask <= 24 ? 'default' : 'destructive'
                                        }
                                    >
                                        Target: ≤24h
                                    </Badge>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium">Total Events</p>
                                    <p className="text-2xl font-bold">{stats.totalEvents}</p>
                                </div>
                            </div>
                        ) : (
                            <p>Loading statistics...</p>
                        )}
                    </CardContent>
                </Card>

                {/* Event Statistics */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Event Statistics</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {stats ? (
                            <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                                <div>
                                    <p className="text-sm text-muted-foreground">Plan Created</p>
                                    <p className="text-xl font-bold">{stats.planCreated}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Task Created</p>
                                    <p className="text-xl font-bold">{stats.taskCreated}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Hint Viewed</p>
                                    <p className="text-xl font-bold">{stats.hintViewed}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Task Completed</p>
                                    <p className="text-xl font-bold">{stats.taskCompleted}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Task Assigned</p>
                                    <p className="text-xl font-bold">{stats.taskAssigned}</p>
                                </div>
                            </div>
                        ) : (
                            <p>Loading...</p>
                        )}
                    </CardContent>
                </Card>

                {/* Database Actions */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Database Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="flex gap-2">
                        <Button onClick={handleSeed}>Seed Database</Button>
                        <Button variant="destructive" onClick={handleReset}>
                            Reset Database
                        </Button>
                    </CardContent>
                </Card>

                {/* Recent Events */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Events ({events.length})</CardTitle>
                        <CardDescription>
                            Last 50 analytics events
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {events.slice(-50).reverse().map((event) => (
                                <div
                                    key={event.id}
                                    className="flex items-center justify-between rounded-md border p-2 text-sm"
                                >
                                    <div className="flex-1">
                                        <Badge variant="outline" className="mr-2">
                                            {event.type}
                                        </Badge>
                                        <span className="text-muted-foreground">
                                            {new Date(event.timestamp).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {event.projectId && `Project: ${event.projectId.substring(0, 8)}...`}
                                        {event.taskId && ` • Task: ${event.taskId.substring(0, 8)}...`}
                                    </div>
                                </div>
                            ))}
                            {events.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-8">
                                    No events recorded yet. Generate a plan or interact with tasks to create events.
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

