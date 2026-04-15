import { create } from 'zustand';

const usePipelineStore = create((set, get) => ({
  currentStep: 1,
  completedSteps: new Set(),
  selectedDomain: null,
  domainDetail: null,

  setStep: (step) => {
    const { completedSteps } = get();
    // Can only go to step 1, completed steps + 1, or already completed steps
    if (
      step === 1 ||
      completedSteps.has(step) ||
      completedSteps.has(step - 1) ||
      step <= Math.max(...completedSteps, 0) + 1
    ) {
      set({ currentStep: step });
      window.scrollTo({ top: 0 });
    }
  },

  completeStep: (step) => {
    set((state) => {
      const next = new Set(state.completedSteps);
      next.add(step);
      return { completedSteps: next };
    });
  },

  setDomain: (domain) => {
    set({ selectedDomain: domain });
  },

  setDomainDetail: (detail) => {
    set({ domainDetail: detail });
  },

  resetPipeline: () => {
    set({
      currentStep: 1,
      completedSteps: new Set(),
      domainDetail: null,
    });
  },

  isStepAccessible: (step) => {
    const { completedSteps } = get();
    if (step === 1) return true;
    return completedSteps.has(step - 1) || completedSteps.has(step);
  },
}));

export default usePipelineStore;
