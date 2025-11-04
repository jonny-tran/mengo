"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { db, getProjectsForUser } from "@/lib/mock-data";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Mock user ID (từ mock-data.ts)
const MOCK_USER_ID = "u-jonny";

export default function AppDashboardPage() {
  const router = useRouter();
  // Giả lập việc fetch data
  const projects = getProjectsForUser(MOCK_USER_ID);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Projects</h1>
        <Button onClick={() => router.push("/app/guest")}>
          Create New Project
        </Button>
      </div>
      <p className="text-muted-foreground mb-6">
        Welcome, {db.users[MOCK_USER_ID]?.name || "Guest"}.
      </p>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Link key={project.id} href={`/app/board/${project.id}`}>
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>{project.title}</CardTitle>
                <CardDescription>
                  {project.brief.substring(0, 100)}...
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
        {projects.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground mb-4">No projects yet.</p>
            <Button onClick={() => router.push("/app/guest")}>
              Create Your First Project
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
