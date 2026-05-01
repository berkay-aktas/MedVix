import { useMemo } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Map, AlertCircle, Info } from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import useExplainabilityStore from '../../stores/useExplainabilityStore';

// ─────────── Color helpers ───────────

/**
 * Linear interpolation between two hex colors.
 */
function lerpColor(hex1, hex2, t) {
  const h1 = parseInt(hex1.slice(1), 16);
  const h2 = parseInt(hex2.slice(1), 16);
  const r1 = (h1 >> 16) & 0xff;
  const g1 = (h1 >> 8) & 0xff;
  const b1 = h1 & 0xff;
  const r2 = (h2 >> 16) & 0xff;
  const g2 = (h2 >> 8) & 0xff;
  const b2 = h2 & 0xff;
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

/**
 * Map probability [0, 1] → green → amber → red gradient color.
 */
function probabilityToColor(p) {
  if (p == null || isNaN(p)) return '#94A3B8';
  if (p < 0.5) {
    // green (0) → amber (0.5)
    return lerpColor('#059669', '#F59E0B', p * 2);
  }
  // amber (0.5) → red (1)
  return lerpColor('#F59E0B', '#DC2626', (p - 0.5) * 2);
}

const SEX_COLORS = {
  Male: '#2563EB',
  Female: '#DB2777',
};

function sexToColor(sex) {
  return SEX_COLORS[sex] ?? '#94A3B8';
}

function ageToColor(age) {
  if (!age) return '#94A3B8';
  // Younger band slightly lighter, older band darker — distinct hues
  return age.startsWith('<') ? '#0EA5E9' : '#7C3AED';
}

function colorForPoint(point, mode) {
  if (mode === 'sex') return sexToColor(point.subgroup_sex);
  if (mode === 'age') return ageToColor(point.subgroup_age);
  return probabilityToColor(point.probability);
}

// ─────────── Custom dot ───────────

/**
 * Custom Recharts shape for each scatter point.
 * Renders a circle whose color/size/stroke encode multiple dimensions.
 */
function PatientDot(props) {
  const { cx, cy, payload, selectedIndex, colorMode, onSelect } = props;
  if (cx == null || cy == null || !payload) return null;

  const color = colorForPoint(payload, colorMode);
  const isSelected = payload.index === selectedIndex;
  const isMisclassified = payload.is_misclassified;
  // Confidence radius: more confident → larger dot. Range 5–10 px.
  const confidence = Math.abs((payload.probability ?? 0.5) - 0.5);
  const r = 5 + confidence * 10;

  return (
    <g
      style={{ cursor: 'pointer' }}
      onClick={() => onSelect && onSelect(payload.index)}
    >
      {/* Selected ring */}
      {isSelected && (
        <circle
          cx={cx}
          cy={cy}
          r={r + 4}
          fill="none"
          stroke="#059669"
          strokeWidth={2.5}
          opacity={0.85}
        />
      )}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill={isMisclassified ? '#FFFFFF' : color}
        stroke={color}
        strokeWidth={isMisclassified ? 2.2 : 1}
        fillOpacity={isMisclassified ? 1 : 0.85}
      />
    </g>
  );
}

// ─────────── Tooltip ───────────

function MapTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const p = payload[0].payload;
  if (!p) return null;

  const probPct = (p.probability * 100).toFixed(0);

  return (
    <div className="bg-white border border-border rounded-lg shadow-modal px-3 py-2.5 text-xs space-y-1.5 min-w-[230px]">
      <div className="font-semibold text-dark text-sm">{p.label}</div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-muted">Model says</span>
        <span
          className={clsx(
            'font-semibold',
            !p.is_multiclass && p.predicted_class === 'positive' && 'text-red-600',
            !p.is_multiclass && p.predicted_class === 'negative' && 'text-emerald-700'
          )}
        >
          {p.is_multiclass
            ? `Class ${p.predicted_class}`
            : `${p.predicted_class === 'positive' ? 'High risk' : 'Low risk'} · ${probPct}% confidence`}
        </span>
      </div>
      {p.actual_class != null && (
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted">Truth in data</span>
          <span
            className={clsx(
              'font-semibold',
              !p.is_multiclass && p.actual_class === 'positive' && 'text-red-600',
              !p.is_multiclass && p.actual_class === 'negative' && 'text-emerald-700',
              p.is_multiclass && 'text-text-main'
            )}
          >
            {p.is_multiclass
              ? `Class ${p.actual_class}`
              : (p.actual_class === 'positive' ? 'High risk' : 'Low risk')}
          </span>
        </div>
      )}
      {p.is_misclassified ? (
        <div className="flex items-start gap-1.5 text-amber-800 bg-amber-50 border border-amber-200 rounded px-2 py-1.5 mt-1">
          <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
          <span className="leading-snug">
            <strong>Model got this wrong.</strong> Worth a closer look at why.
          </span>
        </div>
      ) : (
        <div className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-100 rounded px-2 py-1 mt-1">
          Model and reality agree for this patient.
        </div>
      )}
      {(p.subgroup_sex || p.subgroup_age) && (
        <div className="flex items-center gap-2 text-[11px] text-muted pt-1 border-t border-border mt-1">
          {p.subgroup_sex && <span>{p.subgroup_sex}</span>}
          {p.subgroup_sex && p.subgroup_age && <span>·</span>}
          {p.subgroup_age && <span>Age {p.subgroup_age}</span>}
        </div>
      )}
      <div className="text-[10px] text-primary font-semibold pt-1">
        Click to see which measurements drove this decision →
      </div>
    </div>
  );
}

