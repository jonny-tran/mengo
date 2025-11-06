"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CheckCircle2, AlertTriangle, TrendingUp } from "lucide-react";

export interface SprintOverviewItem {
  id: string;
  sprintName: string;
  progress: number; // 0-100
  status: "On Track" | "At Risk" | "Completed";
}

const statusConfig = {
  "On Track": {
    icon: TrendingUp,
    gradient: "from-green-500/20 via-green-400/15 to-emerald-500/20",
    borderColor: "border-green-500/30",
    badgeClass:
      "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/30",
    progressColor: "bg-green-500",
  },
  "At Risk": {
    icon: AlertTriangle,
    gradient: "from-red-500/20 via-red-400/15 to-rose-500/20",
    borderColor: "border-red-500/30",
    badgeClass:
      "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30",
    progressColor: "bg-red-500",
  },
  Completed: {
    icon: CheckCircle2,
    gradient: "from-blue-500/20 via-blue-400/15 to-cyan-500/20",
    borderColor: "border-blue-500/30",
    badgeClass:
      "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30",
    progressColor: "bg-blue-500",
  },
};

export function SprintSummaryCard({ sprint }: { sprint: SprintOverviewItem }) {
  const config = statusConfig[sprint.status];
  const StatusIcon = config.icon;

  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all duration-300",
        "hover:shadow-xl hover:-translate-y-0.5",
        "border-primary/20 hover:border-primary/40",
        "bg-gradient-to-br",
        config.gradient,
        "backdrop-blur-sm"
      )}
    >
      {/* Gradient overlay on hover */}
      <div
        className={cn(
          "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
          "bg-gradient-to-br from-primary/10 via-transparent to-secondary/10"
        )}
      />

      <CardContent className="relative z-10 py-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3 mb-3">
              <StatusIcon
                className={cn(
                  "h-5 w-5 shrink-0 transition-transform duration-300 group-hover:scale-110",
                  config.badgeClass.replace("bg-", "text-").replace("/10", "")
                )}
              />
              <p className="font-semibold text-base leading-tight truncate group-hover:text-primary transition-colors">
                {sprint.sprintName}
              </p>
            </div>
            <Badge
              variant="outline"
              className={cn(
                "text-xs font-semibold transition-all duration-200",
                "group-hover:scale-105",
                config.badgeClass
              )}
            >
              {sprint.status}
            </Badge>
          </div>
          <div className="w-full sm:w-[280px] space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span className="font-semibold">{sprint.progress}%</span>
            </div>
            <div className="relative h-2.5 w-full bg-background/50 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full transition-all duration-500 ease-out rounded-full",
                  config.progressColor,
                  "group-hover:shadow-lg"
                )}
                style={{ width: `${sprint.progress}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default SprintSummaryCard;
