
/**
 * Split Visualizer component for Step 3 (Data Preparation) of the MedVix pipeline.
 *
 * @param {object} props - Component props.
 * @returns {JSX.Element} Rendered component.
 */export default function SplitVisualizer({ trainRatio, trainRows, testRows }) {
  return (
    <div className="mt-4">
      {/* Split bar */}
      <div className="h-8 rounded-full overflow-hidden flex">
        <div
          className="bg-primary flex items-center justify-center transition-all duration-300"
          style={{ width: `${trainRatio}%` }}
        >
          <span className="text-[10px] font-bold text-white">
            Train {trainRatio}%
          </span>
        </div>
        <div
          className="bg-blue-500 flex items-center justify-center transition-all duration-300"
          style={{ width: `${100 - trainRatio}%` }}
        >
          <span className="text-[10px] font-bold text-white">
            Test {100 - trainRatio}%
          </span>
        </div>
      </div>

      {/* Counts */}
      <div className="flex justify-between mt-2">
        <span className="text-xs text-muted">
          ~{trainRows.toLocaleString()} training samples
        </span>
        <span className="text-xs text-muted">
          ~{testRows.toLocaleString()} test samples
        </span>
      </div>
    </div>
  );
}
