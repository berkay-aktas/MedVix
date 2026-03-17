import { create } from 'zustand';

const usePreparationStore = create((set) => ({
  trainRatio: 80,
  missingStrategy: 'median',
  normMethod: 'zscore',
  smoteEnabled: false,
  isApplied: false,
  isApplying: false,
  beforeStats: null,
  afterStats: null,
  preparationResult: null,

  setTrainRatio: (ratio) => set({ trainRatio: ratio }),
  setMissingStrategy: (strategy) => set({ missingStrategy: strategy }),
  setNormMethod: (method) => set({ normMethod: method }),
  setSmoteEnabled: (enabled) => set({ smoteEnabled: enabled }),
  setIsApplied: (applied) => set({ isApplied: applied }),
  setIsApplying: (applying) => set({ isApplying: applying }),

  setPreparationResult: (result) =>
    set({
      preparationResult: result,
      isApplied: true,
      isApplying: false,
    }),

  resetPreparation: () =>
    set({
      trainRatio: 80,
      missingStrategy: 'median',
      normMethod: 'zscore',
      smoteEnabled: false,
      isApplied: false,
      isApplying: false,
      beforeStats: null,
      afterStats: null,
      preparationResult: null,
    }),
}));

export default usePreparationStore;
