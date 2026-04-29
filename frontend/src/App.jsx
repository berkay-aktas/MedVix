import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { Construction } from 'lucide-react';
import PageLayout from './components/layout/PageLayout';
import GlossaryModal from './components/modals/GlossaryModal';
import DomainSwitchModal from './components/modals/DomainSwitchModal';
import ColumnMapperModal from './components/modals/ColumnMapperModal';
import Step1ClinicalContext from './pages/Step1ClinicalContext/Step1ClinicalContext';
import Step2DataExploration from './pages/Step2DataExploration/Step2DataExploration';
import Step3DataPreparation from './pages/Step3DataPreparation/Step3DataPreparation';
import Step4ModelParameters from './pages/Step4ModelParameters/Step4ModelParameters';
import Step5Results from './pages/Step5Results/Step5Results';
import Step6Explainability from './pages/Step6Explainability/Step6Explainability';
import Step7EthicsBias from './pages/Step7EthicsBias/Step7EthicsBias';
import usePipelineStore from './stores/usePipelineStore';
import useDataStore from './stores/useDataStore';
import useExplainabilityStore from './stores/useExplainabilityStore';
import useEthicsStore from './stores/useEthicsStore';
import Card from './components/ui/Card';
import api from './utils/api';

function PlaceholderStep({ step, sprint }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        <Construction className="w-8 h-8 text-muted" />
      </div>
      <h2 className="text-lg font-semibold text-dark mb-2">
        Step {step} — Coming in Sprint {sprint}
      </h2>
      <p className="text-sm text-muted max-w-md">
        This step is under development and will be available in a future sprint.
        Continue exploring the available steps.
      </p>
    </div>
  );
}

function CurrentStep() {
  const currentStep = usePipelineStore((s) => s.currentStep);
  const schemaOK = useDataStore((s) => s.schemaOK);

  switch (currentStep) {
    case 1:
      return <Step1ClinicalContext />;
    case 2:
      return <Step2DataExploration />;
    case 3:
      return <Step3DataPreparation />;
    case 4:
      return <Step4ModelParameters />;
    case 5:
      return <Step5Results />;
    case 6:
      return <Step6Explainability />;
    case 7:
      return <Step7EthicsBias />;
    default:
      return <Step1ClinicalContext />;
  }
}

/**
 * App component for the MedVix application.
 *
 * @param {object} props - Component props.
 * @returns {JSX.Element} Rendered component.
 */
export default function App() {
  const setDomain = usePipelineStore((s) => s.setDomain);
  const selectedDomain = usePipelineStore((s) => s.selectedDomain);
  const completeStep = usePipelineStore((s) => s.completeStep);

  // Load domains from API on mount and auto-select first
  useEffect(() => {
    const loadDomains = async () => {
      try {
        const response = await api.get('/domains');
        // Domains loaded successfully - if no domain selected, select first
        if (!selectedDomain && response.data?.domains?.length > 0) {
          setDomain(response.data.domains[0].id);
          completeStep(1);
        }
      } catch {
        // API not available, will use local domain data
        // Auto-select first domain from local data
        if (!selectedDomain) {
          setDomain('cardiology');
          completeStep(1);
        }
      }
    };
    loadDomains();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            fontSize: '13px',
            borderRadius: '12px',
            padding: '12px 16px',
          },
          success: {
            iconTheme: {
              primary: '#059669',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#DC2626',
              secondary: '#fff',
            },
          },
        }}
      />

      <PageLayout>
        <CurrentStep />
      </PageLayout>

      {/* Global modals */}
      <GlossaryModal />
      <DomainSwitchModal />
      <ColumnMapperModal />
    </>
  );
}
