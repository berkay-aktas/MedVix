import { create } from 'zustand';

const useMLStore = create((set) => ({
  selectedModel: null,
  hyperparams: {},
  trainedModels: [],
  activeModelResult: null,
  isTraining: false,
  autoRetrain: false,
  comparison: null,

  setSelectedModel: (modelType) =>
    set({ selectedModel: modelType, hyperparams: {} }),

  setHyperparam: (name, value) =>
    set((state) => ({
      hyperparams: { ...state.hyperparams, [name]: value },
    })),

  setHyperparams: (params) => set({ hyperparams: params }),

  addTrainedModel: (result) =>
    set((state) => ({
      trainedModels: [...state.trainedModels, result],
      activeModelResult: result,
    })),

  setActiveModelResult: (result) => set({ activeModelResult: result }),

  setIsTraining: (training) => set({ isTraining: training }),

  setAutoRetrain: (enabled) => set({ autoRetrain: enabled }),

  setComparison: (comparison) => set({ comparison: comparison }),

  resetML: () =>
    set({
      selectedModel: null,
      hyperparams: {},
      trainedModels: [],
      activeModelResult: null,
      isTraining: false,
      autoRetrain: false,
      comparison: null,
    }),
}));

export default useMLStore;
