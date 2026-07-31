import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Gauge,
  Sparkles,
  TrendingUp,
  Shield,
  HandCoins,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Award,
  Wallet,
  Building2,
  FileCheck,
  Check,
  Zap,
  ArrowRight,
  TrendingDown,
  Activity,
  Layers,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
} from 'recharts';
import { useAppContext } from '../context/AppContext';
import { agentsApi, transactionsApi, creditScoringApi } from '../services/api';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge, ProgressBar } from '../components/ui/Badge';
import { staggerContainer, staggerItem, fadeIn, slideInLeft } from '../utils/animations';
import { useTranslation } from 'react-i18next';
import { tData } from '../utils/i18nData';
import { useNavigate } from 'react-router-dom';

// Default mock data (used if no real transactions exist)
const defaultIncomeExpenseData = [
  { month: 'Jan', income: 15000, expense: 8000 },
  { month: 'Feb', income: 18000, expense: 9500 },
  { month: 'Mar', income: 16500, expense: 11000 },
  { month: 'Apr', income: 21000, expense: 10500 },
  { month: 'May', income: 19000, expense: 13000 },
  { month: 'Jun', income: 24500, expense: 14500 },
];

const defaultSavingsTrendData = [
  { month: 'Jan', amount: 8000 },
  { month: 'Feb', amount: 11500 },
  { month: 'Mar', amount: 15000 },
  { month: 'Apr', amount: 19500 },
  { month: 'May', amount: 24000 },
  { month: 'Jun', amount: 28500 },
];

const defaultCreditTimeline = [
  { date: 'Jan 2024', score: 640, status: 'Fair', note: 'Initial Profile Seeded' },
  { date: 'Mar 2024', score: 675, status: 'Good', note: 'Weaver ID Verified' },
  { date: 'May 2024', score: 720, scoreGrowth: '+45', status: 'Good', note: 'PMJJBY Insurance Enrolled' },
  { date: 'Jul 2024', score: 765, scoreGrowth: '+45', status: 'Excellent', note: 'Yarn Passbook Uploaded & Verified' },
];

