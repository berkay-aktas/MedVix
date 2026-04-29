import Card from '../../components/ui/Card';
import useDataStore from '../../stores/useDataStore';

function getScoreColor(score) {
  if (score >= 80) return '#16A34A';
  if (score >= 60) return '#D97706';
  return '#DC2626';
}

function getScoreLabel(score) {
  if (score >= 80) return 'Good';
  if (score >= 60) return 'Fair';
  return 'Poor';
}

/**
 * Data Quality Score component for Step 2 (Data Exploration) of the MedVix pipeline.
 *
 * @param {object} props - Component props.
 * @returns {JSX.Element} Rendered component.
 */
export default function DataQualityScore() {
  const dataQualityScore = useDataStore((s) => s.dataQualityScore);

  if (dataQualityScore === null || dataQualityScore === undefined) return null;

  const color = getScoreColor(dataQualityScore);
  const label = getScoreLabel(dataQualityScore);

  // SVG arc parameters for semicircle gauge
  const radius = 52;
  const circumference = Math.PI * radius; // half circle
  const progress = (dataQualityScore / 100) * circumference;

  return (
    <Card title="Data Quality" className="w-48 flex-shrink-0">
      <div className="flex flex-col items-center">
        <svg
          width="120"
          height="72"
          viewBox="0 0 120 72"
          className="overflow-visible"
          aria-label={`Data quality score: ${dataQualityScore} out of 100`}
          role="img"
        >
          {/* Background arc */}
          <path
            d="M 8 64 A 52 52 0 0 1 112 64"
            fill="none"
            stroke="#E2E8F0"
            strokeWidth="8"
            strokeLinecap="round"
          />
          {/* Progress arc */}
          <path
            d="M 8 64 A 52 52 0 0 1 112 64"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${progress} ${circumference}`}
            className="transition-all duration-700"
          />
          {/* Score text */}
          <text
            x="60"
            y="56"
            textAnchor="middle"
            className="font-mono font-bold"
            style={{ fontSize: '24px', fill: color }}
          >
            {dataQualityScore}
          </text>
        </svg>
        <span
          className="text-xs font-semibold mt-1"
          style={{ color }}
        >
          {label}
        </span>
      </div>
    </Card>
  );
}
