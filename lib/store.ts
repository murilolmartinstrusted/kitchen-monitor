import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  PlateAuditResult,
  CleaningAuditResult,
  EPICheckResult,
  NFSeResult,
} from "./types";

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
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Auth state
      user: null,
      isAuthenticated: false,
      login: (email: string, _password: string) => {
        // Fake auth - accept any credentials
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
      addPlateAudit: (result) =>
        set((state) => ({
          plateAudits: [result, ...state.plateAudits],
        })),
      addCleaningAudit: (result) =>
        set((state) => ({
          cleaningAudits: [result, ...state.cleaningAudits],
        })),
      addEPICheck: (result) =>
        set((state) => ({
          epiChecks: [result, ...state.epiChecks],
        })),
      addNFSeResult: (result) =>
        set((state) => ({
          nfseResults: [result, ...state.nfseResults],
        })),
    }),
    {
      name: "app-state",
    }
  )
);
