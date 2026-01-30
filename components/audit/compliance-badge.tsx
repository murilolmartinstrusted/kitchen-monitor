"use client";

import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle } from "lucide-react";

interface ComplianceBadgeProps {
  compliant: boolean;
  size?: "sm" | "lg";
}

export function ComplianceBadge({ compliant, size = "lg" }: ComplianceBadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full font-semibold",
        compliant
          ? "bg-success/15 text-success"
          : "bg-destructive/15 text-destructive",
        size === "lg" ? "px-4 py-2 text-base" : "px-3 py-1 text-sm"
      )}
    >
      {compliant ? (
        <CheckCircle2 className={size === "lg" ? "h-5 w-5" : "h-4 w-4"} />
      ) : (
        <XCircle className={size === "lg" ? "h-5 w-5" : "h-4 w-4"} />
      )}
      {compliant ? "Conforme" : "Nao Conforme"}
    </div>
  );
}
