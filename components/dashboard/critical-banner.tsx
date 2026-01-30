"use client";

import { useCriticalAlerts } from "@/lib/store";
import { AlertTriangle, X } from "lucide-react";
import { useState } from "react";

export function CriticalBanner() {
  const criticalAlerts = useCriticalAlerts();
  const [dismissed, setDismissed] = useState(false);

  if (criticalAlerts.length === 0 || dismissed) {
    return null;
  }

  return (
    <div className="bg-red-500 text-white px-4 py-2 flex items-center justify-between animate-pulse">
      <div className="flex items-center gap-3">
        <AlertTriangle className="h-5 w-5" />
        <span className="font-medium">
          {criticalAlerts.length} alerta{criticalAlerts.length > 1 ? "s" : ""}{" "}
          critico{criticalAlerts.length > 1 ? "s" : ""} ativo
          {criticalAlerts.length > 1 ? "s" : ""}
        </span>
        <span className="text-red-100 text-sm hidden sm:inline">
          - {criticalAlerts[0]?.message}
        </span>
      </div>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="p-1 hover:bg-red-600 rounded transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
