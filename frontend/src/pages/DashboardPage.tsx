import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HandCoins,
  Shield,
  Building2,
  BookOpen,
  ArrowRight,
  CheckCircle,
  TrendingUp,
  Bell,
  Search,
  ChevronRight,
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { loans } from '../data/loans';
import { insurancePolicies } from '../data/insurance';
import { govtSchemes } from '../data/schemes';
import { learningModules } from '../data/literacy';
import { staggerContainer, staggerItem, hoverScale } from '../utils/animations';
import { ProgressBar } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { useTranslation } from 'react-i18next';
import logoKargha from '../assets/logokargha.png';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAppContext();
  const { t } = useTranslation();

  const eligibleLoans = loans.filter((l) => l.isEligible);
  const recommendedInsurance = insurancePolicies.filter((p) => p.isRecommended);
  const completedModules = learningModules.filter((m) => m.isCompleted).length;
  const inProgressModules = learningModules.filter((m) => m.progress > 0 && !m.isCompleted).length;

  // quick actions moved here to allow translation
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
    <div className="space-y-6">
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
            <span className="text-sm text-success-700 font-semibold">{t('common.verified', 'Verified')} Weaver</span>
            <span className="text-slate-300">•</span>
            <span className="text-sm text-slate-500">{user?.occupation}</span>
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

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Recommendation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-primary-600 to-indigo-700 rounded-3xl p-6 text-white relative overflow-hidden shadow-lg shadow-primary-200/50"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <img src={logoKargha} alt="Icon" className="w-5 h-5 object-contain" />
                <span className="text-sm font-bold text-white/90 uppercase tracking-wider">{t('dashboard.recommendationTitle', 'Kargha AI Recommendation')}</span>
              </div>
              <h3 className="text-xl font-bold mb-2">
                {t('dashboard.recommendationSub', "🎯 You're eligible for NHDC Handloom Weaver Loan")}
              </h3>
              <p className="text-white/80 text-sm mb-5 max-w-lg">
                {t('dashboard.recommendationText', 'Based on your 12 years of experience and verified Weaver ID, you can get up to ₹2,00,000 at 6% interest.')}
              </p>
              <Button
                size="sm"
                className="bg-white text-primary-700 hover:bg-slate-50 shadow-none"
                onClick={() => navigate('/loans')}
                rightIcon={<ArrowRight size={16} />}
              >
                View Loan Details
              </Button>
            </div>
          </motion.div>

          {/* Top Loan Picks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold text-slate-800">{t('dashboard.topLoanPicks', 'Top Loan Picks')}</h2>
                  <button onClick={() => navigate('/loans')} className="text-xs text-primary-600 font-bold hover:underline flex items-center gap-1">
                    {t('common.viewAll', 'View All')} <ChevronRight size={14} />
                  </button>
                </div>
                <div className="space-y-3">
                  {eligibleLoans.slice(0, 3).map((loan) => (
                    <div key={loan.id} className="flex items-center gap-4 p-3 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors">
                      <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
                        <HandCoins size={20} className="text-primary-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">{loan.name}</p>
                        <p className="text-xs text-slate-500">{loan.provider}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-primary-700">
                          ₹{(loan.maxAmount / 100000).toFixed(1)}L
                        </p>
                        <p className="text-xs text-slate-500 font-medium">{loan.interestRate} p.a.</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  className="mt-4"
                  onClick={() => navigate('/loans')}
                >
                  See All Eligible Loans
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Insurance Picks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold text-slate-800">{t('dashboard.recommendedInsurance', 'Recommended Insurance')}</h2>
                  <button onClick={() => navigate('/insurance')} className="text-xs text-indigo-600 font-bold hover:underline flex items-center gap-1">
                    {t('common.viewAll', 'View All')} <ChevronRight size={14} />
                  </button>
                </div>
                <div className="space-y-3">
                  {recommendedInsurance.slice(0, 3).map((policy) => (
                    <div key={policy.id} className="flex items-center gap-4 p-3 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors">
                      <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Shield size={20} className="text-indigo-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">{policy.name}</p>
                        <p className="text-xs text-slate-500">{policy.coverage}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-indigo-700">₹{policy.annualPremium}/yr</p>
                        <span className="text-xs bg-success-50 text-success-600 px-2 py-0.5 rounded-md font-semibold inline-block mt-0.5">Recommended</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
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
                      <span className="text-xs text-success-600 font-semibold">Verified Weaver</span>
                    </div>
                  </div>
                </div>

                <ProgressBar
                  value={user?.profileCompletion || 95}
                  label="Profile Completion"
                  showValue
                  height="h-3"
                />

                <div className="mt-5 space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  {[
                    { label: 'District', value: user?.district },
                    { label: 'State', value: user?.state },
                    { label: 'Experience', value: `${user?.yearsOfExperience} years` },
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
                  View Full Profile
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Upcoming Benefits */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 }}
          >
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
                    { text: 'PMJJBY renewal in 15 days', color: 'bg-secondary-50 text-secondary-700 border-secondary-100', icon: '⚠️' },
                    { text: 'Yarn Subsidy Scheme closes Jun 30', color: 'bg-danger-50 text-danger-700 border-danger-100', icon: '📅' },
                    { text: 'New Skill Training batch starting', color: 'bg-success-50 text-success-700 border-success-100', icon: '🎓' },
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
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={18} className="text-indigo-500" />
                    <h2 className="text-lg font-bold text-slate-800">{t('dashboard.learning', 'Learning')}</h2>
                  </div>
                  <button onClick={() => navigate('/literacy')} className="text-xs text-primary-600 font-bold hover:underline">
                    Continue →
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
                  label="Overall Progress"
                  showValue
                  height="h-2"
                />
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Government Schemes Strip */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-800">{t('dashboard.activeSchemes', 'Active Government Schemes')}</h2>
              <button onClick={() => navigate('/schemes')} className="text-xs text-secondary-600 font-bold hover:underline flex items-center gap-1">
                {t('common.viewAll', 'View All')} <ChevronRight size={14} />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {govtSchemes.slice(0, 3).map((scheme) => (
                <div key={scheme.id} className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-secondary-300 transition-colors">
                  <div className="w-10 h-10 bg-white shadow-sm rounded-xl flex items-center justify-center flex-shrink-0 border border-slate-100">
                    <Building2 size={18} className="text-secondary-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 leading-tight">{scheme.name}</p>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{scheme.description.slice(0, 70)}...</p>
                    {scheme.deadline && (
                      <p className="text-xs text-danger-500 font-semibold mt-2">
                        Deadline: {new Date(scheme.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
