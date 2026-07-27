import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  HandCoins,
  ExternalLink,
  CheckCircle,
  Filter,
  CheckCircle2, 
  ChevronRight, 
  AlertCircle, 
  Sparkles
} from 'lucide-react';
import { getLoans } from '../data/loans';
import type { Loan } from '../types';
import { Button } from '../components/ui/Button';
import { LoansHero } from '../components/hero/LoansHero';
import { Modal } from '../components/ui/Modal';
import { HeroProductCard } from '../components/ui/HeroProductCard';
import { staggerContainer, staggerItem } from '../utils/animations';
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
  const [toast, setToast] = useState(false);

  const loansData = getLoans(t);
  const filtered = loansData.filter(
    (l) => activeFilter === 'All' || l.category === activeFilter
  );

  const showToast = () => {
    setToast(true);
    setTimeout(() => setToast(false), 3000);
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center shadow-sm">
            <HandCoins size={24} className="text-primary-600" />
          </div>
          <div className="flex flex-col gap-2">
            <motion.h1 variants={fadeIn} className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
              {t('loans.title', 'Loans & Micro-Credit')}
            </motion.h1>
          </div>
        </div>
      </motion.div>
      
      <LoansHero />

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
            <p className="text-4xl font-bold">{loansData.filter((l) => l.isEligible).length} <span className="text-2xl font-medium">{t('loans.loansCount', 'Loans')}</span></p>
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
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filtered.map((loan) => (
          <motion.div key={loan.id} variants={staggerItem} className="h-full">
            <HeroProductCard
              title={loan.name}
              category={loan.category}
              categoryColor="primary"
              imageSrc={loan.imageSrc || '/illustrations/business_loan_hero.png'}
              benefit={loan.benefits[0]}
              highlightLabel="Max Amount"
              highlightValue={`₹${(loan.maxAmount / 100000).toFixed(1)}L`}
              secondaryLabel="Interest Rate"
              secondaryValue={loan.interestRate}
              isRecommended={loan.isEligible}
              onLearnMore={() => setSelectedLoan(loan)}
              onApply={loan.isEligible ? () => setSelectedLoan(loan) : undefined}
            />
          </motion.div>
        ))}
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

            <div className="space-y-4 pt-4 border-t border-slate-100">
               <div>
                 <p className="text-sm font-bold text-slate-800 tracking-wide mb-2 flex items-center gap-2">
                   <CheckCircle size={14} className="text-success-500" /> {t('loans.eligibility', 'Eligibility')}
                 </p>
                 <ul className="space-y-1">
                   {selectedLoan.eligibility.map((e) => (
                     <li key={e} className="text-sm text-slate-600 pl-6 relative before:content-[''] before:w-1.5 before:h-1.5 before:bg-slate-300 before:rounded-full before:absolute before:left-2 before:top-2">
                       {e}
                     </li>
                   ))}
                 </ul>
               </div>
               <div>
                 <p className="text-sm font-bold text-slate-800 tracking-wide mb-2 flex items-center gap-2">
                   <span className="text-secondary-500">✦</span> {t('loans.benefits', 'Benefits')}
                 </p>
                 <ul className="space-y-1">
                   {selectedLoan.benefits.map((b) => (
                     <li key={b} className="text-sm text-slate-600 pl-6 relative before:content-[''] before:w-1.5 before:h-1.5 before:bg-slate-300 before:rounded-full before:absolute before:left-2 before:top-2">
                       {b}
                     </li>
                   ))}
                 </ul>
               </div>
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
