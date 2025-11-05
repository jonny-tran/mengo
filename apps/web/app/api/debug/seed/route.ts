// Seed data endpoint - populates database with sample data
import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/mock-data';
import type { User, Project, Epic, Task, Team, Hint } from '@/lib/mock-data';

export async function POST(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const variant = searchParams.get('variant') || 'demo';
        
        // Reset database first
        database.reset();
        
        const now = new Date();
        const fourDaysAgo = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000);
        
        // Create 3 instructors
        const instructors: User[] = [
            {
                id: 'inst_1',
                name: 'Instructor Lin',
                email: 'lin@bootcamp.com',
                role: 'instructor',
            },
            {
                id: 'inst_2',
                name: 'Instructor Sarah',
                email: 'sarah@bootcamp.com',
                role: 'instructor',
            },
            {
                id: 'inst_3',
                name: 'Instructor Alex',
                email: 'alex@bootcamp.com',
                role: 'instructor',
            },
        ];
        
        instructors.forEach((instructor) => database.setUser(instructor));
        
        // Create 10 teams
        const teams: Team[] = [];
        for (let i = 1; i <= 10; i++) {
            const team: Team = {
                id: `team_${i}`,
                name: `Team ${String.fromCharCode(64 + i)}`, // Team A, B, C...
                memberEmails: [
                    `student${i}a@bootcamp.com`,
                    `student${i}b@bootcamp.com`,
                ],
                instructorEmail: instructors[i % 3].email,
                createdAt: new Date(now.getTime() - (i * 24 * 60 * 60 * 1000)).toISOString(),
            };
            database.setTeam(team);
            teams.push(team);
        }
        
        // Create students/team leads
        const students: User[] = [];
        teams.forEach((team, index) => {
            team.memberEmails.forEach((email, emailIndex) => {
                const student: User = {
                    id: `student_${team.id}_${emailIndex}`,
                    name: `Student ${email.split('@')[0]}`,
                    email,
                    role: emailIndex === 0 ? 'team_lead' : 'student',
                };
                database.setUser(student);
                students.push(student);
            });
        });
        
        // Create 3 projects
        const projects: Project[] = [
            {
                id: 'proj_1',
                title: 'E-commerce Platform',
                brief: 'Build a full-stack e-commerce platform with user authentication, product catalog, shopping cart, and payment integration.',
                ownerId: students[0].id,
                teamId: teams[0].id,
                createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            },
            {
                id: 'proj_2',
                title: 'Task Management App',
                brief: 'Create a task management application with Kanban boards, team collaboration, and real-time updates.',
                ownerId: students[2].id,
                teamId: teams[1].id,
                createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            },
            {
                id: 'proj_3',
                title: 'Learning Management System',
                brief: 'Develop an LMS platform for online courses with video streaming, quizzes, and progress tracking.',
                ownerId: students[4].id,
                teamId: teams[2].id,
                createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            },
        ];
        
        projects.forEach((project) => database.setProject(project));
        
        // Create epics and tasks for each project
        projects.forEach((project, projectIndex) => {
            const epics: Epic[] = [
                {
                    id: `epic_${project.id}_1`,
                    projectId: project.id,
                    title: 'Setup & Foundation',
                    order: 0,
                    createdAt: project.createdAt,
                },
                {
                    id: `epic_${project.id}_2`,
                    projectId: project.id,
                    title: 'Core Features',
                    order: 1,
                    createdAt: project.createdAt,
                },
                {
                    id: `epic_${project.id}_3`,
                    projectId: project.id,
                    title: 'Testing & Deployment',
                    order: 2,
                    createdAt: project.createdAt,
                },
            ];
            
            epics.forEach((epic) => database.setEpic(epic));
            
            // Create tasks with hints
            const taskTemplates = [
                {
                    title: 'Initialize project repository',
                    description: 'Set up project structure and dependencies',
                    hints: [
                        {
                            level: 'metacognitive' as const,
                            content: 'Plan first commit: project structure → dependencies → basic config → README.',
                        },
                        {
                            level: 'conceptual' as const,
                            content: 'Git basics, package management, project structure conventions.',
                        },
                        {
                            level: 'keywords' as const,
                            content: 'git init, README, package.json, project structure',
                        },
                    ],
                },
                {
                    title: 'Set up CI/CD pipeline',
                    description: 'Configure continuous integration and deployment',
                    hints: [
                        {
                            level: 'metacognitive' as const,
                            content: 'Design CI flow: trigger → test → build → deploy (if tests pass).',
                        },
                        {
                            level: 'conceptual' as const,
                            content: 'Understand CI/CD concepts, GitHub Actions, or similar tools.',
                        },
                        {
                            level: 'keywords' as const,
                            content: 'CI/CD, GitHub Actions, automated testing, deployment',
                        },
                    ],
                },
                {
                    title: 'Implement main feature',
                    description: 'Build the primary functionality described in the brief',
                    hints: [
                        {
                            level: 'metacognitive' as const,
                            content: 'Break feature into smaller tasks: plan → implement → test → refine.',
                        },
                        {
                            level: 'conceptual' as const,
                            content: 'Apply software engineering principles: modularity, testing, documentation.',
                        },
                        {
                            level: 'keywords' as const,
                            content: 'feature implementation, testing, modular code',
                        },
                    ],
                },
            ];
            
            taskTemplates.forEach((template, taskIndex) => {
                const taskCreatedAt = projectIndex === 0 && taskIndex === 2
                    ? fourDaysAgo.toISOString() // Create a stuck task
                    : new Date(now.getTime() - (taskIndex * 6 * 60 * 60 * 1000)).toISOString();
                
                const task: Task = {
                    id: `task_${project.id}_${taskIndex + 1}`,
                    projectId: project.id,
                    epicId: epics[taskIndex % 3].id,
                    title: template.title,
                    description: template.description,
                    status: taskIndex === 0 ? 'done' : taskIndex === 1 ? 'progress' : 'todo',
                    assigneeId: students[projectIndex * 2].id,
                    createdAt: taskCreatedAt,
                    updatedAt: taskCreatedAt,
                };
                
                database.setTask(task);
                
                // Create hints for each task
                template.hints.forEach((hintTemplate, hintIndex) => {
                    const hint: Hint = {
                        id: `hint_${task.id}_${hintIndex + 1}`,
                        taskId: task.id,
                        level: hintTemplate.level,
                        content: hintTemplate.content,
                        editableBy: [students[projectIndex * 2].id, instructors[projectIndex % 3].id],
                        createdAt: taskCreatedAt,
                        updatedAt: taskCreatedAt,
                    };
                    database.setHint(hint);
                });
                
                // Track events
                if (projectIndex === 0) {
                    database.addEvent({
                        type: 'plan_created',
                        projectId: project.id,
                        userId: students[projectIndex * 2].id,
                    });
                }
                
                database.addEvent({
                    type: 'task_created',
                    projectId: project.id,
                    taskId: task.id,
                    userId: students[projectIndex * 2].id,
                });
            });
        });
        
        return NextResponse.json({
            success: true,
            message: 'Database seeded successfully',
            counts: {
                users: Object.keys(database.users).length,
                projects: Object.keys(database.projects).length,
                teams: Object.keys(database.teams).length,
                epics: Object.keys(database.epics).length,
                tasks: Object.keys(database.tasks).length,
                hints: Object.keys(database.hints).length,
                events: database.events.length,
            },
        });
    } catch (error) {
        console.error('Error in /api/debug/seed:', error);
        return NextResponse.json(
            { error: 'Failed to seed database', details: String(error) },
            { status: 500 }
        );
    }
}

