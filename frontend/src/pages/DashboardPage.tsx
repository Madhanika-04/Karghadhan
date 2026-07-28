import { useState } from 'react';
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
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { getLoans } from '../data/loans';
import { insurancePolicies } from '../data/insurance';
import { govtSchemes } from '../data/schemes';
import { learningModules } from '../data/literacy';
import { staggerContainer, staggerItem, fadeIn, hoverScale } from '../utils/animations';
import { ProgressBar } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { PromoCarousel } from '../components/ui/PromoCarousel';
import type { PromoBanner } from '../components/ui/PromoCarousel';
import { HeroProductCard } from '../components/ui/HeroProductCard';
import { useTranslation } from 'react-i18next';
import logoKargha from '@/assets/logos/logoKargha.png';
import { globalPromos } from '../data/promos';
import { tData } from '../utils/i18nData';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAppContext();
  const { t } = useTranslation();
  const [toast, setToast] = useState(false);

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
      value: 4,
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
      value: 5,
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

          {/* Upcoming Benefits */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Bell size={18} className="text-secondary-500" />
                    <h2 className="text-lg font-bold text-slate-800">{t('dashboard.alerts', 'Alerts')}</h2>
                  </div>
                </div>
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
