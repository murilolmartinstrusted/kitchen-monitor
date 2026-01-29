"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

interface HistoryCardProps {
  title: string;
  timestamp: string | Date;
  imageData?: string;
  compliant?: boolean;
  score?: number;
  notes?: string;
}

export function HistoryCard({
  title,
  timestamp,
  imageData,
  compliant,
  score,
  notes,
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
              {compliant ? "Pass" : "Fail"}
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
      <CardContent className="p-4 pt-0">
        <p className="mb-2 text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
        </p>
        {notes && (
          <p className="line-clamp-2 text-sm text-muted-foreground">{notes}</p>
        )}
      </CardContent>
    </Card>
  );
}
