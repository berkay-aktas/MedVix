import { create } from 'zustand';

const useModalStore = create((set) => ({
  glossaryOpen: false,
  columnMapperOpen: false,
  domainSwitchOpen: false,
  domainSwitchTarget: null,
  dataInspectorOpen: false,
  dataInspectorFilterNames: null,
  dataInspectorInitialColumn: null,

  openGlossary: () => set({ glossaryOpen: true }),
  closeGlossary: () => set({ glossaryOpen: false }),

  openColumnMapper: () => set({ columnMapperOpen: true }),
  closeColumnMapper: () => set({ columnMapperOpen: false }),

  openDomainSwitch: (targetDomain) =>
    set({ domainSwitchOpen: true, domainSwitchTarget: targetDomain }),
  closeDomainSwitch: () =>
    set({ domainSwitchOpen: false, domainSwitchTarget: null }),

  openDataInspector: (options = {}) =>
    set({
      dataInspectorOpen: true,
      dataInspectorFilterNames: options.filterNames || null,
      dataInspectorInitialColumn: options.initialColumn || null,
    }),
  closeDataInspector: () =>
    set({
      dataInspectorOpen: false,
      dataInspectorFilterNames: null,
      dataInspectorInitialColumn: null,
    }),
}));

export default useModalStore;
