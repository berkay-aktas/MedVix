import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import Modal from '../ui/Modal';
import Badge from '../ui/Badge';
import useModalStore from '../../stores/useModalStore';
import GLOSSARY from '../../utils/glossary';

/**
 * Glossary Modal modal dialog for the MedVix application.
 *
 * @param {object} props - Component props.
 * @returns {JSX.Element} Rendered component.
 */
export default function GlossaryModal() {
  const { glossaryOpen, closeGlossary } = useModalStore();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return GLOSSARY;
    const q = search.toLowerCase();
    return GLOSSARY.filter(
      (item) =>
        item.term.toLowerCase().includes(q) ||
        item.definition.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <Modal
      isOpen={glossaryOpen}
      onClose={closeGlossary}
      title="Glossary"
      subtitle={`${GLOSSARY.length} ML and clinical terms`}
      width="max-w-3xl"
    >
      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <input
          type="text"
          placeholder="Search terms..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 text-sm border border-border rounded-xl bg-slate-50 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
          aria-label="Search glossary terms"
        />
      </div>

      {/* Terms grid */}
      {filtered.length === 0 ? (
        <p className="text-sm text-muted text-center py-8">
          No terms match your search.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((item) => (
            <div
              key={item.term}
              className="border border-border rounded-xl p-4 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-sm font-semibold text-dark">
                  {item.term}
                </span>
                <Badge variant={item.tag}>{item.tag.toUpperCase()}</Badge>
              </div>
              <p className="text-xs text-muted leading-relaxed">
                {item.definition}
              </p>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}
