import { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Calendar, CheckCircle, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { govtSchemes } from '../data/schemes';
import type { GovtScheme } from '../types';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Toast } from '../components/ui/Modal';
import { staggerContainer, staggerItem } from '../utils/animations';

const categoryColors: Record<string, string> = {
  'Raw Material': 'emerald',
  'Subsidy': 'teal',
  'Technology Upgrade': 'indigo',
  'Development Programme': 'amber',
  'Skill Development': 'purple',
};

export default function SchemesPage() {
  const [selectedScheme, setSelectedScheme] = useState<GovtScheme | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [toast, setToast] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', ...Array.from(new Set(govtSchemes.map((s) => s.category)))];
  const filtered = govtSchemes.filter((s) => activeCategory === 'All' || s.category === activeCategory);

  const getDaysLeft = (deadline?: string) => {
    if (!deadline) return null;
    const diff = new Date(deadline).getTime() - Date.now();
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
            <Building2 size={22} className="text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 font-display">Government Schemes</h1>
            <p className="text-sm text-slate-500">Welfare programmes you're eligible for</p>
          </div>
        </div>
      </motion.div>

      {/* Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-3xl p-5 text-white"
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-white/80 text-sm">You're eligible for</p>
            <p className="text-3xl font-bold">{govtSchemes.length} Active Schemes</p>
            <p className="text-white/70 text-xs mt-1">Ministry of Textiles & other departments</p>
          </div>
          <div className="flex gap-3">
            <div className="text-center bg-white/15 rounded-2xl px-4 py-3">
              <p className="text-xl font-bold">90%</p>
              <p className="text-xs text-white/70">Subsidy Max</p>
            </div>
            <div className="text-center bg-white/15 rounded-2xl px-4 py-3">
              <p className="text-xl font-bold">₹3K/mo</p>
              <p className="text-xs text-white/70">Training Stipend</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={[
              'flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all',
              activeCategory === cat
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-amber-300',
            ].join(' ')}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Cards */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-2 gap-5"
      >
        {filtered.map((scheme) => {
          const daysLeft = getDaysLeft(scheme.deadline);
          const isExpanded = expandedId === scheme.id;
          const badgeVariant = (categoryColors[scheme.category] || 'slate') as 'emerald' | 'teal' | 'indigo' | 'amber' | 'purple' | 'slate';

          return (
            <motion.div
              key={scheme.id}
              variants={staggerItem}
              className="bg-white rounded-3xl shadow-sm border-2 border-amber-100 hover:border-amber-300 transition-all duration-300 overflow-hidden"
            >
              <div className="p-5">
                {/* Header */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-11 h-11 bg-amber-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Building2 size={20} className="text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-slate-800 text-sm leading-tight">{scheme.name}</h3>
                      <Badge variant={badgeVariant} className="flex-shrink-0">{scheme.category}</Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{scheme.ministry}</p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 mb-4 leading-relaxed line-clamp-2">
                  {scheme.description}
                </p>

                {/* Benefits Preview */}
                <div className="space-y-1.5 mb-4">
                  {scheme.benefits.slice(0, 2).map((b) => (
                    <div key={b} className="flex items-start gap-2 text-xs text-slate-600">
                      <CheckCircle size={12} className="text-amber-500 flex-shrink-0 mt-0.5" />
                      {b}
                    </div>
                  ))}
                </div>

                {/* Deadline */}
                {daysLeft !== null && (
                  <div className={`flex items-center gap-2 rounded-xl px-3 py-2 mb-4 text-xs font-semibold ${
                    daysLeft <= 30 ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    <Calendar size={12} />
                    {daysLeft === 0 ? 'Deadline today!' : `${daysLeft} days left to apply`}
                    {scheme.deadline && (
                      <span className="ml-1 text-slate-400 font-normal">
                        ({new Date(scheme.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })})
                      </span>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-amber-200 text-amber-700 hover:bg-amber-50"
                    onClick={() => setExpandedId(isExpanded ? null : scheme.id)}
                    rightIcon={isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  >
                    {isExpanded ? 'Less Info' : 'Full Details'}
                  </Button>
                  <Button
                    size="sm"
                    variant="amber"
                    className="flex-1"
                    onClick={() => { setSelectedScheme(scheme); setToast(true); setTimeout(() => setToast(false), 3000); }}
                    rightIcon={<ExternalLink size={14} />}
                  >
                    Apply
                  </Button>
                </div>
              </div>

              {/* Expanded */}
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="border-t border-amber-100 px-5 pb-5 pt-4 space-y-4"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">All Benefits</p>
                    <ul className="space-y-1.5">
                      {scheme.benefits.map((b) => (
                        <li key={b} className="flex items-start gap-2 text-xs text-slate-600">
                          <CheckCircle size={12} className="text-amber-500 flex-shrink-0 mt-0.5" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Eligibility</p>
                    <ul className="space-y-1.5">
                      {scheme.eligibility.map((e) => (
                        <li key={e} className="flex items-start gap-2 text-xs text-slate-600">
                          <span className="text-amber-500 flex-shrink-0">•</span>
                          {e}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Required Documents</p>
                    <div className="flex flex-wrap gap-1.5">
                      {scheme.documents.map((doc) => (
                        <span key={doc} className="text-[10px] font-medium bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full">
                          {doc}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </motion.div>

      {/* Apply Modal */}
      <Modal isOpen={!!selectedScheme} onClose={() => setSelectedScheme(null)} title="Apply for Scheme" size="md">
        {selectedScheme && (
          <div className="space-y-4">
            <div className="bg-amber-50 rounded-2xl p-4">
              <p className="font-bold text-slate-800">{selectedScheme.name}</p>
              <p className="text-xs text-amber-700 font-semibold mt-1">{selectedScheme.ministry}</p>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-700 mb-2">Documents to Carry:</p>
              <ul className="space-y-1.5">
                {selectedScheme.documents.map((doc) => (
                  <li key={doc} className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle size={14} className="text-amber-500" />
                    {doc}
                  </li>
                ))}
              </ul>
            </div>
            <p className="text-sm text-slate-600">
              Visit your nearest District Handloom Office or apply through the official government portal at{' '}
              <span className="text-indigo-600 font-semibold">handlooms.nic.in</span>
            </p>
            <Button fullWidth size="lg" variant="amber" onClick={() => setSelectedScheme(null)}>
              Understood, I'll Apply
            </Button>
          </div>
        )}
      </Modal>

      <Toast message="Scheme application guidance sent to your registered number!" isVisible={toast} type="success" />
    </div>
  );
}
