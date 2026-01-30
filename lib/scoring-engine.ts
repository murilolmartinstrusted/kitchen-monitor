import type {
  PlateAuditResult,
  CleaningAuditResult,
  EPICheckResult,
  Alert,
  AlertType,
  AlertSeverity,
  TimelineEvent,
  TimelineEventType,
  TimelineEventStatus,
} from "./types";

// Kitchen Score calculation
export function calculateKitchenScore(
  plateAudits: PlateAuditResult[],
  cleaningAudits: CleaningAuditResult[],
  epiChecks: EPICheckResult[]
): number {
  if (plateAudits.length === 0 && cleaningAudits.length === 0 && epiChecks.length === 0) {
    return 100; // Default score when no audits
  }

  let score = 50; // Base score

  // Plate audit contribution
  plateAudits.forEach((audit) => {
    if (audit.compliant) {
      score += 10;
    } else {
      score -= 15;
    }
  });

  // Cleaning score contribution (average, scaled)
  if (cleaningAudits.length > 0) {
    const avgCleaningScore =
      cleaningAudits.reduce((sum, a) => sum + a.score, 0) / cleaningAudits.length;
    score += (avgCleaningScore / 100) * 30; // Max 30 points from cleaning
  }

  // EPI check contribution
  epiChecks.forEach((check) => {
    if (check.compliant) {
      score += 5;
    } else {
      score -= 10;
    }
  });

  // Normalize between 0 and 100
  return Math.max(0, Math.min(100, Math.round(score)));
}

// Get score color based on value
export function getScoreColor(score: number): string {
  if (score >= 90) return "text-green-500";
  if (score >= 70) return "text-yellow-500";
  return "text-red-500";
}

export function getScoreBgColor(score: number): string {
  if (score >= 90) return "bg-green-500";
  if (score >= 70) return "bg-yellow-500";
  return "bg-red-500";
}

export function getScoreStatus(score: number): string {
  if (score >= 90) return "Excelente";
  if (score >= 70) return "Bom";
  if (score >= 50) return "Atencao";
  return "Critico";
}

// Alert generation
export function generateAlerts(
  plateAudits: PlateAuditResult[],
  cleaningAudits: CleaningAuditResult[],
  epiChecks: EPICheckResult[],
  kitchenScore: number,
  existingAlertIds: Set<string>
): Alert[] {
  const newAlerts: Alert[] = [];

  // Check recent plate audit failures
  const recentPlateFailures = plateAudits
    .filter((a) => !a.compliant)
    .slice(0, 5);
  
  recentPlateFailures.forEach((audit) => {
    const alertId = `plate-${audit.id}`;
    if (!existingAlertIds.has(alertId)) {
      newAlerts.push({
        id: alertId,
        type: "plate",
        severity: "warning",
        message: `Auditoria de prato falhou: itens faltando detectados`,
        timestamp: audit.timestamp,
        read: false,
      });
    }
  });

  // Check cleaning score issues
  const lowCleaningScores = cleaningAudits
    .filter((a) => a.score < 70)
    .slice(0, 5);
  
  lowCleaningScores.forEach((audit) => {
    const alertId = `cleaning-${audit.id}`;
    if (!existingAlertIds.has(alertId)) {
      const severity: AlertSeverity = audit.score < 40 ? "critical" : "warning";
      newAlerts.push({
        id: alertId,
        type: "cleaning",
        severity,
        message: `Pontuacao de limpeza baixa: ${audit.score}/100`,
        timestamp: audit.timestamp,
        read: false,
      });
    }
  });

  // Check EPI non-compliance
  const epiFailures = epiChecks
    .filter((c) => !c.compliant)
    .slice(0, 5);
  
  epiFailures.forEach((check) => {
    const alertId = `epi-${check.id}`;
    if (!existingAlertIds.has(alertId)) {
      newAlerts.push({
        id: alertId,
        type: "epi",
        severity: "critical",
        message: `Verificacao de EPI falhou: equipamento faltando`,
        timestamp: check.timestamp,
        read: false,
      });
    }
  });

  // Check kitchen score
  if (kitchenScore < 70) {
    const scoreAlertId = `kitchen-score-low`;
    if (!existingAlertIds.has(scoreAlertId)) {
      newAlerts.push({
        id: scoreAlertId,
        type: "kitchen-score",
        severity: kitchenScore < 50 ? "critical" : "warning",
        message: `Kitchen Score baixo: ${kitchenScore}/100`,
        timestamp: new Date().toISOString(),
        read: false,
      });
    }
  }

  return newAlerts;
}

// Timeline event generation
export function createTimelineEvent(
  type: TimelineEventType,
  status: TimelineEventStatus,
  summary: string
): TimelineEvent {
  return {
    id: crypto.randomUUID(),
    type,
    status,
    timestamp: new Date().toISOString(),
    summary,
  };
}

export function getTimelineIcon(type: TimelineEventType): string {
  switch (type) {
    case "plate":
      return "UtensilsCrossed";
    case "cleaning":
      return "SprayCanIcon";
    case "epi":
      return "HardHat";
    case "nfse":
      return "FileText";
    default:
      return "Activity";
  }
}

export function getAlertIcon(type: AlertType): string {
  switch (type) {
    case "plate":
      return "UtensilsCrossed";
    case "cleaning":
      return "SprayCanIcon";
    case "epi":
      return "HardHat";
    case "kitchen-score":
      return "Activity";
    default:
      return "AlertTriangle";
  }
}
