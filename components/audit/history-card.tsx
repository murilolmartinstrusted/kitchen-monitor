"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import type { DetectedFood } from "@/lib/types";

interface HistoryCardProps {
  title: string;
  timestamp: string | Date;
  imageData?: string;
  compliant?: boolean;
  score?: number;
  notes?: string;
  detectedFoods?: DetectedFood[];
  wellPrepared?: boolean;
}

export function HistoryCard({
  title,
  timestamp,
  imageData,
  compliant,
  score,
  notes,
  detectedFoods,
  wellPrepared,
}: HistoryCardProps) {
  return (
    <Card className="overflow-hidden">
      {imageData && (
        <div className="aspect-video w-full overflow-hidden bg-muted">
          <img
            src={imageData || "/placeholder.svg"}
            alt={title}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {compliant !== undefined && (
            <Badge
              variant={compliant ? "default" : "destructive"}
              className={compliant ? "bg-success text-success-foreground" : ""}
            >
              {compliant ? "Aprovado" : "Reprovado"}
            </Badge>
          )}
          {score !== undefined && (
            <Badge
              variant="outline"
              className={
                score >= 70
                  ? "border-success/50 text-success"
                  : score >= 40
                    ? "border-warning/50 text-warning-foreground"
                    : "border-destructive/50 text-destructive"
              }
            >
              {score}/100
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-2">
        <p className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
        </p>
        {wellPrepared !== undefined && (
          <Badge
            variant="outline"
            className={wellPrepared ? "border-green-500/50 text-green-600" : "border-orange-500/50 text-orange-600"}
          >
            {wellPrepared ? "Bem Preparado" : "Precisa Atencao"}
          </Badge>
        )}
        {detectedFoods && detectedFoods.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {detectedFoods.slice(0, 4).map((food, i) => (
              <span
                key={i}
                className={`text-xs px-1.5 py-0.5 rounded ${food.present ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"}`}
              >
                {food.name}
              </span>
            ))}
            {detectedFoods.length > 4 && (
              <span className="text-xs text-muted-foreground">+{detectedFoods.length - 4}</span>
            )}
          </div>
        )}
        {notes && (
          <p className="line-clamp-2 text-sm text-muted-foreground">{notes}</p>
        )}
      </CardContent>
    </Card>
  );
}
