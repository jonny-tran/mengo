"use client";

import EmptyState from "@/components/empty-state";
import ProjectCard, { type ProjectSummary } from "@/components/project-card";
import { Star } from "lucide-react";

const mockStarredProjects: ProjectSummary[] = [
  {
    id: "p1",
    name: "E-commerce Mugs",
    description: "Mini shop with cart & checkout",
    lastUpdated: "2 days ago",
  },
  {
    id: "p2",
    name: "Study Planner",
    description: "Plan studies with tasks and hints",
    lastUpdated: "5 days ago",
  },
  {
    id: "p3",
    name: "Blog Platform",
    description: "Simple blog with tags and sharing",
    lastUpdated: "1 week ago",
  },
];

function StarredPage() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-2xl font-bold mb-4">Starred Projects</h1>

        {mockStarredProjects.length === 0 ? (
          <EmptyState
            message="You haven't starred any projects yet."
            Icon={Star}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockStarredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default StarredPage;
