"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAppStore } from "@/lib/store";
import { TrendingUp } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function ScoreTrendChart() {
  const { kitchenScoreHistory } = useAppStore();

  // Reverse to show oldest first
  const chartData = [...kitchenScoreHistory]
    .reverse()
    .slice(-15)
    .map((entry) => ({
      time: format(new Date(entry.timestamp), "HH:mm", { locale: ptBR }),
      score: entry.score,
    }));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-base">Tendencia do Kitchen Score</CardTitle>
        </div>
        <CardDescription>Evolucao do indice de saude operacional</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length < 2 ? (
          <div className="flex h-56 items-center justify-center text-muted-foreground">
            <div className="text-center">
              <TrendingUp className="mx-auto h-12 w-12 opacity-30" />
              <p className="mt-2 text-sm">Dados insuficientes</p>
              <p className="text-xs">Execute mais auditorias para ver tendencias</p>
            </div>
          </div>
        ) : (
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="time"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => [`${value}`, "Score"]}
                />
                {/* Warning threshold line */}
                <ReferenceLine
                  y={70}
                  stroke="#f59e0b"
                  strokeDasharray="5 5"
                  label={{
                    value: "Minimo",
                    fill: "#f59e0b",
                    fontSize: 10,
                    position: "right",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))", strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
