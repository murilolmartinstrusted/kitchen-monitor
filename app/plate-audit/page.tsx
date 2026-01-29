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
import type { PlateAuditResult } from "@/lib/types";

export default function PlateAuditPage() {
  const [capturedImage, setCapturedImage] = React.useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [currentResult, setCurrentResult] = React.useState<PlateAuditResult | null>(null);

  const { plateAudits, addPlateAudit } = useAppStore();

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
      const response = await fetch("/api/audit/plate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageData: capturedImage }),
      });

      if (!response.ok) {
        throw new Error("Falha ao analisar prato");
      }

      const data = await response.json();
      const result: PlateAuditResult = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        imageData: capturedImage,
        ...data.result,
      };

      setCurrentResult(result);
      addPlateAudit(result);

      toast.success(
        result.compliant
          ? "Prato em conformidade!"
          : "Prato nao conforme. Verifique itens faltando."
      );
    } catch {
      toast.error("Falha ao analisar prato. Tente novamente.");
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
          title="Auditoria de Montagem de Pratos"
          description="Verificar se o prato de sanduiche contem os ingredientes necessarios"
        />
        <div className="p-4 md:p-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
            {/* Main Content */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Capturar Prato</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CameraCapture
                    onCapture={handleCapture}
                    onClear={handleClear}
                    capturedImage={capturedImage}
                    isAnalyzing={isAnalyzing}
                    frameGuide="plate"
                  />
                  {capturedImage && !isAnalyzing && !currentResult && (
                    <Button onClick={handleAnalyze} className="w-full">
                      Analisar Prato
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Results */}
              {currentResult && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Resultado da Analise</CardTitle>
                      <ComplianceBadge compliant={currentResult.compliant} />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      <ResultBadge value={currentResult.bread} label="Pao" />
                      <ResultBadge value={currentResult.meat} label="Carne" />
                      <ResultBadge value={currentResult.cheese} label="Queijo" />
                    </div>
                    <div className="rounded-lg bg-muted p-4">
                      <p className="text-sm font-medium text-muted-foreground">
                        Observacoes
                      </p>
                      <p className="mt-1 text-sm">{currentResult.notes}</p>
                    </div>
                    <Button
                      onClick={handleClear}
                      variant="outline"
                      className="w-full bg-transparent"
                    >
                      Nova Auditoria
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* History Sidebar */}
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-muted-foreground">
                Auditorias Recentes
              </h2>
              {plateAudits.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                    <p className="text-sm text-muted-foreground">
                      Nenhuma auditoria ainda. Capture um prato para comecar.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <ScrollArea className="h-[calc(100vh-220px)]">
                  <div className="space-y-4 pr-4">
                    {plateAudits.map((audit) => (
                      <HistoryCard
                        key={audit.id}
                        title="Auditoria de Prato"
                        timestamp={audit.timestamp}
                        imageData={audit.imageData}
                        compliant={audit.compliant}
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
