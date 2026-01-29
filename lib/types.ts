// Plate Assembly Audit Types
export interface PlateAuditResult {
  id: string;
  timestamp: string;
  imageData: string;
  bread: boolean;
  meat: boolean;
  cheese: boolean;
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
