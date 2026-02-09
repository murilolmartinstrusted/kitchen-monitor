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
import { FloatingChat } from "@/components/dashboard/floating-chat";
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
  MessageCircle,
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

// Custom tooltip for plate quality chart
const PlateTooltip = ({ active, payload }: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    const entry = payload[0];
    const value = entry?.value as number || 0;
    const name = entry?.name as string || "";
    
    return (
      <div className="rounded-lg border bg-card p-3 shadow-lg">
        <p className="font-semibold text-sm mb-1">{name}</p>
        <p className="text-sm">{value} auditoria{value !== 1 ? 's' : ''}</p>
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
      "Avental/Uniforme": "Avental, jaleco ou uniforme de cozinha",
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
  const [chatOpen, setChatOpen] = React.useState(false);
  const [chatCardTitle, setChatCardTitle] = React.useState("");
  const [chatContext, setChatContext] = React.useState("");
  const {
    plateAudits,
    cleaningAudits,
    epiChecks,
    nfseResults,
    alerts,
    timeline,
  } = useAppStore();
  const kitchenScore = useKitchenScore();
  const plateCompliant = plateAudits.filter((a) => a.wellPrepared).length; // Declare plateCompliant here
  const plateWellPrepared = plateAudits.filter((a) => a.wellPrepared === true).length; // Declare plateWellPrepared here

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate metrics
  const totalAnalyses =
    plateAudits.length +
    cleaningAudits.length +
    epiChecks.length +
    nfseResults.length;

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

  // Plate Audit - Quality chart data (Pie chart)
  const plateQualityData = [
    {
      name: "Bem Preparado",
      value: plateAudits.filter((a) => a.wellPrepared === true).length,
      fill: "#22c55e",
    },
    {
      name: "Precisa Atencao",
      value: plateAudits.filter((a) => a.wellPrepared === false).length,
      fill: "#ef4444",
    },
  ].filter(d => d.value > 0);

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
      name: "Avental/Uniforme",
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

  // Build context for AI chat based on card type
  const buildContext = (cardType: string): string => {
    switch (cardType) {
      case "pratos":
        return `DADOS DE AUDITORIA DE PRATOS:
- Total de auditorias: ${plateAudits.length}
- Bem preparados: ${plateWellPrepared}
- Precisam atencao: ${plateAudits.length - plateWellPrepared}
- Taxa de qualidade: ${plateAudits.length > 0 ? Math.round((plateWellPrepared / plateAudits.length) * 100) : 0}%
Ultimas auditorias: ${JSON.stringify(plateAudits.slice(0, 5).map(a => ({ 
  data: a.timestamp, 
  bemPreparado: a.wellPrepared, 
  alimentos: a.detectedFoods?.map(f => f.name).join(", "),
  notas: a.preparationNotes 
})))}`;
      case "limpeza":
        return `DADOS DE AUDITORIA DE LIMPEZA:
- Total de auditorias: ${cleaningAudits.length}
- Media de score: ${avgCleaningScore}/100
- Criticos (< 40): ${cleaningAudits.filter(a => a.score < 40).length}
- Atencao (40-70): ${cleaningAudits.filter(a => a.score >= 40 && a.score < 70).length}
- Bom (> 70): ${cleaningAudits.filter(a => a.score >= 70).length}
Ultimas auditorias: ${JSON.stringify(cleaningAudits.slice(0, 5).map(a => ({
  data: a.timestamp,
  score: a.score,
  bancadaLimpa: a.counter_clean,
  lixoCheio: a.trash_full,
  chaoSujo: a.floor_dirty,
  notas: a.notes
})))}`;
      case "epi":
        return `DADOS DE VERIFICACAO DE EPI:
- Total de verificacoes: ${epiChecks.length}
- Conformes: ${epiCompliant}
- Nao conformes: ${epiChecks.length - epiCompliant}
- Taxa de conformidade: ${epiChecks.length > 0 ? Math.round((epiCompliant / epiChecks.length) * 100) : 0}%
- Touca conforme: ${epiChecks.filter(c => c.hairnet === true).length}/${epiChecks.length}
- Luvas conforme: ${epiChecks.filter(c => c.gloves === true).length}/${epiChecks.length}
- Avental/Uniforme conforme: ${epiChecks.filter(c => c.apron === true).length}/${epiChecks.length}
Ultimas verificacoes: ${JSON.stringify(epiChecks.slice(0, 5).map(c => ({
  data: c.timestamp,
  touca: c.hairnet,
  luvas: c.gloves,
  avental: c.apron,
  conforme: c.compliant,
  notas: c.notes
})))}`;
      case "nfse":
        return `DADOS DE NFS-e:
- Total de notas: ${nfseResults.length}
- Valor total: R$ ${totalNfseValue.toFixed(2)}
- Total ISS: R$ ${totalTaxValue.toFixed(2)}
- Prestadores unicos: ${new Set(nfseResults.map(r => r.provider_name)).size}
Ultimas notas: ${JSON.stringify(nfseResults.slice(0, 5).map(r => ({
  numero: r.invoice_number,
  data: r.issue_date,
  prestador: r.provider_name,
  servico: r.service_description,
  valor: r.total_value,
  iss: r.tax_value
})))}`;
      case "geral":
      default:
        return `RESUMO GERAL DO DASHBOARD:
- Kitchen Score: ${kitchenScore}
- Total de auditorias: ${totalAnalyses}
- Taxa de conformidade geral: ${complianceRate}%
- Media de limpeza: ${avgCleaningScore}/100
- Alertas ativos: ${alerts.filter(a => !a.read).length}
- Alertas criticos: ${alerts.filter(a => a.severity === "critical" && !a.read).length}
- Pratos auditados: ${plateAudits.length} (${plateWellPrepared} bem preparados)
- Auditorias de limpeza: ${cleaningAudits.length} (media ${avgCleaningScore})
- Verificacoes EPI: ${epiChecks.length} (${epiCompliant} conformes)
- NFS-e processadas: ${nfseResults.length} (total R$ ${totalNfseValue.toFixed(2)})`;
    }
  };

  const openChat = (cardType: string, title: string) => {
    setChatContext(buildContext(cardType));
    setChatCardTitle(title);
    setChatOpen(true);
  };

  // Compliance Pie Chart data
  const complianceData = [
    { name: "Conforme", value: plateWellPrepared + epiCompliant, fill: "#22c55e" },
    {
      name: "Nao Conforme",
      value: totalCompliance - (plateWellPrepared + epiCompliant),
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
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <UtensilsCrossed className="h-5 w-5 text-orange-500" />
                        <CardTitle className="text-base">Qualidade dos Pratos</CardTitle>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 bg-transparent"
                        onClick={() => openChat("pratos", "Qualidade dos Pratos")}
                      >
                        <MessageCircle className="h-4 w-4 text-muted-foreground" />
                        <span className="sr-only">Perguntar sobre pratos</span>
                      </Button>
                    </div>
                    <CardDescription>Avaliacao de preparo</CardDescription>
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
                          <RechartsPieChart>
                            <Pie
                              data={plateQualityData}
                              cx="50%"
                              cy="50%"
                              innerRadius={40}
                              outerRadius={70}
                              paddingAngle={2}
                              dataKey="value"
                              nameKey="name"
                            >
                              {plateQualityData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                              ))}
                            </Pie>
                            <Tooltip content={<PlateTooltip />} />
                            <Legend
                              wrapperStyle={{ fontSize: "10px" }}
                              formatter={(value) => <span className="text-foreground">{value}</span>}
                            />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Cleaning Score Distribution */}
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <SprayCanIcon className="h-5 w-5 text-blue-500" />
                        <CardTitle className="text-base">Limpeza</CardTitle>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 bg-transparent"
                        onClick={() => openChat("limpeza", "Auditoria de Limpeza")}
                      >
                        <MessageCircle className="h-4 w-4 text-muted-foreground" />
                        <span className="sr-only">Perguntar sobre limpeza</span>
                      </Button>
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
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <HardHat className="h-5 w-5 text-amber-500" />
                        <CardTitle className="text-base">EPI</CardTitle>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 bg-transparent"
                        onClick={() => openChat("epi", "Verificacao de EPI")}
                      >
                        <MessageCircle className="h-4 w-4 text-muted-foreground" />
                        <span className="sr-only">Perguntar sobre EPI</span>
                      </Button>
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
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-purple-500" />
                        <CardTitle className="text-base">NFS-e</CardTitle>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 bg-transparent"
                        onClick={() => openChat("nfse", "Notas Fiscais (NFS-e)")}
                      >
                        <MessageCircle className="h-4 w-4 text-muted-foreground" />
                        <span className="sr-only">Perguntar sobre NFS-e</span>
                      </Button>
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

        {/* General chat FAB */}
        {!chatOpen && (
          <button
            type="button"
            onClick={() => openChat("geral", "Resumo Geral")}
            className="fixed bottom-4 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-110"
          >
            <MessageCircle className="h-5 w-5" />
            <span className="sr-only">Abrir assistente de dados</span>
          </button>
        )}

        {/* Floating Chat */}
        <FloatingChat
          context={chatContext}
          cardTitle={chatCardTitle}
          isOpen={chatOpen}
          onClose={() => setChatOpen(false)}
        />
      </main>
    </div>
  );
}
