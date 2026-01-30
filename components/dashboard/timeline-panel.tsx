"use client";

import React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAppStore } from "@/lib/store";
import {
  Clock,
  UtensilsCrossed,
  SprayCanIcon,
  HardHat,
  FileText,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { TimelineEvent, TimelineEventType } from "@/lib/types";

const timelineIcons: Record<TimelineEventType, React.ReactNode> = {
  plate: <UtensilsCrossed className="h-4 w-4" />,
  cleaning: <SprayCanIcon className="h-4 w-4" />,
  epi: <HardHat className="h-4 w-4" />,
  nfse: <FileText className="h-4 w-4" />,
};

const typeColors: Record<TimelineEventType, string> = {
  plate: "bg-orange-500/10 text-orange-500",
  cleaning: "bg-blue-500/10 text-blue-500",
  epi: "bg-amber-500/10 text-amber-500",
  nfse: "bg-purple-500/10 text-purple-500",
};

const typeLabels: Record<TimelineEventType, string> = {
  plate: "Prato",
  cleaning: "Limpeza",
  epi: "EPI",
  nfse: "NFS-e",
};

export function TimelinePanel() {
  const { timeline } = useAppStore();

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-base">Linha do Tempo</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {timeline.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Clock className="h-10 w-10 text-muted-foreground/30" />
            <p className="mt-2 text-sm text-muted-foreground">
              Nenhum evento registrado
            </p>
            <p className="text-xs text-muted-foreground">
              Execute auditorias para ver a linha do tempo
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-[18px] top-0 bottom-0 w-px bg-border" />

              <div className="space-y-4">
                {timeline.map((event, index) => (
                  <TimelineItem key={event.id} event={event} isFirst={index === 0} />
                ))}
              </div>
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

function TimelineItem({
  event,
  isFirst,
}: {
  event: TimelineEvent;
  isFirst: boolean;
}) {
  const isOk = event.status === "ok";

  return (
    <div className="relative flex gap-4 pl-1">
      {/* Icon */}
      <div
        className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 ${
          isFirst ? "border-primary bg-background" : "border-border bg-background"
        }`}
      >
        <div className={`rounded-full p-1 ${typeColors[event.type]}`}>
          {timelineIcons[event.type]}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 pb-4">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${typeColors[event.type]}`}
          >
            {typeLabels[event.type]}
          </span>
          {isOk ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
          ) : (
            <XCircle className="h-3.5 w-3.5 text-red-500" />
          )}
        </div>
        <p className="mt-1 text-sm">{event.summary}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(event.timestamp), {
            addSuffix: true,
            locale: ptBR,
          })}
        </p>
      </div>
    </div>
  );
}
