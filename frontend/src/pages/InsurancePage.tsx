import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Star, ChevronDown, ChevronUp, CheckCircle, ExternalLink } from 'lucide-react';
import { insurancePolicies } from '../data/insurance';
import type { InsurancePolicy } from '../types';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Toast } from '../components/ui/Modal';
import { staggerContainer, staggerItem } from '../utils/animations';

const typeColors: Record<string, { bg: string; text: string; border: string }> = {
  'Life Insurance': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  'Health Insurance': { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
  'Accident Insurance': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
};

export default function InsurancePage() {
  const [selectedPolicy, setSelectedPolicy] = useState<InsurancePolicy | null>(null);
  const [activeType, setActiveType] = useState('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [toast, setToast] = useState(false);

  const types = ['All', 'Life Insurance', 'Health Insurance', 'Accident Insurance'];
  const filtered = insurancePolicies.filter((p) => activeType === 'All' || p.type === activeType);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
            <Shield size={22} className="text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 font-display">Insurance Policies</h1>
            <p className="text-sm text-slate-500">Government-backed and private plans for your security</p>
          </div>
        </div>
      </motion.div>

      {/* Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-r from-indigo-600 to-violet-700 rounded-3xl p-5 text-white flex flex-col sm:flex-row items-center justify-between gap-4"
      >
        <div>
          <p className="text-white/80 text-sm">Protect your family starting at just</p>
          <p className="text-3xl font-bold">₹20/year</p>
          <p className="text-white/70 text-xs mt-1">PMSBY – Accidental death & disability cover</p>
        </div>
        <div className="flex gap-3">
          <div className="text-center bg-white/15 rounded-2xl px-5 py-3">
            <p className="text-xl font-bold">₹7L+</p>
            <p className="text-xs text-white/70">Max Coverage</p>
          </div>
          <div className="text-center bg-white/15 rounded-2xl px-5 py-3">
            <p className="text-xl font-bold">3</p>
            <p className="text-xs text-white/70">Recommended</p>
          </div>
        </div>
      </motion.div>

      {/* Type Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {types.map((type) => (
          <button
            key={type}
            onClick={() => setActiveType(type)}
            className={[
              'flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200',
              activeType === type
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50',
            ].join(' ')}
          >
            {type}
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
        {filtered.map((policy) => {
          const colors = typeColors[policy.type] || typeColors['Health Insurance'];
          const isExpanded = expandedId === policy.id;

          return (
            <motion.div
              key={policy.id}
              variants={staggerItem}
              className={[
                'bg-white rounded-3xl shadow-sm border-2 transition-all duration-300 overflow-hidden',
                policy.isRecommended ? 'border-indigo-200' : 'border-slate-100',
              ].join(' ')}
            >
              {policy.isRecommended && (
                <div className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-bold px-5 py-2 flex items-center gap-1.5">
                  <Star size={12} fill="currentColor" />
                  AI Recommended for You
                </div>
              )}

              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`w-11 h-11 ${colors.bg} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                      <Shield size={20} className={colors.text} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-800 text-sm leading-tight">{policy.name}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{policy.provider}</p>
                    </div>
                  </div>
                  <Badge variant={policy.type === 'Life Insurance' ? 'indigo' : policy.type === 'Accident Insurance' ? 'amber' : 'teal'}>
                    {policy.type.split(' ')[0]}
                  </Badge>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className={`${colors.bg} rounded-xl p-3`}>
                    <p className="text-[10px] text-slate-500 mb-0.5">Coverage</p>
                    <p className={`text-sm font-bold ${colors.text} leading-tight`}>{policy.coverage}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3">
                    <p className="text-[10px] text-slate-500 mb-0.5">Annual Premium</p>
                    <p className="text-sm font-bold text-slate-800">
                      {policy.annualPremium === 0 ? '🆓 FREE' : `₹${policy.annualPremium.toLocaleString('en-IN')}`}
                    </p>
                  </div>
                </div>

                {/* Benefits Preview */}
                <div className="space-y-1.5 mb-4">
                  {policy.benefits.slice(0, 2).map((b) => (
                    <div key={b} className="flex items-start gap-2 text-xs text-slate-600">
                      <CheckCircle size={12} className={`${colors.text} flex-shrink-0 mt-0.5`} />
                      {b}
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setExpandedId(isExpanded ? null : policy.id)}
                    rightIcon={isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  >
                    {isExpanded ? 'Less' : 'Details'}
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="flex-1"
                    onClick={() => { setSelectedPolicy(policy); setToast(true); setTimeout(() => setToast(false), 3000); }}
                    rightIcon={<ExternalLink size={14} />}
                  >
                    Enroll
                  </Button>
                </div>
              </div>

              {/* Expanded */}
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="border-t border-slate-100 px-5 pb-5 pt-4 space-y-4"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">All Benefits</p>
                    <ul className="space-y-1.5">
                      {policy.benefits.map((b) => (
                        <li key={b} className="flex items-start gap-2 text-xs text-slate-600">
                          <CheckCircle size={12} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Eligibility</p>
                    <ul className="space-y-1.5">
                      {policy.eligibility.map((e) => (
                        <li key={e} className="flex items-start gap-2 text-xs text-slate-600">
                          <span className="text-indigo-500 flex-shrink-0">•</span>
                          {e}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Claim Process</p>
                    <ol className="space-y-1.5 list-decimal list-inside">
                      {policy.claimProcess.map((step, i) => (
                        <li key={i} className="text-xs text-slate-600">{step}</li>
                      ))}
                    </ol>
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </motion.div>

      {/* Modal */}
      <Modal isOpen={!!selectedPolicy} onClose={() => setSelectedPolicy(null)} title="Enroll in Insurance" size="md">
        {selectedPolicy && (
          <div className="space-y-4">
            <div className="bg-indigo-50 rounded-2xl p-4">
              <p className="font-bold text-slate-800">{selectedPolicy.name}</p>
              <p className="text-sm text-slate-500 mt-1">Coverage: {selectedPolicy.coverage}</p>
              <p className="text-sm font-bold text-indigo-700 mt-1">
                Premium: {selectedPolicy.annualPremium === 0 ? 'Free (Government Scheme)' : `₹${selectedPolicy.annualPremium}/year`}
              </p>
            </div>
            <p className="text-sm text-slate-600">
              {selectedPolicy.annualPremium === 0
                ? 'Visit your nearest PHC (Primary Health Centre) or government office with your Aadhaar to enroll.'
                : 'Visit your nearest bank branch or insurance office. Auto-debit from your savings account is available.'}
            </p>
            <Button fullWidth size="lg" variant="secondary" onClick={() => setSelectedPolicy(null)}>
              Got it, I'll Enroll
            </Button>
          </div>
        )}
      </Modal>

      <Toast message="Insurance enrollment initiated! Visit your bank with Aadhaar." isVisible={toast} type="info" />
    </div>
  );
}
