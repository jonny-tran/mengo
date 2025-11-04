// Simulated LLM API endpoint
// For Prototype depth: simulate LLM responses without real API keys

import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/mock-data';
import type { Epic, Task, Hint } from '@/lib/mock-data';

interface GenerateRequest {
    brief: string;
    template?: 'default' | 'detailed';
    simulate_success?: boolean;
    latency_ms?: number;
}

interface GenerateResponse {
    project_title: string;
    epics: Array<{
        title: string;
        tasks: Array<{
            title: string;
            description: string;
            acceptance?: string;
            hints: Array<{
                level: 'metacognitive' | 'conceptual' | 'keywords';
                content: string;
            }>;
        }>;
    }>;
}

// Sample prompt templates
const PROMPT_TEMPLATES = {
    default: (brief: string) => `Generate a project plan for: ${brief}`,
    detailed: (brief: string) => `Create a detailed project plan with epics and tasks for: ${brief}`,
};

// Sample LLM responses (deterministic based on brief keywords)
function generateSamplePlan(brief: string, template: 'default' | 'detailed' = 'default'): GenerateResponse {
    const briefLower = brief.toLowerCase();
    
    // E-commerce template
    if (briefLower.includes('e-commerce') || briefLower.includes('ecommerce') || briefLower.includes('shop') || briefLower.includes('cart')) {
        return {
            project_title: 'Mini E-Commerce Platform',
            epics: [
                {
                    title: 'User Authentication & Management',
                    tasks: [
                        {
                            title: 'Create login page',
                            description: 'Implement responsive login page with email and password fields',
                            acceptance: 'User can log in and see dashboard',
                            hints: [
                                {
                                    level: 'metacognitive',
                                    content: 'Break the UI into components: form, input fields, submit button. Think about validation before submission.',
                                },
                                {
                                    level: 'conceptual',
                                    content: 'Understand authentication flow: form submission → API call → token storage → redirect.',
                                },
                                {
                                    level: 'keywords',
                                    content: 'login form, authentication, JWT token, protected routes',
                                },
                            ],
                        },
                        {
                            title: 'Implement user registration',
                            description: 'Create registration form with email, password, and name fields',
                            acceptance: 'New users can create accounts',
                            hints: [
                                {
                                    level: 'metacognitive',
                                    content: 'Plan the registration flow: validation → API call → success message → redirect to login.',
                                },
                                {
                                    level: 'conceptual',
                                    content: 'Learn about password hashing, email validation, and user data models.',
                                },
                                {
                                    level: 'keywords',
                                    content: 'registration, password hashing, bcrypt, user schema',
                                },
                            ],
                        },
                        {
                            title: 'Add password reset functionality',
                            description: 'Implement forgot password flow with email verification',
                            acceptance: 'Users can reset passwords via email',
                            hints: [
                                {
                                    level: 'metacognitive',
                                    content: 'Design the flow: request reset → send email → verify token → set new password.',
                                },
                                {
                                    level: 'conceptual',
                                    content: 'Understand token-based password reset, email sending, and secure token generation.',
                                },
                                {
                                    level: 'keywords',
                                    content: 'password reset, email verification, JWT token, nodemailer',
                                },
                            ],
                        },
                    ],
                },
                {
                    title: 'Product Catalog',
                    tasks: [
                        {
                            title: 'Design product card component',
                            description: 'Create reusable product card with image, title, price, and add to cart button',
                            acceptance: 'Product cards display correctly on all screen sizes',
                            hints: [
                                {
                                    level: 'metacognitive',
                                    content: 'Think about component reusability and responsive design. Consider image loading states.',
                                },
                                {
                                    level: 'conceptual',
                                    content: 'Understand component composition, props, and responsive CSS (flexbox/grid).',
                                },
                                {
                                    level: 'keywords',
                                    content: 'React component, props, CSS Grid, responsive design, image optimization',
                                },
                            ],
                        },
                        {
                            title: 'Build product listing page',
                            description: 'Create page that displays all products in a grid layout',
                            acceptance: 'All products are displayed with pagination',
                            hints: [
                                {
                                    level: 'metacognitive',
                                    content: 'Plan the data flow: fetch products → filter/sort → display → pagination.',
                                },
                                {
                                    level: 'conceptual',
                                    content: 'Learn about data fetching, state management, and pagination patterns.',
                                },
                                {
                                    level: 'keywords',
                                    content: 'useEffect, fetch API, pagination, state management, filtering',
                                },
                            ],
                        },
                        {
                            title: 'Implement product search',
                            description: 'Add search functionality to filter products by name or category',
                            acceptance: 'Users can search and filter products in real-time',
                            hints: [
                                {
                                    level: 'metacognitive',
                                    content: 'Design search UX: input field → debounce → filter results → update UI.',
                                },
                                {
                                    level: 'conceptual',
                                    content: 'Understand debouncing, string matching algorithms, and filtering arrays.',
                                },
                                {
                                    level: 'keywords',
                                    content: 'debounce, filter, search algorithm, input handling',
                                },
                            ],
                        },
                    ],
                },
                {
                    title: 'Shopping Cart & Checkout',
                    tasks: [
                        {
                            title: 'Create checkout UI',
                            description: 'Implement checkout page with cart summary, shipping form, and payment section',
                            acceptance: 'User can submit order and see confirmation',
                            hints: [
                                {
                                    level: 'metacognitive',
                                    content: 'Break the UI into components: cart summary, form sections, payment method selection.',
                                },
                                {
                                    level: 'conceptual',
                                    content: 'Understand POST flow to server, form validation, and order processing.',
                                },
                                {
                                    level: 'keywords',
                                    content: 'checkout, cart, order API, form validation, payment integration',
                                },
                            ],
                        },
                        {
                            title: 'Implement add to cart functionality',
                            description: 'Allow users to add products to cart and update quantities',
                            acceptance: 'Cart persists across page refreshes',
                            hints: [
                                {
                                    level: 'metacognitive',
                                    content: 'Plan cart state management: add item → update quantity → persist → display.',
                                },
                                {
                                    level: 'conceptual',
                                    content: 'Learn about state management (Context/Redux), localStorage, and cart data structure.',
                                },
                                {
                                    level: 'keywords',
                                    content: 'cart state, localStorage, Context API, cart operations',
                                },
                            ],
                        },
                    ],
                },
            ],
        };
    }
    
    // Task management template
    if (briefLower.includes('task') || briefLower.includes('kanban') || briefLower.includes('board')) {
        return {
            project_title: 'Task Management Application',
            epics: [
                {
                    title: 'Kanban Board',
                    tasks: [
                        {
                            title: 'Create column components',
                            description: 'Build draggable columns for To Do, In Progress, Done',
                            acceptance: 'Tasks can be moved between columns',
                            hints: [
                                {
                                    level: 'metacognitive',
                                    content: 'Plan the drag-and-drop flow: detect drag → calculate drop zone → update state.',
                                },
                                {
                                    level: 'conceptual',
                                    content: 'Understand HTML5 drag and drop API, or use libraries like react-beautiful-dnd.',
                                },
                                {
                                    level: 'keywords',
                                    content: 'drag and drop, HTML5 DnD API, react-beautiful-dnd, state update',
                                },
                            ],
                        },
                        {
                            title: 'Implement task cards',
                            description: 'Create task card components with title, assignee, and status',
                            acceptance: 'Tasks display correctly with all metadata',
                            hints: [
                                {
                                    level: 'metacognitive',
                                    content: 'Design card component: props → render → handle interactions.',
                                },
                                {
                                    level: 'conceptual',
                                    content: 'Learn component design patterns, prop drilling vs context, and event handling.',
                                },
                                {
                                    level: 'keywords',
                                    content: 'React component, props, event handlers, card design',
                                },
                            ],
                        },
                    ],
                },
                {
                    title: 'Team Collaboration',
                    tasks: [
                        {
                            title: 'Add comment system',
                            description: 'Implement threaded comments on tasks',
                            acceptance: 'Users can add and reply to comments',
                            hints: [
                                {
                                    level: 'metacognitive',
                                    content: 'Plan comment structure: input → submit → save → display in thread.',
                                },
                                {
                                    level: 'conceptual',
                                    content: 'Understand nested data structures, recursive components, and API design.',
                                },
                                {
                                    level: 'keywords',
                                    content: 'comments, threaded comments, nested data, recursive components',
                                },
                            ],
                        },
                        {
                            title: 'Implement task assignment',
                            description: 'Allow task owners to assign tasks to team members',
                            acceptance: 'Assigned users receive notifications',
                            hints: [
                                {
                                    level: 'metacognitive',
                                    content: 'Design assignment flow: select user → update task → notify → update UI.',
                                },
                                {
                                    level: 'conceptual',
                                    content: 'Learn about user selection UI, state updates, and notification systems.',
                                },
                                {
                                    level: 'keywords',
                                    content: 'user selection, dropdown, assignment, notifications',
                                },
                            ],
                        },
                    ],
                },
            ],
        };
    }
    
    // Default generic template
    return {
        project_title: 'Project Plan',
        epics: [
            {
                title: 'Setup & Configuration',
                tasks: [
                    {
                        title: 'Initialize project repository',
                        description: 'Set up project structure and dependencies',
                        acceptance: 'Project runs locally without errors',
                        hints: [
                            {
                                level: 'metacognitive',
                                content: 'Plan first commit: project structure → dependencies → basic config → README.',
                            },
                            {
                                level: 'conceptual',
                                content: 'Git basics, package management, project structure conventions.',
                            },
                            {
                                level: 'keywords',
                                content: 'git init, README, package.json, project structure',
                            },
                        ],
                    },
                    {
                        title: 'Set up CI/CD pipeline',
                        description: 'Configure continuous integration and deployment',
                        acceptance: 'CI runs on every push',
                        hints: [
                            {
                                level: 'metacognitive',
                                content: 'Design CI flow: trigger → test → build → deploy (if tests pass).',
                            },
                            {
                                level: 'conceptual',
                                content: 'Understand CI/CD concepts, GitHub Actions, or similar tools.',
                            },
                            {
                                level: 'keywords',
                                content: 'CI/CD, GitHub Actions, automated testing, deployment',
                            },
                        ],
                    },
                ],
            },
            {
                title: 'Core Features',
                tasks: [
                    {
                        title: 'Implement main feature',
                        description: 'Build the primary functionality described in the brief',
                        acceptance: 'Feature works as specified',
                        hints: [
                            {
                                level: 'metacognitive',
                                content: 'Break feature into smaller tasks: plan → implement → test → refine.',
                            },
                            {
                                level: 'conceptual',
                                content: 'Apply software engineering principles: modularity, testing, documentation.',
                            },
                            {
                                level: 'keywords',
                                content: 'feature implementation, testing, modular code',
                            },
                        ],
                    },
                ],
            },
            {
                title: 'Testing & Deployment',
                tasks: [
                    {
                        title: 'Write unit tests',
                        description: 'Create tests for critical functionality',
                        acceptance: 'Test coverage > 70%',
                        hints: [
                            {
                                level: 'metacognitive',
                                content: 'Plan test strategy: identify critical paths → write tests → run → fix failures.',
                            },
                            {
                                level: 'conceptual',
                                content: 'Understand testing frameworks (Jest, Vitest), test types, and mocking.',
                            },
                            {
                                level: 'keywords',
                                content: 'unit tests, Jest, test coverage, mocking',
                            },
                        ],
                    },
                ],
            },
        ],
    };
}

