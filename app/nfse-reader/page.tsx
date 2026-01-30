"use client";

import * as React from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/lib/store";
import { toast } from "sonner";
import { Upload, FileText, CheckCircle2, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { NFSeResult } from "@/lib/types";

export default function NFSeReaderPage() {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [xmlContent, setXmlContent] = React.useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [currentResult, setCurrentResult] = React.useState<NFSeResult | null>(null);

  const { nfseResults, addNFSeResult } = useAppStore();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".xml")) {
      toast.error("Por favor, selecione um arquivo XML.");
      return;
    }

    setSelectedFile(file);
    setCurrentResult(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setXmlContent(content);
    };
    reader.readAsText(file);
  };

  const handleClear = () => {
    setSelectedFile(null);
    setXmlContent(null);
    setCurrentResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleParse = async () => {
    if (!xmlContent || !selectedFile) return;

    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/audit/nfse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          xmlContent,
          filename: selectedFile.name,
        }),
      });

      if (!response.ok) {
        throw new Error("Falha ao processar NFS-e");
      }

      const data = await response.json();
      const result: NFSeResult = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        filename: selectedFile.name,
        ...data.result,
      };

      setCurrentResult(result);
      addNFSeResult(result);

      toast.success("NFS-e processada com sucesso!");
    } catch {
      toast.error("Falha ao processar XML da NFS-e. Verifique o formato do arquivo.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="flex min-h-screen">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <main className="flex-1 md:ml-64">
        <Header
          title="Leitor de XML NFS-e"
          description="Interpretar documentos NFS-e brasileiros"
        />
        <div className="p-4 md:p-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
            {/* Main Content */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Carregar XML</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xml"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  {selectedFile ? (
                    <div className="rounded-lg border border-border bg-muted/50 p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-medium">
                            {selectedFile.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {(selectedFile.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleClear}
                          disabled={isAnalyzing}
                        >
                          Remover
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex w-full flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-border bg-muted/30 px-6 py-12 text-center transition-colors hover:border-primary/50 hover:bg-muted/50"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <Upload className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Carregar XML NFS-e</p>
                        <p className="text-xs text-muted-foreground">
                          Clique para selecionar ou arraste e solte
                        </p>
                      </div>
                    </button>
                  )}

                  {selectedFile && !isAnalyzing && !currentResult && (
                    <Button onClick={handleParse} className="w-full">
                      Processar NFS-e
                    </Button>
                  )}

                  {isAnalyzing && (
                    <div className="flex items-center justify-center gap-2 py-4">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      <span className="text-sm">Analisando XML...</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Results */}
              {currentResult && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Dados Processados</CardTitle>
                      <Badge className="bg-success text-success-foreground">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Sucesso
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-lg bg-muted p-4">
                      <pre className="overflow-x-auto text-xs">
                        {JSON.stringify(
                          {
                            invoice_number: currentResult.invoice_number,
                            issue_date: currentResult.issue_date,
                            provider_name: currentResult.provider_name,
                            client_name: currentResult.client_name,
                            service_description: currentResult.service_description,
                            total_value: currentResult.total_value,
                            tax_value: currentResult.tax_value,
                            city: currentResult.city,
                          },
                          null,
                          2
                        )}
                      </pre>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Numero da Nota</p>
                        <p className="text-sm font-medium">{currentResult.invoice_number}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Data de Emissao</p>
                        <p className="text-sm font-medium">{currentResult.issue_date}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Prestador</p>
                        <p className="text-sm font-medium">{currentResult.provider_name}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Tomador</p>
                        <p className="text-sm font-medium">{currentResult.client_name}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Valor Total</p>
                        <p className="text-sm font-semibold text-primary">
                          {formatCurrency(currentResult.total_value)}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Imposto (ISS)</p>
                        <p className="text-sm font-medium">
                          {formatCurrency(currentResult.tax_value)}
                        </p>
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <p className="text-xs text-muted-foreground">Cidade</p>
                        <p className="text-sm font-medium">{currentResult.city}</p>
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <p className="text-xs text-muted-foreground">Descricao do Servico</p>
                        <p className="text-sm">{currentResult.service_description}</p>
                      </div>
                    </div>

                    <div className="rounded-lg bg-muted p-4">
                      <p className="text-sm font-medium text-muted-foreground">Resumo</p>
                      <p className="mt-1 text-sm">{currentResult.raw_summary}</p>
                    </div>

                    <Button onClick={handleClear} variant="outline" className="w-full bg-transparent">
                      Processar Outra
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* History Sidebar */}
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-muted-foreground">
                Processamentos Recentes
              </h2>
              {nfseResults.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                    <p className="text-sm text-muted-foreground">
                      Nenhum resultado ainda. Carregue um XML para comecar.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <ScrollArea className="h-[calc(100vh-220px)]">
                  <div className="space-y-4 pr-4">
                    {nfseResults.map((result) => (
                      <Card key={result.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium truncate max-w-[150px]">
                                {result.filename}
                              </span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {formatCurrency(result.total_value)}
                            </Badge>
                          </div>
                          <p className="mt-2 text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(result.timestamp), { addSuffix: true })}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground truncate">
                            {result.provider_name}
                          </p>
                        </CardContent>
                      </Card>
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
