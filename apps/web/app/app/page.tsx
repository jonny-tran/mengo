import React from "react";
import { db, getProjectsForUser } from "@/lib/mock-data";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

// Mock user ID (từ mock-data.ts)
const MOCK_USER_ID = "u-jonny";

export default function AppDashboardPage() {
  // Giả lập việc fetch data
  const projects = getProjectsForUser(MOCK_USER_ID);

  return (
    <div>
      <h1 className="text-3xl font-bold">My Projects</h1>
      <p className="text-muted-foreground mb-6">
        Welcome, {db.users[MOCK_USER_ID].name}.
      </p>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Card key={project.id}>
            <CardHeader>
              <CardTitle>{project.name}</CardTitle>
              <CardDescription>
                {project.brief.substring(0, 100)}...
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
