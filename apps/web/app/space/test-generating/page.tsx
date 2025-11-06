"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Generating } from "@/components/space/generating/generating";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function TestGeneratingPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [briefContent, setBriefContent] = useState(
    "Build a mini e-commerce platform to sell mugs with cart and checkout functionality"
  );

  const handleTest = () => {
    setIsGenerating(true);

    // Simulate generation process (will auto-close after some time)
    setTimeout(() => {
      setIsGenerating(false);
    }, 15000); // 15 seconds for demo
  };

  return (
    <div className="min-h-screen bg-background page-gradient-bg p-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold gradient-title">
            Test Generating Component
          </h1>
          <p className="text-muted-foreground">
            Trang này để test giao diện component Generating
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Test Controls</CardTitle>
            <CardDescription>
              Nhập brief và nhấn nút để xem component Generating
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Nhập project brief của bạn..."
              value={briefContent}
              onChange={(e) => setBriefContent(e.target.value)}
              className="min-h-24"
            />
            <div className="flex gap-2">
              <Button onClick={handleTest} disabled={isGenerating}>
                {isGenerating ? "Đang test..." : "Bắt đầu test"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsGenerating(false)}
                disabled={!isGenerating}
              >
                Dừng test
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hướng dẫn</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              • Component sẽ hiển thị dialog overlay khi isGenerating = true
            </p>
            <p>• Progress bar sẽ tự động tăng dần</p>
            <p>• Các steps sẽ tự động chuyển từ pending → active → completed</p>
            <p>• Tips sẽ xuất hiện ngẫu nhiên mỗi 3 giây</p>
            <p>
              • Component không thể đóng bằng cách click outside
              (showCloseButton = false)
            </p>
          </CardContent>
        </Card>

        {/* Generating Component */}
        <Generating open={isGenerating} briefContent={briefContent} />
      </div>
    </div>
  );
}
