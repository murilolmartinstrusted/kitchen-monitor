"use client";

import * as React from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { CameraCapture } from "@/components/audit/camera-capture";
import { ResultBadge } from "@/components/audit/result-badge";
import { HistoryCard } from "@/components/audit/history-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAppStore } from "@/lib/store";
import { toast } from "sonner";
import type { CleaningAuditResult } from "@/lib/types";

export default function CleaningAuditPage() {
  const [capturedImage, setCapturedImage] = React.useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [currentResult, setCurrentResult] = React.useState<CleaningAuditResult | null>(null);

  const { cleaningAudits, addCleaningAudit } = useAppStore();

  const handleCapture = (imageData: string) => {
    setCapturedImage(imageData);
    setCurrentResult(null);
  };

  const handleClear = () => {
    setCapturedImage(null);
    setCurrentResult(null);
  };

  const handleAnalyze = async () => {
    if (!capturedImage) return;

    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/audit/cleaning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageData: capturedImage }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze cleaning");
      }

      const data = await response.json();
      const result: CleaningAuditResult = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        imageData: capturedImage,
        ...data.result,
      };

      setCurrentResult(result);
      addCleaningAudit(result);

      toast.success(
        result.score >= 70
          ? "Station passes cleanliness check!"
          : "Station needs attention. Review findings."
      );
    } catch {
      toast.error("Failed to analyze cleaning. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return "bg-success";
    if (score >= 40) return "bg-warning";
    return "bg-destructive";
  };

  return (
    <div className="flex min-h-screen">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <main className="flex-1 md:ml-64">
        <Header
          title="Cleaning Checklist Audit"
          description="Evaluate kitchen station cleanliness"
        />
        <div className="p-4 md:p-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
            {/* Main Content */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Capture Station</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CameraCapture
                    onCapture={handleCapture}
                    onClear={handleClear}
                    capturedImage={capturedImage}
                    isAnalyzing={isAnalyzing}
                    frameGuide="area"
                  />
                  {capturedImage && !isAnalyzing && !currentResult && (
                    <Button onClick={handleAnalyze} className="w-full">
                      Analyze Cleaning
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Results */}
              {currentResult && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Analysis Result</CardTitle>
                      <div className="text-right">
                        <p className="text-2xl font-bold">{currentResult.score}</p>
                        <p className="text-xs text-muted-foreground">Score</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Score Progress */}
                    <div className="space-y-2">
                      <Progress
                        value={currentResult.score}
                        className="h-3"
                        indicatorClassName={getScoreColor(currentResult.score)}
                      />
                      <p className="text-xs text-muted-foreground">
                        {currentResult.score >= 70
                          ? "Good cleanliness level"
                          : currentResult.score >= 40
                            ? "Needs improvement"
                            : "Immediate attention required"}
                      </p>
                    </div>

                    {/* Checklist */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium">Checklist</h4>
                      <div className="grid gap-3">
                        <ResultBadge
                          value={currentResult.counter_clean}
                          label="Counter Clean"
                        />
                        <ResultBadge
                          value={currentResult.trash_full}
                          label="Trash Full"
                          invertColors
                        />
                        <ResultBadge
                          value={currentResult.floor_dirty}
                          label="Floor Dirty"
                          invertColors
                        />
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="rounded-lg bg-muted p-4">
                      <p className="text-sm font-medium text-muted-foreground">
                        Notes
                      </p>
                      <p className="mt-1 text-sm">{currentResult.notes}</p>
                    </div>

                    <Button
                      onClick={handleClear}
                      variant="outline"
                      className="w-full bg-transparent"
                    >
                      New Audit
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* History Sidebar */}
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-muted-foreground">
                Recent Audits
              </h2>
              {cleaningAudits.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                    <p className="text-sm text-muted-foreground">
                      No audits yet. Capture a station to begin.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <ScrollArea className="h-[calc(100vh-220px)]">
                  <div className="space-y-4 pr-4">
                    {cleaningAudits.map((audit) => (
                      <HistoryCard
                        key={audit.id}
                        title="Cleaning Audit"
                        timestamp={audit.timestamp}
                        imageData={audit.imageData}
                        score={audit.score}
                        notes={audit.notes}
                      />
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
