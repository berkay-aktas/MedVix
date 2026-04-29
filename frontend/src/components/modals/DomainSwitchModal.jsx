import Modal from '../ui/Modal';
import Banner from '../ui/Banner';
import Button from '../ui/Button';
import useModalStore from '../../stores/useModalStore';
import usePipelineStore from '../../stores/usePipelineStore';
import useDataStore from '../../stores/useDataStore';
import usePreparationStore from '../../stores/usePreparationStore';
import useMLStore from '../../stores/useMLStore';
import useExplainabilityStore from '../../stores/useExplainabilityStore';
import useEthicsStore from '../../stores/useEthicsStore';
import DOMAINS, { getDomainById } from '../../utils/domains';

/**
 * Domain Switch Modal modal dialog for the MedVix application.
 *
 * @param {object} props - Component props.
 * @returns {JSX.Element} Rendered component.
 */
export default function DomainSwitchModal() {
  const { domainSwitchOpen, domainSwitchTarget, closeDomainSwitch } =
    useModalStore();
  const { selectedDomain, setDomain, resetPipeline, currentStep, completeStep, setStep } =
    usePipelineStore();
  const resetData = useDataStore((s) => s.resetData);
  const resetPreparation = usePreparationStore((s) => s.resetPreparation);
  const resetML = useMLStore((s) => s.resetML);
  const resetExplainability = useExplainabilityStore((s) => s.resetExplainability);
  const resetEthics = useEthicsStore((s) => s.resetEthics);

  const targetDomain = domainSwitchTarget
    ? getDomainById(domainSwitchTarget)
    : null;

  const hasProgress = currentStep > 1;

  const handleConfirm = () => {
    if (domainSwitchTarget) {
      // Reset all progress
      resetPipeline();
      resetData();
      resetPreparation();
      resetML();
      resetExplainability();
      resetEthics();

      // Set new domain and go to step 1
      setDomain(domainSwitchTarget);
      completeStep(1);
      setStep(1);
    }
    closeDomainSwitch();
  };

  return (
    <Modal
      isOpen={domainSwitchOpen}
      onClose={closeDomainSwitch}
      title="Switch Clinical Domain"
      subtitle="Select a new domain for your analysis"
      width="max-w-[680px]"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={closeDomainSwitch}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleConfirm} disabled={!domainSwitchTarget}>
            {hasProgress ? 'Switch & Reset' : 'Confirm'}
          </Button>
        </div>
      }
    >
      {/* Warning if there's progress */}
      {hasProgress && (
        <Banner
          variant="warning"
          title="Progress will be reset"
          message="Switching domain will reset all your progress including uploaded data, column mappings, and preparation settings."
          className="mb-4"
        />
      )}

      {/* Domain grid */}
      <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
        {DOMAINS.map((domain) => {
          const isSelected = domainSwitchTarget === domain.id;
          const isCurrent = selectedDomain === domain.id;

          return (
            <button
              key={domain.id}
              onClick={() => {
                if (!isCurrent) {
                  useModalStore.setState({ domainSwitchTarget: domain.id });
                }
              }}
              disabled={isCurrent}
              className={`
                flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all duration-150 text-center
                ${isSelected
                  ? 'border-primary bg-primary-bg ring-1 ring-primary'
                  : isCurrent
                    ? 'border-border bg-slate-50 opacity-50 cursor-not-allowed'
                    : 'border-border bg-white hover:border-primary/40 cursor-pointer'
                }
              `}
              aria-label={`${domain.name} - ${domain.subtitle}${isCurrent ? ' (current)' : ''}`}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-base"
                style={{
                  background: `linear-gradient(135deg, ${domain.gradient.from}, ${domain.gradient.to})`,
                }}
              >
                <span className="drop-shadow-sm">{domain.icon}</span>
              </div>
              <div>
                <div className="text-[11px] font-semibold text-dark leading-tight">
                  {domain.name}
                </div>
                <div className="text-[9px] text-muted">{domain.subtitle}</div>
              </div>
            </button>
          );
        })}
      </div>
    </Modal>
  );
}
