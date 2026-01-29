"use client";

import * as React from "react";
import Link from "next/link";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAppStore } from "@/lib/store";
import {
  UtensilsCrossed,
  SprayCanIcon,
  HardHat,
  FileText,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Activity,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

export default function DashboardPage() {
  const [mounted, setMounted] = React.useState(false);
  const { plateAudits, cleaningAudits, epiChecks, nfseResults } = useAppStore();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate metrics
  const totalAnalyses = plateAudits.length + cleaningAudits.length + epiChecks.length + nfseResults.length;
  
  const plateCompliant = plateAudits.filter((a) => a.compliant).length;
  const epiCompliant = epiChecks.filter((c) => c.compliant).length;
  const totalCompliance = plateAudits.length + epiChecks.length;
  const complianceRate = totalCompliance > 0 
    ? Math.round(((plateCompliant + epiCompliant) / totalCompliance) * 100)
    : 0;

  const avgCleaningScore = cleaningAudits.length
    ? Math.round(cleaningAudits.reduce((sum, a) => sum + a.score, 0) / cleaningAudits.length)
    : 0;

  const plateFailures = plateAudits.filter((a) => !a.compliant).length;

  // Plate Audit - Items missing breakdown
  const plateItemsData = [
    { 
      name: "Pao", 
      presente: plateAudits.filter(a => a.bread === true).length,
      ausente: plateAudits.filter(a => a.bread === false).length,
    },
    { 
      name: "Carne", 
      presente: plateAudits.filter(a => a.meat === true).length,
      ausente: plateAudits.filter(a => a.meat === false).length,
    },
    { 
      name: "Queijo", 
      presente: plateAudits.filter(a => a.cheese === true).length,
      ausente: plateAudits.filter(a => a.cheese === false).length,
    },
  ];

  // Cleaning Audit - Issues breakdown
  const cleaningIssuesData = [
    { 
      name: "Balcao Sujo", 
      value: cleaningAudits.filter(a => a.counter_clean === false).length,
    },
    { 
      name: "Lixo Cheio", 
      value: cleaningAudits.filter(a => a.trash_full === true).length,
    },
    { 
      name: "Chao Sujo", 
      value: cleaningAudits.filter(a => a.floor_dirty === true).length,
    },
  ].filter(d => d.value > 0);

  // EPI Check - Equipment missing breakdown  
  const epiEquipmentData = [
    { 
      name: "Touca", 
      conforme: epiChecks.filter(c => c.hairnet === true).length,
      faltando: epiChecks.filter(c => c.hairnet === false).length,
    },
    { 
      name: "Luvas", 
      conforme: epiChecks.filter(c => c.gloves === true).length,
      faltando: epiChecks.filter(c => c.gloves === false).length,
    },
    { 
      name: "Avental", 
      conforme: epiChecks.filter(c => c.apron === true).length,
      faltando: epiChecks.filter(c => c.apron === false).length,
    },
  ];

  // NFS-e - Financial summary
  const totalNfseValue = nfseResults.reduce((sum, r) => sum + r.total_value, 0);
  const totalTaxValue = nfseResults.reduce((sum, r) => sum + r.tax_value, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Score distribution for cleaning audits
  const scoreRanges = [
    { range: "0-40", count: cleaningAudits.filter(a => a.score < 40).length, fill: "hsl(var(--destructive))" },
    { range: "40-70", count: cleaningAudits.filter(a => a.score >= 40 && a.score < 70).length, fill: "hsl(var(--warning))" },
    { range: "70-100", count: cleaningAudits.filter(a => a.score >= 70).length, fill: "hsl(var(--success))" },
  ];

  const recentActivity = [
    ...plateAudits.slice(0, 5).map((a) => ({
      type: "plate" as const,
      timestamp: a.timestamp,
      compliant: a.compliant,
      title: "Auditoria de Prato",
      summary: a.compliant ? "Todos os itens presentes" : "Itens faltando detectados",
    })),
    ...cleaningAudits.slice(0, 5).map((a) => ({
      type: "cleaning" as const,
      timestamp: a.timestamp,
      score: a.score,
      title: "Auditoria de Limpeza",
      summary: `Pontuacao: ${a.score}/100`,
    })),
    ...epiChecks.slice(0, 5).map((c) => ({
      type: "epi" as const,
      timestamp: c.timestamp,
      compliant: c.compliant,
      title: "Verificacao de EPI",
      summary: c.compliant ? "Totalmente em conformidade" : "Equipamento faltando",
    })),
    ...nfseResults.slice(0, 5).map((r) => ({
      type: "nfse" as const,
      timestamp: r.timestamp,
      filename: r.filename,
      title: "NFS-e Processada",
      summary: r.filename,
    })),
  ]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);

  const barChartData = [
    { name: "Auditorias de Pratos", total: plateAudits.length, compliant: plateCompliant },
    { name: "Auditorias de Limpeza", total: cleaningAudits.length, compliant: cleaningAudits.filter(a => a.compliant).length },
    { name: "Verificacoes de EPI", total: epiChecks.length, compliant: epiCompliant },
    { name: "NFS-e", total: nfseResults.length, compliant: nfseResults.length }, // Assuming all NFS-e results are compliant for simplicity
  ];

  const pieChartData = [
    { name: "Auditorias de Pratos", value: plateAudits.length },
    { name: "Auditorias de Limpeza", value: cleaningAudits.length },
    { name: "Verificacoes de EPI", value: epiChecks.length },
    { name: "NFS-e", value: nfseResults.length },
  ];

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <main className="flex-1 md:ml-64">
        <Header
          title="Painel"
          description="Visao geral de inteligencia operacional com IA"
        />
        <div className="p-4 md:p-6 space-y-6">
          {/* Key Metrics */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {/* Total Analyses */}
            <Card className="relative overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total de Analises
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{totalAnalyses}</span>
                  <Activity className="h-5 w-5 text-primary" />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Todos os tipos de auditoria
                </p>
              </CardContent>
            </Card>

            {/* Compliance Rate */}
            <Card className="relative overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Taxa de Conformidade
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{complianceRate}%</span>
                  <TrendingUp className="h-5 w-5 text-success" />
                </div>
                <Progress value={complianceRate} className="mt-2 h-2" indicatorClassName="bg-success" />
              </CardContent>
            </Card>

            {/* Cleaning Score */}
            <Card className="relative overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pontuacao Media Limpeza
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{avgCleaningScore}</span>
                  <span className="text-lg text-muted-foreground">/100</span>
                </div>
                <Progress 
                  value={avgCleaningScore} 
                  className="mt-2 h-2" 
                  indicatorClassName={avgCleaningScore >= 70 ? "bg-success" : avgCleaningScore >= 40 ? "bg-warning" : "bg-destructive"} 
                />
              </CardContent>
            </Card>

            {/* EPI Compliance */}
            <Card className="relative overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Conformidade EPI
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">
                    {epiChecks.length > 0 ? Math.round((epiCompliant / epiChecks.length) * 100) : 0}%
                  </span>
                  <HardHat className="h-5 w-5 text-chart-3" />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {epiCompliant}/{epiChecks.length} verificacoes aprovadas
                </p>
              </CardContent>
            </Card>

            {/* Plate Failures */}
            <Card className="relative overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Falhas em Pratos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className={`text-3xl font-bold ${plateFailures > 0 ? "text-destructive" : ""}`}>
                    {plateFailures}
                  </span>
                  {plateFailures > 0 && <AlertTriangle className="h-5 w-5 text-destructive" />}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {plateAudits.length > 0 ? `${Math.round((plateFailures / plateAudits.length) * 100)}% taxa de falha` : "Nenhuma auditoria ainda"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Module-Specific Charts */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Plate Audit - Ingredients Analysis */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <UtensilsCrossed className="h-5 w-5 text-chart-1" />
                  <CardTitle className="text-base">Auditoria de Pratos - Ingredientes</CardTitle>
                </div>
                <CardDescription>Presenca de ingredientes nas auditorias</CardDescription>
              </CardHeader>
              <CardContent>
                {plateAudits.length === 0 ? (
                  <div className="flex h-64 items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <UtensilsCrossed className="mx-auto h-12 w-12 opacity-50" />
                      <p className="mt-2">Sem auditorias de pratos ainda.</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={plateItemsData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                        <YAxis dataKey="name" type="category" tick={{ fill: "hsl(var(--muted-foreground))" }} width={60} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "var(--radius)",
                          }}
                        />
                        <Bar dataKey="presente" fill="hsl(var(--success))" name="Presente" stackId="a" radius={[0, 4, 4, 0]} />
                        <Bar dataKey="ausente" fill="hsl(var(--destructive))" name="Ausente" stackId="a" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Cleaning Audit - Issues & Score */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <SprayCanIcon className="h-5 w-5 text-chart-2" />
                  <CardTitle className="text-base">Auditoria de Limpeza - Problemas</CardTitle>
                </div>
                <CardDescription>Distribuicao de pontuacoes e problemas encontrados</CardDescription>
              </CardHeader>
              <CardContent>
                {cleaningAudits.length === 0 ? (
                  <div className="flex h-64 items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <SprayCanIcon className="mx-auto h-12 w-12 opacity-50" />
                      <p className="mt-2">Sem auditorias de limpeza ainda.</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-64 flex flex-col gap-4">
                    {/* Score Distribution */}
                    <div className="flex-1">
                      <p className="text-xs font-medium text-muted-foreground mb-2">Distribuicao de Pontuacao</p>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={scoreRanges}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                          <XAxis dataKey="range" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                          <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "var(--radius)",
                            }}
                          />
                          <Bar dataKey="count" name="Auditorias" radius={[4, 4, 0, 0]}>
                            {scoreRanges.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    {/* Issues Legend */}
                    {cleaningIssuesData.length > 0 && (
                      <div className="flex flex-wrap gap-3 text-xs">
                        {cleaningIssuesData.map((issue, i) => (
                          <div key={i} className="flex items-center gap-1">
                            <div className="h-2 w-2 rounded-full bg-destructive" />
                            <span>{issue.name}: {issue.value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* EPI Check - Equipment Analysis */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <HardHat className="h-5 w-5 text-chart-3" />
                  <CardTitle className="text-base">Verificacao de EPI - Equipamentos</CardTitle>
                </div>
                <CardDescription>Conformidade por tipo de equipamento</CardDescription>
              </CardHeader>
              <CardContent>
                {epiChecks.length === 0 ? (
                  <div className="flex h-64 items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <HardHat className="mx-auto h-12 w-12 opacity-50" />
                      <p className="mt-2">Sem verificacoes de EPI ainda.</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={epiEquipmentData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                        <YAxis dataKey="name" type="category" tick={{ fill: "hsl(var(--muted-foreground))" }} width={60} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "var(--radius)",
                          }}
                        />
                        <Bar dataKey="conforme" fill="hsl(var(--success))" name="Conforme" stackId="a" radius={[0, 4, 4, 0]} />
                        <Bar dataKey="faltando" fill="hsl(var(--destructive))" name="Faltando" stackId="a" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* NFS-e - Financial Summary */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-chart-4" />
                  <CardTitle className="text-base">Leitor NFS-e - Resumo Financeiro</CardTitle>
                </div>
                <CardDescription>Total de notas processadas e valores</CardDescription>
              </CardHeader>
              <CardContent>
                {nfseResults.length === 0 ? (
                  <div className="flex h-64 items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <FileText className="mx-auto h-12 w-12 opacity-50" />
                      <p className="mt-2">Sem notas fiscais processadas ainda.</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-64 flex flex-col justify-center gap-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-lg bg-muted p-4 text-center">
                        <p className="text-xs text-muted-foreground">Notas Processadas</p>
                        <p className="text-2xl font-bold text-chart-4">{nfseResults.length}</p>
                      </div>
                      <div className="rounded-lg bg-muted p-4 text-center">
                        <p className="text-xs text-muted-foreground">Prestadores</p>
                        <p className="text-2xl font-bold text-chart-4">
                          {new Set(nfseResults.map(r => r.provider_name)).size}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-lg bg-primary/10 p-4 text-center">
                        <p className="text-xs text-muted-foreground">Valor Total</p>
                        <p className="text-xl font-bold text-primary">{formatCurrency(totalNfseValue)}</p>
                      </div>
                      <div className="rounded-lg bg-destructive/10 p-4 text-center">
                        <p className="text-xs text-muted-foreground">Total ISS</p>
                        <p className="text-xl font-bold text-destructive">{formatCurrency(totalTaxValue)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Recent Activity */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Acoes Rapidas</CardTitle>
                <CardDescription>Inicie uma nova auditoria ou processe documentos</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                <Button asChild variant="outline" className="justify-start h-auto py-4 bg-transparent">
                  <Link href="/plate-audit">
                    <UtensilsCrossed className="mr-3 h-5 w-5 text-chart-1" />
                    <div className="text-left">
                      <p className="font-medium">Auditoria de Pratos</p>
                      <p className="text-xs text-muted-foreground">
                        Verificar ingredientes
                      </p>
                    </div>
                    <ArrowRight className="ml-auto h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="justify-start h-auto py-4 bg-transparent">
                  <Link href="/cleaning-audit">
                    <SprayCanIcon className="mr-3 h-5 w-5 text-chart-2" />
                    <div className="text-left">
                      <p className="font-medium">Auditoria de Limpeza</p>
                      <p className="text-xs text-muted-foreground">
                        Verificar limpeza
                      </p>
                    </div>
                    <ArrowRight className="ml-auto h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="justify-start h-auto py-4 bg-transparent">
                  <Link href="/epi-check">
                    <HardHat className="mr-3 h-5 w-5 text-chart-3" />
                    <div className="text-left">
                      <p className="font-medium">Verificacao de EPI</p>
                      <p className="text-xs text-muted-foreground">
                        Verificar equipamentos
                      </p>
                    </div>
                    <ArrowRight className="ml-auto h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="justify-start h-auto py-4 bg-transparent">
                  <Link href="/nfse-reader">
                    <FileText className="mr-3 h-5 w-5 text-chart-4" />
                    <div className="text-left">
                      <p className="font-medium">Leitor NFS-e</p>
                      <p className="text-xs text-muted-foreground">
                        Processar notas fiscais
                      </p>
                    </div>
                    <ArrowRight className="ml-auto h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Atividade Recente</CardTitle>
                <CardDescription>Ultimos resultados de auditorias e analises</CardDescription>
              </CardHeader>
              <CardContent>
                {recentActivity.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Activity className="h-10 w-10 text-muted-foreground/40" />
                    <p className="mt-3 text-sm text-muted-foreground">
                      Nenhuma atividade ainda
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Comece executando uma auditoria nas Acoes Rapidas
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                    {recentActivity.map((activity, index) => (
                      <div
                        key={`${activity.type}-${index}`}
                        className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
                      >
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                            activity.type === "plate"
                              ? "bg-chart-1/10"
                              : activity.type === "cleaning"
                                ? "bg-chart-2/10"
                                : activity.type === "epi"
                                  ? "bg-chart-3/10"
                                  : "bg-chart-4/10"
                          }`}
                        >
                          {activity.type === "plate" && (
                            <UtensilsCrossed className="h-4 w-4 text-chart-1" />
                          )}
                          {activity.type === "cleaning" && (
                            <SprayCanIcon className="h-4 w-4 text-chart-2" />
                          )}
                          {activity.type === "epi" && (
                            <HardHat className="h-4 w-4 text-chart-3" />
                          )}
                          {activity.type === "nfse" && (
                            <FileText className="h-4 w-4 text-chart-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{activity.title}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {activity.summary}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {"compliant" in activity && (
                            <div>
                              {activity.compliant ? (
                                <span className="inline-flex items-center gap-1 text-xs text-success">
                                  <CheckCircle2 className="h-4 w-4" />
                                  OK
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-xs text-destructive">
                                  <XCircle className="h-4 w-4" />
                                  Problema
                                </span>
                              )}
                            </div>
                          )}
                          {"score" in activity && (
                            <span
                              className={`text-xs font-medium ${
                                activity.score >= 70
                                  ? "text-success"
                                  : activity.score >= 40
                                    ? "text-yellow-500"
                                    : "text-destructive"
                              }`}
                            >
                              {activity.score}/100
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {new Date(activity.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
