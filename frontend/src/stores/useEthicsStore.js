import { create } from 'zustand';

const DEFAULT_CHECKLIST = {
  data_quality: true,
  transparency: true,
  human_oversight: false,
  accuracy_reporting: false,
  bias_mitigation: false,
  technical_docs: false,
  risk_classification: false,
  post_market: false,
};

const useEthicsStore = create((set) => ({
  biasAnalysis: null,
  checklistStatus: { ...DEFAULT_CHECKLIST },
  isLoading: false,
  isGeneratingPdf: false,

  setBiasAnalysis: (data) => set({ biasAnalysis: data }),
  toggleChecklistItem: (id) =>
    set((state) => ({
      checklistStatus: {
        ...state.checklistStatus,
        [id]: !state.checklistStatus[id],
      },
    })),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setIsGeneratingPdf: (loading) => set({ isGeneratingPdf: loading }),
  resetEthics: () =>
    set({
      biasAnalysis: null,
      checklistStatus: { ...DEFAULT_CHECKLIST },
      isLoading: false,
      isGeneratingPdf: false,
    }),
}));

export default useEthicsStore;