export async function POST(request: NextRequest) {
    try {
        const body: GenerateRequest = await request.json();
        const { brief, template = 'default', simulate_success = true, latency_ms = 800 } = body;
        
        // Check for simulate_fail query param
        const searchParams = request.nextUrl.searchParams;
        const shouldFail = searchParams.get('simulate_fail') === 'true';
        
        if (shouldFail || !simulate_success) {
            return NextResponse.json(
                { error: 'Simulated LLM API failure' },
                { status: 500 }
            );
        }
        
        // Simulate latency
        const latency = parseInt(searchParams.get('latency') || String(latency_ms), 10);
        await new Promise((resolve) => setTimeout(resolve, Math.min(latency, 5000)));
        
        // Generate sample plan
        const plan = generateSamplePlan(brief, template);
        
        // Validate: must have ≥3 epics or ≥8 tasks
        const totalTasks = plan.epics.reduce((sum, epic) => sum + epic.tasks.length, 0);
        if (plan.epics.length < 3 && totalTasks < 8) {
            // Add more tasks to meet requirement
            plan.epics.push({
                title: 'Additional Features',
                tasks: [
                    {
                        title: 'Add user preferences',
                        description: 'Allow users to customize settings',
                        hints: [
                            { level: 'metacognitive', content: 'Plan settings structure' },
                            { level: 'conceptual', content: 'Learn about settings persistence' },
                            { level: 'keywords', content: 'localStorage, user preferences' },
                        ],
                    },
                    {
                        title: 'Implement error handling',
                        description: 'Add comprehensive error handling and user feedback',
                        hints: [
                            { level: 'metacognitive', content: 'Identify error scenarios' },
                            { level: 'conceptual', content: 'Understand error boundaries and handling' },
                            { level: 'keywords', content: 'error handling, try-catch, error boundaries' },
                        ],
                    },
                ],
            });
        }
        
        return NextResponse.json(plan);
    } catch (error) {
        console.error('Error in /api/llm/generate:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