export default function CreditScorePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, yarnPassbook, documentsList, isNewWeaver } = useAppContext();

  const [agentData, setAgentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  const [incomeExpenseData, setIncomeExpenseData] = useState<any[]>(defaultIncomeExpenseData);
  const [savingsTrendData, setSavingsTrendData] = useState<any[]>(defaultSavingsTrendData);
  const [creditTimeline, setCreditTimeline] = useState<any[]>(defaultCreditTimeline);

  const processTransactionsForCharts = (transactions: any[]) => {
    if (!transactions || transactions.length === 0) return;
    
    // Group transactions by month
    const monthlyData: Record<string, { income: number; expense: number }> = {};
    let cumulativeSavings = 0;
    const savingsData: any[] = [];
    
    // Sort oldest to newest for trend
    const sortedTxs = [...transactions].sort((a, b) => new Date(a.transacted_at).getTime() - new Date(b.transacted_at).getTime());
    
    sortedTxs.forEach(tx => {
      const date = new Date(tx.transacted_at);
      const month = date.toLocaleString('default', { month: 'short' });
      
      if (!monthlyData[month]) monthlyData[month] = { income: 0, expense: 0 };
      
      if (tx.type === 'CREDIT') {
        monthlyData[month].income += tx.amount;
      } else if (tx.type === 'DEBIT') {
        monthlyData[month].expense += tx.amount;
      }
    });

    const months = Object.keys(monthlyData);
    if (months.length > 0) {
      setIncomeExpenseData(months.map(month => ({
        month,
        income: monthlyData[month].income,
        expense: monthlyData[month].expense
      })));
      
      months.forEach(month => {
        cumulativeSavings += (monthlyData[month].income - monthlyData[month].expense);
        savingsData.push({ month, amount: cumulativeSavings > 0 ? cumulativeSavings : 0 });
      });
      
      setSavingsTrendData(savingsData);
    }
  };

  const fetchCreditProfile = async () => {
    setLoading(true);
    setError(false);
    try {
      const [res, txRes, scoreRes] = await Promise.all([
        agentsApi.creditworthiness({
          cibil_score: user?.cibil_score || 765,
          experience_years: user?.yearsOfExperience || 8,
          monthly_income: user?.monthlyIncome || 24500,
          pehchan_id: user?.pehchan_id || 'PEH-UP-2024-8842',
          yarn_passbook_id: user?.yarn_passbook_id || yarnPassbook?.passbookNumber || 'YPB-UP-2024-8842',
        }).catch(err => {
          console.error("Agent API failed:", err);
          return { data: { credit_score: user?.cibil_score || 765, risk_level: "Medium", insights: ["Could not fetch live AI insights. Showing fallback data."] } };
        }),
        transactionsApi.getTransactions(user?.id || 'default').catch(() => []),
        creditScoringApi.getScoringProfile(user?.id || 'default').catch(() => null)
      ]);
      setAgentData(res?.data || null);
      processTransactionsForCharts(txRes);
      
      if (scoreRes && scoreRes.score) {
        setCreditTimeline([
          { date: new Date().toLocaleDateString('default', {month: 'short', year: 'numeric'}), score: scoreRes.score, status: scoreRes.risk_tier, note: 'Latest Backend Evaluation' },
          ...defaultCreditTimeline.slice(1)
        ]);
      }
    } catch (err) {
      console.error('Credit score agent fetch failed:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCreditProfile();
  }, [user?.id]);

  // If user is a new weaver with no transaction history and no valid cibil score
  const hasCreditScore = (user?.cibil_score && user.cibil_score > 0) || agentData?.credit_score;
  if (isNewWeaver && !hasCreditScore && !loading) {
    return (
      <div className="space-y-8 pb-16 max-w-5xl mx-auto">
        {/* Page Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3.5">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-primary-700 rounded-2xl flex items-center justify-center text-white shadow-md shadow-indigo-200 shrink-0">
            <Gauge size={28} />
          </div>
          <div>
            <Badge variant="indigo" dot>{t('creditDashboard.newWeaverProfile', 'New Weaver Profile')}</Badge>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              {t('creditDashboard.title', 'AI Credit Score Dashboard')}
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              {t('creditDashboard.unlockScoreSubtitle', 'Complete your onboarding credentials to unlock your AI fintech credit score')}
            </p>
          </div>
        </motion.div>

        {/* Empty State Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-8 sm:p-12 border-2 border-slate-100 shadow-sm text-center space-y-6"
        >
          <div className="w-20 h-20 rounded-3xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto shadow-inner">
            <Gauge size={44} />
          </div>

          <div className="space-y-2 max-w-xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              {t('creditDashboard.noTxHistory', 'No transaction history available yet')}
            </h2>
            <p className="text-sm text-slate-600 font-medium leading-relaxed">
              {t('creditDashboard.completeRegToUnlock', 'Complete your Pehchan ID registration and upload your Yarn Passbook to unlock:')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-3xl mx-auto text-left pt-2">
            {[
              t('creditDashboard.featureCreditGen', 'AI Credit Score Generation'),
              t('creditDashboard.featureMicroCredit', 'Micro-Credit & Loan Eligibility'),
              t('creditDashboard.featureRisk', 'Financial Health & Risk Analysis'),
              t('creditDashboard.featureAnalytics', 'Business & Turnover Analytics'),
              t('creditDashboard.featureSubvention', 'Smart Subvention Recommendations'),
              t('creditDashboard.featureInsurance', 'Loom Insurance Eligibility'),
            ].map((feature, idx) => (
              <div key={idx} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs font-bold text-slate-700 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-indigo-600 shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4 max-w-lg mx-auto">
            <Button
              fullWidth
              size="lg"
              variant="primary"
              leftIcon={<Sparkles size={18} />}
              onClick={() => navigate('/pehchan-guidance')}
            >
              <span className="whitespace-nowrap overflow-hidden text-ellipsis">{t('creditDashboard.applyPehchan', 'Apply for Pehchan ID')}</span>
            </Button>
            <Button
              fullWidth
              size="lg"
              variant="secondary"
              leftIcon={<Award size={18} />}
              onClick={() => navigate('/yarn-passbook-guidance')}
            >
              <span className="whitespace-nowrap overflow-hidden text-ellipsis">{t('creditDashboard.getYarnPassbook', 'Get Yarn Passbook')}</span>
            </Button>
            <Button
              fullWidth
              size="lg"
              variant="outline"
              onClick={() => navigate('/schemes')}
              className="border-slate-200 text-slate-700"
            >
              <span className="whitespace-nowrap overflow-hidden text-ellipsis">{t('creditDashboard.exploreSchemes', 'Explore Schemes')}</span>
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Score styling logic strictly based on score range
  const score = agentData?.credit_score || user?.cibil_score || 765;

  const getScoreColor = (s: number) => {
    if (s <= 500) return { stroke: '#EF4444', text: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200', rating: t('creditDashboard.ratingPoor', 'POOR'), risk: 'HIGH' };
    if (s <= 650) return { stroke: '#F59E0B', text: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200', rating: t('creditDashboard.ratingFair', 'FAIR'), risk: 'MEDIUM' };
    if (s <= 750) return { stroke: '#3B82F6', text: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200', rating: t('creditDashboard.ratingGood', 'GOOD'), risk: 'LOW' };
    return { stroke: '#10B981', text: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200', rating: t('creditDashboard.ratingExcellent', 'EXCELLENT'), risk: 'LOW' };
  };

  const scoreTheme = getScoreColor(score);
  const strokeDashoffset = 440 - (440 * ((score - 300) / 600)); // Map 300-900 onto 440 stroke radius

  // Credit factors
  const creditFactors = [
    { label: t('creditDashboard.incomeStability', 'Income Stability'), val: 90, color: 'bg-emerald-500' },
    { label: t('creditDashboard.savingsHabit', 'Savings Habit'), val: 82, color: 'bg-indigo-500' },
    { label: t('creditDashboard.loanRepayment', 'Loan Repayment'), val: 88, color: 'bg-blue-500' },
    { label: t('creditDashboard.businessTransactions', 'Business Transactions'), val: 75, color: 'bg-amber-500' },
    { label: t('creditDashboard.insuranceCoverage', 'Insurance Coverage'), val: 60, color: 'bg-purple-500' },
  ];

  const aiImprovementTips = [
    t('creditDashboard.tip1', 'Increase monthly savings by ₹500 to strengthen liquidity buffer.'),
    t('creditDashboard.tip2', 'Pay loan EMIs before due date to maintain 100% clean repayment track.'),
    t('creditDashboard.tip3', 'Upload latest Yarn Passbook regularly to reflect active raw material turnover.'),
    t('creditDashboard.tip4', 'Maintain consistent business transactions via UPI and e-Dhaga portal.'),
    t('creditDashboard.tip5', 'Renew PMJJBY and PMSBY policies to maximize insurance score weight.'),
  ];

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto">
      {/* Page Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-primary-700 rounded-2xl flex items-center justify-center text-white shadow-md shadow-indigo-200 shrink-0">
            <Gauge size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-display tracking-tight">
                {t('creditDashboard.title', 'AI Credit Score Dashboard')}
              </h1>
              <span className="bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-indigo-200">
                {t('creditDashboard.fintechEngine', 'Fintech Engine')}
              </span>
            </div>
            <p className="text-sm text-slate-500 font-medium mt-0.5">
              {t('creditDashboard.subtitle', 'Fintech credit analytics, risk assessment & financial health profile')}
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchCreditProfile}
          disabled={loading}
          leftIcon={<RefreshCw size={16} className={loading ? 'animate-spin' : ''} />}
          className="border-slate-200 text-slate-700 self-start sm:self-auto"
        >
          {loading ? t('common.refreshing', 'Refreshing...') : t('common.refreshScore', 'Refresh Profile')}
        </Button>
      </motion.div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col items-center justify-center min-h-[300px]">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}>
            <Sparkles size={40} className="text-indigo-600" />
          </motion.div>
          <p className="text-sm font-bold text-slate-700 mt-4">{t('creditDashboard.loading', 'Connecting to AI Credit Engine...')}</p>
          <p className="text-xs text-slate-400 mt-1">{t('creditDashboard.fetchingData', 'Fetching credit score, risk profile & loan eligibility')}</p>
        </div>
      )}

      {/* Error State with Retry Button */}
      {error && !loading && (
        <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-8 text-center space-y-4">
          <AlertTriangle size={48} className="mx-auto text-red-500" />
          <div>
            <h3 className="text-lg font-bold text-red-900">{t('creditDashboard.fetchFailed', 'Failed to fetch credit score profile from backend')}</h3>
            <p className="text-sm text-red-700 mt-1">{t('creditDashboard.checkConnection', 'Please check your backend connection and try again.')}</p>
          </div>
          <Button variant="primary" onClick={fetchCreditProfile} leftIcon={<RefreshCw size={16} />} className="mx-auto">
            {t('creditDashboard.retry', 'Retry Fetching Data')}
          </Button>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* HERO SECTION — Large Animated Score Meter */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-indigo-500/30"
          >
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              
              {/* Circular Meter */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center">
                <div className="relative w-64 h-64 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                    {/* Background Ring */}
                    <circle cx="80" cy="80" r="70" stroke="#1E293B" strokeWidth="12" fill="transparent" />
                    {/* Animated Score Arc */}
                    <motion.circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke={scoreTheme.stroke}
                      strokeWidth="12"
                      strokeDasharray="440"
                      initial={{ strokeDashoffset: 440 }}
                      animate={{ strokeDashoffset }}
                      transition={{ duration: 1.8, ease: 'easeOut' }}
                      strokeLinecap="round"
                      fill="transparent"
                    />
                  </svg>

                  {/* Inside Circle Content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <p className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-1">
                      {t('creditDashboard.scoreMeter', 'AI Credit Score')}
                    </p>
                    <span className="text-5xl font-black text-white tracking-tight">{score}</span>
                    <span className="text-xs font-semibold text-slate-400 mt-1">{t('creditDashboard.outOf', 'out of 900')}</span>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mt-2 border ${scoreTheme.bg} ${scoreTheme.text} ${scoreTheme.border}`}>
                      {scoreTheme.rating}
                    </span>
                  </div>
                </div>

                {/* Score Ranges Bar */}
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[10px] font-bold">
                  <span className="px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800">300-500 {t('creditDashboard.ratingPoor', 'Poor')}</span>
                  <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">501-650 {t('creditDashboard.ratingFair', 'Fair')}</span>
                  <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800">651-750 {t('creditDashboard.ratingGood', 'Good')}</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">751-900 {t('creditDashboard.ratingExcellent', 'Excellent')}</span>
                </div>
              </div>

              {/* Profile Context & Stats */}
              <div className="lg:col-span-7 space-y-6">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="success" dot>{user?.name || t('creditDashboard.verifiedWeaver', 'Verified Weaver')}</Badge>
                    <span className="text-xs text-slate-400 font-medium">{t('profile.weaverIdNumber', 'Pehchan ID')}: {user?.pehchan_id || 'PEH-UP-2024-8842'}</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                    {tData(agentData?.financial_health) || t('creditDashboard.strongProfile', 'Strong Financial Profile with Low Risk')}
                  </h2>
                  <p className="text-sm text-indigo-200 font-medium leading-relaxed">
                    {t('creditDashboard.evaluatedUsing', 'Evaluated using e-Dhaga Yarn Passbook transactions, Weaver Mudra repayment records, and automated thrift savings.')}
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                    <p className="text-xs text-indigo-300 font-medium">{t('creditDashboard.riskLevel', 'Risk Level')}</p>
                    <p className="text-lg font-black text-emerald-400">{t(`creditDashboard.risk${agentData?.risk_level || 'LOW'}`, `${agentData?.risk_level || 'LOW'}`)} {t('creditDashboard.riskText', 'Risk')}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                    <p className="text-xs text-indigo-300 font-medium">{t('creditDashboard.maxLoanEligible', 'Max Loan Eligibility')}</p>
                    <p className="text-lg font-black text-white">₹{((agentData?.max_eligible_loan || 250000) / 100000).toFixed(1)}L</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 col-span-2 sm:col-span-1">
                    <p className="text-xs text-indigo-300 font-medium">{t('creditDashboard.savingsScore', 'Savings Score')}</p>
                    <p className="text-lg font-black text-indigo-300">88 / 100</p>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>

          {/* SUMMARY CARDS GRID */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {[
              {
                title: t('creditDashboard.scoreMeter', 'Credit Score'),
                value: `${score} / 900`,
                desc: scoreTheme.rating,
                icon: Gauge,
                color: 'bg-indigo-50 text-indigo-700 border-indigo-100',
              },
              {
                title: t('creditDashboard.riskLevel', 'Risk Level'),
                value: `${t(`creditDashboard.risk${agentData?.risk_level || 'LOW'}`, `${agentData?.risk_level || 'LOW'}`)} ${t('creditDashboard.riskText', 'Risk')}`,
                desc: t('creditDashboard.verifiedLowRisk', 'Verified Low Default Risk'),
                icon: Shield,
                color: 'bg-emerald-50 text-emerald-700 border-emerald-100',
              },
              {
                title: t('creditDashboard.maxLoanEligible', 'Loan Eligibility'),
                value: `₹${((agentData?.max_eligible_loan || 250000) / 100000).toFixed(1)} ${t('loans.lakhs', 'Lakhs')}`,
                desc: t('creditDashboard.mudraWorkingCapital', 'Mudra Working Capital'),
                icon: HandCoins,
                color: 'bg-blue-50 text-blue-700 border-blue-100',
              },
              {
                title: t('creditDashboard.financialHealth', 'Financial Health'),
                value: t('creditDashboard.ratingExcellent', 'Excellent'),
                desc: t('creditDashboard.lowLeverage', 'Low Leverage & High Thrift'),
                icon: HeartPulseIcon,
                color: 'bg-purple-50 text-purple-700 border-purple-100',
              },
            ].map((card, idx) => {
              const Icon = card.icon;
              return (
                <motion.div key={idx} variants={staggerItem}>
                  <Card className="border-2 border-slate-100 shadow-sm hover:shadow-md transition-shadow h-full">
                    <CardContent className="p-5 flex items-start justify-between h-full">
                      <div className="flex-1 mr-3">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 truncate">{card.title}</p>
                        <h4 className="text-xl font-black text-slate-900 mb-1">{card.value}</h4>
                        <p className="text-xs font-medium text-slate-500 leading-tight">{card.desc}</p>
                      </div>
                      <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 ${card.color}`}>
                        <Icon size={20} />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LEFT COLUMN — Credit Factors & AI Recommendations */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* CREDIT FACTORS BREAKDOWN */}
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers size={20} className="text-indigo-600" />
                    <h3 className="text-lg font-bold text-slate-800">{t('creditDashboard.creditFactorsTitle', 'Credit Factors Breakdown')}</h3>
                  </div>
                  <span className="text-xs font-semibold text-slate-400">{t('creditDashboard.weightedScoring', 'Weighted Scoring')}</span>
                </div>

                <div className="space-y-4">
                  {creditFactors.map((factor, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="font-bold text-slate-700">{factor.label}</span>
                        <span className="font-black text-slate-900">{factor.val}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${factor.val}%` }}
                          transition={{ duration: 1.2, delay: idx * 0.1 }}
                          className={`h-full rounded-full ${factor.color}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* AI GENERATED RECOMMENDATIONS */}
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-indigo-900 via-primary-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg space-y-6 border border-indigo-500/30">
                <div className="flex items-center gap-2">
                  <Sparkles size={20} className="text-amber-300 animate-pulse" />
                  <h3 className="text-lg font-bold text-white uppercase tracking-wider">{t('creditDashboard.aiInsightsTitle', 'AI Generated Recommendations')}</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {agentData?.strengths?.map((s: string, idx: number) => (
                    <div key={`s-${idx}`} className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                        <CheckCircle2 size={14} /> {t('creditDashboard.strengths', 'Strengths')}
                      </div>
                      <p className="text-xs text-white leading-relaxed font-medium">{tData(s)}</p>
                    </div>
                  ))}

                  {agentData?.risks?.map((r: string, idx: number) => (
                    <div key={`r-${idx}`} className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                        <AlertTriangle size={14} /> {t('creditDashboard.recommendations', 'Recommendations')}
                      </div>
                      <p className="text-xs text-white leading-relaxed font-medium">{tData(r)}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* TRANSACTION ANALYTICS (CHARTS) */}
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity size={20} className="text-indigo-600" />
                    <h3 className="text-lg font-bold text-slate-800">{t('creditDashboard.txAnalyticsTitle', 'Transaction Analytics & Trends')}</h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Income vs Expenses */}
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">{t('creditDashboard.incomeExpenseTrend', 'Income vs Expenses')}</p>
                    <div className="h-56 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={incomeExpenseData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                          <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
                          <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                          <Bar dataKey="income" fill="#10B981" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="expense" fill="#EF4444" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Savings Trend */}
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">{t('creditDashboard.savingsTrend', 'Savings Growth')}</p>
                    <div className="h-56 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={savingsTrendData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                          <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
                          <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                          <Area type="monotone" dataKey="amount" stroke="#6366F1" fill="#EEF2FF" strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </motion.div>

            </div>

            {/* RIGHT COLUMN — Timeline, Products, Docs, Tips */}
            <div className="space-y-8">
              
              {/* CREDIT HISTORY TIMELINE */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-5">
                <div className="flex items-center gap-2">
                  <TrendingUp size={18} className="text-indigo-600" />
                  <h3 className="text-base font-bold text-slate-800">{t('creditDashboard.creditHistoryTitle', 'Credit History Timeline')}</h3>
                </div>

                <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {creditTimeline.map((item, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-indigo-600 border-2 border-white shadow-sm" />
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs font-bold text-slate-500 uppercase">{item.date}</p>
                          <p className="text-base font-black text-slate-900">{t('creditDashboard.scoreText', 'Score')} {item.score}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{tData(item.note)}</p>
                        </div>
                        {item.scoreGrowth && (
                          <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            {item.scoreGrowth}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* RECOMMENDED ELIGIBLE PRODUCTS */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-800">{t('creditDashboard.eligibleProductsTitle', 'Recommended Products')}</h3>
                  <button onClick={() => navigate('/loans')} className="text-xs text-indigo-600 font-bold hover:underline">{t('common.viewAll', 'View All')} →</button>
                </div>

                <div className="space-y-3">
                  {[
                    { title: t('creditDashboard.prodWeaverMudra', 'Weaver Mudra Loan'), desc: t('creditDashboard.prodMudraDesc', 'Up to ₹2L @ 6% Subvention'), badge: t('creditDashboard.badgeRecommended', 'Recommended'), color: 'bg-emerald-100 text-emerald-700' },
                    { title: t('creditDashboard.prodWorkingCapital', 'Working Capital Credit'), desc: t('creditDashboard.prodWCDesc', 'Instant Liquidity Line'), badge: t('creditDashboard.badgeHighApproval', 'High Approval'), color: 'bg-indigo-100 text-indigo-700' },
                    { title: t('creditDashboard.prodPMJJBY', 'PMJJBY Insurance'), desc: t('creditDashboard.prodPMJJBYDesc', '₹2L Life Cover @ ₹436/yr'), badge: t('creditDashboard.badgeFreeScheme', 'Free Scheme'), color: 'bg-blue-100 text-blue-700' },
                  ].map((prod, idx) => (
                    <div key={idx} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center hover:bg-slate-100/80 transition-colors cursor-pointer" onClick={() => navigate('/loans')}>
                      <div className="mr-2">
                        <p className="text-sm font-bold text-slate-900 leading-tight">{prod.title}</p>
                        <p className="text-[11px] text-slate-500 font-medium leading-tight mt-0.5">{prod.desc}</p>
                      </div>
                      <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-full whitespace-nowrap shrink-0 ${prod.color}`}>
                        {prod.badge}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* DOCUMENT VERIFICATION STATUS */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  <FileCheck size={18} className="text-emerald-600" />
                  <h3 className="text-base font-bold text-slate-800">{t('creditDashboard.documentStatusTitle', 'Document Status')}</h3>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: t('profile.aadhaarCard', 'Aadhaar Card'), status: t('common.verified', 'Verified'), icon: CheckCircle2, color: 'text-emerald-500' },
                    { label: t('profile.weaverIdNumber', 'Weaver ID'), status: t('common.verified', 'Verified'), icon: CheckCircle2, color: 'text-emerald-500' },
                    { label: t('profile.bankPassbook', 'Bank Passbook'), status: t('common.verified', 'Verified'), icon: CheckCircle2, color: 'text-emerald-500' },
                    { label: t('profile.yarnPassbook', 'Yarn Passbook'), status: t('common.verified', 'Verified'), icon: CheckCircle2, color: 'text-emerald-500' },
                  ].map((doc, idx) => {
                    const Icon = doc.icon;
                    return (
                      <div key={idx} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-2">
                        <Icon size={16} className={doc.color + ' shrink-0'} />
                        <div>
                          <p className="text-[11px] font-bold text-slate-800 leading-tight">{doc.label}</p>
                          <p className="text-[10px] text-emerald-600 font-semibold">{doc.status}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              {/* AI IMPROVEMENT TIPS */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="bg-gradient-to-br from-indigo-50 to-primary-50 rounded-3xl p-6 border border-indigo-100 shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-indigo-600" />
                  <h3 className="text-base font-bold text-indigo-950">{t('creditDashboard.aiTipsTitle', 'AI Score Improvement Tips')}</h3>
                </div>

                <ul className="space-y-2.5">
                  {aiImprovementTips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-indigo-900 font-medium leading-relaxed">
                      <Zap size={14} className="text-amber-500 shrink-0 mt-0.5" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

            </div>

          </div>
        </>
      )}
    </div>
  );
}

function HeartPulseIcon({ size = 20 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
      <path d="M12 5v14"/>
    </svg>
  );
}
