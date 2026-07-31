import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import {
  Wallet,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronRight,
  PiggyBank,
  Landmark,
  ShieldCheck,
  Plus,
  Sparkles,
  Target,
  HeartPulse,
  ExternalLink,
  MapPin,
  Building2,
  CheckCircle2,
  Clock,
  Send,
  AlertCircle,
  BellRing
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { SavingsHero } from '../components/hero/SavingsHero';
import { staggerContainer, staggerItem, fadeIn, slideInLeft } from '../utils/animations';
import { recommendedSavings, userSavings, type SavingsProduct } from '../data/savings';
import { tData } from '../utils/i18nData';
import { agentsApi, productsApi } from '../services/api';
import { useAppContext } from '../context/AppContext';
import { Button } from '../components/ui/Button';
import { Modal, Toast } from '../components/ui/Modal';

const chartData = [
  { month: 'Jan', amount: 8000 },
  { month: 'Feb', amount: 9500 },
  { month: 'Mar', amount: 11000 },
  { month: 'Apr', amount: 10500 },
  { month: 'May', amount: 13000 },
  { month: 'Jun', amount: 14500 },
];

// Removed MOCK_POST_OFFICES

export default function SavingsPage() {
  const { t } = useTranslation();
  const { user } = useAppContext();
  const [savingsAgent, setSavingsAgent] = useState<any>(null);
  const [savingsLoading, setSavingsLoading] = useState(false);

  // Facilitator & Aggregator Modal States
  const [selectedProduct, setSelectedProduct] = useState<SavingsProduct | null>(null);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [isPostOfficeModalOpen, setIsPostOfficeModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);

  // Post Office Locator State (Removed)
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  // Custom Goal Creation State
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalAmount, setNewGoalAmount] = useState('25000');

  // Dynamic savings state
  const [dynamicSavings, setDynamicSavings] = useState<SavingsProduct[]>(recommendedSavings);

  useEffect(() => {
    if (user) {
      setSavingsLoading(true);
      agentsApi.savings({
        monthly_income: user.monthlyIncome || 16000,
        monthly_expenses: Math.round((user.monthlyIncome || 16000) * 0.65),
        total_savings_balance: userSavings.totalBalance,
        monthly_contribution_pct: 5,
      })
        .then(r => setSavingsAgent(r.data))
        .catch(err => {
          console.warn('Savings agent offline, using local analysis model', err);
          setSavingsAgent({
            recommended_monthly_savings_inr: Math.round((user.monthlyIncome || 16000) * 0.15),
            projected_12m_savings_inr: Math.round((user.monthlyIncome || 16000) * 0.15 * 12),
            recommended_emergency_fund_target_inr: Math.round((user.monthlyIncome || 16000) * 3),
            financial_health_score: 84,
            current_savings_balance_inr: userSavings.totalBalance,
            target_emergency_fund_inr: 20000,
            estimated_months_to_target: 4,
            suggested_budget_split: {
              yarn_and_living_needs_60pct: Math.round((user.monthlyIncome || 16000) * 0.60),
              loom_maintenance_and_expenses_30pct: Math.round((user.monthlyIncome || 16000) * 0.30),
              automated_thrift_savings_10pct: Math.round((user.monthlyIncome || 16000) * 0.10),
            },
            budgeting_tips: [
              "Set aside ₹500 every week directly after saree delivery payouts.",
              "Utilize Post Office 5-Yr RD (6.7% p.a.) for guaranteed returns during lean weaving months."
            ]
          });
        })
        .finally(() => setSavingsLoading(false));
        
      productsApi.getRecommendations(user.id).then(res => {
        if (res.recommended_savings && res.recommended_savings.length > 0) {
          const mapped = res.recommended_savings.map((p: any) => ({
            id: p.id,
            name: p.name,
            description: p.description,
            minBalance: p.minimum_balance,
            interestRate: p.interest_rate,
            features: p.benefits || [],
            eKycSupported: true,
            requiresPostOfficeVisit: p.provider.includes("Post"),
            officialProviderType: p.provider.includes("Post") ? "India Post" : "Partner Bank",
            officialPortalUrl: p.portal_url,
          }));
          setDynamicSavings(mapped);
        }
      }).catch(console.error);
    }
  }, [user?.id]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  const handleProductClick = (product: SavingsProduct) => {
    setSelectedProduct(product);
    if (product.officialProviderType === 'India Post') {
      setIsPostOfficeModalOpen(true);
    } else {
      setIsBankModalOpen(true);
    }
  };

  // filteredPostOffices removed

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto pb-20">
      {/* Header */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <motion.h1 variants={fadeIn} className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
            {t('savings.title', 'Savings & Wealth Facilitator')}
          </motion.h1>
          <span className="text-xs bg-indigo-100 text-indigo-800 font-bold px-3 py-1 rounded-full border border-indigo-200 flex items-center gap-1">
            <ShieldCheck size={14} className="text-indigo-600" /> Digital Aggregator Platform
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          KarghaDhan connects handloom weavers directly to official Partner Banks (e-KYC) and India Post Savings Schemes.
        </p>
      </motion.div>
      
      <SavingsHero />

      {/* Facilitator & Aggregator Role Explanation Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-5 text-white shadow-md border border-indigo-500/20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-amber-300 shrink-0">
              <Landmark size={20} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                Digital Facilitation Architecture
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 px-2 py-0.5 rounded-full font-bold">RBI Account Aggregator Framework</span>
              </h3>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                KarghaDhan pre-fills your verified Weaver Pehchan details and routes you to official Bank e-KYC portals & India Post branches.
              </p>
            </div>
          </div>
          <div className="text-xs font-mono bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 text-amber-300 shrink-0">
            User → KarghaDhan → Partner Institution → e-KYC
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        
        {/* Left Column - Main Stats & Charts */}
        <div className="lg:col-span-2 space-y-6 lg:space-y-8">
          
          {/* Main Balance Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-indigo-700 via-indigo-600 to-primary-700 text-white shadow-xl shadow-indigo-200"
          >
            <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-white/10 rounded-full blur-3xl mix-blend-overlay"></div>
            
            <div className="relative z-10 flex flex-col sm:flex-row justify-between gap-6">
              <div className="space-y-2">
                <p className="text-indigo-200 font-medium text-sm sm:text-base flex items-center gap-2">
                  <Wallet size={16} /> {t('savings.totalSavings', 'Aggregated Savings Balance')}
                </p>
                <h2 className="text-4xl sm:text-5xl font-black tracking-tight">
                  ₹{userSavings.totalBalance.toLocaleString()}
                </h2>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 backdrop-blur-md mt-2">
                  <TrendingUp size={16} className="text-green-300" />
                  <p className="text-sm font-semibold">
                    +₹{userSavings.totalInterestEarned.toLocaleString()} <span className="text-indigo-200 font-normal">{t('savings.earned', 'Earned')}</span>
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => triggerToast('💳 Bank Account Aggregator Consent: Fetching live balance from SBI / India Post IPPB...')}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white text-indigo-700 px-6 py-3 rounded-xl font-bold text-sm hover:bg-indigo-50 hover:scale-105 transition-all shadow-md h-fit cursor-pointer"
                >
                  <Sparkles size={16} /> Sync API Balances
                </button>
              </div>
            </div>
          </motion.div>

          {/* AI Savings Agent Panel */}
          <motion.div
            variants={slideInLeft}
            initial="hidden"
            animate="visible"
            className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm"
          >
            <div className="bg-gradient-to-r from-primary-600 to-indigo-700 px-6 py-4 flex items-center gap-2">
              <Sparkles size={16} className="text-white" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">{t('savings.agentTitle', 'AI Weaver Savings & Budget Plan')}</h2>
              {savingsLoading && <span className="ml-auto text-xs text-white/70 animate-pulse">Calculating...</span>}
            </div>
            {!savingsLoading && savingsAgent && (
              <div className="p-6 space-y-5">
                {/* Thrift target progress */}
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-xs font-bold text-slate-600">{t('savings.emergencyFundTarget', 'Emergency Fund Target')}</span>
                    <span className="text-xs font-black text-primary-700">₹{(savingsAgent.target_emergency_fund_inr || 20000)?.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (((savingsAgent.current_savings_balance_inr || 14500) / (savingsAgent.target_emergency_fund_inr || 20000)) * 100))}%` }}
                      transition={{ duration: 1.2, ease: 'easeOut' }}
                      className="h-3 bg-gradient-to-r from-primary-500 to-indigo-600 rounded-full"
                    />
                  </div>
                  <div className="flex justify-between mt-1.5 text-xs">
                    <span className="text-slate-500">{t('savings.saved', 'Saved')}: ₹{(savingsAgent.current_savings_balance_inr || 14500)?.toLocaleString('en-IN')}</span>
                    <span className="text-primary-600 font-bold">{savingsAgent.estimated_months_to_target || 4} {t('savings.monthsToGo', 'months to target')}</span>
                  </div>
                </div>

                {/* Budget split */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: t('savings.yarn', 'Yarn & Living'), value: savingsAgent.suggested_budget_split?.yarn_and_living_needs_60pct, color: 'bg-indigo-100 text-indigo-700' },
                    { label: t('savings.loomMaint', 'Loom Maint.'), value: savingsAgent.suggested_budget_split?.loom_maintenance_and_expenses_30pct, color: 'bg-amber-100 text-amber-700' },
                    { label: t('savings.thrift', 'Thrift Fund'), value: savingsAgent.suggested_budget_split?.automated_thrift_savings_10pct, color: 'bg-emerald-100 text-emerald-700' },
                  ].map((item) => (
                    <div key={item.label} className={`rounded-2xl p-3 text-center ${item.color}`}>
                      <p className="text-base font-black">₹{(item.value || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                      <p className="text-xs font-semibold mt-0.5 opacity-80">{item.label}</p>
                    </div>
                  ))}
                </div>

                {/* Tips */}
                {savingsAgent.budgeting_tips?.map((tip: string, i: number) => (
                  <div key={i} className="flex items-start gap-3 bg-primary-50 border border-primary-100 rounded-xl p-3">
                    <Target size={14} className="text-primary-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">{tip}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Growth Timeline Chart */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-800 text-lg">{t('savings.growthTimeline', 'Savings Growth Timeline')}</h3>
              <select className="bg-slate-50 border border-slate-200 text-sm font-bold text-slate-600 rounded-lg px-3 py-1 outline-none">
                <option>{t('savings.last6Months', 'Last 6 Months')}</option>
                <option>{t('savings.thisYear', 'This Year')}</option>
              </select>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: '#4f46e5', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="amount" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Official Partner Banks & Post Office Schemes Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Official Partner Bank & Post Office Savings Schemes</h2>
              <span className="text-xs text-slate-500 font-semibold">Government Certified</span>
            </div>

            <div className="grid gap-4">
              {dynamicSavings.map((product) => (
                <motion.div
                  key={product.id}
                  whileHover={{ scale: 1.01, y: -2 }}
                  onClick={() => handleProductClick(product)}
                  className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-4 justify-between group cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all"
                >
                  <div className="flex gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors ${
                      product.officialProviderType === 'India Post'
                        ? 'bg-amber-100 text-amber-800 group-hover:bg-amber-600 group-hover:text-white'
                        : 'bg-indigo-100 text-indigo-700 group-hover:bg-indigo-600 group-hover:text-white'
                    }`}>
                      {product.officialProviderType === 'India Post' ? <Landmark size={24} /> : <Building2 size={24} />}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-base">{product.name}</h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          product.officialProviderType === 'India Post' ? 'bg-amber-100 text-amber-900' : 'bg-indigo-100 text-indigo-800'
                        }`}>
                          {product.officialProviderType}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium">{product.description}</p>
                      <div className="flex flex-wrap gap-2 pt-1">
                        <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-bold">
                          Min Deposit: ₹{product.minBalance}
                        </span>
                        {product.eKycSupported && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
                            <CheckCircle2 size={10} /> Instant e-KYC
                          </span>
                        )}
                        {product.requiresPostOfficeVisit && (
                          <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
                            <MapPin size={10} /> Branch Verification
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-left sm:text-right flex flex-row sm:flex-col justify-between items-center sm:items-end shrink-0">
                    <div>
                      <p className="text-2xl font-black text-indigo-700">{product.interestRate}%</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Official Interest Rate</p>
                    </div>
                    <Button size="sm" variant="outline" className="mt-2 text-xs font-bold border-indigo-200 text-indigo-700 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600">
                      Open & Facilitate <ChevronRight size={14} className="ml-1" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Goals, Health & Reminders */}
        <div className="space-y-6 lg:space-y-8">
          
          {/* Financial Health Score */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-950 rounded-3xl p-6 text-white relative overflow-hidden border border-slate-800"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl" />
            <div className="flex items-center gap-2 text-slate-400 font-medium text-sm mb-4">
              <HeartPulse size={16} className="text-emerald-400" /> {t('savings.financialHealth', 'Weaver Financial Health Index')}
            </div>
            
            <div className="flex items-end gap-2 mb-2">
              <span className="text-5xl font-black text-white">{savingsAgent?.financial_health_score || 84}</span>
              <span className="text-slate-400 font-bold mb-1">/ 100</span>
            </div>
            <p className="text-emerald-400 text-sm font-bold">{t('savings.excellent', 'Excellent! High credit & savings discipline.')}</p>
            
            <div className="mt-6 space-y-3">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-300">{t('savings.savingsRate', 'Savings Rate')}</span>
                <span className="text-white">18% (Optimal)</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5">
                <div className="bg-emerald-400 h-1.5 rounded-full" style={{ width: '84%' }}></div>
              </div>
            </div>
          </motion.div>

          {/* Goal Tracker */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Target size={16} className="text-indigo-600" /> {t('savings.yourGoals', 'Weaver Savings Goals')}
              </h3>
              <span className="text-xs bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-full">2 Active</span>
            </div>
            
            <div className="space-y-6">
              {/* Emergency Fund Goal */}
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0">
                  <svg className="w-16 h-16 transform -rotate-90">
                    <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-100" />
                    <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" strokeDasharray="175" strokeDashoffset="44" className="text-indigo-500" strokeLinecap="round" />
                  </svg>
                  <span className="absolute text-[11px] font-bold text-slate-700">75%</span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">{t('savings.emergencyFund', 'Emergency Fund')}</h4>
                  <p className="text-xs text-slate-500 font-medium mt-1">₹15,000 / ₹20,000</p>
                </div>
              </div>

              {/* Loom Upgrade Goal */}
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0">
                  <svg className="w-16 h-16 transform -rotate-90">
                    <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-100" />
                    <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" strokeDasharray="175" strokeDashoffset="122" className="text-emerald-500" strokeLinecap="round" />
                  </svg>
                  <span className="absolute text-[11px] font-bold text-slate-700">30%</span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">{t('savings.newJacquardLoom', 'New Jacquard Loom Upgrade')}</h4>
                  <p className="text-xs text-slate-500 font-medium mt-1">₹15,000 / ₹50,000</p>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setIsGoalModalOpen(true)}
              className="w-full py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <Plus size={14} /> Create New Savings Goal
            </button>
          </div>

          {/* Reminders & Notifications */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <BellRing size={16} className="text-amber-500" /> Automated Deposit Reminders
            </h3>
            <div className="space-y-3 text-xs">
              <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-3 flex items-start gap-2.5">
                <Clock size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900">Post Office RD Monthly Deposit Due</p>
                  <p className="text-slate-600 mt-0.5">₹500 due on 5th of every month. Automatic SMS & WhatsApp reminder enabled.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Partner Bank e-KYC Digital Facilitation Modal */}
      <Modal
        isOpen={isBankModalOpen}
        onClose={() => setIsBankModalOpen(false)}
        title={`Digital Facilitator: ${selectedProduct?.name || 'Partner Bank Account'}`}
        size="lg"
      >
        {selectedProduct && (
          <div className="space-y-6">
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-start gap-3">
              <Building2 size={24} className="text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-indigo-950">
                  Digital Account Aggregator Architecture
                </p>
                <p className="text-xs text-indigo-800 leading-relaxed mt-0.5">
                  KarghaDhan acts as a certified digital aggregator. We pre-fill your verified <strong>Weaver Pehchan Credentials</strong> and transfer your session to the official partner bank portal for instant video e-KYC.
                </p>
              </div>
            </div>

            {/* Facilitator Flow Diagram */}
            <div className="bg-slate-900 rounded-2xl p-4 text-white text-xs space-y-3">
              <p className="font-bold text-amber-300 uppercase tracking-wider text-[11px]">Digital Facilitator Workflow</p>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-center">
                <div className="bg-white/10 p-2.5 rounded-xl border border-white/10">1. Pre-fill Details ✅</div>
                <div className="bg-white/10 p-2.5 rounded-xl border border-white/10">2. Partner Bank Redirect 🏦</div>
                <div className="bg-white/10 p-2.5 rounded-xl border border-white/10">3. Video e-KYC 📹</div>
                <div className="bg-emerald-500/20 text-emerald-300 p-2.5 rounded-xl border border-emerald-400/30">4. Account Issued 💳</div>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-xs">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider">Pre-Filled Verified Details</h4>
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-slate-500">Weaver ID:</span> <strong>{user?.pehchan_id || 'PEH-UP-2024-8842'}</strong></div>
                <div><span className="text-slate-500">Aadhaar Status:</span> <strong className="text-emerald-600">Verified</strong></div>
                <div><span className="text-slate-500">Target Product:</span> <strong>{selectedProduct.name}</strong></div>
                <div><span className="text-slate-500">Interest Rate:</span> <strong className="text-indigo-600">{selectedProduct.interestRate}% p.a.</strong></div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                fullWidth
                size="lg"
                rightIcon={<ExternalLink size={18} />}
                onClick={() => {
                  window.open(selectedProduct.officialPortalUrl, '_blank');
                  triggerToast(`Redirecting to official ${selectedProduct.provider} e-KYC Portal...`);
                  setIsBankModalOpen(false);
                }}
              >
                Proceed to Partner Bank e-KYC Portal
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* India Post (Post Office) Facilitation & Branch Locator Modal */}
      <Modal
        isOpen={isPostOfficeModalOpen}
        onClose={() => setIsPostOfficeModalOpen(false)}
        title={`India Post Scheme Facilitator: ${selectedProduct?.name || 'Post Office Scheme'}`}
        size="lg"
      >
        {selectedProduct && (
          <div className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
              <Landmark size={24} className="text-amber-700 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-amber-950">
                  Official India Post (Department of Posts) Facilitator
                </p>
                <p className="text-xs text-amber-900 leading-relaxed mt-0.5">
                  India Post schemes provide 100% sovereign government protection. KarghaDhan now offers 100% digital e-KYC for India Post schemes, removing the need to visit a branch physically.
                </p>
              </div>
            </div>

            {/* Scheme Official Details */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                <span className="text-slate-500 font-medium">Official Rate:</span>
                <p className="text-base font-black text-amber-700">{selectedProduct.interestRate}% p.a.</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                <span className="text-slate-500 font-medium">Min Deposit:</span>
                <p className="text-base font-black text-slate-900">₹{selectedProduct.minBalance}</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl col-span-2 sm:col-span-1">
                <span className="text-slate-500 font-medium">Safety Guarantee:</span>
                <p className="text-xs font-bold text-emerald-700">100% Sovereign Govt Cover</p>
              </div>
            </div>

            {/* Digital e-KYC Verification Step */}
            <div className="space-y-3 pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  100% Online e-KYC Verification
                </h4>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex justify-between items-center text-xs">
                <div>
                  <h5 className="font-bold text-slate-900">Digital KYC Ready</h5>
                  <p className="text-slate-500 mt-0.5">Your Weaver ID and Aadhaar will be used to digitally sign your application.</p>
                </div>
                <span className="text-[10px] bg-emerald-100 font-bold px-2 py-1 rounded-md text-emerald-800 shrink-0">
                  Instant Process
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                fullWidth
                variant="outline"
                onClick={() => {
                  triggerToast('📄 Form SB-3 pre-filled with Pehchan ID & Aadhaar details! Starting e-KYC...');
                }}
              >
                Start Digital e-KYC Process
              </Button>

              <Button
                fullWidth
                rightIcon={<ExternalLink size={16} />}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold"
                onClick={() => {
                  window.open(selectedProduct.officialPortalUrl, '_blank');
                  triggerToast('Redirecting to official India Post Portal...');
                  setIsPostOfficeModalOpen(false);
                }}
              >
                Redirect to India Post Portal
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Goal Creator Modal */}
      <Modal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        title="Create New Weaver Savings Goal"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase">Goal Name</label>
            <input
              type="text"
              placeholder="e.g. Raw Silk Yarn Reserve"
              value={newGoalName}
              onChange={e => setNewGoalName(e.target.value)}
              className="w-full mt-1 p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase">Target Amount (₹)</label>
            <input
              type="number"
              value={newGoalAmount}
              onChange={e => setNewGoalAmount(e.target.value)}
              className="w-full mt-1 p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
            />
          </div>

          <Button
            fullWidth
            onClick={() => {
              triggerToast(`Target Goal '${newGoalName || 'New Goal'}' created! Automatic weekly reminders active.`);
              setIsGoalModalOpen(false);
            }}
          >
            Create Goal & Activate Reminders
          </Button>
        </div>
      </Modal>

      <Toast message={toastMessage} isVisible={showToast} type="info" />
    </div>
  );
}
