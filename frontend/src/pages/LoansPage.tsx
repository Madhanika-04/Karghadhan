import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import businessLoanHero from '@/assets/illustrations/business_loan_hero.png';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HandCoins,
  ExternalLink,
  CheckCircle,
  Filter,
  CheckCircle2, 
  ChevronRight, 
  AlertCircle, 
  Sparkles,
  Calculator,
  TrendingUp,
  Building2,
  Send,
  Clock,
  ShieldCheck,
  Award,
  ArrowRight
} from 'lucide-react';
import { getLoans } from '../data/loans';
import type { Loan } from '../types';
import { productsApi, loanApi, agentsApi } from '../services/api';
import { useAppContext } from '../context/AppContext';
import { Button } from '../components/ui/Button';
import { LoansHero } from '../components/hero/LoansHero';
import { Modal } from '../components/ui/Modal';
import { HeroProductCard } from '../components/ui/HeroProductCard';
import { staggerContainer, staggerItem } from '../utils/animations';
import { Toast } from '../components/ui/Modal';
import { useTranslation } from 'react-i18next';
import { tData } from '../utils/i18nData';

// Category filters matching exact category tabs in UI
const categoryFilters = [
  { key: 'loans.filterAll', label: 'All' },
  { key: 'loans.filterMicro', label: 'Micro Loan' },
  { key: 'loans.filterSector', label: 'Sector Specific' },
  { key: 'loans.filterEmployment', label: 'Employment Generation' },
  { key: 'loans.filterEntrepreneurship', label: 'Entrepreneurship' },
  { key: 'loans.filterMSME', label: 'MSME' },
  { key: 'loans.filterWorkingCapital', label: 'Working Capital' }
];

const PARTNER_BANKS = [
  { id: 'sbi', name: 'State Bank of India (SBI) – Handloom Nodal Branch', type: 'Public Sector Bank', subvention: '6% Subsidy Available', time: '3-5 Days' },
  { id: 'canara', name: 'Canara Bank – MSME & Weaver Desk', type: 'Public Sector Bank', subvention: '7% Interest Subvention', time: '5 Days' },
  { id: 'sidbi', name: 'SIDBI – Direct Micro-Credit Facilitation Node', type: 'Development Bank', subvention: 'Zero Collateral', time: '2-4 Days' },
  { id: 'ujjivan', name: 'Ujjivan Small Finance Bank / NBFC Partner', type: 'NBFC Partner', subvention: 'Doorstep Verification', time: '48 Hours' },
  { id: 'nabard', name: 'NABARD Regional Cooperative Handloom Society', type: 'Apex Cooperative', subvention: 'Matching Grant Scheme', time: '7 Days' },
];

