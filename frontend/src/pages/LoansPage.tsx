import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  HandCoins,
  Clock,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  CheckCircle,
  Filter,
} from 'lucide-react';
import { loans } from '../data/loans';
import type { Loan } from '../types';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { staggerContainer, staggerItem, hoverScale } from '../utils/animations';
import { Toast } from '../components/ui/Modal';

const categoryFilters = ['All', 'Micro Loan', 'Sector Specific', 'Employment Generation', 'Entrepreneurship', 'MSME', 'Working Capital'];

export default function LoansPage() {
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [toast, setToast] = useState(false);

  const filtered = loans.filter(
    (l) => activeFilter === 'All' || l.category === activeFilter
  );

  const showToast = () => {
    setToast(true);
    setTimeout(() => setToast(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
            <HandCoins size={22} className="text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 font-display">Loan Schemes</h1>
            <p className="text-sm text-slate-500">AI-matched loans based on your profile</p>
          </div>
        </div>
      </motion.div>

      {/* Summary Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl p-5 text-white flex flex-col sm:flex-row items-center justify-between gap-4"
      >
        <div>
          <p className="text-white/80 text-sm font-medium">Total eligible loans found</p>
          <p className="text-3xl font-bold">{loans.filter((l) => l.isEligible).length} Loans</p>
          <p className="text-white/70 text-xs mt-1">Up to ₹1 Crore available across schemes</p>
        </div>
        <div className="flex gap-3">
          <div className="text-center bg-white/15 rounded-2xl px-5 py-3">
            <p className="text-xl font-bold">6%</p>
            <p className="text-xs text-white/70">Lowest Rate</p>
          </div>
          <div className="text-center bg-white/15 rounded-2xl px-5 py-3">
            <p className="text-xl font-bold">3 days</p>
            <p className="text-xs text-white/70">Fastest Approval</p>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <Filter size={16} className="text-slate-400 flex-shrink-0" />
        {categoryFilters.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            className={[
              'flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200',
              activeFilter === cat
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50',
            ].join(' ')}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Loan Cards */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-2 gap-5"
      >
        {filtered.map((loan) => {
          const isExpanded = expandedId === loan.id;
          return (
            <motion.div
              key={loan.id}
              variants={staggerItem}
              className={[
                'bg-white rounded-3xl shadow-sm border-2 transition-all duration-300 overflow-hidden',
                loan.isEligible ? 'border-emerald-100 hover:border-emerald-300' : 'border-slate-100 opacity-80',
              ].join(' ')}
            >
              {/* Card Header */}
              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-11 h-11 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <HandCoins size={20} className="text-emerald-600" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-800 text-sm leading-tight">{loan.name}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{loan.provider}</p>
                    </div>
                  </div>
                  {loan.isEligible ? (
                    <Badge variant="emerald" dot>Eligible</Badge>
                  ) : (
                    <Badge variant="slate">Not Eligible</Badge>
                  )}
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="bg-emerald-50 rounded-xl p-2.5 text-center">
                    <p className="text-sm font-bold text-emerald-700">
                      ₹{loan.maxAmount >= 100000
                        ? `${(loan.maxAmount / 100000).toFixed(1)}L`
                        : `${(loan.maxAmount / 1000).toFixed(0)}K`}
                    </p>
                    <p className="text-[10px] text-slate-500">Max Amount</p>
                  </div>
                  <div className="bg-indigo-50 rounded-xl p-2.5 text-center">
                    <p className="text-sm font-bold text-indigo-700">{loan.interestRate.split(' ')[0]}</p>
                    <p className="text-[10px] text-slate-500">Interest Rate</p>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-2.5 text-center">
                    <Clock size={12} className="text-amber-600 mx-auto mb-0.5" />
                    <p className="text-[10px] text-slate-500">{loan.processingTime.split('–')[0]} days</p>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {loan.tags.map((tag) => (
                    <span key={tag} className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setExpandedId(isExpanded ? null : loan.id)}
                    rightIcon={isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  >
                    {isExpanded ? 'Hide Details' : 'View Details'}
                  </Button>
                  {loan.isEligible && (
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => { setSelectedLoan(loan); showToast(); }}
                      rightIcon={<ExternalLink size={14} />}
                    >
                      Apply Now
                    </Button>
                  )}
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-slate-100 px-5 pb-5 pt-4 space-y-4"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Eligibility</p>
                    <ul className="space-y-1.5">
                      {loan.eligibility.map((e) => (
                        <li key={e} className="flex items-start gap-2 text-xs text-slate-600">
                          <CheckCircle size={12} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                          {e}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Benefits</p>
                    <ul className="space-y-1.5">
                      {loan.benefits.map((b) => (
                        <li key={b} className="flex items-start gap-2 text-xs text-slate-600">
                          <span className="text-amber-500 flex-shrink-0">✦</span>
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Required Documents</p>
                    <div className="flex flex-wrap gap-1.5">
                      {loan.requiredDocuments.map((doc) => (
                        <span key={doc} className="text-[10px] font-medium bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full">
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
      <Modal
        isOpen={!!selectedLoan}
        onClose={() => setSelectedLoan(null)}
        title={selectedLoan?.name}
        size="lg"
      >
        {selectedLoan && (
          <div className="space-y-5">
            <div className="bg-emerald-50 rounded-2xl p-4 flex items-center gap-3">
              <CheckCircle size={24} className="text-emerald-500" />
              <div>
                <p className="font-bold text-slate-800">You're Eligible!</p>
                <p className="text-sm text-slate-500">Based on your Weaver ID and profile</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Max Amount', value: `₹${(selectedLoan.maxAmount / 100000).toFixed(1)}L` },
                { label: 'Interest Rate', value: selectedLoan.interestRate },
                { label: 'Processing Time', value: selectedLoan.processingTime },
                { label: 'Provider', value: selectedLoan.provider },
              ].map((item) => (
                <div key={item.label} className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-500">{item.label}</p>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{item.value}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-slate-600">
              Visit your nearest bank or use the official government portal to apply. Your Weaver ID and Aadhaar are required.
            </p>
            <Button fullWidth size="lg" rightIcon={<ExternalLink size={18} />} onClick={() => setSelectedLoan(null)}>
              Proceed to Apply
            </Button>
          </div>
        )}
      </Modal>

      <Toast message="Application process initiated! Check your registered phone for updates." isVisible={toast} />
    </div>
  );
}