// ─────────── Main component ───────────

/**
 * Patient Risk Map — 2D scatter of every test-set patient for Step 6.
 *
 * Each dot:
 *  - Position: PCA component 1 (x) and 2 (y) from the trained model's test set
 *  - Color: probability gradient (default), or sex / age subgroup
 *  - Size: confidence (|prob − 0.5|) — bigger = more confident
 *  - Border: hollow for misclassified patients, filled otherwise
 *  - Click: selects the patient and triggers the existing waterfall fetch
 */
export default function PatientRiskMap() {
  const patientMapData = useExplainabilityStore((s) => s.patientMapData);
  const isMapLoading = useExplainabilityStore((s) => s.isMapLoading);
  const mapColorMode = useExplainabilityStore((s) => s.mapColorMode);
  const setMapColorMode = useExplainabilityStore((s) => s.setMapColorMode);
  const selectedPatientIndex = useExplainabilityStore((s) => s.selectedPatientIndex);
  const setSelectedPatientIndex = useExplainabilityStore((s) => s.setSelectedPatientIndex);

  const handleSelect = (index) => {
    setSelectedPatientIndex(index);
  };

  // Pad the visible domain so dots near the edges aren't clipped by the chart frame.
  const xDomain = useMemo(() => {
    if (!patientMapData?.points?.length) return [0, 1];
    const xs = patientMapData.points.map((p) => p.x);
    const min = Math.min(...xs);
    const max = Math.max(...xs);
    const pad = (max - min) * 0.08 || 0.5;
    return [min - pad, max + pad];
  }, [patientMapData]);

  const yDomain = useMemo(() => {
    if (!patientMapData?.points?.length) return [0, 1];
    const ys = patientMapData.points.map((p) => p.y);
    const min = Math.min(...ys);
    const max = Math.max(...ys);
    const pad = (max - min) * 0.08 || 0.5;
    return [min - pad, max + pad];
  }, [patientMapData]);

  const scatterData = patientMapData?.points || [];

  // Effective color mode: don't allow 'sex' if subgroup unavailable
  const effectiveMode = useMemo(() => {
    if (!patientMapData) return 'probability';
    if (mapColorMode === 'sex' && !patientMapData.has_sex_subgroup) return 'probability';
    if (mapColorMode === 'age' && !patientMapData.has_age_subgroup) return 'probability';
    return mapColorMode;
  }, [mapColorMode, patientMapData]);

  // Loading skeleton
  if (isMapLoading && !patientMapData) {
    return (
      <div className="bg-white rounded-xl shadow-card border border-border overflow-hidden mb-5">
        <div className="px-5 pt-4 flex items-center gap-2">
          <span className="w-7 h-7 rounded-md bg-primary-bg text-primary flex items-center justify-center">
            <Map className="w-4 h-4" />
          </span>
          <h3 className="text-[15px] font-semibold text-dark">Patient Risk Map</h3>
        </div>
        <div className="flex items-center justify-center py-16 text-muted text-sm">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
          Computing patient map...
        </div>
      </div>
    );
  }

  if (!patientMapData || scatterData.length === 0) {
    return null;
  }

  const totalPatients = scatterData.length;
  const misclassifiedCount = scatterData.filter((p) => p.is_misclassified).length;
  const variance = patientMapData.pca_explained_variance || [0, 0];
  const totalVariance = (variance[0] + (variance[1] || 0)) * 100;

  return (
    <div className="bg-white rounded-xl shadow-card border border-border overflow-hidden mb-5">
      {/* Header */}
      <div className="px-5 pt-4 pb-3 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-md bg-primary-bg text-primary flex items-center justify-center">
            <Map className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-[15px] font-semibold text-dark">Patient Risk Map</h3>
            <p className="text-[11px] text-muted leading-tight">
              {totalPatients} patients in the test set · click any dot to see why
            </p>
          </div>
        </div>

        {/* Color mode toggle */}
        <div className="inline-flex rounded-lg border border-border bg-slate-50 p-0.5 text-xs">
          <ColorButton
            active={effectiveMode === 'probability'}
            onClick={() => setMapColorMode('probability')}
            label="Probability"
          />
          <ColorButton
            active={effectiveMode === 'sex'}
            onClick={() => {
              if (!patientMapData.has_sex_subgroup) {
                toast(
                  "Sex coloring isn't available for this dataset — the source has no documented sex column (or the cohort is single-sex). Probability and Age remain.",
                  { icon: 'ℹ️', duration: 4500 }
                );
                return;
              }
              setMapColorMode('sex');
            }}
            label="Sex"
            unavailable={!patientMapData.has_sex_subgroup}
          />
          <ColorButton
            active={effectiveMode === 'age'}
            onClick={() => {
              if (!patientMapData.has_age_subgroup) {
                toast(
                  "Age binning isn't available for this dataset — no age column or threshold is configured for this domain.",
                  { icon: 'ℹ️', duration: 4500 }
                );
                return;
              }
              setMapColorMode('age');
            }}
            label="Age"
            unavailable={!patientMapData.has_age_subgroup}
          />
        </div>
      </div>

      {/* Plain-language explainer — for non-CS / non-stats readers */}
      <div className="mx-5 mb-3 px-4 py-2.5 bg-emerald-50/60 border border-emerald-100 rounded-lg text-[12px] text-emerald-900 leading-relaxed">
        <strong className="text-emerald-800">How to read this:</strong>{' '}
        Every dot is one patient. <strong>Patients with similar measurements sit close together.</strong>{' '}
        <strong>Colour</strong> shows the model's predicted risk (green = low, red = high).{' '}
        <strong>Hollow dots</strong> are patients the model got wrong — those are the cases to scrutinise first.{' '}
        <strong>Click any dot</strong> to see exactly which features pushed the model's decision.
      </div>

      {/* Subgroup availability note (visible, non-blocking) */}
      {(!patientMapData.has_sex_subgroup || !patientMapData.has_age_subgroup) && (
        <div className="px-5 -mt-1 mb-2">
          <div className="inline-flex items-start gap-1.5 text-[11px] text-muted">
            <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
            <span>
              {!patientMapData.has_sex_subgroup && !patientMapData.has_age_subgroup
                ? 'Sex and Age coloring are unavailable for this dataset (no subgroup columns configured).'
                : !patientMapData.has_sex_subgroup
                  ? 'Sex coloring is unavailable for this dataset (single-sex cohort or no sex column).'
                  : 'Age coloring is unavailable for this dataset (no age threshold configured).'}{' '}
              Click a disabled button for details.
            </span>
          </div>
        </div>
      )}

      {/* Scatter chart */}
      <div className="px-2 pb-1" style={{ height: 360 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 18, bottom: 24, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis
              type="number"
              dataKey="x"
              domain={xDomain}
              tick={false}
              axisLine={{ stroke: '#CBD5E1' }}
              label={{
                value: '← Patients more similar         Patients more different →',
                position: 'insideBottom',
                offset: -8,
                style: { fontSize: 11, fill: '#64748B', fontStyle: 'italic' },
              }}
            />
            <YAxis
              type="number"
              dataKey="y"
              domain={yDomain}
              tick={false}
              axisLine={{ stroke: '#CBD5E1' }}
              label={{
                value: 'Patient profile (along a different axis)',
                angle: -90,
                position: 'insideLeft',
                offset: 12,
                style: { fontSize: 11, fill: '#64748B', fontStyle: 'italic' },
              }}
            />
            <Tooltip
              content={<MapTooltip />}
              cursor={{ strokeDasharray: '3 3' }}
              isAnimationActive={false}
            />
            <Scatter
              data={scatterData}
              shape={(props) => (
                <PatientDot
                  {...props}
                  selectedIndex={selectedPatientIndex}
                  colorMode={effectiveMode}
                  onSelect={handleSelect}
                />
              )}
              isAnimationActive={false}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="px-5 pb-4 pt-1 border-t border-border bg-slate-50">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-muted pt-3">
          {effectiveMode === 'probability' && (
            <div className="flex items-center gap-2">
              <span className="font-semibold text-dark uppercase tracking-wide text-[10px]">
                Color
              </span>
              <span
                className="inline-block w-16 h-2.5 rounded"
                style={{
                  background:
                    'linear-gradient(90deg, #059669 0%, #F59E0B 50%, #DC2626 100%)',
                }}
              />
              <span>Low predicted risk → High predicted risk</span>
            </div>
          )}
          {effectiveMode === 'sex' && (
            <div className="flex items-center gap-3">
              <span className="font-semibold text-dark uppercase tracking-wide text-[10px]">
                Color
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded-full" style={{ background: SEX_COLORS.Male }} />
                <span>Male</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded-full" style={{ background: SEX_COLORS.Female }} />
                <span>Female</span>
              </span>
            </div>
          )}
          {effectiveMode === 'age' && (
            <div className="flex items-center gap-3">
              <span className="font-semibold text-dark uppercase tracking-wide text-[10px]">
                Color
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded-full" style={{ background: '#0EA5E9' }} />
                <span>Younger</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded-full" style={{ background: '#7C3AED' }} />
                <span>Older</span>
              </span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="font-semibold text-dark uppercase tracking-wide text-[10px]">
              Filled / Hollow
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-full bg-slate-400" />
              <span>Model agreed with reality</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className="inline-block w-3 h-3 rounded-full bg-white"
                style={{ borderWidth: 2, borderColor: '#94A3B8', borderStyle: 'solid' }}
              />
              <span>Model got it wrong ({misclassifiedCount})</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-dark uppercase tracking-wide text-[10px]">
              Size
            </span>
            <span>Bigger dot = model is more sure of its answer</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ColorButton({ active, onClick, label, unavailable = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'px-3 py-1 rounded font-semibold transition-colors inline-flex items-center gap-1',
        active && !unavailable && 'bg-white text-primary shadow-sm',
        !active && !unavailable && 'text-muted hover:text-dark',
        unavailable && 'text-slate-400 cursor-help hover:text-slate-500 italic'
      )}
      title={unavailable ? 'Click to learn why this mode is unavailable' : undefined}
    >
      {label}
      {unavailable && <span className="text-[9px] font-normal not-italic">·n/a</span>}
    </button>
  );
}
