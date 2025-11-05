"use client";

import { FolderSearch } from "lucide-react";

export function EmptyState({
  message = "You have no tasks assigned.",
  Icon = FolderSearch,
}: {
  message?: string;
  Icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
      <Icon className="h-16 w-16 mb-4" />
      <p className="text-lg">{message}</p>
    </div>
  );
}

export default EmptyState;


