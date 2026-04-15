import { create } from 'zustand';

const useExplainabilityStore = create((set) => ({
  featureImportance: null,
  senseCheckText: '',
  patients: [],
  selectedPatientIndex: null,
  waterfallData: null,
  isLoading: false,
  isWaterfallLoading: false,
  domainId: null,

  setFeatureImportance: (data) => set({
    featureImportance: data.feature_importance,
    senseCheckText: data.sense_check_text,
    patients: data.patients,
    domainId: data.domain_id,
  }),
  setSelectedPatientIndex: (index) => set({ selectedPatientIndex: index }),
  setWaterfallData: (data) => set({ waterfallData: data }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setIsWaterfallLoading: (loading) => set({ isWaterfallLoading: loading }),
  resetExplainability: () => set({
    featureImportance: null,
    senseCheckText: '',
    patients: [],
    selectedPatientIndex: null,
    waterfallData: null,
    isLoading: false,
    isWaterfallLoading: false,
    domainId: null,
  }),
}));

export default useExplainabilityStore;
