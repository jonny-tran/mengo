'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { database } from '@/lib/mock-data';
import type { Team, Task, Project } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { AlertCircle, Download, Upload } from 'lucide-react';
import Link from 'next/link';

interface StuckTeam {
    team: Team;
    stuckTasks: Array<{
        task: Task;
        project: Project;
        daysOld: number;
    }>;
}

export default function InstructorDashboard() {
    const router = useRouter();
    const [teams, setTeams] = useState<Team[]>([]);
    const [stuckTeams, setStuckTeams] = useState<StuckTeam[]>([]);
    const [stuckThresholdDays, setStuckThresholdDays] = useState(3);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Check if admin mode is enabled
        const isAdmin = localStorage.getItem('mengo_admin') === 'true';
        if (!isAdmin) {
            toast.error('Instructor access required');
            router.push('/app/guest');
            return;
        }

        loadData();
    }, [router, stuckThresholdDays]);

    const loadData = () => {
        const allTeams = Object.values(database.teams);
        setTeams(allTeams);

        // Calculate stuck teams
        const stuck: StuckTeam[] = [];
        const now = new Date();

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

            const stuckTasksForTeam: StuckTeam['stuckTasks'] = [];

            teamTasks.forEach((task) => {
                const taskDate = new Date(task.createdAt);
                const daysOld = Math.floor((now.getTime() - taskDate.getTime()) / (1000 * 60 * 60 * 24));
                const comments = database.getCommentsByTaskId(task.id);

                // Stuck if: age > threshold AND no comments AND status is not done
                if (
                    daysOld > stuckThresholdDays &&
                    comments.length === 0 &&
                    task.status !== 'done'
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

            if (stuckTasksForTeam.length > 0) {
                stuck.push({
                    team,
                    stuckTasks: stuckTasksForTeam,
                });
            }
        });

        setStuckTeams(stuck);
        setIsLoading(false);
    };

    const handleExportCSV = () => {
        const csvRows: string[] = [];
        csvRows.push('team_name,member_emails,instructor_email,stuck_tasks_count');

        stuckTeams.forEach((stuckTeam) => {
            csvRows.push(
                [
                    stuckTeam.team.name,
                    stuckTeam.team.memberEmails.join(';'),
                    stuckTeam.team.instructorEmail,
                    stuckTeam.stuckTasks.length.toString(),
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
        a.download = `stuck_teams_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);

        toast.success('CSV exported successfully');
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
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Instructor Dashboard</h1>
                        <p className="text-muted-foreground">
                            Monitor teams and identify stuck tasks
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/import">
                            <Button variant="outline">
                                <Upload className="h-4 w-4 mr-2" />
                                Import CSV
                            </Button>
                        </Link>
                        <Button onClick={handleExportCSV} disabled={stuckTeams.length === 0}>
                            <Download className="h-4 w-4 mr-2" />
                            Export CSV
                        </Button>
                    </div>
                </div>

                <div className="mb-6 flex items-center gap-4">
                    <label className="text-sm font-medium">Stuck Threshold (days):</label>
                    <Input
                        type="number"
                        value={stuckThresholdDays}
                        onChange={(e) => setStuckThresholdDays(parseInt(e.target.value) || 3)}
                        className="w-20"
                        min="1"
                    />
                    <Button size="sm" onClick={loadData}>
                        Apply
                    </Button>
                </div>

                {/* Stuck Teams Alert */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-destructive" />
                            Stuck Teams ({stuckTeams.length})
                        </CardTitle>
                        <CardDescription>
                            Teams with tasks older than {stuckThresholdDays} days and no comments
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {stuckTeams.length > 0 ? (
                            <div className="space-y-4">
                                {stuckTeams.map((stuckTeam) => (
                                    <Card key={stuckTeam.team.id} className="border-destructive/20">
                                        <CardHeader>
                                            <CardTitle className="text-lg">{stuckTeam.team.name}</CardTitle>
                                            <CardDescription>
                                                Instructor: {stuckTeam.team.instructorEmail}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-2">
                                                <p className="text-sm font-medium">
                                                    {stuckTeam.stuckTasks.length} stuck task(s):
                                                </p>
                                                {stuckTeam.stuckTasks.map(({ task, project, daysOld }) => (
                                                    <div
                                                        key={task.id}
                                                        className="flex items-center justify-between rounded-md border p-2"
                                                    >
                                                        <div className="flex-1">
                                                            <Link
                                                                href={`/app/task/${task.id}`}
                                                                className="font-medium hover:underline"
                                                            >
                                                                {task.title}
                                                            </Link>
                                                            <p className="text-xs text-muted-foreground">
                                                                {project.title} • {daysOld} days old
                                                            </p>
                                                        </div>
                                                        <Badge variant="destructive">{task.status}</Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                No stuck teams found. All teams are making progress! 🎉
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* All Teams */}
                <Card>
                    <CardHeader>
                        <CardTitle>All Teams ({teams.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {teams.map((team) => {
                                const stuckCount = stuckTeams.find((st) => st.team.id === team.id)?.stuckTasks.length || 0;
                                return (
                                    <Card key={team.id}>
                                        <CardHeader>
                                            <CardTitle className="text-base">{team.name}</CardTitle>
                                            <CardDescription>
                                                {team.memberEmails.length} member(s)
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-2">
                                                <p className="text-xs text-muted-foreground">
                                                    Instructor: {team.instructorEmail}
                                                </p>
                                                {stuckCount > 0 && (
                                                    <Badge variant="destructive">
                                                        {stuckCount} stuck task(s)
                                                    </Badge>
                                                )}
                                                {stuckCount === 0 && (
                                                    <Badge variant="outline">On track</Badge>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                        {teams.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-8">
                                No teams found. Import a CSV roster to get started.
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

