import { useState, useEffect } from 'react';
import businessLoanHero from '@/assets/illustrations/business_loan_hero.png';
import lifeInsuranceHero from '@/assets/illustrations/life_insurance_hero.png';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HandCoins,
  Shield,
  Building2,
  BookOpen,
  CheckCircle,
  TrendingUp,
  Bell,
  ChevronRight,
  Sparkles,
  TrendingDown,
  AlertTriangle,
  Receipt,
  ArrowRight,
  Check,
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { getLoans } from '../data/loans';
import { insurancePolicies } from '../data/insurance';
import { learningModules } from '../data/literacy';
import { financeApi, loanApi, agentsApi } from '../services/api';
import { staggerContainer, staggerItem, fadeIn, hoverScale } from '../utils/animations';
import { ProgressBar, Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { PromoCarousel } from '../components/ui/PromoCarousel';
import { HeroProductCard } from '../components/ui/HeroProductCard';
import { useTranslation } from 'react-i18next';
import logoKargha from '@/assets/logos/logoKargha.png';
import { globalPromos } from '../data/promos';
import { tData } from '../utils/i18nData';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, yarnPassbook, isNewWeaver } = useAppContext();
  const { t } = useTranslation();
  const [toast, setToast] = useState(false);
  const [financeSummary, setFinanceSummary] = useState<any>(null);
  const [loansList, setLoansList] = useState<any[]>([]);
  const [creditData, setCreditData] = useState<any>(null);
  const [creditLoading, setCreditLoading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      financeApi.getSummary(user.id).then(setFinanceSummary).catch(console.error);
      loanApi.getLoans(user.id).then(setLoansList).catch(console.error);

      // Fetch live credit assessment from the creditworthiness agent
      setCreditLoading(true);
      agentsApi.creditworthiness({
        cibil_score: user.cibil_score,
        experience_years: user.yearsOfExperience,
        monthly_income: user.monthlyIncome,
        pehchan_id: user.pehchan_id,
        yarn_passbook_id: user.yarn_passbook_id || yarnPassbook?.passbookNumber,
      })
        .then(r => setCreditData(r.data))
        .catch(console.error)
        .finally(() => setCreditLoading(false));
    }
  }, [user?.id]);

  const showToast = () => {
    setToast(true);
    setTimeout(() => setToast(false), 3000);
  };

  const eligibleLoans = getLoans(t).filter((l) => l.isEligible);
  const recommendedInsurance = insurancePolicies.filter((p) => p.isRecommended);
  const completedModules = learningModules.filter((m) => m.isCompleted).length;
  const inProgressModules = learningModules.filter((m) => m.progress > 0 && !m.isCompleted).length;

  const quickActions = [
    {
      to: '/loans',
      icon: HandCoins,
      label: t('dashboard.eligibleLoans', 'Eligible Loans'),
      value: loansList.length > 0 ? loansList.length : 4,
      desc: t('dashboard.loansAvailable', 'Loans available'),
      bg: 'bg-primary-50',
      textColor: 'text-primary-700',
      iconBg: 'bg-primary-100',
    },
    {
      to: '/insurance',
      icon: Shield,
      label: t('dashboard.insurancePlans', 'Insurance Plans'),
      value: 3,
      desc: t('dashboard.plansEligible', 'Plans eligible'),
      bg: 'bg-indigo-50',
      textColor: 'text-indigo-700',
      iconBg: 'bg-indigo-100',
    },
    {
      to: '/schemes',
      icon: Building2,
      label: t('dashboard.govSchemes', 'Gov. Schemes'),
      value: financeSummary ? (financeSummary.active_insurance?.length > 0 ? 5 : 3) : 5,
      desc: t('dashboard.activeSchemes', 'Active schemes'),
      bg: 'bg-secondary-50',
      textColor: 'text-secondary-700',
      iconBg: 'bg-secondary-100',
    },
    {
      to: '/literacy',
      icon: BookOpen,
      label: t('dashboard.learning', 'Learning'),
      value: 8,
      desc: t('dashboard.modulesAvailable', 'Modules available'),
      bg: 'bg-rose-50',
      textColor: 'text-rose-700',
      iconBg: 'bg-rose-100',
    },
  ];

  return (
    <div className="space-y-8 pb-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">👋</span>
            <h1 className="text-2xl font-bold text-slate-900 font-display tracking-tight">
              {t('dashboard.welcome', 'Welcome back, {{name}}!', { name: user?.name?.split(' ')[0] })}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle size={14} className="text-success-500" />
            <span className="text-sm text-success-700 font-semibold">{t('common.verifiedWeaver', 'Verified Weaver')}</span>
            <span className="text-slate-300">•</span>
            <span className="text-sm text-slate-500">{t(`profile.${user?.occupation?.toLowerCase().replace(' ', '')}`, user?.occupation || '')}</span>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/assistant')}
          leftIcon={<img src={logoKargha} alt="Icon" className="w-4 h-4 object-contain" />}
        >
          {t('common.askKargha', 'Ask Kargha AI')}
        </Button>
      </motion.div>
        
      <motion.div variants={fadeIn} className="w-full">
        <PromoCarousel banners={globalPromos} />
      </motion.div>

      {/* NEW WEAVER JOURNEY CONTAINER */}
      {isNewWeaver ? (
        <div className="space-y-6">
          {/* Welcome & Getting Started Checklist */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs uppercase tracking-wider font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">{t('dashboard.firstTimePath', 'First-Time Weaver Guided Path')}</span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1.5">{t('dashboard.gettingStarted', 'Getting Started Checklist')}</h2>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">{t('dashboard.gettingStartedDesc', 'Complete these steps to build your financial history & unlock credit eligibility')}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/pehchan-guidance')}
                leftIcon={<ArrowRight size={16} />}
                className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 shrink-0"
              >
                {t('dashboard.pehchanGuide', 'Pehchan ID Guide')}
              </Button>
            </div>

            {/* Checklist Items */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { title: t('dashboard.registerAccount', 'Register Account'), done: true, route: '/profile' },
                { title: t('dashboard.applyPehchan', 'Apply for Pehchan ID'), done: false, route: '/pehchan-guidance' },
                { title: t('dashboard.getYarnPassbook', 'Get Yarn Passbook'), done: false, route: '/yarn-passbook-guidance' },
                { title: t('dashboard.uploadBankPassbook', 'Upload Bank Passbook'), done: true, route: '/documents' },
                { title: t('dashboard.completeAiProfile', 'Complete AI Financial Profile'), done: false, route: '/onboarding-profile' },
                { title: t('dashboard.exploreGovtSchemes', 'Explore Govt Schemes'), done: true, route: '/schemes' },
                { title: t('dashboard.completeFinLiteracy', 'Complete Financial Literacy'), done: false, route: '/literacy' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => navigate(item.route)}
                  className={`p-4 rounded-2xl border flex items-center justify-between transition-all cursor-pointer ${
                    item.done
                      ? 'bg-success-50/60 border-success-200 text-slate-900'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-indigo-50/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      item.done ? 'bg-success-500 text-white' : 'border-2 border-slate-300 text-slate-400'
                    }`}>
                      {item.done ? <Check size={14} /> : idx + 1}
                    </div>
                    <span className="text-xs font-bold">{item.title}</span>
                  </div>
                  <ChevronRight size={14} className="text-slate-400" />
                </div>
              ))}
            </div>
          </motion.div>

          {/* GOVERNMENT SCHEME RECOMMENDATIONS (No Credit History Required) */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-indigo-900 via-slate-900 to-primary-950 border border-indigo-500/30 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
                  <Sparkles size={20} className="animate-pulse" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-white">{t('dashboard.govSchemesNew', 'Government Schemes for New Weavers')}</h3>
                  <p className="text-xs text-indigo-200">{t('dashboard.govSchemesNewDesc', 'No prior credit history required — instant government subvention & training')}</p>
                </div>
              </div>
              <Button size="sm" variant="secondary" onClick={() => navigate('/schemes')} className="text-xs">
                {t('dashboard.viewAllSchemes', 'View All Schemes')}
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { title: t('dashboard.scheme1', 'Weaver Mudra Scheme'), desc: t('dashboard.scheme1Desc', 'Concessional credit up to ₹2 Lakhs with 6% interest subvention & margin money.'), badge: t('dashboard.badgeNoCibil', 'No CIBIL Required') },
                { title: t('dashboard.scheme2', 'Handloom Cluster Support (NHDP)'), desc: t('dashboard.scheme2Desc', 'Financial assistance for loom upgrade, yarn procurement & jacquard equipment.'), badge: t('dashboard.badgeGrant', '100% Grant') },
                { title: t('dashboard.scheme3', 'PMEGP Artisan Support'), desc: t('dashboard.scheme3Desc', 'Up to 35% capital subsidy for establishing new handloom weaving units.'), badge: t('dashboard.badgeSubsidy', 'Govt Subsidy') },
                { title: t('dashboard.scheme4', 'Skill Development & Training'), desc: t('dashboard.scheme4Desc', 'Free technical training in natural dyeing, jacquard design & digital marketing.'), badge: t('dashboard.badgeStipend', 'Stipend Included') },
                { title: t('dashboard.scheme5', 'PMJJBY & PMSBY Cover'), desc: t('dashboard.scheme5Desc', 'Free ₹2 Lakh life and accidental insurance for registered weavers.'), badge: t('dashboard.badgeFree', 'Free Scheme') },
                { title: t('dashboard.scheme6', 'Financial Literacy Program'), desc: t('dashboard.scheme6Desc', 'Learn digital payments, thrift savings, and interest calculation.'), badge: t('dashboard.badgeInteractive', 'Interactive') },
              ].map((scheme, idx) => (
                <div key={idx} className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 space-y-2 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-sm text-white">{scheme.title}</h4>
                      <span className="text-[10px] bg-amber-400/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-400/30 whitespace-nowrap ml-2">
                        {scheme.badge}
                      </span>
                    </div>
                    <p className="text-xs text-indigo-100 font-medium leading-relaxed">{scheme.desc}</p>
                  </div>
                  <p className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 pt-2 border-t border-white/10 mt-2">
                    <CheckCircle size={12} /> {t('dashboard.recommendedFirstTime', 'Recommended for First-Time Weavers')}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      ) : (
        /* EXISTING WEAVER YARN PASSBOOK BANNER */
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-indigo-900 via-slate-900 to-primary-950 border border-indigo-500/30 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-amber-300">
                <Sparkles size={20} className="animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-base text-white">{t('documents.yarnPassbookAiProfile', 'Yarn Passbook Financial Profile')}</h3>
                  <span className="text-[10px] bg-success-500/20 border border-success-400/40 text-success-300 px-2 py-0.5 rounded-full font-bold">{t('dashboard.verifiedLedger', 'Verified Ledger')}</span>
                </div>
                <p className="text-xs text-indigo-200">{t('dashboard.extractedTurnover', 'Extracted turnover: ₹18,000/mo purchase • ₹28,500/mo sales')}</p>
              </div>
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => navigate('/documents')}
              leftIcon={<Receipt size={14} />}
              className="text-xs shrink-0 shadow-sm"
            >
              {t('documents.viewLedger', 'View Passbook Ledger')}
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            {yarnPassbook?.aiInsights?.map((insight, idx) => (
              <div key={idx} className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 text-xs font-semibold leading-relaxed flex items-start gap-2">
                <CheckCircle size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>{tData(insight)}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Stats Row */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <motion.div
              key={action.to}
              variants={staggerItem}
              {...hoverScale}
              onClick={() => navigate(action.to)}
              className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className={`w-12 h-12 ${action.iconBg} rounded-2xl flex items-center justify-center mb-4`}>
                <Icon size={20} className={action.textColor} />
              </div>
              <p className="text-2xl font-bold text-slate-900 leading-none mb-1">{action.value}</p>
              <p className="text-xs text-slate-500 font-medium">{action.label}</p>
              <div className={`flex items-center gap-1 mt-3 ${action.textColor}`}>
                <span className="text-xs font-semibold">{action.desc}</span>
                <ChevronRight size={12} />
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          {/* Top Loan Picks - Hero Cards */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-800 font-display">{t('dashboard.recommendedLoans', 'Recommended Loans')}</h2>
              <button onClick={() => navigate('/loans')} className="text-sm text-primary-600 font-bold hover:underline flex items-center gap-1">
                {t('dashboard.viewAll', 'View All')} <ChevronRight size={16} />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {eligibleLoans.slice(0, 2).map((loan) => (
                <HeroProductCard
                  key={loan.id}
                  title={tData(loan.name)}
                  category={tData(loan.category)}
                  categoryColor="primary"
                  imageSrc={loan.imageSrc || businessLoanHero as string}
                  benefit={tData(loan.benefits[0])}
                  highlightLabel={t('loans.maxAmount', 'Max Amount')}
                  highlightValue={`₹${(loan.maxAmount / 100000).toFixed(1)}L`}
                  secondaryLabel={t('loans.interestRate', 'Interest Rate')}
                  secondaryValue={loan.interestRate}
                  isRecommended={loan.isEligible}
                  onLearnMore={() => navigate('/loans')}
                  onApply={() => navigate('/loans')}
                />
              ))}
            </div>
          </div>

          {/* Insurance Picks - Hero Cards */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-800 font-display">{t('dashboard.essentialInsurance', 'Essential Insurance')}</h2>
              <button onClick={() => navigate('/insurance')} className="text-sm text-indigo-600 font-bold hover:underline flex items-center gap-1">
                {t('dashboard.viewAll', 'View All')} <ChevronRight size={16} />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {recommendedInsurance.slice(0, 2).map((policy) => (
                <HeroProductCard
                  key={policy.id}
                  title={tData(policy.name)}
                  category={tData(policy.type)}
                  categoryColor="indigo"
                  imageSrc={policy.imageSrc || lifeInsuranceHero as string}
                  benefit={tData(policy.shortDescription)}
                  highlightLabel={t('insurance.coverage', 'Coverage')}
                  highlightValue={tData(policy.coverage).split(' ')[0]}
                  secondaryLabel={t('insurance.premium', 'Premium')}
                  secondaryValue={`₹${policy.annualPremium}/${t('common.yr', 'yr')}`}
                  isRecommended={policy.isRecommended}
                  onLearnMore={() => navigate('/insurance')}
                  onApply={() => navigate('/insurance')}
                />
              ))}
            </div>
          </div>

        </div>

        {/* Right column */}
        <div className="space-y-8">
          {/* Profile Card */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-md shadow-primary-200">
                    {user?.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-lg leading-tight mb-1">{user?.name}</p>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle size={14} className="text-success-500" />
                      <span className="text-xs text-success-600 font-semibold">{t('common.verifiedWeaver', 'Verified Weaver')}</span>
                    </div>
                  </div>
                </div>

                <ProgressBar
                  value={user?.profileCompletion || 95}
                  label={t('profile.profileCompletion', 'Profile Completion')}
                  showValue
                  height="h-3"
                />

                <div className="mt-5 space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  {[
                    { label: t('profile.district', 'District'), value: tData(user?.district || '') },
                    { label: t('profile.state', 'State'), value: tData(user?.state || '') },
                    { label: t('profile.experience', 'Experience'), value: `${user?.yearsOfExperience} ${t('profile.years', 'years')}` },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between text-sm">
                      <span className="text-slate-500">{item.label}</span>
                      <span className="font-semibold text-slate-800">{item.value}</span>
                    </div>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  className="mt-4"
                  onClick={() => navigate('/profile')}
                >
                  {t('profile.viewFullProfile', 'View Full Profile')}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* AI Credit Score Card */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}>
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-primary-600 px-6 py-4 flex items-center gap-2">
                <Sparkles size={16} className="text-white" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">{t('dashboard.aiCreditScore', 'AI Credit Score')}</h2>
              </div>
              <CardContent className="p-6">
                {creditLoading ? (
                  <div className="flex items-center justify-center h-24">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}>
                      <Sparkles size={28} className="text-indigo-400" />
                    </motion.div>
                  </div>
                ) : creditData ? (
                  <div className="space-y-4">
                    {/* Score + Risk Tier */}
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-5xl font-black text-slate-900">{creditData.credit_score}</p>
                        <p className="text-xs text-slate-500 font-semibold mt-1">{t('dashboard.outOf900', 'out of 900')}</p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                          creditData.risk_level === 'LOW' ? 'bg-success-100 text-success-700' :
                          creditData.risk_level === 'MEDIUM' ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {t(`creditDashboard.risk${creditData.risk_level}`, creditData.risk_level) as string} {t('dashboard.risk', 'Risk')}
                        </span>
                        <p className="text-xs text-slate-500 font-semibold mt-1">{tData(creditData.financial_health)}</p>
                      </div>
                    </div>

                    {/* Score bar */}
                    <ProgressBar value={(creditData.credit_score / 900) * 100} height="h-2" />

                    {/* Max eligible loan */}
                    <div className="bg-indigo-50 rounded-xl px-4 py-3 flex items-center justify-between border border-indigo-100">
                      <span className="text-xs font-bold text-indigo-700">{t('dashboard.maxEligibleLoan', 'Max Eligible Loan')}</span>
                      <span className="text-base font-black text-indigo-900">₹{(creditData.max_eligible_loan / 100000).toFixed(1)}L</span>
                    </div>

                    {/* Strengths */}
                    {creditData.strengths?.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-success-700 mb-2 flex items-center gap-1"><TrendingUp size={12}/> {t('dashboard.strengths', 'Strengths')}</p>
                        <ul className="space-y-1">
                          {creditData.strengths.slice(0, 2).map((s: string, i: number) => (
                            <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                              <CheckCircle size={11} className="text-success-500 mt-0.5 shrink-0"/>{tData(s)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Risks */}
                    {creditData.risks?.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-amber-700 mb-2 flex items-center gap-1"><AlertTriangle size={12}/> {t('dashboard.risks', 'Risks')}</p>
                        <ul className="space-y-1">
                          {creditData.risks.slice(0, 2).map((r: string, i: number) => (
                            <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                              <TrendingDown size={11} className="text-amber-500 mt-0.5 shrink-0"/>{tData(r)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Fallback static alerts */
                  <div className="space-y-3">
                    {[
                      { text: t('dashboard.alert1', 'PMJJBY renewal in 15 days'), color: 'bg-secondary-50 text-secondary-700 border-secondary-100', icon: '⚠️' },
                      { text: t('dashboard.alert2', 'Yarn Subsidy Scheme closes Jun 30'), color: 'bg-danger-50 text-danger-700 border-danger-100', icon: '📅' },
                      { text: t('dashboard.alert3', 'New Skill Training batch starting'), color: 'bg-success-50 text-success-700 border-success-100', icon: '🎓' },
                    ].map((item, i) => (
                      <div key={i} className={`flex items-start gap-3 border rounded-xl p-3 text-sm font-medium leading-tight ${item.color}`}>
                        <span className="mt-0.5">{item.icon}</span>
                        <span>{item.text}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Learning Progress */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={18} className="text-indigo-500" />
                    <h2 className="text-lg font-bold text-slate-800">{t('dashboard.learning', 'Learning')}</h2>
                  </div>
                  <button onClick={() => navigate('/literacy')} className="text-xs text-primary-600 font-bold hover:underline">
                    {t('dashboard.continue', 'Continue →')}
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-5">
                  <div className="text-center bg-success-50 rounded-xl p-3">
                    <p className="text-xl font-bold text-success-700">{completedModules}</p>
                    <p className="text-xs text-slate-500 font-medium">{t('dashboard.completed', 'Completed')}</p>
                  </div>
                  <div className="text-center bg-secondary-50 rounded-xl p-3">
                    <p className="text-xl font-bold text-secondary-700">{inProgressModules}</p>
                    <p className="text-xs text-slate-500 font-medium">{t('dashboard.inProgress', 'In Progress')}</p>
                  </div>
                  <div className="text-center bg-slate-50 rounded-xl p-3">
                    <p className="text-xl font-bold text-slate-700">{learningModules.length - completedModules - inProgressModules}</p>
                    <p className="text-xs text-slate-500 font-medium">{t('dashboard.remaining', 'Remaining')}</p>
                  </div>
                </div>
                <ProgressBar
                  value={(completedModules / learningModules.length) * 100}
                  label={t('dashboard.overallProgress', 'Overall Progress')}
                  showValue
                  height="h-2"
                />
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
