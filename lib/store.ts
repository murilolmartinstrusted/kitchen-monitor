import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  PlateAuditResult,
  CleaningAuditResult,
  EPICheckResult,
  NFSeResult,
  Alert,
  TimelineEvent,
  KitchenScoreEntry,
} from "./types";
import {
  calculateKitchenScore,
  generateAlerts,
  createTimelineEvent,
} from "./scoring-engine";

interface User {
  email: string;
  name: string;
}

interface AppState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  
  // Audits
  plateAudits: PlateAuditResult[];
  cleaningAudits: CleaningAuditResult[];
  epiChecks: EPICheckResult[];
  nfseResults: NFSeResult[];
  addPlateAudit: (result: PlateAuditResult) => void;
  addCleaningAudit: (result: CleaningAuditResult) => void;
  addEPICheck: (result: EPICheckResult) => void;
  addNFSeResult: (result: NFSeResult) => void;
  
  // Operational Intelligence
  alerts: Alert[];
  timeline: TimelineEvent[];
  kitchenScoreHistory: KitchenScoreEntry[];
  addAlert: (alert: Alert) => void;
  markAlertRead: (alertId: string) => void;
  clearAlerts: () => void;
  addTimelineEvent: (event: TimelineEvent) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Auth state
      user: null,
      isAuthenticated: false,
      login: (email: string, _password: string) => {
        const name = email.split("@")[0];
        set({
          user: { email, name: name.charAt(0).toUpperCase() + name.slice(1) },
          isAuthenticated: true,
        });
        return true;
      },
      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
      
      // Audit state
      plateAudits: [],
      cleaningAudits: [],
      epiChecks: [],
      nfseResults: [],
      
      // Operational Intelligence state
      alerts: [],
      timeline: [],
      kitchenScoreHistory: [],
      
      addPlateAudit: (result) => {
        const state = get();
        const newPlateAudits = [result, ...state.plateAudits];
        
        // Calculate new kitchen score
        const newScore = calculateKitchenScore(
          newPlateAudits,
          state.cleaningAudits,
          state.epiChecks
        );
        
        // Generate alerts
        const existingAlertIds = new Set(state.alerts.map((a) => a.id));
        const newAlerts = generateAlerts(
          newPlateAudits,
          state.cleaningAudits,
          state.epiChecks,
          newScore,
          existingAlertIds
        );
        
        // Create timeline event
        const timelineEvent = createTimelineEvent(
          "plate",
          result.wellPrepared ? "ok" : "issue",
          result.wellPrepared
            ? "Auditoria de prato: bem preparado"
            : "Auditoria de prato: precisa atencao"
        );
        
        set({
          plateAudits: newPlateAudits,
          alerts: [...newAlerts, ...state.alerts],
          timeline: [timelineEvent, ...state.timeline].slice(0, 50),
          kitchenScoreHistory: [
            { timestamp: new Date().toISOString(), score: newScore },
            ...state.kitchenScoreHistory,
          ].slice(0, 30),
        });
      },
      
      addCleaningAudit: (result) => {
        const state = get();
        const newCleaningAudits = [result, ...state.cleaningAudits];
        
        const newScore = calculateKitchenScore(
          state.plateAudits,
          newCleaningAudits,
          state.epiChecks
        );
        
        const existingAlertIds = new Set(state.alerts.map((a) => a.id));
        const newAlerts = generateAlerts(
          state.plateAudits,
          newCleaningAudits,
          state.epiChecks,
          newScore,
          existingAlertIds
        );
        
        const timelineEvent = createTimelineEvent(
          "cleaning",
          result.score >= 70 ? "ok" : "issue",
          `Auditoria de limpeza: ${result.score}/100`
        );
        
        set({
          cleaningAudits: newCleaningAudits,
          alerts: [...newAlerts, ...state.alerts],
          timeline: [timelineEvent, ...state.timeline].slice(0, 50),
          kitchenScoreHistory: [
            { timestamp: new Date().toISOString(), score: newScore },
            ...state.kitchenScoreHistory,
          ].slice(0, 30),
        });
      },
      
      addEPICheck: (result) => {
        const state = get();
        const newEpiChecks = [result, ...state.epiChecks];
        
        const newScore = calculateKitchenScore(
          state.plateAudits,
          state.cleaningAudits,
          newEpiChecks
        );
        
        const existingAlertIds = new Set(state.alerts.map((a) => a.id));
        const newAlerts = generateAlerts(
          state.plateAudits,
          state.cleaningAudits,
          newEpiChecks,
          newScore,
          existingAlertIds
        );
        
        const timelineEvent = createTimelineEvent(
          "epi",
          result.compliant ? "ok" : "issue",
          result.compliant
            ? "Verificacao de EPI aprovada"
            : "Verificacao de EPI: equipamento faltando"
        );
        
        set({
          epiChecks: newEpiChecks,
          alerts: [...newAlerts, ...state.alerts],
          timeline: [timelineEvent, ...state.timeline].slice(0, 50),
          kitchenScoreHistory: [
            { timestamp: new Date().toISOString(), score: newScore },
            ...state.kitchenScoreHistory,
          ].slice(0, 30),
        });
      },
      
      addNFSeResult: (result) => {
        const state = get();
        
        const timelineEvent = createTimelineEvent(
          "nfse",
          "ok",
          `NFS-e processada: ${result.filename}`
        );
        
        set({
          nfseResults: [result, ...state.nfseResults],
          timeline: [timelineEvent, ...state.timeline].slice(0, 50),
        });
      },
      
      addAlert: (alert) =>
        set((state) => ({
          alerts: [alert, ...state.alerts],
        })),
      
      markAlertRead: (alertId) =>
        set((state) => ({
          alerts: state.alerts.map((a) =>
            a.id === alertId ? { ...a, read: true } : a
          ),
        })),
      
      clearAlerts: () => set({ alerts: [] }),
      
      addTimelineEvent: (event) =>
        set((state) => ({
          timeline: [event, ...state.timeline].slice(0, 50),
        })),
    }),
    {
      name: "kitchen-monitor-state",
    }
  )
);

// Selector hooks for derived state
export function useKitchenScore() {
  const { plateAudits, cleaningAudits, epiChecks } = useAppStore();
  return calculateKitchenScore(plateAudits, cleaningAudits, epiChecks);
}

export function useUnreadAlerts() {
  const { alerts } = useAppStore();
  return alerts.filter((a) => !a.read);
}

export function useCriticalAlerts() {
  const { alerts } = useAppStore();
  return alerts.filter((a) => a.severity === "critical" && !a.read);
}
