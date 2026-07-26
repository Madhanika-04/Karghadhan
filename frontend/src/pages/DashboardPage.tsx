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
  Sparkles,
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

const quickActions = [
  {
    to: '/loans',
    icon: HandCoins,
    label: 'Eligible Loans',
    value: 4,
    desc: 'Loans available',
    color: 'from-emerald-500 to-teal-600',
    bg: 'bg-emerald-50',
    textColor: 'text-emerald-600',
    iconBg: 'bg-emerald-500',
  },
  {
    to: '/insurance',
    icon: Shield,
    label: 'Insurance Plans',
    value: 3,
    desc: 'Plans eligible',
    color: 'from-indigo-500 to-violet-600',
    bg: 'bg-indigo-50',
    textColor: 'text-indigo-600',
    iconBg: 'bg-indigo-500',
  },
  {
    to: '/schemes',
    icon: Building2,
    label: 'Gov. Schemes',
    value: 5,
    desc: 'Active schemes',
    color: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-50',
    textColor: 'text-amber-600',
    iconBg: 'bg-amber-500',
  },
  {
    to: '/literacy',
    icon: BookOpen,
    label: 'Learning',
    value: 8,
    desc: 'Modules available',
    color: 'from-pink-500 to-rose-600',
    bg: 'bg-pink-50',
    textColor: 'text-pink-600',
    iconBg: 'bg-pink-500',
  },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAppContext();

  const eligibleLoans = loans.filter((l) => l.isEligible);
  const recommendedInsurance = insurancePolicies.filter((p) => p.isRecommended);
  const completedModules = learningModules.filter((m) => m.isCompleted).length;
  const inProgressModules = learningModules.filter((m) => m.progress > 0 && !m.isCompleted).length;

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
            <h1 className="text-2xl font-bold text-slate-800 font-display">
              Welcome back, {user?.name?.split(' ')[0]}!
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle size={14} className="text-emerald-500" />
            <span className="text-sm text-emerald-700 font-semibold">Verified Weaver</span>
            <span className="text-slate-300">•</span>
            <span className="text-sm text-slate-500">{user?.occupation}</span>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/assistant')}
          leftIcon={<Sparkles size={16} />}
        >
          Ask Kargha AI
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
              className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 cursor-pointer card-hover"
            >
              <div className={`w-10 h-10 ${action.bg} rounded-xl flex items-center justify-center mb-3`}>
                <Icon size={18} className={action.textColor} />
              </div>
              <p className="text-2xl font-bold text-slate-800">{action.value}</p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">{action.label}</p>
              <div className={`flex items-center gap-1 mt-2 ${action.textColor}`}>
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
            className="bg-gradient-to-r from-emerald-600 to-indigo-700 rounded-3xl p-6 text-white relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={18} className="text-amber-300" />
                <span className="text-sm font-bold text-white/90">Kargha AI Recommendation</span>
              </div>
              <h3 className="text-xl font-bold mb-2">
                🎯 You're eligible for NHDC Handloom Weaver Loan
              </h3>
              <p className="text-white/80 text-sm mb-4">
                Based on your 12 years of experience and verified Weaver ID, you can get up to ₹2,00,000 at 6% interest.
              </p>
              <Button
                size="sm"
                className="bg-white text-emerald-700 hover:bg-emerald-50"
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
            className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-800">Top Loan Picks</h2>
              <button onClick={() => navigate('/loans')} className="text-xs text-emerald-600 font-bold hover:underline flex items-center gap-1">
                View All <ChevronRight size={14} />
              </button>
            </div>
            <div className="space-y-3">
              {eligibleLoans.slice(0, 3).map((loan) => (
                <div key={loan.id} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-colors">
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <HandCoins size={18} className="text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{loan.name}</p>
                    <p className="text-xs text-slate-500">{loan.provider}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-emerald-700">
                      ₹{(loan.maxAmount / 100000).toFixed(1)}L
                    </p>
                    <p className="text-xs text-slate-500">{loan.interestRate}</p>
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
          </motion.div>

          {/* Insurance Picks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-800">Recommended Insurance</h2>
              <button onClick={() => navigate('/insurance')} className="text-xs text-emerald-600 font-bold hover:underline flex items-center gap-1">
                View All <ChevronRight size={14} />
              </button>
            </div>
            <div className="space-y-3">
              {recommendedInsurance.slice(0, 3).map((policy) => (
                <div key={policy.id} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-colors">
                  <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Shield size={18} className="text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{policy.name}</p>
                    <p className="text-xs text-slate-500">{policy.coverage}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-indigo-700">₹{policy.annualPremium}/yr</p>
                    <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-semibold">Recommended</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-indigo-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {user?.name?.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-slate-800">{user?.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <CheckCircle size={12} className="text-emerald-500" />
                  <span className="text-xs text-emerald-600 font-semibold">Verified Weaver</span>
                </div>
              </div>
            </div>

            <ProgressBar
              value={user?.profileCompletion || 95}
              label="Profile Completion"
              showValue
              height="h-3"
            />

            <div className="mt-4 space-y-2">
              {[
                { label: 'District', value: user?.district },
                { label: 'State', value: user?.state },
                { label: 'Experience', value: `${user?.yearsOfExperience} years` },
              ].map((item) => (
                <div key={item.label} className="flex justify-between text-sm">
                  <span className="text-slate-400">{item.label}</span>
                  <span className="font-semibold text-slate-700">{item.value}</span>
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
          </motion.div>

          {/* Upcoming Benefits */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100"
          >
            <div className="flex items-center gap-2 mb-4">
              <Bell size={18} className="text-amber-500" />
              <h2 className="text-lg font-bold text-slate-800">Upcoming Benefits</h2>
            </div>
            <div className="space-y-3">
              {[
                { text: 'PMJJBY renewal in 15 days', color: 'bg-amber-50 text-amber-700', icon: '⚠️' },
                { text: 'Yarn Subsidy Scheme closes Jun 30', color: 'bg-red-50 text-red-600', icon: '📅' },
                { text: 'New Skill Training batch starting', color: 'bg-emerald-50 text-emerald-700', icon: '🎓' },
              ].map((item, i) => (
                <div key={i} className={`flex items-center gap-3 ${item.color} rounded-xl px-3 py-2.5 text-sm font-medium`}>
                  <span>{item.icon}</span>
                  {item.text}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Learning Progress */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp size={18} className="text-indigo-500" />
                <h2 className="text-lg font-bold text-slate-800">Learning</h2>
              </div>
              <button onClick={() => navigate('/literacy')} className="text-xs text-emerald-600 font-bold">
                Continue →
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center bg-emerald-50 rounded-xl p-3">
                <p className="text-xl font-bold text-emerald-700">{completedModules}</p>
                <p className="text-xs text-slate-500">Completed</p>
              </div>
              <div className="text-center bg-amber-50 rounded-xl p-3">
                <p className="text-xl font-bold text-amber-700">{inProgressModules}</p>
                <p className="text-xs text-slate-500">In Progress</p>
              </div>
              <div className="text-center bg-slate-50 rounded-xl p-3">
                <p className="text-xl font-bold text-slate-700">{learningModules.length - completedModules - inProgressModules}</p>
                <p className="text-xs text-slate-500">Remaining</p>
              </div>
            </div>
            <ProgressBar
              value={(completedModules / learningModules.length) * 100}
              label="Overall Progress"
              showValue
              height="h-2"
            />
          </motion.div>
        </div>
      </div>

      {/* Government Schemes Strip */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-slate-800">Active Government Schemes</h2>
          <button onClick={() => navigate('/schemes')} className="text-xs text-emerald-600 font-bold hover:underline flex items-center gap-1">
            View All <ChevronRight size={14} />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {govtSchemes.slice(0, 3).map((scheme) => (
            <div key={scheme.id} className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-100">
              <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Building2 size={16} className="text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 leading-tight">{scheme.name}</p>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{scheme.description.slice(0, 70)}...</p>
                {scheme.deadline && (
                  <p className="text-xs text-red-500 font-semibold mt-1">
                    Deadline: {new Date(scheme.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
