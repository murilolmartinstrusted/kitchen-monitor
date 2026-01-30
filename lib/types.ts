// Food item detected in the dish
export interface DetectedFood {
  name: string;
  present: boolean;
  observation?: string;
}

// Plate Assembly Audit Types
export interface PlateAuditResult {
  id: string;
  timestamp: string;
  imageData: string;
  // Legacy fields for backwards compatibility
  bread: boolean;
  meat: boolean;
  cheese: boolean;
  // New detailed food analysis
  detectedFoods: DetectedFood[];
  wellPrepared: boolean;
  preparationNotes: string;
  compliant: boolean;
  notes: string;
}

// Cleaning Checklist Audit Types
export type CleaningStatus = boolean | "uncertain";

export interface CleaningAuditResult {
  id: string;
  timestamp: string;
  imageData: string;
  counter_clean: CleaningStatus;
  trash_full: CleaningStatus;
  floor_dirty: CleaningStatus;
  score: number;
  notes: string;
}

// EPI Compliance Check Types
export type EPIStatus = boolean | "uncertain";

export interface EPICheckResult {
  id: string;
  timestamp: string;
  imageData: string;
  hairnet: EPIStatus;
  gloves: EPIStatus;
  apron: EPIStatus;
  compliant: boolean;
  notes: string;
}

// NFS-e XML Reader Types
export interface NFSeResult {
  id: string;
  timestamp: string;
  filename: string;
  invoice_number: string;
  issue_date: string;
  provider_name: string;
  client_name: string;
  service_description: string;
  total_value: number;
  tax_value: number;
  city: string;
  raw_summary: string;
}

// Union type for all audit results
export type AuditResult =
  | PlateAuditResult
  | CleaningAuditResult
  | EPICheckResult
  | NFSeResult;

// Alert System Types
export type AlertType = "plate" | "cleaning" | "epi" | "kitchen-score";
export type AlertSeverity = "warning" | "critical";

export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  timestamp: string;
  read: boolean;
}

// Timeline Event Types
export type TimelineEventType = "plate" | "cleaning" | "epi" | "nfse";
export type TimelineEventStatus = "ok" | "issue";

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  status: TimelineEventStatus;
  timestamp: string;
  summary: string;
}

// Kitchen Score History
export interface KitchenScoreEntry {
  timestamp: string;
  score: number;
}
