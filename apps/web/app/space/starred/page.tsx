"use client";

import EmptyState from "@/components/empty-state";
import ProjectCard, { type ProjectSummary } from "@/components/project-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter, Grid3X3, List, Search, Star } from "lucide-react";
import { useState } from "react";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [filteredProjects, setFilteredProjects] = useState(mockStarredProjects);

  // Filter projects based on search query
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setFilteredProjects(mockStarredProjects);
    } else {
      const filtered = mockStarredProjects.filter(
        (project) =>
          project.name.toLowerCase().includes(query.toLowerCase()) ||
          project.description.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredProjects(filtered);
    }
  };

  return (
    <div className="min-h-screen bg-background page-gradient-bg p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        {/* Enhanced Header Section */}
        <div className="mb-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-card/60 backdrop-blur-sm border border-white/20 dark:border-white/10 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-gradient-to-br from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30 p-3">
                <Star className="h-6 w-6 text-amber-600 dark:text-amber-400 fill-current" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold gradient-title">
                  Starred Projects
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Your favorite projects in one place
                </p>
              </div>
            </div>
            <Badge
              variant="secondary"
              className="bg-amber-100/80 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 px-3 py-1"
            >
              {filteredProjects.length} project
              {filteredProjects.length !== 1 ? "s" : ""}
            </Badge>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl bg-card/40 backdrop-blur-sm border border-white/10 dark:border-white/5">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search starred projects..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 bg-background/80 backdrop-blur-sm border-white/20 dark:border-white/10 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setViewMode(viewMode === "grid" ? "list" : "grid")
                }
                className="bg-background/80 backdrop-blur-sm border-white/20 dark:border-white/10 hover:bg-accent/80 transition-all duration-200"
              >
                {viewMode === "grid" ? (
                  <List className="h-4 w-4" />
                ) : (
                  <Grid3X3 className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-background/80 backdrop-blur-sm border-white/20 dark:border-white/10 hover:bg-accent/80 transition-all duration-200"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </div>

        {/* Projects Grid/List */}
        {filteredProjects.length === 0 ? (
          <EmptyState
            message={
              searchQuery
                ? "No projects match your search."
                : "You haven't starred any projects yet."
            }
            Icon={Star}
          />
        ) : (
          <div className="space-y-4 transition-all duration-300">
            {filteredProjects.map((project, index) => (
              <div
                key={project.id}
                className="transform transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1"
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                <div className="w-full">
                  <ProjectCard project={project} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Add custom CSS for animations
const styles = `
  @keyframes fade-in-up {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-fade-in-up {
    animation: fade-in-up 0.6s ease-out;
  }
`;

if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default StarredPage;
