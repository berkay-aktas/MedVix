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
  // Patient Risk Map state
  patientMapData: null,         // PatientMapResponse from backend
  isMapLoading: false,
  mapColorMode: 'probability',  // 'probability' | 'sex' | 'age'
  // Counterfactual Explorer state
  counterfactualData: null,     // CounterfactualResponse: { probability, predicted_class, baseline_*, prediction_changed, feature_ranges }
  isCounterfactualLoading: false,
  featureOverrides: {},         // local map of feature_name -> new value (original scale)
  autoFindResult: null,         // AutoFindResponse | null

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
  setPatientMapData: (data) => set({ patientMapData: data }),
  setIsMapLoading: (loading) => set({ isMapLoading: loading }),
  setMapColorMode: (mode) => set({ mapColorMode: mode }),
  setCounterfactualData: (data) => set({ counterfactualData: data }),
  setIsCounterfactualLoading: (loading) => set({ isCounterfactualLoading: loading }),
  setFeatureOverrides: (overrides) => set({ featureOverrides: overrides }),
  updateFeatureOverride: (name, value) => set((state) => ({
    featureOverrides: { ...state.featureOverrides, [name]: value },
  })),
  resetFeatureOverrides: () => set({ featureOverrides: {}, autoFindResult: null }),
  setAutoFindResult: (result) => set({ autoFindResult: result }),
  resetExplainability: () => set({
    featureImportance: null,
    senseCheckText: '',
    patients: [],
    selectedPatientIndex: null,
    waterfallData: null,
    isLoading: false,
    isWaterfallLoading: false,
    domainId: null,
    patientMapData: null,
    isMapLoading: false,
    mapColorMode: 'probability',
    counterfactualData: null,
    isCounterfactualLoading: false,
    featureOverrides: {},
    autoFindResult: null,
  }),
}));

export default useExplainabilityStore;
