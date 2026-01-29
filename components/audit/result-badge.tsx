"use client";

import { cn } from "@/lib/utils";
import { Check, X, AlertCircle } from "lucide-react";

interface ResultBadgeProps {
  value: boolean | "uncertain";
  label: string;
  invertColors?: boolean;
}

export function ResultBadge({ value, label, invertColors = false }: ResultBadgeProps) {
  const isPositive = invertColors ? value === false : value === true;
  const isNegative = invertColors ? value === true : value === false;

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border px-3 py-2",
        value === "uncertain"
          ? "border-warning/30 bg-warning/10 text-warning-foreground"
          : isPositive
            ? "border-success/30 bg-success/10 text-success"
            : "border-destructive/30 bg-destructive/10 text-destructive"
      )}
    >
      {value === "uncertain" ? (
        <AlertCircle className="h-4 w-4" />
      ) : isPositive ? (
        <Check className="h-4 w-4" />
      ) : (
        <X className="h-4 w-4" />
      )}
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}
