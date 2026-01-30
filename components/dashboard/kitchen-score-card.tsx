"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useKitchenScore, useAppStore } from "@/lib/store";
import { getScoreColor, getScoreStatus, getScoreBgColor } from "@/lib/scoring-engine";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export function KitchenScoreCard() {
  const score = useKitchenScore();
  const { kitchenScoreHistory } = useAppStore();

  // Calculate trend
  const previousScore = kitchenScoreHistory[1]?.score ?? score;
  const trend = score - previousScore;

  const scoreColor = getScoreColor(score);
  const scoreBgColor = getScoreBgColor(score);
  const status = getScoreStatus(score);

  // Calculate ring percentage for visual
  const ringPercentage = score;
  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDashoffset = circumference - (ringPercentage / 100) * circumference;

  return (
    <Card className="relative overflow-hidden">
      <div
        className={`absolute inset-0 opacity-5 ${scoreBgColor}`}
        style={{
          background: `radial-gradient(circle at 50% 0%, ${
            score >= 90
              ? "rgb(34, 197, 94)"
              : score >= 70
                ? "rgb(234, 179, 8)"
                : "rgb(239, 68, 68)"
          } 0%, transparent 70%)`,
        }}
      />
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Kitchen Score
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          {/* Score Ring */}
          <div className="relative">
            <svg
              className="h-28 w-28 -rotate-90 transform"
              viewBox="0 0 100 100"
            >
              {/* Background ring */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-muted/20"
              />
              {/* Score ring */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeLinecap="round"
                className={scoreColor}
                style={{
                  strokeDasharray: circumference,
                  strokeDashoffset,
                  transition: "stroke-dashoffset 0.5s ease-in-out",
                }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-3xl font-bold ${scoreColor}`}>{score}</span>
            </div>
          </div>

          {/* Score Details */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  score >= 90
                    ? "bg-green-500/10 text-green-500"
                    : score >= 70
                      ? "bg-yellow-500/10 text-yellow-500"
                      : "bg-red-500/10 text-red-500"
                }`}
              >
                {status}
              </span>
            </div>

            {/* Trend indicator */}
            <div className="flex items-center gap-1 text-sm">
              {trend > 0 ? (
                <>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-green-500">+{trend}</span>
                </>
              ) : trend < 0 ? (
                <>
                  <TrendingDown className="h-4 w-4 text-red-500" />
                  <span className="text-red-500">{trend}</span>
                </>
              ) : (
                <>
                  <Minus className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Estavel</span>
                </>
              )}
              <span className="text-muted-foreground text-xs ml-1">
                vs anterior
              </span>
            </div>

            <p className="text-xs text-muted-foreground">
              Indice de saude operacional
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
