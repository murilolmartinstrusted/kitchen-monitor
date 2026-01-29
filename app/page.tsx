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
  BarChart3,
  PieChartIcon,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))"];

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

  // Chart data
  const barChartData = [
    { name: "Plate", total: plateAudits.length, compliant: plateCompliant },
    { name: "Cleaning", total: cleaningAudits.length, compliant: cleaningAudits.filter(a => a.score >= 70).length },
    { name: "EPI", total: epiChecks.length, compliant: epiCompliant },
    { name: "NFS-e", total: nfseResults.length, compliant: nfseResults.length },
  ];

  const pieChartData = [
    { name: "Plate Audits", value: plateAudits.length },
    { name: "Cleaning Audits", value: cleaningAudits.length },
    { name: "EPI Checks", value: epiChecks.length },
    { name: "NFS-e Parsed", value: nfseResults.length },
  ].filter(d => d.value > 0);

  const recentActivity = [
    ...plateAudits.slice(0, 5).map((a) => ({
      type: "plate" as const,
      timestamp: a.timestamp,
      compliant: a.compliant,
      title: "Plate Audit",
      summary: a.compliant ? "All items present" : "Missing items detected",
    })),
    ...cleaningAudits.slice(0, 5).map((a) => ({
      type: "cleaning" as const,
      timestamp: a.timestamp,
      score: a.score,
      title: "Cleaning Audit",
      summary: `Score: ${a.score}/100`,
    })),
    ...epiChecks.slice(0, 5).map((c) => ({
      type: "epi" as const,
      timestamp: c.timestamp,
      compliant: c.compliant,
      title: "EPI Check",
      summary: c.compliant ? "Fully compliant" : "Equipment missing",
    })),
    ...nfseResults.slice(0, 5).map((r) => ({
      type: "nfse" as const,
      timestamp: r.timestamp,
      filename: r.filename,
      title: "NFS-e Parsed",
      summary: r.filename,
    })),
  ]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading...</p>
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
          title="Dashboard"
          description="AI-powered operational intelligence overview"
        />
        <div className="p-4 md:p-6 space-y-6">
          {/* Key Metrics */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {/* Total Analyses */}
            <Card className="relative overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Analyses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{totalAnalyses}</span>
                  <Activity className="h-5 w-5 text-primary" />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  All audit types combined
                </p>
              </CardContent>
            </Card>

            {/* Compliance Rate */}
            <Card className="relative overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Compliance Rate
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
                  Avg. Cleaning Score
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
                  EPI Compliance
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
                  {epiCompliant}/{epiChecks.length} checks passed
                </p>
              </CardContent>
            </Card>

            {/* Plate Failures */}
            <Card className="relative overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Plate Failures
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
                  {plateAudits.length > 0 ? `${Math.round((plateFailures / plateAudits.length) * 100)}% failure rate` : "No audits yet"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Bar Chart */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-base">Audit Overview</CardTitle>
                </div>
                <CardDescription>Total vs compliant audits by type</CardDescription>
              </CardHeader>
              <CardContent>
                {totalAnalyses === 0 ? (
                  <div className="flex h-64 items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <BarChart3 className="mx-auto h-12 w-12 opacity-50" />
                      <p className="mt-2">No data yet. Run some audits to see charts.</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barChartData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="name" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                        <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "var(--radius)",
                          }}
                          labelStyle={{ color: "hsl(var(--foreground))" }}
                        />
                        <Bar dataKey="total" fill="hsl(var(--muted))" name="Total" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="compliant" fill="hsl(var(--primary))" name="Compliant" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pie Chart */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-base">Audit Distribution</CardTitle>
                </div>
                <CardDescription>Breakdown by audit type</CardDescription>
              </CardHeader>
              <CardContent>
                {pieChartData.length === 0 ? (
                  <div className="flex h-64 items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <PieChartIcon className="mx-auto h-12 w-12 opacity-50" />
                      <p className="mt-2">No data yet. Run some audits to see charts.</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={2}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {pieChartData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "var(--radius)",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
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
                <CardTitle className="text-base">Quick Actions</CardTitle>
                <CardDescription>Start a new audit or parse documents</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                <Button asChild variant="outline" className="justify-start h-auto py-4 bg-transparent">
                  <Link href="/plate-audit">
                    <UtensilsCrossed className="mr-3 h-5 w-5 text-chart-1" />
                    <div className="text-left">
                      <p className="font-medium">Plate Audit</p>
                      <p className="text-xs text-muted-foreground">
                        Verify ingredients
                      </p>
                    </div>
                    <ArrowRight className="ml-auto h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="justify-start h-auto py-4 bg-transparent">
                  <Link href="/cleaning-audit">
                    <SprayCanIcon className="mr-3 h-5 w-5 text-chart-2" />
                    <div className="text-left">
                      <p className="font-medium">Cleaning Audit</p>
                      <p className="text-xs text-muted-foreground">
                        Check cleanliness
                      </p>
                    </div>
                    <ArrowRight className="ml-auto h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="justify-start h-auto py-4 bg-transparent">
                  <Link href="/epi-check">
                    <HardHat className="mr-3 h-5 w-5 text-chart-3" />
                    <div className="text-left">
                      <p className="font-medium">EPI Check</p>
                      <p className="text-xs text-muted-foreground">
                        Verify equipment
                      </p>
                    </div>
                    <ArrowRight className="ml-auto h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="justify-start h-auto py-4 bg-transparent">
                  <Link href="/nfse-reader">
                    <FileText className="mr-3 h-5 w-5 text-chart-4" />
                    <div className="text-left">
                      <p className="font-medium">NFS-e Reader</p>
                      <p className="text-xs text-muted-foreground">
                        Parse invoices
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
                <CardTitle className="text-base">Recent Activity</CardTitle>
                <CardDescription>Latest audit results and analyses</CardDescription>
              </CardHeader>
              <CardContent>
                {recentActivity.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Activity className="h-10 w-10 text-muted-foreground/40" />
                    <p className="mt-3 text-sm text-muted-foreground">
                      No activity yet
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Start by running an audit from Quick Actions
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
                                  Issue
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
