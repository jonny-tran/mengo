"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { ExternalLink, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AppItem {
  id: string;
  name: string;
  description: string;
  url: string;
}

export function AppCard({ app }: { app: AppItem }) {
  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all duration-300",
        "hover:shadow-2xl hover:-translate-y-1",
        "border-primary/20 hover:border-primary/40",
        "bg-gradient-to-br from-indigo-500/20 via-indigo-400/15 to-violet-500/20",
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

      {/* Shine effect */}
      <div
        className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
        }}
      />

      <CardHeader className="relative z-10">
        <div className="flex items-start justify-between gap-3 mb-2">
          <CardTitle className="text-lg font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2 flex-1">
            {app.name}
          </CardTitle>
          <Globe className="h-5 w-5 shrink-0 mt-0.5 text-indigo-600 dark:text-indigo-400 transition-transform duration-300 group-hover:scale-110" />
        </div>
        <CardDescription className="text-sm leading-relaxed line-clamp-2">
          {app.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="relative z-10">
        <Link
          href={app.url}
          className={cn(
            "inline-flex items-center gap-2 text-sm font-medium",
            "text-primary hover:text-primary/80 transition-colors",
            "group/link"
          )}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="truncate max-w-[200px]">{app.url}</span>
          <ExternalLink className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
        </Link>
      </CardContent>
    </Card>
  );
}

export default AppCard;