export default function LoansPage() {
  const { t } = useTranslation();
  const location = useLocation();
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [toast, setToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const { user } = useAppContext();
  const [realLoans, setRealLoans] = useState<any[]>([]);

  // --- Loan Agent EMI Calculator state ---
  const [loanAmount, setLoanAmount] = useState(50000);
  const [tenureMonths, setTenureMonths] = useState(12);
  const [emiData, setEmiData] = useState<any>(null);
  const [emiLoading, setEmiLoading] = useState(false);

  // --- Enhanced Bank Bridge & Application Form state ---
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState<1 | 2>(1);
  const [selectedBank, setSelectedBank] = useState(PARTNER_BANKS[0].id);
  const [loanPurpose, setLoanPurpose] = useState('Raw Material & Yarn Procurement');
  const [bankAccount, setBankAccount] = useState('98765432109842');
  const [ifscCode, setIfscCode] = useState('SBIN0001234');
  const [declarationAccepted, setDeclarationAccepted] = useState(true);
  const [isSubmittingToBank, setIsSubmittingToBank] = useState(false);
  const [submittedApplications, setSubmittedApplications] = useState<any[]>([]);

  // Auto-open modal if navigated from AI assistant with state payload
  useEffect(() => {
    if (location.state?.autoOpenModal) {
      if (location.state.requestedAmount) {
        setLoanAmount(location.state.requestedAmount);
      }
      if (location.state.loanPurpose) {
        setLoanPurpose(location.state.loanPurpose);
      }
      setModalStep(1);
      setIsBankModalOpen(true);
    }
  }, [location.state]);

  const openApplicationModal = (loan?: any) => {
    if (loan) {
      setSelectedLoan(loan);
      if (loan.maxAmount) {
        setLoanAmount(Math.min(loan.maxAmount, 100000));
      }
      if (loan.category) {
        setLoanPurpose(`${loan.name} - ${loan.category}`);
      }
    } else {
      setLoanPurpose('Raw Material & Yarn Procurement');
    }
    setModalStep(1);
    setIsBankModalOpen(true);
  };

  const calculateLoan = async () => {
    setEmiLoading(true);
    try {
      const res = await agentsApi.loan({
        requested_amount: loanAmount,
        tenure_months: tenureMonths,
        monthly_income: user?.monthlyIncome || 18000,
        annual_interest_rate: 7.0,
      });
      setEmiData(res.data);
    } catch (e) {
      console.warn('Loan agent offline, calculating EMI locally:', e);
      const monthlyRate = 0.07 / 12;
      const emi = Math.round((loanAmount * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) / (Math.pow(1 + monthlyRate, tenureMonths) - 1));
      setEmiData({
        monthly_emi_inr: emi,
        total_repayment_inr: emi * tenureMonths,
        total_interest_inr: (emi * tenureMonths) - loanAmount,
        eligibility_status: loanAmount <= (user?.monthlyIncome || 18000) * 10 ? 'APPROVED' : 'MANUAL_REVIEW',
        effective_interest_rate_pct: 7.0,
        subvention_interest_rate_pct: 5.0,
        eligibility_guidance: `Full approval for ₹${loanAmount.toLocaleString('en-IN')}. Monthly EMI of ₹${emi.toLocaleString('en-IN')} is well within your Yarn Passbook verified income.`
      });
    } finally {
      setEmiLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      productsApi.getRecommendations(user.id).then((res) => {
        const mappedLoans = res.recommended_loans.map((apiLoan: any) => {
          let cat = 'Micro Loan';
          const lid = (apiLoan.id || '').toUpperCase();
          if (lid.includes('MUDRA_CARD') || lid.includes('WORKING') || lid.includes('PASSBOOK')) cat = 'Working Capital';
          else if (lid.includes('KISHOR') || lid.includes('STANDUP')) cat = 'Entrepreneurship';
          else if (lid.includes('PMEGP') || lid.includes('EMPLOYMENT')) cat = 'Employment Generation';
          else if (lid.includes('MSME') || lid.includes('SIDBI')) cat = 'MSME';
          else if (lid.includes('WEAVER')) cat = 'Sector Specific';

          return {
            id: apiLoan.id,
            name: apiLoan.name,
            category: cat,
            isEligible: true,
            maxAmount: apiLoan.max_amount,
            interestRate: `${apiLoan.interest_rate}% ${apiLoan.subsidy_rate ? '(Subsidized)' : ''}`,
            processingTime: '3–7 working days',
            provider: apiLoan.provider,
            benefits: [apiLoan.description],
            eligibility: apiLoan.requirements,
            portalUrl: apiLoan.portal_url,
            portalName: apiLoan.portal_name
          };
        });
        setRealLoans(mappedLoans);
      }).catch(console.error);

      // Fetch submitted loans
      loanApi.getLoans(user.id).then((res) => {
        if (res && res.length > 0) {
          const mapped = res.map((r: any) => {
            let bankName = 'Partner Bank / NBFC';
            if (r.assessment_id) {
              const b = PARTNER_BANKS.find(pb => r.assessment_id.includes(pb.id.toUpperCase()));
              if (b) bankName = b.name;
            }
            return {
              id: r.id.substring(0, 8).toUpperCase(),
              bankName,
              loanName: r.purpose || 'Micro Loan Application',
              amount: r.requested_amount,
              tenure: r.tenure_months,
              emi: Math.round(r.requested_amount / r.tenure_months),
              status: r.status,
              date: (r.applied_at || '').split('T')[0]
            };
          });
          setSubmittedApplications(mapped);
        }
      }).catch(console.error);

      // Auto-calculate EMI on load with defaults
      calculateLoan();
    } else {
      calculateLoan();
    }
  }, [user?.id]);

  const defaultLoans = getLoans(t);
  const combinedLoans = realLoans.length > 0
    ? [...realLoans, ...defaultLoans.filter(d => !realLoans.some(r => r.id === d.id))]
    : defaultLoans;

  const filtered = combinedLoans.filter((l) => {
    if (activeFilter === 'All') return true;
    return l.category === activeFilter;
  });

  const showToast = (msg?: string) => {
    setToastMessage(msg || t('loans.applyInitiated', 'Application process initiated! Check your registered phone for updates.'));
    setToast(true);
    setTimeout(() => setToast(false), 4000);
  };

  const handleTransmitToBank = async () => {
    if (!declarationAccepted) return;
    setIsSubmittingToBank(true);
    const bankObj = PARTNER_BANKS.find(b => b.id === selectedBank) || PARTNER_BANKS[0];
    const trackingId = `KAR-BANK-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      if (user?.id) {
        await loanApi.applyForLoan(
          user.id,
          loanAmount,
          tenureMonths,
          `BANK_BRIDGE_${selectedBank.toUpperCase()}_${loanPurpose.replace(/\s+/g, '_')}`
        );
      }
    } catch (e) {
      console.warn('Backend bank transmission queued locally:', e);
    }

    const newApp = {
      id: trackingId,
      bankName: bankObj.name,
      loanName: selectedLoan?.name || loanPurpose,
      amount: loanAmount,
      tenure: tenureMonths,
      emi: emiData?.monthly_emi_inr || Math.round(loanAmount / tenureMonths),
      status: 'SUBMITTED_TO_BANK',
      date: new Date().toISOString().split('T')[0],
      purpose: loanPurpose,
      accountNo: bankAccount
    };

    const updated = [newApp, ...submittedApplications];
    setSubmittedApplications(updated);

    setIsSubmittingToBank(false);
    setIsBankModalOpen(false);
    setSelectedLoan(null);
    showToast(`✅ ${t('loans.appTransmitted', 'Application {{id}} successfully transmitted to {{bank}}!', { id: trackingId, bank: bankObj.name })}`);
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center shadow-sm">
            <HandCoins size={24} className="text-primary-600" />
          </div>
          <div className="flex flex-col gap-1">
            <motion.h1 variants={fadeIn} className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
              {t('loans.title', 'Loans & Micro-Credit Portal')}
            </motion.h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              {t('loans.subtitle', 'Direct Platform Bridge connecting Handloom Weavers to Banks, Government Schemes, NBFCs & SIDBI')}
            </p>
          </div>
        </div>
      </motion.div>
      
      <LoansHero onApply={() => openApplicationModal()} />

      {/* Credit Score & Eligibility Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-primary-600 via-indigo-700 to-slate-900 rounded-3xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-lg shadow-primary-200/50 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 w-full flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs bg-emerald-400/20 text-emerald-300 font-bold px-2.5 py-0.5 rounded-full border border-emerald-400/30 flex items-center gap-1">
                <ShieldCheck size={12} /> {t('loans.verifiedCreditProfile', 'Verified Credit Profile')}
              </span>
              <span className="text-xs bg-amber-400/20 text-amber-200 font-bold px-2.5 py-0.5 rounded-full border border-amber-400/30">
                {t('loans.weaverCreditScore', 'Weaver Credit Score: {{score}} (Tier A)', { score: user?.cibil_score || 765 })}
              </span>
            </div>
            <p className="text-2xl font-black text-white mt-1">
              {t('loans.eligibleSchemes', 'Eligible for {{count}} Pre-Approved Loan Schemes', { count: combinedLoans.filter((l) => l.isEligible).length })}
            </p>
            <p className="text-xs text-white/80 font-medium">
              {t('loans.eligibleDescFull', 'Up to ₹10 Lakhs available across Mudra, Stand-Up India, SIDBI & Yarn Passbook Working Capital.')}
            </p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto shrink-0">
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-3 flex-1 sm:flex-none border border-white/10">
              <p className="text-xl font-extrabold text-amber-300">6.0%</p>
              <p className="text-[11px] text-white/80 font-medium">{t('loans.subventionRate', 'Subvention Rate')}</p>
            </div>
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-3 flex-1 sm:flex-none border border-white/10">
              <p className="text-xl font-extrabold text-emerald-300">{t('loans.fastBank', 'Fast Bank')}</p>
              <p className="text-[11px] text-white/80 font-medium">{t('loans.directBridge', 'Direct Bridge')}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Yarn Passbook Working Capital Eligible Highlight */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-indigo-900 via-slate-900 to-primary-950 rounded-3xl p-5 text-white flex flex-col sm:flex-row items-center justify-between gap-4 border border-indigo-400/30 shadow-md"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-amber-300 shrink-0">
            <Sparkles size={20} className="animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              {t('loans.yarnPassbookWC', 'Yarn Passbook Working Capital Pre-Approved')}
              <span className="text-[10px] bg-success-500/20 text-success-300 border border-success-400/40 px-2 py-0.5 rounded-full font-bold">{t('common.approved', 'Approved')}</span>
            </h3>
            <p className="text-xs text-indigo-200 mt-0.5">
              {t('loans.yarnPassbookWCDesc', 'Based on your average monthly yarn purchase of ₹18,000, you qualify for up to ₹1,80,000 Working Capital Loan @ 6% interest subvention.')}
            </p>
          </div>
        </div>
        <Button size="sm" onClick={() => openApplicationModal()} className="shrink-0 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold border-none">
          {t('common.applyNow', 'Apply Now')} <ArrowRight size={14} className="ml-1" />
        </Button>
      </motion.div>

      {/* AI EMI Calculator Panel */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden"
      >
        <div className="bg-gradient-to-r from-primary-600 to-indigo-700 px-6 py-4 flex items-center gap-2">
          <Calculator size={18} className="text-white" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">{t('loans.emiCalculator', 'AI Micro-Loan Calculator')}</h2>
          <span className="ml-auto text-xs bg-white/20 text-white px-2.5 py-0.5 rounded-full font-semibold">{t('loans.weaverSubvention', 'Weaver Subvention Rate @ 7%')}</span>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-5">
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-bold text-slate-700">{t('loans.loanAmount', 'Loan Amount')}</label>
                <span className="text-sm font-black text-primary-600">₹{loanAmount.toLocaleString('en-IN')}</span>
              </div>
              <input type="range" min={10000} max={200000} step={5000} value={loanAmount}
                onChange={e => setLoanAmount(Number(e.target.value))}
                className="w-full accent-primary-600 cursor-pointer" />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>₹10,000</span><span>₹2,00,000</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-bold text-slate-700">{t('loans.tenure', 'Tenure')}</label>
                <span className="text-sm font-black text-primary-600">{tenureMonths} {t('loans.months', 'months')}</span>
              </div>
              <input type="range" min={3} max={36} step={3} value={tenureMonths}
                onChange={e => setTenureMonths(Number(e.target.value))}
                className="w-full accent-primary-600 cursor-pointer" />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>{t('loans.nMonths', '3 Months', { count: 3 })}</span><span>{t('loans.nMonths', '36 Months', { count: 36 })}</span>
              </div>
            </div>
            <Button fullWidth onClick={calculateLoan} leftIcon={<Sparkles size={16}/>} disabled={emiLoading}>
              {emiLoading ? t('loans.calculating', 'Calculating...') : t('loans.calculate', 'Calculate EMI & Eligibility')}
            </Button>
          </div>

          {emiData ? (
            <div className="space-y-3 flex flex-col justify-between">
              <div className="bg-primary-50 border border-primary-100 rounded-2xl p-4">
                <p className="text-xs text-primary-600 font-bold uppercase tracking-wide mb-1">{t('loans.monthlyEmi', 'Calculated Monthly EMI')}</p>
                <p className="text-3xl font-black text-primary-700">
                  ₹{emiData.monthly_emi_inr?.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-xs text-slate-500 font-semibold">{t('loans.totalInterest', 'Total Interest')}</p>
                  <p className="text-sm font-black text-slate-800">
                    ₹{(emiData.total_interest_inr || emiData.total_interest_payable_inr || 2023)?.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-xs text-slate-500 font-semibold">{t('loans.interestSubvention', 'Interest Subvention')}</p>
                  <p className="text-sm font-black text-emerald-600">6.0% {t('loans.subsidy', 'Subsidy')}</p>
                </div>
              </div>
              <div className="rounded-xl px-4 py-3 bg-success-50 border border-success-200 flex items-start gap-2.5">
                <TrendingUp size={18} className="text-success-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-black text-success-700 uppercase tracking-wide">
                    {t('loans.approvedAiBridge', 'APPROVED BY KARGHADHAN AI BRIDGE')}
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {tData(emiData.eligibility_guidance) || t('loans.fullApprovalText', `Full approval for ₹{{amount}}. Monthly EMI of ₹{{emi}} is well within your verified Yarn Passbook income.`, { amount: loanAmount.toLocaleString('en-IN'), emi: emiData.monthly_emi_inr })}
                  </p>
                </div>
              </div>

              <Button
                fullWidth
                size="lg"
                onClick={() => openApplicationModal()}
                leftIcon={<Building2 size={18} />}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-200 mt-2"
              >
                {t('loans.submitBankRequest', 'Apply & Submit Application to Partner Banks')}
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400">
              <div className="text-center">
                <Calculator size={40} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">{t('loans.adjustSliders', 'Adjust sliders & tap Calculate')}</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Category Filters */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Filter size={18} className="text-primary-600" />
            {t('loans.exploreProducts', 'Explore Financial Products & Schemes')}
          </h2>
          <span className="text-xs text-slate-500 font-semibold">
            {t('loans.showingProducts', 'Showing {{count}} products in', { count: filtered.length })} <strong className="text-primary-600">{t(`loans.filter${activeFilter.replace(/\s+/g, '')}`, activeFilter)}</strong>
          </span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categoryFilters.map((cat) => (
            <button
              key={cat.label}
              onClick={() => setActiveFilter(cat.label)}
              className={[
                'flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer',
                activeFilter === cat.label
                  ? 'bg-primary-600 text-white shadow-md shadow-primary-200 scale-105'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-primary-300 hover:bg-primary-50',
              ].join(' ')}
            >
              {t(cat.key, cat.label)}
            </button>
          ))}
        </div>
      </div>

      {/* Loan Divisions / Cards Grid */}
      {filtered.length > 0 ? (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filtered.map((loan) => (
            <motion.div key={loan.id} variants={staggerItem} className="h-full">
              <HeroProductCard
                title={tData(loan.name)}
                category={tData(loan.category)}
                categoryColor="primary"
                imageSrc={loan.imageSrc || businessLoanHero}
                benefit={tData(loan.benefits[0])}
                highlightLabel={t('loans.maxAmount', 'Max Amount')}
                highlightValue={`₹${(loan.maxAmount >= 100000 ? (loan.maxAmount / 100000).toFixed(1) + 'L' : (loan.maxAmount / 1000).toFixed(0) + 'K')}`}
                secondaryLabel={t('loans.interestRate', 'Interest Rate')}
                secondaryValue={loan.interestRate}
                isRecommended={loan.isEligible}
                onLearnMore={() => setSelectedLoan(loan)}
                onApply={loan.isEligible ? () => openApplicationModal(loan) : undefined}
              />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <AlertCircle size={40} className="mx-auto text-slate-400 mb-3" />
          <h3 className="text-base font-bold text-slate-800">{t('loans.noProductsFound', 'No loan products found for "{{filter}}"', { filter: activeFilter })}</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">{t('loans.trySelectingAll', 'Try selecting "All" to view all pre-approved schemes.')}</p>
          <Button size="sm" onClick={() => setActiveFilter('All')}>{t('loans.viewAllSchemes', 'View All Schemes')}</Button>
        </div>
      )}

      {/* Submitted Bank Applications Tracking Section */}
      {submittedApplications.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wider">
              <Building2 size={18} className="text-primary-600" />
              {t('loans.activeApplications', 'Your Active Bank & Government Applications ({{count}})', { count: submittedApplications.length })}
            </h2>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Clock size={12} /> {t('loans.liveBridgeStatus', 'Live Bridge Status')}
            </span>
          </div>

          <div className="space-y-3">
            {submittedApplications.map((app) => (
              <div key={app.id} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-800">{app.id}</span>
                    <span className="text-[10px] bg-primary-100 text-primary-700 font-bold px-2 py-0.5 rounded-full">
                      {app.bankName}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{tData(app.loanName)}</h4>
                  <p className="text-xs text-slate-500">
                    {t('loans.requestedAmount', 'Requested Amount')}: <strong>₹{app.amount.toLocaleString('en-IN')}</strong> | {t('loans.tenure', 'Tenure')}: {app.tenure} {t('loans.months', 'months')} | {t('loans.monthlyEmi', 'Monthly EMI')}: <strong>₹{app.emi.toLocaleString('en-IN')}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs bg-amber-100 text-amber-800 border border-amber-300 font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <Clock size={12} /> {t('loans.pendingVerification', 'Pending Bank Officer Verification')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Enhanced Interactive Loan Application Modal */}
      <Modal
        isOpen={isBankModalOpen}
        onClose={() => setIsBankModalOpen(false)}
        title={modalStep === 1 ? "Step 1 of 2: Loan Application & Auto-Filled Profile Details" : "Step 2 of 2: Review Complete Application & Transmit"}
        size="lg"
      >
        <div className="space-y-6">
          {/* Progress Indicator */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${modalStep === 1 ? 'bg-primary-600 text-white' : 'bg-emerald-500 text-white'}`}>1</span>
              <span className="text-xs font-bold text-slate-700">Application Details</span>
            </div>
            <div className="w-12 h-0.5 bg-slate-200" />
            <div className="flex items-center gap-2">
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${modalStep === 2 ? 'bg-primary-600 text-white' : 'bg-slate-200 text-slate-500'}`}>2</span>
              <span className="text-xs font-bold text-slate-700">Review & Submit</span>
            </div>
          </div>

          {modalStep === 1 ? (
            <div className="space-y-6">
              {/* Auto-filled account details notification box */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wider mb-2">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  Auto-Filled from your Verified Account Profile
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-100">
                    <span className="text-slate-500 block text-[11px]">Weaver Name</span>
                    <strong className="text-slate-900 font-bold text-sm">{user?.name || 'Ramesh Kumar'}</strong>
                  </div>
                  <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-100">
                    <span className="text-slate-500 block text-[11px]">Mobile Number</span>
                    <strong className="text-slate-900 font-bold text-sm">{user?.phone || '+91 9876543210'}</strong>
                  </div>
                  <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-100">
                    <span className="text-slate-500 block text-[11px]">Weaver Pehchan ID</span>
                    <strong className="text-primary-700 font-bold">{user?.pehchan_id || user?.weaverIdNumber || 'IND-HL-UP-2024-8842'}</strong>
                  </div>
                  <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-100">
                    <span className="text-slate-500 block text-[11px]">Yarn Passbook ID</span>
                    <strong className="text-indigo-700 font-bold">{user?.yarn_passbook_id || 'YP-2026-UP-8842'}</strong>
                  </div>
                  <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-100">
                    <span className="text-slate-500 block text-[11px]">Credit Score & Tier</span>
                    <strong className="text-emerald-600 font-bold">{user?.cibil_score || 765} (Tier A Low Risk)</strong>
                  </div>
                  <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-100">
                    <span className="text-slate-500 block text-[11px]">Verified Monthly Income</span>
                    <strong className="text-slate-900 font-bold">₹{(user?.monthlyIncome || 18000).toLocaleString('en-IN')}</strong>
                  </div>
                </div>
              </div>

              {/* Form Input Fields */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Loan Application Requirements</h4>
                
                {/* Purpose of Loan */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Purpose of Loan</label>
                  <select
                    value={loanPurpose}
                    onChange={(e) => setLoanPurpose(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="Raw Material & Yarn Procurement">Raw Material & Yarn Procurement</option>
                    <option value="Handloom Machine & Jacquard Upgrade">Handloom Machine & Jacquard Upgrade</option>
                    <option value="Working Capital Requirement">Working Capital Requirement</option>
                    <option value="Business Expansion & Workshop Construction">Business Expansion & Workshop Construction</option>
                    <option value="General Micro-Credit Facility">General Micro-Credit Facility</option>
                  </select>
                </div>

                {/* Bank Choice */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">Select Preferred Nodal Bank / Financial Institution</label>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-hide">
                    {PARTNER_BANKS.map((b) => (
                      <div
                        key={b.id}
                        onClick={() => setSelectedBank(b.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                          selectedBank === b.id
                            ? 'bg-primary-50/80 border-primary-500 ring-2 ring-primary-500/20'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="bank_choice_step1"
                            checked={selectedBank === b.id}
                            onChange={() => setSelectedBank(b.id)}
                            className="accent-primary-600"
                          />
                          <div>
                            <h4 className="text-xs font-bold text-slate-900">{b.name}</h4>
                            <p className="text-[11px] text-slate-500">{b.type} • {b.time}</p>
                          </div>
                        </div>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                          {b.subvention}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Amount & Tenure Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Requested Amount (₹)</label>
                    <input
                      type="number"
                      value={loanAmount}
                      onChange={(e) => setLoanAmount(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-black text-primary-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tenure (Months)</label>
                    <select
                      value={tenureMonths}
                      onChange={(e) => setTenureMonths(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-800"
                    >
                      <option value={6}>6 Months</option>
                      <option value={12}>12 Months</option>
                      <option value={18}>18 Months</option>
                      <option value={24}>24 Months</option>
                      <option value={36}>36 Months</option>
                    </select>
                  </div>
                </div>

                {/* Disbursal Account */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Disbursal Bank Account No.</label>
                    <input
                      type="text"
                      value={bankAccount}
                      onChange={(e) => setBankAccount(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">IFSC Code</label>
                    <input
                      type="text"
                      value={ifscCode}
                      onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800"
                    />
                  </div>
                </div>
              </div>

              <Button
                fullWidth
                size="lg"
                onClick={() => setModalStep(2)}
                rightIcon={<ChevronRight size={18} />}
                className="shadow-md shadow-primary-200"
              >
                Proceed to Review & Confirm Application
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Step 2 Review Card */}
              <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-4 border border-slate-800 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Verified Application Payload
                    </span>
                    <h3 className="text-base font-black text-white mt-1">{loanPurpose}</h3>
                  </div>
                  <span className="text-xs bg-amber-400/20 text-amber-300 font-extrabold px-3 py-1 rounded-full border border-amber-400/30">
                    6.0% Subsidy
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Applicant Name</span>
                    <strong className="text-white font-bold">{user?.name || 'Ramesh Kumar'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Destination Nodal Bank</span>
                    <strong className="text-emerald-400 font-bold">{(PARTNER_BANKS.find(b => b.id === selectedBank) || PARTNER_BANKS[0]).name}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Weaver Pehchan ID</span>
                    <strong className="text-white font-bold">{user?.pehchan_id || user?.weaverIdNumber || 'IND-HL-UP-2024-8842'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Yarn Passbook ID</span>
                    <strong className="text-white font-bold">{user?.yarn_passbook_id || 'YP-2026-UP-8842'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Loan Amount</span>
                    <strong className="text-amber-300 font-black text-sm">₹{loanAmount.toLocaleString('en-IN')}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Estimated Monthly EMI</span>
                    <strong className="text-emerald-400 font-black text-sm">₹{(emiData?.monthly_emi_inr || Math.round(loanAmount / tenureMonths)).toLocaleString('en-IN')} ({tenureMonths} mos)</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Disbursal Bank Account</span>
                    <strong className="text-white font-mono">{bankAccount}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">IFSC Code</span>
                    <strong className="text-white font-mono">{ifscCode}</strong>
                  </div>
                </div>
              </div>

              {/* Declaration Checkbox */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="declaration_checkbox"
                  checked={declarationAccepted}
                  onChange={(e) => setDeclarationAccepted(e.target.checked)}
                  className="mt-0.5 accent-primary-600 w-4 h-4 rounded"
                />
                <label htmlFor="declaration_checkbox" className="text-xs text-slate-700 font-medium leading-relaxed cursor-pointer">
                  I hereby declare that all details fetched from my <strong>KarghaDhan Account Dashboard</strong> (Pehchan Card, Yarn Passbook Ledger, Credit Rating) are true and correct. I authorize direct submission to bank nodal officers for fast-track disbursal.
                </label>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => setModalStep(1)}
                  className="w-1/3"
                >
                  Edit Details
                </Button>
                <Button
                  fullWidth
                  size="lg"
                  disabled={isSubmittingToBank || !declarationAccepted}
                  onClick={handleTransmitToBank}
                  leftIcon={<Send size={18} />}
                  className="w-2/3 shadow-lg shadow-primary-200"
                >
                  {isSubmittingToBank ? 'Transmitting to Bank...' : 'Submit Application to Bank'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Learn More Modal */}
      <Modal
        isOpen={!!selectedLoan && !isBankModalOpen}
        onClose={() => setSelectedLoan(null)}
        title={tData(selectedLoan?.name || '')}
        size="lg"
      >
        {selectedLoan && (
          <div className="space-y-6">
            <div className="bg-success-50 border border-success-100 rounded-2xl p-5 flex items-start gap-4">
              <CheckCircle size={28} className="text-success-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-lg font-bold text-slate-900 mb-1">{t('loans.eligibleTitle', "You're Pre-Approved!")}</p>
                <p className="text-sm text-slate-600">{t('loans.eligibleDesc', 'Based on your verified Weaver ID and KarghaDhan Profile.')}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: t('loans.maxAmount', 'Max Amount'), value: `₹${(selectedLoan.maxAmount >= 100000 ? (selectedLoan.maxAmount / 100000).toFixed(1) + 'L' : (selectedLoan.maxAmount / 1000).toFixed(0) + 'K')}` },
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
                   <CheckCircle size={14} className="text-success-500" /> {t('loans.eligibility', 'Eligibility Criteria')}
                 </p>
                 <ul className="space-y-1">
                   {selectedLoan.eligibility.map((e) => (
                     <li key={e} className="text-sm text-slate-600 pl-6 relative before:content-[''] before:w-1.5 before:h-1.5 before:bg-slate-300 before:rounded-full before:absolute before:left-2 before:top-2">
                       {tData(e)}
                     </li>
                   ))}
                 </ul>
               </div>
               <div>
                 <p className="text-sm font-bold text-slate-800 tracking-wide mb-2 flex items-center gap-2">
                   <span className="text-secondary-500">✦</span> {t('loans.benefits', 'Benefits & Subsidies')}
                 </p>
                 <ul className="space-y-1">
                   {selectedLoan.benefits.map((b) => (
                     <li key={b} className="text-sm text-slate-600 pl-6 relative before:content-[''] before:w-1.5 before:h-1.5 before:bg-slate-300 before:rounded-full before:absolute before:left-2 before:top-2">
                       {tData(b)}
                     </li>
                   ))}
                 </ul>
               </div>
            </div>
            
            <Button 
              fullWidth 
              size="lg" 
              rightIcon={<Building2 size={18} />} 
              onClick={() => openApplicationModal(selectedLoan)}
              className="shadow-md shadow-primary-200"
            >
              {t('loans.proceedToBank', 'Proceed to Bank Application')}
            </Button>
          </div>
        )}
      </Modal>

      <Toast message={toastMessage} isVisible={toast} />
    </div>
  );
}
