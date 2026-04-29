import { Settings2, Play } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Banner from '../../components/ui/Banner';
import SliderControl from '../../components/ui/SliderControl';
import OptionCard from '../../components/ui/OptionCard';
import ToggleSwitch from '../../components/ui/ToggleSwitch';
import useDataStore from '../../stores/useDataStore';
import usePreparationStore from '../../stores/usePreparationStore';
import usePipelineStore from '../../stores/usePipelineStore';
import api from '../../utils/api';
import SplitVisualizer from './SplitVisualizer';
import NormalisationResults from './NormalisationResults';
import SmoteResults from './SmoteResults';

/**
 * Step3 Data Preparation component for Step 3 (Data Preparation) of the MedVix pipeline.
 *
 * @param {object} props - Component props.
 * @returns {JSX.Element} Rendered component.
 */
export default function Step3DataPreparation() {
  const sessionId = useDataStore((s) => s.sessionId);
  const isImbalanced = useDataStore((s) => s.isImbalanced);
  const uploadResponse = useDataStore((s) => s.uploadResponse);
  const totalRows = uploadResponse?.row_count || 0;

  const {
    trainRatio,
    missingStrategy,
    normMethod,
    smoteEnabled,
    isApplied,
    isApplying,
    preparationResult,
    setTrainRatio,
    setMissingStrategy,
    setNormMethod,
    setSmoteEnabled,
    setIsApplying,
    setPreparationResult,
  } = usePreparationStore();

  const completeStep = usePipelineStore((s) => s.completeStep);

  const trainRows = Math.round(totalRows * (trainRatio / 100));
  const testRows = totalRows - trainRows;

  const handleApply = async () => {
    if (!sessionId) {
      toast.error('No data session. Please load data in Step 2 first.');
      return;
    }

    setIsApplying(true);
    try {
      const response = await api.post('/data/prepare', {
        session_id: sessionId,
        test_size: (100 - trainRatio) / 100,
        missing_strategy: missingStrategy,
        normalisation: normMethod,
        apply_smote: smoteEnabled,
      });
      setPreparationResult(response.data);
      completeStep(3);
      toast.success('Data preparation complete!');
    } catch (err) {
      toast.error(err.message || 'Preparation failed.');
      setIsApplying(false);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Page header */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-flex items-center rounded-full bg-primary-bg text-primary text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5">
            Step 3
          </span>
        </div>
        <h1 className="text-xl font-semibold text-dark">Data Preparation</h1>
        <p className="text-sm text-muted mt-1">
          Configure preprocessing settings before model training.
        </p>
      </div>

      <div className="space-y-5">
        {/* Section 1: Train/Test Split */}
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
              1
            </div>
            <h3 className="text-sm font-semibold text-dark">
              Train / Test Split
            </h3>
          </div>

          <SliderControl
            label="Training Data Ratio"
            min={60}
            max={90}
            step={5}
            value={trainRatio}
            onChange={setTrainRatio}
            displayFormat={(v) => `${v}%`}
          />

          <SplitVisualizer
            trainRatio={trainRatio}
            trainRows={trainRows}
            testRows={testRows}
          />
        </Card>

        {/* Section 2: Missing Value Strategy */}
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
              2
            </div>
            <h3 className="text-sm font-semibold text-dark">
              Missing Value Strategy
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <OptionCard
              title="Median"
              description="Replace missing numeric values with the column median. Robust to outliers."
              selected={missingStrategy === 'median'}
              onClick={() => setMissingStrategy('median')}
              recommended
            />
            <OptionCard
              title="Mode"
              description="Replace missing values with the most frequent value. Works for all types."
              selected={missingStrategy === 'mode'}
              onClick={() => setMissingStrategy('mode')}
            />
            <OptionCard
              title="Remove Rows"
              description="Delete rows containing any missing values. Reduces dataset size."
              selected={missingStrategy === 'remove'}
              onClick={() => setMissingStrategy('remove')}
            />
          </div>
        </Card>

        {/* Section 3: Normalisation */}
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
              3
            </div>
            <h3 className="text-sm font-semibold text-dark">
              Normalisation Method
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <OptionCard
              title="Z-Score (Standardisation)"
              description="Centers data around mean=0 with std=1. Handles outliers well."
              formula="(x - \u03BC) / \u03C3"
              selected={normMethod === 'zscore'}
              onClick={() => setNormMethod('zscore')}
              recommended
            />
            <OptionCard
              title="Min-Max Scaling"
              description="Scales values to a 0-1 range. Preserves original distribution shape."
              formula="(x - min) / (max - min)"
              selected={normMethod === 'minmax'}
              onClick={() => setNormMethod('minmax')}
            />
          </div>
        </Card>

        {/* Section 4: SMOTE */}
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
              4
            </div>
            <h3 className="text-sm font-semibold text-dark">
              SMOTE (Class Balancing)
            </h3>
          </div>

          <ToggleSwitch
            enabled={smoteEnabled}
            onChange={setSmoteEnabled}
            label="Enable SMOTE"
            description={
              isImbalanced
                ? 'Generates synthetic samples for the minority class to balance the dataset.'
                : 'No class imbalance detected. SMOTE is not recommended for this dataset.'
            }
            disabled={!isImbalanced}
          />

          {!isImbalanced && (
            <Banner
              variant="info"
              message="Class distribution appears balanced. SMOTE is disabled."
              className="mt-3"
            />
          )}
        </Card>

        {/* Apply Button */}
        <div className="flex justify-center">
          <Button
            variant="primary"
            size="lg"
            onClick={handleApply}
            disabled={isApplying}
            icon={isApplying ? Settings2 : Play}
            className={isApplying ? 'animate-pulse' : ''}
          >
            {isApplying
              ? 'Applying Preparation Settings...'
              : 'Apply Preparation Settings'}
          </Button>
        </div>

        {/* Results Section */}
        {isApplied && preparationResult && (
          <div className="space-y-5 animate-slide-up">
            {/* Success Banner */}
            <Banner
              variant="success"
              title="Data preparation complete!"
              message={
                preparationResult.success_message ||
                'Your data is ready for model training.'
              }
            />

            {/* Summary stats */}
            <Card title="Preparation Summary">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="text-center p-3 bg-slate-50 rounded-xl">
                  <div className="text-xl font-bold font-mono text-dark">
                    {preparationResult.train_rows.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-muted font-medium uppercase tracking-wide">
                    Training Rows
                  </div>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-xl">
                  <div className="text-xl font-bold font-mono text-dark">
                    {preparationResult.test_rows.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-muted font-medium uppercase tracking-wide">
                    Test Rows
                  </div>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-xl">
                  <div className="text-xl font-bold font-mono text-dark">
                    {preparationResult.feature_count}
                  </div>
                  <div className="text-[10px] text-muted font-medium uppercase tracking-wide">
                    Features
                  </div>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-xl">
                  <div className="text-xl font-bold font-mono text-dark">
                    {preparationResult.missing_before} &rarr;{' '}
                    {preparationResult.missing_after}
                  </div>
                  <div className="text-[10px] text-muted font-medium uppercase tracking-wide">
                    Missing Values
                  </div>
                </div>
              </div>
            </Card>

            {/* Before/After Normalisation */}
            <NormalisationResults preparationResult={preparationResult} />

            {/* Before/After SMOTE */}
            {preparationResult.smote?.applied && (
              <SmoteResults smote={preparationResult.smote} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
