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
  }),
}));

export default useExplainabilityStore;
