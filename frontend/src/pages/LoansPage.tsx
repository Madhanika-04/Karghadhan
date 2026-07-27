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
import { Card, CardContent } from '../components/ui/Card';
import { staggerContainer, staggerItem, hoverScale } from '../utils/animations';
import { Toast } from '../components/ui/Modal';
import { useTranslation } from 'react-i18next';

// Mapping for filters so we can translate them dynamically
const categoryFilters = [
  { key: 'loans.filterAll', label: 'All' },
  { key: 'loans.filterMicro', label: 'Micro Loan' },
  { key: 'loans.filterSector', label: 'Sector Specific' },
  { key: 'loans.filterEmployment', label: 'Employment Generation' },
  { key: 'loans.filterEntrepreneurship', label: 'Entrepreneurship' },
  { key: 'loans.filterMSME', label: 'MSME' },
  { key: 'loans.filterWorkingCapital', label: 'Working Capital' }
];

export default function LoansPage() {
  const { t } = useTranslation();
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
          <div className="w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center shadow-sm">
            <HandCoins size={24} className="text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 font-display tracking-tight">{t('loans.title', 'Loan Schemes')}</h1>
            <p className="text-sm text-slate-500">{t('loans.subtitle', 'AI-matched loans based on your profile')}</p>
          </div>
        </div>
      </motion.div>

      {/* Summary Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-primary-600 to-indigo-700 rounded-3xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-lg shadow-primary-200/50 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 w-full flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-white/80 text-sm font-medium uppercase tracking-wider mb-1">{t('loans.eligibleFound', 'Eligible Loans Found')}</p>
            <p className="text-4xl font-bold">{loans.filter((l) => l.isEligible).length} <span className="text-2xl font-medium">{t('loans.loansCount', 'Loans')}</span></p>
            <p className="text-white/80 text-sm mt-2 font-medium">{t('loans.bannerSub', 'Up to ₹1 Crore available across schemes')}</p>
          </div>
          <div className="flex gap-4 w-full sm:w-auto">
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 flex-1 sm:flex-none border border-white/10">
              <p className="text-2xl font-bold">6%</p>
              <p className="text-xs text-white/80 font-medium">{t('loans.lowestRate', 'Lowest Rate')}</p>
            </div>
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 flex-1 sm:flex-none border border-white/10">
              <p className="text-2xl font-bold">3 {t('loans.days', 'days')}</p>
              <p className="text-xs text-white/80 font-medium">{t('loans.approval', 'Approval')}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide pt-2">
        <Filter size={16} className="text-slate-400 flex-shrink-0 ml-1" />
        {categoryFilters.map((cat) => (
          <button
            key={cat.label}
            onClick={() => setActiveFilter(cat.label)}
            className={[
              'flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200',
              activeFilter === cat.label
                ? 'bg-primary-600 text-white shadow-md shadow-primary-200'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-primary-300 hover:bg-primary-50',
            ].join(' ')}
          >
            {t(cat.key, cat.label)}
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
                'transition-all duration-300',
                !loan.isEligible && 'opacity-70',
              ].join(' ')}
            >
              <Card className={`h-full border-2 ${loan.isEligible ? 'border-primary-100 hover:border-primary-300' : 'border-slate-100'}`}>
                <CardContent className="p-0">
                  {/* Card Header */}
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-3 mb-5">
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl flex items-center justify-center flex-shrink-0 border border-primary-100/50">
                          <HandCoins size={22} className="text-primary-600" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-slate-900 text-base leading-tight mb-1">{loan.name}</h3>
                          <p className="text-xs text-slate-500 font-medium">{loan.provider}</p>
                        </div>
                      </div>
                      {loan.isEligible ? (
                        <Badge variant="success" dot className="bg-success-50 text-success-700 border-success-200">{t('loans.eligible', 'Eligible')}</Badge>
                      ) : (
                        <Badge variant="slate">{t('loans.notEligible', 'Not Eligible')}</Badge>
                      )}
                    </div>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-3 gap-3 mb-5">
                      <div className="bg-primary-50 rounded-xl p-3 text-center border border-primary-100/50">
                        <p className="text-base font-bold text-primary-700">
                          ₹{loan.maxAmount >= 100000
                            ? `${(loan.maxAmount / 100000).toFixed(1)}L`
                            : `${(loan.maxAmount / 1000).toFixed(0)}K`}
                        </p>
                        <p className="text-[10px] text-slate-500 font-medium mt-0.5">{t('loans.maxAmount', 'Max Amount')}</p>
                      </div>
                      <div className="bg-indigo-50 rounded-xl p-3 text-center border border-indigo-100/50">
                        <p className="text-base font-bold text-indigo-700">{loan.interestRate.split(' ')[0]}</p>
                        <p className="text-[10px] text-slate-500 font-medium mt-0.5">{t('loans.interestRate', 'Interest Rate')}</p>
                      </div>
                      <div className="bg-secondary-50 rounded-xl p-3 text-center border border-secondary-100/50">
                        <p className="text-base font-bold text-secondary-700">{loan.processingTime.split('–')[0]}d</p>
                        <p className="text-[10px] text-slate-500 font-medium mt-0.5">{t('loans.processing', 'Processing')}</p>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-5">
                      {loan.tags.map((tag) => (
                        <span key={tag} className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md">
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-slate-200 hover:bg-slate-50 text-slate-700"
                        onClick={() => setExpandedId(isExpanded ? null : loan.id)}
                        rightIcon={isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      >
                        {isExpanded ? t('common.hideDetails', 'Hide Details') : t('common.viewDetails', 'View Details')}
                      </Button>
                      {loan.isEligible && (
                        <Button
                          size="sm"
                          className="flex-1 shadow-sm shadow-primary-200"
                          onClick={() => { setSelectedLoan(loan); showToast(); }}
                          rightIcon={<ExternalLink size={14} />}
                        >
                          {t('common.applyNow', 'Apply Now')}
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
                      className="border-t border-slate-100 bg-slate-50/50 px-6 pb-6 pt-5 space-y-5 rounded-b-3xl"
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-800 tracking-wide mb-3 flex items-center gap-2">
                          <CheckCircle size={14} className="text-success-500" /> {t('loans.eligibility', 'Eligibility')}
                        </p>
                        <ul className="space-y-2">
                          {loan.eligibility.map((e) => (
                            <li key={e} className="flex items-start gap-2 text-sm text-slate-600 leading-relaxed">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 flex-shrink-0" />
                              {e}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 tracking-wide mb-3 flex items-center gap-2">
                          <span className="text-secondary-500">✦</span> {t('loans.benefits', 'Benefits')}
                        </p>
                        <ul className="space-y-2">
                          {loan.benefits.map((b) => (
                            <li key={b} className="flex items-start gap-2 text-sm text-slate-600 leading-relaxed">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 flex-shrink-0" />
                              {b}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 tracking-wide mb-3">{t('loans.requiredDocs', 'Required Documents')}</p>
                        <div className="flex flex-wrap gap-2">
                          {loan.requiredDocuments.map((doc) => (
                            <span key={doc} className="text-xs font-semibold bg-white border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg shadow-sm">
                              {doc}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
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
          <div className="space-y-6">
            <div className="bg-success-50 border border-success-100 rounded-2xl p-5 flex items-start gap-4">
              <CheckCircle size={28} className="text-success-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-lg font-bold text-slate-900 mb-1">{t('loans.eligibleTitle', "You're Eligible!")}</p>
                <p className="text-sm text-slate-600">{t('loans.eligibleDesc', 'Based on your verified Weaver ID and KarghaDhan Profile.')}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: t('loans.maxAmount', 'Max Amount'), value: `₹${(selectedLoan.maxAmount / 100000).toFixed(1)}L` },
                { label: t('loans.interestRate', 'Interest Rate'), value: selectedLoan.interestRate },
                { label: t('loans.processing', 'Processing Time'), value: selectedLoan.processingTime },
                { label: t('loans.provider', 'Provider'), value: selectedLoan.provider },
              ].map((item) => (
                <div key={item.label} className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                  <p className="text-xs font-semibold text-slate-500 mb-1">{item.label}</p>
                  <p className="text-base font-bold text-slate-900">{item.value}</p>
                </div>
              ))}
            </div>
            
            <div className="bg-primary-50 rounded-2xl p-4 border border-primary-100">
              <p className="text-sm text-primary-800 font-medium leading-relaxed">
                {t('loans.applyInstruction', 'Visit your nearest bank branch or use the official portal to apply. Keep your Weaver ID and Aadhaar Card handy.')}
              </p>
            </div>
            
            <Button fullWidth size="lg" rightIcon={<ExternalLink size={18} />} onClick={() => setSelectedLoan(null)} className="shadow-md shadow-primary-200">
              {t('common.proceedApply', 'Proceed to Apply')}
            </Button>
          </div>
        )}
      </Modal>

      <Toast message={t('loans.applyInitiated', 'Application process initiated! Check your registered phone for updates.')} isVisible={toast} />
    </div>
  );
}
