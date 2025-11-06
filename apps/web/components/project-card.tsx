"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Calendar, ExternalLink, Folder, Star } from "lucide-react";

export interface ProjectSummary {
  id: string;
  name: string;
  description: string;
  lastUpdated: string;
}

export function ProjectCard({ project }: { project: ProjectSummary }) {
  return (
    <Card className="group hover:shadow-xl hover:shadow-black/5 transition-all duration-300 hover:scale-[1.01] hover:-translate-y-1 bg-gradient-to-r from-card/80 via-card to-card/80 backdrop-blur-sm border-white/20 dark:border-white/10">
      <div className="flex items-center p-6 gap-6">
        {/* Project Icon */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <Folder className="h-6 w-6 text-primary" />
          </div>
        </div>

        {/* Project Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-2">
            <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors duration-200 truncate">
              {project.name}
            </CardTitle>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Star className="h-5 w-5 text-amber-500 fill-amber-500 group-hover:scale-110 transition-transform duration-200" />
              <Badge
                variant="outline"
                className="bg-amber-50/80 text-amber-700 border-amber-200/50 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800/50"
              >
                Starred
              </Badge>
            </div>
          </div>

          <CardDescription className="text-muted-foreground mb-3 line-clamp-2">
            {project.description}
          </CardDescription>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Updated {project.lastUpdated}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex-shrink-0 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
          <Button
            variant="outline"
            size="sm"
            className="bg-background/80 backdrop-blur-sm border-white/20 dark:border-white/10 hover:bg-primary/10 hover:border-primary/30 transition-all duration-200"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="hover:bg-amber-100/80 dark:hover:bg-amber-900/20 transition-all duration-200"
          >
            <Star className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default ProjectCard;

// Add line-clamp utility if not available
const styles = `
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`;

if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}
