"use client";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";

export interface SprintOverviewItem {
  id: string;
  sprintName: string;
  progress: number; // 0-100
  status: "On Track" | "At Risk" | "Completed";
}

export function SprintSummaryCard({ sprint }: { sprint: SprintOverviewItem }) {
  const statusVariant = sprint.status === "At Risk" ? "destructive" : "default";

  return (
    <Card className="w-full">
      <CardContent className="py-4">
        <div className="flex flex-row items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="font-medium leading-none truncate">{sprint.sprintName}</p>
            <div className="mt-2">
              <Badge variant={statusVariant as any}>{sprint.status}</Badge>
            </div>
          </div>
          <div className="w-[220px]">
            <Progress value={sprint.progress} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default SprintSummaryCard;


