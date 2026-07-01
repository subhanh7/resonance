import { create } from "zustand";
import type { AnalyzeResponse, CommentItem } from "@/types/api";

export type PanelId = "pulse" | "voices" | "signal" | "lexicon";

export type AppPhase = "intake" | "loading" | "field" | "error";

interface ResonanceState {
  phase: AppPhase;
  errorMessage: string | null;
  data: AnalyzeResponse | null;

  // panel visibility — panels can be docked (visible) or collapsed to an edge chip
  openPanels: Record<PanelId, boolean>;
  commandPaletteOpen: boolean;
  selectedComment: CommentItem | null;
  sentimentFilter: "positive" | "neutral" | "negative" | null;

  setLoading: () => void;
  setData: (data: AnalyzeResponse) => void;
  setError: (message: string) => void;
  reset: () => void;

  togglePanel: (panel: PanelId) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setSelectedComment: (comment: CommentItem | null) => void;
  setSentimentFilter: (filter: "positive" | "neutral" | "negative" | null) => void;
}

export const useResonanceStore = create<ResonanceState>((set) => ({
  phase: "intake",
  errorMessage: null,
  data: null,

  openPanels: {
    pulse: true,
    voices: true,
    signal: true,
    lexicon: false,
  },
  commandPaletteOpen: false,
  selectedComment: null,
  sentimentFilter: null,

  setLoading: () => set({ phase: "loading", errorMessage: null }),
  setData: (data) => set({ phase: "field", data, errorMessage: null }),
  setError: (message) => set({ phase: "error", errorMessage: message }),
  reset: () =>
    set({
      phase: "intake",
      data: null,
      errorMessage: null,
      selectedComment: null,
    }),

  togglePanel: (panel) =>
    set((state) => ({
      openPanels: { ...state.openPanels, [panel]: !state.openPanels[panel] },
    })),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  setSelectedComment: (comment) => set({ selectedComment: comment }),
  setSentimentFilter: (filter) => set({ sentimentFilter: filter }),
}));
