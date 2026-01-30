"use client";

import React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useAppStore, useUnreadAlerts } from "@/lib/store";
import {
  AlertTriangle,
  Bell,
  CheckCircle,
  UtensilsCrossed,
  SprayCanIcon,
  HardHat,
  Activity,
  X,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Alert, AlertType } from "@/lib/types";

const alertIcons: Record<AlertType, React.ReactNode> = {
  plate: <UtensilsCrossed className="h-4 w-4" />,
  cleaning: <SprayCanIcon className="h-4 w-4" />,
  epi: <HardHat className="h-4 w-4" />,
  "kitchen-score": <Activity className="h-4 w-4" />,
};

export function AlertPanel() {
  const { alerts, markAlertRead, clearAlerts } = useAppStore();
  const unreadAlerts = useUnreadAlerts();

  const criticalCount = alerts.filter(
    (a) => a.severity === "critical" && !a.read
  ).length;
  const warningCount = alerts.filter(
    (a) => a.severity === "warning" && !a.read
  ).length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">Alertas</CardTitle>
            {unreadAlerts.length > 0 && (
              <Badge variant="destructive" className="h-5 px-1.5 text-xs">
                {unreadAlerts.length}
              </Badge>
            )}
          </div>
          {alerts.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAlerts}
              className="h-8 text-xs bg-transparent"
            >
              Limpar
            </Button>
          )}
        </div>
        {/* Summary badges */}
        <div className="flex gap-2 mt-2">
          <div className="flex items-center gap-1 text-xs">
            <div className="h-2 w-2 rounded-full bg-red-500" />
            <span className="text-muted-foreground">
              Criticos: {criticalCount}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <div className="h-2 w-2 rounded-full bg-yellow-500" />
            <span className="text-muted-foreground">Avisos: {warningCount}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle className="h-10 w-10 text-green-500/50" />
            <p className="mt-2 text-sm text-muted-foreground">
              Nenhum alerta ativo
            </p>
            <p className="text-xs text-muted-foreground">
              Tudo funcionando normalmente
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[280px] pr-4">
            <div className="space-y-3">
              {alerts.slice(0, 20).map((alert) => (
                <AlertItem
                  key={alert.id}
                  alert={alert}
                  onMarkRead={() => markAlertRead(alert.id)}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

function AlertItem({
  alert,
  onMarkRead,
}: {
  alert: Alert;
  onMarkRead: () => void;
}) {
  const isCritical = alert.severity === "critical";

  return (
    <div
      className={`group relative rounded-lg border p-3 transition-colors ${
        alert.read
          ? "border-border bg-muted/30 opacity-60"
          : isCritical
            ? "border-red-500/50 bg-red-500/5"
            : "border-yellow-500/50 bg-yellow-500/5"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 rounded-full p-1.5 ${
            isCritical
              ? "bg-red-500/10 text-red-500"
              : "bg-yellow-500/10 text-yellow-500"
          }`}
        >
          {alertIcons[alert.type]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Badge
              variant={isCritical ? "destructive" : "secondary"}
              className="h-5 text-[10px]"
            >
              {isCritical ? "Critico" : "Aviso"}
            </Badge>
          </div>
          <p className="mt-1 text-sm">{alert.message}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(alert.timestamp), {
              addSuffix: true,
              locale: ptBR,
            })}
          </p>
        </div>
        {!alert.read && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity bg-transparent"
            onClick={onMarkRead}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
}
