"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

export interface AppItem {
  id: string;
  name: string;
  description: string;
  url: string;
}

export function AppCard({ app }: { app: AppItem }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{app.name}</CardTitle>
        <CardDescription>{app.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Link
          href={app.url}
          className="inline-flex items-center gap-1 text-primary hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          {app.url}
          <ExternalLink className="h-4 w-4" />
        </Link>
      </CardContent>
    </Card>
  );
}

export default AppCard;


