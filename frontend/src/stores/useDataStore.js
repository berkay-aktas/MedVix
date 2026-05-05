import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useDataStore = create(
  persist(
    (set) => ({
  sessionId: null,
  dataset: null,
  columnSummary: null,
  classDistribution: null,
  targetColumn: null,
  schemaOK: false,
  isLoading: false,
  preview: null,
  dataQualityScore: null,
  isImbalanced: false,
  imbalanceWarning: null,
  uploadResponse: null,
  warnings: [],

  setSessionId: (id) => set({ sessionId: id }),
  setDataset: (data) => set({ dataset: data }),
  setColumnSummary: (summary) => set({ columnSummary: summary }),
  setClassDistribution: (dist) => set({ classDistribution: dist }),
  setTargetColumn: (col) => set({ targetColumn: col }),
  setSchemaOK: (ok) => set({ schemaOK: ok }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setPreview: (preview) => set({ preview: preview }),
  setDataQualityScore: (score) => set({ dataQualityScore: score }),
  setIsImbalanced: (val) => set({ isImbalanced: val }),
  setImbalanceWarning: (warning) => set({ imbalanceWarning: warning }),
  setUploadResponse: (response) => set({ uploadResponse: response }),
  setWarnings: (warnings) => set({ warnings: warnings }),

  loadSummaryData: (summary) =>
    set({
      columnSummary: summary.columns,
      classDistribution: summary.class_distribution,
      targetColumn: summary.target_column,
      dataQualityScore: summary.data_quality_score,
      isImbalanced: summary.is_imbalanced,
      imbalanceWarning: summary.imbalance_warning,
      warnings: summary.warnings || [],
    }),

  resetData: () =>
    set({
      sessionId: null,
      dataset: null,
      columnSummary: null,
      classDistribution: null,
      targetColumn: null,
      schemaOK: false,
      isLoading: false,
      preview: null,
      dataQualityScore: null,
      isImbalanced: false,
      imbalanceWarning: null,
      uploadResponse: null,
      warnings: [],
    }),
    }),
    {
      name: 'medvix-data',
      storage: createJSONStorage(() => localStorage),
      // Persist only the session pointer + lightweight summary state.
      // Heavy fields (dataset, preview) are re-fetched from the backend on mount.
      partialize: (state) => ({
        sessionId: state.sessionId,
        targetColumn: state.targetColumn,
        schemaOK: state.schemaOK,
      }),
    }
  )
);

export default useDataStore;
