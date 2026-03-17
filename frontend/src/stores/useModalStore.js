import { create } from 'zustand';

const useModalStore = create((set) => ({
  glossaryOpen: false,
  columnMapperOpen: false,
  domainSwitchOpen: false,
  domainSwitchTarget: null,

  openGlossary: () => set({ glossaryOpen: true }),
  closeGlossary: () => set({ glossaryOpen: false }),

  openColumnMapper: () => set({ columnMapperOpen: true }),
  closeColumnMapper: () => set({ columnMapperOpen: false }),

  openDomainSwitch: (targetDomain) =>
    set({ domainSwitchOpen: true, domainSwitchTarget: targetDomain }),
  closeDomainSwitch: () =>
    set({ domainSwitchOpen: false, domainSwitchTarget: null }),
}));

export default useModalStore;
