"use client";

import * as React from "react";
import Link from "next/link";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { KitchenScoreCard } from "@/components/dashboard/kitchen-score-card";
import { AlertPanel } from "@/components/dashboard/alert-panel";
import { TimelinePanel } from "@/components/dashboard/timeline-panel";
import { ScoreTrendChart } from "@/components/dashboard/score-trend-chart";
import { CriticalBanner } from "@/components/dashboard/critical-banner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppStore, useKitchenScore } from "@/lib/store";
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
  PieChart,
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
  Legend,
  PieChart as RechartsPieChart,
  Pie,
  RadialBarChart,
  RadialBar,
  type TooltipProps,
} from "recharts";
import type { ValueType, NameType } from "recharts/types/component/DefaultTooltipContent";

// Custom tooltip for plate ingredients chart
const PlateTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    const presente = payload.find(p => p.dataKey === "Presente")?.value as number || 0;
    const ausente = payload.find(p => p.dataKey === "Ausente")?.value as number || 0;
    const total = presente + ausente;
    const percentPresente = total > 0 ? Math.round((presente / total) * 100) : 0;
    
    return (
      <div className="rounded-lg border bg-card p-3 shadow-lg">
        <p className="font-semibold text-sm mb-2">{label}</p>
        <div className="space-y-1 text-xs">
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              Presente
            </span>
            <span className="font-medium">{presente} ({percentPresente}%)</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              Ausente
            </span>
            <span className="font-medium">{ausente} ({100 - percentPresente}%)</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

// Custom tooltip for cleaning score chart
const CleaningTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    const value = payload[0]?.value as number || 0;
    const descriptions: Record<string, string> = {
      "Critico": "Pontuacao abaixo de 40 - Requer acao imediata",
      "Atencao": "Pontuacao entre 40-70 - Precisa melhorar",
      "Bom": "Pontuacao acima de 70 - Dentro do padrao",
    };
    
    return (
      <div className="rounded-lg border bg-card p-3 shadow-lg">
        <p className="font-semibold text-sm mb-1">{label}</p>
        <p className="text-xs text-muted-foreground mb-2">{descriptions[label as string]}</p>
        <p className="text-sm font-medium">{value} auditoria{value !== 1 ? 's' : ''}</p>
      </div>
    );
  }
  return null;
};

