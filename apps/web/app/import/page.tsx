"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Upload, Download, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";

const CSV_TEMPLATE = `team_name,member_emails,instructor_email
Team Alpha,"alice@example.com;bob@example.com",inst1@example.com
Team Beta,"carol@example.com;dave@example.com",inst1@example.com`;

export default function ImportPage() {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [csvText, setCsvText] = useState("");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/import/csv", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to import CSV");
      }

      const result = await response.json();
      toast.success(`Successfully imported ${result.teamsCreated} team(s)`);

      if (result.errors && result.errors.length > 0) {
        toast.warning(`Some rows had errors: ${result.errors.join(", ")}`);
      }

      router.push("/instructor/dashboard");
    } catch (error) {
      console.error("Error importing CSV:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to import CSV"
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleTextImport = async () => {
    if (!csvText.trim()) {
      toast.error("Please paste CSV content");
      return;
    }

    setIsUploading(true);
    const blob = new Blob([csvText], { type: "text/csv" });
    const file = new File([blob], "import.csv", { type: "text/csv" });
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/import/csv", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to import CSV");
      }

      const result = await response.json();
      toast.success(`Successfully imported ${result.teamsCreated} team(s)`);

      if (result.errors && result.errors.length > 0) {
        toast.warning(`Some rows had errors: ${result.errors.join(", ")}`);
      }

      router.push("/instructor/dashboard");
    } catch (error) {
      console.error("Error importing CSV:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to import CSV"
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "team_roster_template.csv";
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Template downloaded");
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center gap-4">
          <Link href="/instructor/dashboard">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold mb-2">Import CSV Roster</h1>
            <p className="text-muted-foreground">
              Upload a CSV file to import teams and members
            </p>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>CSV Format</CardTitle>
            <CardDescription>
              CSV must have these columns: team_name, member_emails,
              instructor_email
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mb-4">
              <p className="text-sm text-muted-foreground">
                <strong>team_name:</strong> Name of the team
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>member_emails:</strong> Semicolon-separated list of
                member emails
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>instructor_email:</strong> Email of the instructor
              </p>
            </div>
            <Button variant="outline" onClick={handleDownloadTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Upload CSV File</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Select CSV file
                </label>
                <Input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                />
              </div>
              <div className="text-center text-sm text-muted-foreground">
                OR
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Paste CSV content
                </label>
                <Textarea
                  placeholder={CSV_TEMPLATE}
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  className="min-h-32 font-mono text-xs"
                  disabled={isUploading}
                />
                <Button
                  onClick={handleTextImport}
                  disabled={isUploading || !csvText.trim()}
                  className="mt-2"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isUploading ? "Importing..." : "Import from Text"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sample CSV</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-muted p-4 rounded-md overflow-x-auto">
              {CSV_TEMPLATE}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
