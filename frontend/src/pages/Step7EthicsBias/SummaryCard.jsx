import { FileText, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import useMLStore from '../../stores/useMLStore';
import useDataStore from '../../stores/useDataStore';
import useEthicsStore from '../../stores/useEthicsStore';
import api from '../../utils/api';

export default function SummaryCard({ biasAnalysis, domainName }) {
  const activeModelResult = useMLStore((s) => s.activeModelResult);
  const sessionId = useDataStore((s) => s.sessionId);
  const checklistStatus = useEthicsStore((s) => s.checklistStatus);
  const isGeneratingPdf = useEthicsStore((s) => s.isGeneratingPdf);
  const setIsGeneratingPdf = useEthicsStore((s) => s.setIsGeneratingPdf);

  const checkedCount = Object.values(checklistStatus).filter(Boolean).length;

  const handleDownload = async () => {
    if (!sessionId || !activeModelResult) return;

    setIsGeneratingPdf(true);
    try {
      const res = await api.post(
        '/ethics/generate-certificate',
        {
          session_id: sessionId,
          model_id: activeModelResult.model_id,
          checklist_status: checklistStatus,
        },
        { responseType: 'blob' }
      );

      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `MedVix_Certificate_${activeModelResult.model_id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Certificate downloaded successfully');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to generate certificate');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Build summary text
  const modelName = activeModelResult?.model_name || activeModelResult?.model_type || 'Unknown';
  const metrics = activeModelResult?.metrics || [];
  const accMetric = metrics.find((m) => m.name === 'accuracy');
  const aucMetric = metrics.find((m) => m.name === 'auc_roc');
  const accStr = accMetric ? `${(accMetric.value * 100).toFixed(0)}% accuracy` : '';
  const aucStr = aucMetric ? `${aucMetric.value.toFixed(2)} AUC` : '';
  const biasStr = biasAnalysis?.bias_detected
    ? 'has identified fairness concerns'
    : 'shows no significant fairness concerns';

  return (
    <div className="rounded-xl border border-emerald-200 overflow-hidden" style={{ background: 'linear-gradient(135deg, #F0FDF9 0%, #ECFDF5 50%, #F0FDFA 100%)' }}>
      <div className="px-5 pt-4 flex items-center gap-2">
        <span className="w-7 h-7 rounded-md flex items-center justify-center shrink-0" style={{ background: 'rgba(5,150,105,0.15)', color: '#059669' }}>
          <FileText className="w-4 h-4" />
        </span>
        <h3 className="text-[15px] font-semibold text-dark">Assessment summary</h3>
      </div>
      <div className="px-6 py-5">
        <p className="text-sm text-slate-700 leading-relaxed mb-5">
          The <strong>{modelName}</strong> model for <strong>{domainName}</strong> shows{' '}
          {accStr && aucStr ? `${accStr} and ${aucStr}` : accStr || aucStr || 'evaluated performance'}{' '}
          and {biasStr} across patient subgroups.{' '}
          <strong>{checkedCount} of 8</strong> EU AI Act requirements are met.
        </p>
        <button
          onClick={handleDownload}
          disabled={isGeneratingPdf}
          className="inline-flex items-center gap-2 px-7 py-3 bg-primary text-white rounded-lg text-[15px] font-semibold shadow-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGeneratingPdf ? (
            <>
              <div className="w-[18px] h-[18px] border-2 border-white border-t-transparent rounded-full animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Download className="w-[18px] h-[18px]" />
              Download Assessment Certificate (PDF)
            </>
          )}
        </button>
        <p className="text-[12px] text-muted mt-3">
          This certificate summarises the model evaluation for documentation purposes.
        </p>
      </div>
    </div>
  );
}