// Custom tooltip for EPI compliance chart
const EPITooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    const conforme = payload.find(p => p.dataKey === "Conforme")?.value as number || 0;
    const faltando = payload.find(p => p.dataKey === "Faltando")?.value as number || 0;
    const total = conforme + faltando;
    const percentConforme = total > 0 ? Math.round((conforme / total) * 100) : 0;
    
    const epiDescriptions: Record<string, string> = {
      "Touca": "Protecao capilar obrigatoria",
      "Luvas": "Luvas descartaveis para manipulacao",
      "Avental": "Avental ou jaleco de protecao",
    };
    
    return (
      <div className="rounded-lg border bg-card p-3 shadow-lg">
        <p className="font-semibold text-sm">{label}</p>
        <p className="text-xs text-muted-foreground mb-2">{epiDescriptions[label as string]}</p>
        <div className="space-y-1 text-xs">
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              Conforme
            </span>
            <span className="font-medium">{conforme} ({percentConforme}%)</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              Faltando
            </span>
            <span className="font-medium">{faltando} ({100 - percentConforme}%)</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const [mounted, setMounted] = React.useState(false);
  const {
    plateAudits,
    cleaningAudits,
    epiChecks,
    nfseResults,
    alerts,
    timeline,
  } = useAppStore();
  const kitchenScore = useKitchenScore();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate metrics
  const totalAnalyses =
    plateAudits.length +
    cleaningAudits.length +
    epiChecks.length +
    nfseResults.length;

  const plateCompliant = plateAudits.filter((a) => a.compliant).length;
  const epiCompliant = epiChecks.filter((c) => c.compliant).length;
  const totalCompliance = plateAudits.length + epiChecks.length;
  const complianceRate =
    totalCompliance > 0
      ? Math.round(((plateCompliant + epiCompliant) / totalCompliance) * 100)
      : 100;

  const avgCleaningScore = cleaningAudits.length
    ? Math.round(
        cleaningAudits.reduce((sum, a) => sum + a.score, 0) /
          cleaningAudits.length
      )
    : 0;

  // Plate Audit - Ingredients chart data
  const plateItemsData = [
    {
      name: "Pao",
      Presente: plateAudits.filter((a) => a.bread === true).length,
      Ausente: plateAudits.filter((a) => a.bread === false).length,
    },
    {
      name: "Carne",
      Presente: plateAudits.filter((a) => a.meat === true).length,
      Ausente: plateAudits.filter((a) => a.meat === false).length,
    },
    {
      name: "Queijo",
      Presente: plateAudits.filter((a) => a.cheese === true).length,
      Ausente: plateAudits.filter((a) => a.cheese === false).length,
    },
  ];

  // Cleaning Audit - Score distribution
  const scoreRanges = [
    {
      range: "Critico",
      quantidade: cleaningAudits.filter((a) => a.score < 40).length,
      fill: "#ef4444",
    },
    {
      range: "Atencao",
      quantidade: cleaningAudits.filter((a) => a.score >= 40 && a.score < 70)
        .length,
      fill: "#f59e0b",
    },
    {
      range: "Bom",
      quantidade: cleaningAudits.filter((a) => a.score >= 70).length,
      fill: "#22c55e",
    },
  ];

  // EPI Check - Equipment chart data
  const epiEquipmentData = [
    {
      name: "Touca",
      Conforme: epiChecks.filter((c) => c.hairnet === true).length,
      Faltando: epiChecks.filter((c) => c.hairnet === false).length,
    },
    {
      name: "Luvas",
      Conforme: epiChecks.filter((c) => c.gloves === true).length,
      Faltando: epiChecks.filter((c) => c.gloves === false).length,
    },
    {
      name: "Avental",
      Conforme: epiChecks.filter((c) => c.apron === true).length,
      Faltando: epiChecks.filter((c) => c.apron === false).length,
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

  // Compliance Pie Chart data
  const complianceData = [
    { name: "Conforme", value: plateCompliant + epiCompliant, fill: "#22c55e" },
    {
      name: "Nao Conforme",
      value: totalCompliance - (plateCompliant + epiCompliant),
      fill: "#ef4444",
    },
  ].filter((d) => d.value > 0);

  // EPI Radial gauge data
  const epiComplianceRate =
    epiChecks.length > 0
      ? Math.round((epiCompliant / epiChecks.length) * 100)
      : 0;
  const epiGaugeData = [
    {
      name: "EPI",
      value: epiComplianceRate,
      fill:
        epiComplianceRate >= 90
          ? "#22c55e"
          : epiComplianceRate >= 70
            ? "#f59e0b"
            : "#ef4444",
    },
  ];

  // Module quick actions
  const modules = [
    {
      title: "Auditoria de Pratos",
      description: "Verificar montagem de pratos",
      icon: UtensilsCrossed,
      href: "/plate-audit",
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      count: plateAudits.length,
    },
    {
      title: "Auditoria de Limpeza",
      description: "Verificar checklist de limpeza",
      icon: SprayCanIcon,
      href: "/cleaning-audit",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      count: cleaningAudits.length,
    },
    {
      title: "Verificacao de EPI",
      description: "Verificar equipamentos de protecao",
      icon: HardHat,
      href: "/epi-check",
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      count: epiChecks.length,
    },
    {
      title: "Leitor de NFS-e",
      description: "Processar notas fiscais",
      icon: FileText,
      href: "/nfse-reader",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      count: nfseResults.length,
    },
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
        {/* Critical Alert Banner */}
        <CriticalBanner />

        <Header
          title="Centro de Controle"
          description="Inteligencia operacional em tempo real"
        />

        <div className="p-4 md:p-6 space-y-6">
          {/* Hero Row: Kitchen Score + Quick Stats */}
          <div className="grid gap-4 lg:grid-cols-3">
            {/* Kitchen Score Hero Card */}
            <div className="lg:col-span-1">
              <KitchenScoreCard />
            </div>

            {/* Quick Stats */}
            <div className="lg:col-span-2 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Auditorias
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">{totalAnalyses}</span>
                    <Activity className="h-4 w-4 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Taxa Conformidade
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">{complianceRate}%</span>
                    <TrendingUp
                      className={`h-4 w-4 ${complianceRate >= 80 ? "text-green-500" : "text-yellow-500"}`}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Media Limpeza
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">{avgCleaningScore}</span>
                    <span className="text-sm text-muted-foreground">/100</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Alertas Ativos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">
                      {alerts.filter((a) => !a.read).length}
                    </span>
                    {alerts.filter((a) => !a.read && a.severity === "critical")
                      .length > 0 && (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column: Charts */}
            <div className="lg:col-span-2 space-y-6">
              {/* Score Trend */}
              <ScoreTrendChart />

              {/* Module Charts Grid */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* Plate Audit Chart */}
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <UtensilsCrossed className="h-5 w-5 text-orange-500" />
                      <CardTitle className="text-base">Ingredientes</CardTitle>
                    </div>
                    <CardDescription>Presenca por auditoria</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {plateAudits.length === 0 ? (
                      <div className="flex h-48 items-center justify-center text-muted-foreground">
                        <div className="text-center">
                          <UtensilsCrossed className="mx-auto h-10 w-10 opacity-30" />
                          <p className="mt-2 text-xs">Sem dados</p>
                        </div>
                      </div>
                    ) : (
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={plateItemsData} layout="vertical">
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="hsl(var(--border))"
                            />
                            <XAxis
                              type="number"
                              tick={{
                                fill: "hsl(var(--muted-foreground))",
                                fontSize: 10,
                              }}
                            />
                            <YAxis
                              dataKey="name"
                              type="category"
                              tick={{
                                fill: "hsl(var(--muted-foreground))",
                                fontSize: 10,
                              }}
                              width={45}
                            />
<Tooltip content={<PlateTooltip />} />
                                            <Legend wrapperStyle={{ fontSize: "10px" }} />
                                            <Bar
                                              dataKey="Presente"
                                              fill="#22c55e"
                                              stackId="a"
                                              radius={[0, 4, 4, 0]}
                                            />
                                            <Bar
                                              dataKey="Ausente"
                                              fill="#ef4444"
                                              stackId="a"
                                              radius={[0, 4, 4, 0]}
                                            />
                                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Cleaning Score Distribution */}
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <SprayCanIcon className="h-5 w-5 text-blue-500" />
                      <CardTitle className="text-base">Limpeza</CardTitle>
                    </div>
                    <CardDescription>Distribuicao de scores</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {cleaningAudits.length === 0 ? (
                      <div className="flex h-48 items-center justify-center text-muted-foreground">
                        <div className="text-center">
                          <SprayCanIcon className="mx-auto h-10 w-10 opacity-30" />
                          <p className="mt-2 text-xs">Sem dados</p>
                        </div>
                      </div>
                    ) : (
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={scoreRanges}>
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="hsl(var(--border))"
                            />
                            <XAxis
                              dataKey="range"
                              tick={{
                                fill: "hsl(var(--muted-foreground))",
                                fontSize: 10,
                              }}
                            />
                            <YAxis
                              tick={{
                                fill: "hsl(var(--muted-foreground))",
                                fontSize: 10,
                              }}
                            />
<Tooltip content={<CleaningTooltip />} />
                                            <Bar dataKey="quantidade" radius={[4, 4, 0, 0]}>
                              {scoreRanges.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* EPI Compliance */}
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <HardHat className="h-5 w-5 text-amber-500" />
                      <CardTitle className="text-base">EPI</CardTitle>
                    </div>
                    <CardDescription>Conformidade por item</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {epiChecks.length === 0 ? (
                      <div className="flex h-48 items-center justify-center text-muted-foreground">
                        <div className="text-center">
                          <HardHat className="mx-auto h-10 w-10 opacity-30" />
                          <p className="mt-2 text-xs">Sem dados</p>
                        </div>
                      </div>
                    ) : (
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={epiEquipmentData} layout="vertical">
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="hsl(var(--border))"
                            />
                            <XAxis
                              type="number"
                              tick={{
                                fill: "hsl(var(--muted-foreground))",
                                fontSize: 10,
                              }}
                            />
                            <YAxis
                              dataKey="name"
                              type="category"
                              tick={{
                                fill: "hsl(var(--muted-foreground))",
                                fontSize: 10,
                              }}
                              width={50}
                            />
<Tooltip content={<EPITooltip />} />
                                            <Legend wrapperStyle={{ fontSize: "10px" }} />
                                            <Bar
                                              dataKey="Conforme"
                                              fill="#22c55e"
                                              stackId="a"
                                              radius={[0, 4, 4, 0]}
                                            />
                                            <Bar
                                              dataKey="Faltando"
                                              fill="#ef4444"
                                              stackId="a"
                                              radius={[0, 4, 4, 0]}
                                            />
                                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* NFS-e Summary */}
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-purple-500" />
                      <CardTitle className="text-base">NFS-e</CardTitle>
                    </div>
                    <CardDescription>Resumo financeiro</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {nfseResults.length === 0 ? (
                      <div className="flex h-48 items-center justify-center text-muted-foreground">
                        <div className="text-center">
                          <FileText className="mx-auto h-10 w-10 opacity-30" />
                          <p className="mt-2 text-xs">Sem dados</p>
                        </div>
                      </div>
                    ) : (
                      <div className="h-48 flex flex-col justify-center gap-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="rounded-lg bg-purple-500/10 p-3 text-center">
                            <p className="text-[10px] text-muted-foreground">
                              Notas
                            </p>
                            <p className="text-xl font-bold text-purple-500">
                              {nfseResults.length}
                            </p>
                          </div>
                          <div className="rounded-lg bg-blue-500/10 p-3 text-center">
                            <p className="text-[10px] text-muted-foreground">
                              Prestadores
                            </p>
                            <p className="text-xl font-bold text-blue-500">
                              {
                                new Set(nfseResults.map((r) => r.provider_name))
                                  .size
                              }
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="rounded-lg bg-green-500/10 p-3 text-center">
                            <p className="text-[10px] text-muted-foreground">
                              Total
                            </p>
                            <p className="text-sm font-bold text-green-500">
                              {formatCurrency(totalNfseValue)}
                            </p>
                          </div>
                          <div className="rounded-lg bg-red-500/10 p-3 text-center">
                            <p className="text-[10px] text-muted-foreground">
                              ISS
                            </p>
                            <p className="text-sm font-bold text-red-500">
                              {formatCurrency(totalTaxValue)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Right Column: Alerts + Timeline */}
            <div className="space-y-6">
              <AlertPanel />
              <TimelinePanel />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {modules.map((module) => (
              <Link key={module.href} href={module.href}>
                <Card className="group h-full cursor-pointer transition-all hover:shadow-lg hover:border-primary/50">
                  <CardContent className="flex items-center gap-4 p-4">
                    <div
                      className={`rounded-lg p-3 ${module.bgColor} transition-transform group-hover:scale-110`}
                    >
                      <module.icon className={`h-6 w-6 ${module.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate">
                        {module.title}
                      </h3>
                      <p className="text-xs text-muted-foreground truncate">
                        {module.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-muted-foreground">
                        {module.count}
                      </span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
