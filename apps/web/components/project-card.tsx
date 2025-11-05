"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Star } from "lucide-react";

export interface ProjectSummary {
  id: string;
  name: string;
  description: string;
  lastUpdated: string;
}

export function ProjectCard({ project }: { project: ProjectSummary }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div className="min-w-0">
          <CardTitle className="text-base truncate">{project.name}</CardTitle>
        </div>
        <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
      </CardHeader>
      <CardContent>
        <CardDescription>{project.description}</CardDescription>
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">
        Last updated: {project.lastUpdated}
      </CardFooter>
    </Card>
  );
}

export default ProjectCard;


