import { useState, useEffect } from 'react';
import { Receipt, Copy, RefreshCw, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import useMLStore from '../../stores/useMLStore';
import useDataStore from '../../stores/useDataStore';
import useEthicsStore from '../../stores/useEthicsStore';
import api from '../../utils/api';

export default function ReceiptCard() {
  const sessionId = useDataStore((s) => s.sessionId);
  const activeModelResult = useMLStore((s) => s.activeModelResult);
  const checklistStatus = useEthicsStore((s) => s.checklistStatus);
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchReceipt = async () => {
    if (!sessionId || !activeModelResult) return;
    setIsLoading(true);
    try {
      const res = await api.post('/ethics/generate-receipt', {
        session_id: sessionId,
        model_id: activeModelResult.model_id,
        checklist_status: checklistStatus || {},
      });
      setData(res.data);
    } catch (err) {
      toast.error(err.message || 'Failed to generate receipt');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipt();
  }, [sessionId, activeModelResult?.model_id]);

  // Refresh when checklist toggles change (after the first fetch lands)
  const checklistKey = JSON.stringify(checklistStatus || {});
  useEffect(() => {
    if (data) fetchReceipt();
  }, [checklistKey]);

  const handleCopy = async () => {
    if (!data) return;
    try {
      await navigator.clipboard.writeText(data.receipt);
      setCopied(true);
      toast.success('Receipt copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy to clipboard');
    }
  };

  const formatTimestamp = (iso) => {
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  };

  return (
    <div className="rounded-xl border border-border bg-white overflow-hidden">
      <div className="px-5 pt-4 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 bg-primary-bg text-primary">
            <Receipt className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-[15px] font-semibold text-dark">Pipeline receipt</h3>
            <p className="text-[11px] text-muted">Plain-language summary of every decision in this session.</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleCopy}
            disabled={!data}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-primary bg-primary-bg hover:bg-primary-bg/70 rounded-lg transition-colors disabled:opacity-50"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            type="button"
            onClick={fetchReceipt}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-primary bg-primary-bg hover:bg-primary-bg/70 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>
      <div className="px-6 py-5">
        {isLoading && !data ? (
          <p className="text-sm text-muted italic">Generating session summary...</p>
        ) : data ? (
          <>
            <p className="text-[14px] text-slate-800 leading-relaxed whitespace-pre-wrap">{data.receipt}</p>
            <p className="text-[11px] text-muted mt-3">
              Generated {formatTimestamp(data.generated_at)} · Deterministic, no AI generation.
            </p>
          </>
        ) : (
          <p className="text-sm text-muted italic">Receipt unavailable.</p>
        )}
      </div>
    </div>
  );
}
