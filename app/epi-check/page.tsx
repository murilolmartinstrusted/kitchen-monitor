"use client";

import * as React from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { CameraCapture } from "@/components/audit/camera-capture";
import { ComplianceBadge } from "@/components/audit/compliance-badge";
import { ResultBadge } from "@/components/audit/result-badge";
import { HistoryCard } from "@/components/audit/history-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAppStore } from "@/lib/store";
import { toast } from "sonner";
import type { EPICheckResult } from "@/lib/types";

export default function EPICheckPage() {
  const [capturedImage, setCapturedImage] = React.useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [currentResult, setCurrentResult] = React.useState<EPICheckResult | null>(null);

  const { epiChecks, addEPICheck } = useAppStore();

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
      const response = await fetch("/api/audit/epi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageData: capturedImage }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze EPI");
      }

      const data = await response.json();
      const result: EPICheckResult = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        imageData: capturedImage,
        ...data.result,
      };

      setCurrentResult(result);
      addEPICheck(result);

      toast.success(
        result.compliant
          ? "Operator is compliant with EPI requirements!"
          : "Operator is non-compliant. Review missing items."
      );
    } catch {
      toast.error("Failed to analyze EPI compliance. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <main className="flex-1 md:ml-64">
        <Header
          title="EPI Compliance Check"
          description="Verify operator hygiene equipment"
        />
        <div className="p-4 md:p-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
            {/* Main Content */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Capture Operator</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CameraCapture
                    onCapture={handleCapture}
                    onClear={handleClear}
                    capturedImage={capturedImage}
                    isAnalyzing={isAnalyzing}
                    frameGuide="person"
                  />
                  {capturedImage && !isAnalyzing && !currentResult && (
                    <Button onClick={handleAnalyze} className="w-full">
                      Check Operator
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Results */}
              {currentResult && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Compliance Result</CardTitle>
                      <ComplianceBadge compliant={currentResult.compliant} />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium">Required Equipment</h4>
                      <div className="grid gap-3">
                        <ResultBadge value={currentResult.hairnet} label="Hairnet" />
                        <ResultBadge value={currentResult.gloves} label="Gloves" />
                        <ResultBadge value={currentResult.apron} label="Apron" />
                      </div>
                    </div>
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
                      New Check
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* History Sidebar */}
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-muted-foreground">
                Recent Checks
              </h2>
              {epiChecks.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                    <p className="text-sm text-muted-foreground">
                      No checks yet. Capture an operator to begin.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <ScrollArea className="h-[calc(100vh-220px)]">
                  <div className="space-y-4 pr-4">
                    {epiChecks.map((check) => (
                      <HistoryCard
                        key={check.id}
                        title="EPI Check"
                        timestamp={check.timestamp}
                        imageData={check.imageData}
                        compliant={check.compliant}
                        notes={check.notes}
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
