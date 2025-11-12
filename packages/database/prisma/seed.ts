/* eslint-disable prettier/prettier */
import { PrismaClient, Role, TaskStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding V2 ...`);

  // 1. Seed Organization (The 'B' in B2B2C)
  const org = await prisma.organization.upsert({
    where: { name: 'Mengo Bootcamp' },
    update: {},
    create: { name: 'Mengo Bootcamp' },
  });

  // 2. Seed Users (The 'C's)
  const instructor = await prisma.user.upsert({
    where: { email: 'instructor@mengo.test' },
    update: {},
    create: { email: 'instructor@mengo.test', name: 'Instructor One' },
  });

  const studentDat = await prisma.user.upsert({
    where: { email: 'dat@mengo.test' },
    update: {},
    create: { email: 'dat@mengo.test', name: 'Student Dat' },
  });

  const studentChau = await prisma.user.upsert({
    where: { email: 'chau@mengo.test' },
    update: {},
    create: { email: 'chau@mengo.test', name: 'Student Chau' },
  });

  // 3. Seed Memberships (Connecting B and C)
  await prisma.membership.upsert({
    where: { userId_organizationId: { userId: instructor.id, organizationId: org.id } },
    update: { role: Role.INSTRUCTOR },
    create: { userId: instructor.id, organizationId: org.id, role: Role.INSTRUCTOR },
  });
  await prisma.membership.upsert({
    where: { userId_organizationId: { userId: studentDat.id, organizationId: org.id } },
    update: { role: Role.STUDENT },
    create: { userId: studentDat.id, organizationId: org.id, role: Role.STUDENT },
  });
  await prisma.membership.upsert({
    where: { userId_organizationId: { userId: studentChau.id, organizationId: org.id } },
    update: { role: Role.STUDENT },
    create: { userId: studentChau.id, organizationId: org.id, role: Role.STUDENT },
  });

  // --- Project 1: "Mengo MVP" (Simulates our own project) ---
  const project1 = await prisma.project.upsert({
    where: { name_organizationId: { name: 'Mengo MVP', organizationId: org.id } },
    update: {},
    create: {
      organizationId: org.id,
      name: 'Mengo MVP',
      brief: 'Build an AI-Kanban to solve the Cold Start Problem for students.',
    },
  });

  // Project 1 - Epics
  const epic1_1 = await prisma.epic.upsert({
    where: { title_projectId: { title: 'Backend (NestJS)', projectId: project1.id } },
    update: {},
    create: { projectId: project1.id, title: 'Backend (NestJS)', order: 1 },
  });
  const epic1_2 = await prisma.epic.upsert({
    where: { title_projectId: { title: 'Frontend (Next.js)', projectId: project1.id } },
    update: {},
    create: { projectId: project1.id, title: 'Frontend (Next.js)', order: 2 },
  });

  // Project 1 - Tasks
  const task1_1 = await prisma.task.upsert({
    where: { title_epicId: { title: 'Setup Database Schema', epicId: epic1_1.id } },
    update: {},
    create: {
      epicId: epic1_1.id,
      title: 'Setup Database Schema',
      description: 'Implement V1 schema in Prisma and migrate cloud DB',
      order: 1,
      status: TaskStatus.DONE, // Dat completed this
      assigneeId: studentDat.id,
      hintMetacognitive: 'Why does this data structure matter for the B2B model?',
      hintConceptual: 'Research multi-tenancy and relational databases.',
      hintKeywords: 'prisma, schema, foreign key, B2B2C, multi-tenancy',
    },
  });
  await prisma.task.upsert({
    where: { title_epicId: { title: 'Build Auth Endpoints', epicId: epic1_1.id } },
    update: {},
    create: {
      epicId: epic1_1.id,
      title: 'Build Auth Endpoints',
      description: 'Implement JWT logic for login/register',
      order: 2,
      status: TaskStatus.IN_PROGRESS, // Dat is working on this
      assigneeId: studentDat.id,
      hintMetacognitive: 'How do we securely store passwords?',
      hintConceptual: 'Research JWT, bcrypt, and auth guards in NestJS.',
      hintKeywords: 'jwt, passport, bcrypt, guard, @UseGuards',
    },
  });
  await prisma.task.upsert({
    where: { title_epicId: { title: 'Implement Login Page', epicId: epic1_2.id } },
    update: {},
    create: {
      epicId: epic1_2.id,
      title: 'Implement Login Page',
      description: 'Create the login form using shadcn/ui components',
      order: 1,
      status: TaskStatus.TODO, // Chau will do this
      assigneeId: studentChau.id,
      hintMetacognitive: 'How to handle form state and validation?',
      hintConceptual: 'Research react-hook-form and Zod validation.',
      hintKeywords: 'react-hook-form, zod, shadcn/ui, Form, Input',
    },
  });

  // Project 1 - Checklist for Task 1.1
  await prisma.checklistItem.upsert({
    where: { text_taskId: { text: 'Define all models in schema.prisma', taskId: task1_1.id } },
    update: {},
    create: { taskId: task1_1.id, text: 'Define all models in schema.prisma', order: 1, isCompleted: true },
  });
  await prisma.checklistItem.upsert({
    where: { text_taskId: { text: 'Run prisma migrate dev', taskId: task1_1.id } },
    update: {},
    create: { taskId: task1_1.id, text: 'Run prisma migrate dev', order: 2, isCompleted: true },
  });

  // --- Project 2: "E-commerce Site" (Simulates another student project) ---
  const project2 = await prisma.project.upsert({
    where: { name_organizationId: { name: 'E-commerce Site', organizationId: org.id } },
    update: {},
    create: {
      organizationId: org.id,
      name: 'E-commerce Site',
      brief: 'A standard e-commerce website with product catalog and cart.',
    },
  });

  // Project 2 - Epics
  const epic2_1 = await prisma.epic.upsert({
    where: { title_projectId: { title: 'User Authentication', projectId: project2.id } },
    update: {},
    create: { projectId: project2.id, title: 'User Authentication', order: 1 },
  });
  const epic2_2 = await prisma.epic.upsert({
    where: { title_projectId: { title: 'Product Catalog', projectId: project2.id } },
    update: {},
    create: { projectId: project2.id, title: 'Product Catalog', order: 2 },
  });

  // Project 2 - Tasks
  await prisma.task.upsert({
    where: { title_epicId: { title: 'Register User API', epicId: epic2_1.id } },
    update: {},
    create: {
      epicId: epic2_1.id,
      title: 'Register User API',
      order: 1,
      status: TaskStatus.DONE, // Chau completed this
      assigneeId: studentChau.id,
      hintMetacognitive: 'What information is essential for a user?',
      hintConceptual: 'Research REST API design principles (POST vs GET).',
      hintKeywords: 'REST, POST, /api/users, DTO',
    },
  });
  await prisma.task.upsert({
    where: { title_epicId: { title: 'List Products Page', epicId: epic2_2.id } },
    update: {},
    create: {
      epicId: epic2_2.id,
      title: 'List Products Page',
      order: 1,
      status: TaskStatus.TODO, // Unassigned
      hintMetacognitive: 'How should the product data be structured?',
      hintConceptual: 'Research `Product` model schema and fetching data.',
      hintKeywords: 'GET, /api/products, Prisma, findMany',
    },
  });

  console.log(`Seeding V2 finished.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });