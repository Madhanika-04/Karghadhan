import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
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
  HeartPulse
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { SavingsHero } from '../components/hero/SavingsHero';
import { staggerContainer, staggerItem, fadeIn, slideInLeft } from '../utils/animations';
import { recommendedSavings, userSavings } from '../data/savings';
import { tData } from '../utils/i18nData';

const chartData = [
  { month: 'Jan', amount: 8000 },
  { month: 'Feb', amount: 9500 },
  { month: 'Mar', amount: 11000 },
  { month: 'Apr', amount: 10500 },
  { month: 'May', amount: 13000 },
  { month: 'Jun', amount: 14500 },
];

export default function SavingsPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto pb-20">
      {/* Header */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="flex flex-col gap-2">
        <motion.h1 variants={fadeIn} className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
          {t('savings.title', 'Savings & Wealth')}
        </motion.h1>
      </motion.div>
      
      <SavingsHero />

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
                  <Wallet size={16} /> {t('savings.totalSavings', 'Total Savings')}
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

              <div className="flex gap-3">
                <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white text-indigo-700 px-6 py-3 rounded-xl font-bold text-sm hover:bg-indigo-50 hover:scale-105 transition-all shadow-md h-fit">
                  <Plus size={18} /> {t('savings.deposit', 'Deposit')}
                </button>
              </div>
            </div>
          </motion.div>

          {/* AI Tips Card */}
          <motion.div
            variants={slideInLeft}
            initial="hidden"
            animate="visible"
            className="bg-gradient-to-r from-primary-50 to-indigo-50 border border-primary-100 p-5 rounded-2xl flex gap-4 items-start shadow-sm"
          >
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
              <Sparkles className="text-primary-600" size={20} />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm">{t('savings.insightTitle', 'Kargha AI Insight')}</h4>
              <p className="text-sm text-slate-600 mt-1 font-medium leading-relaxed" dangerouslySetInnerHTML={{ __html: t('savings.insightText', 'You can save <strong class="text-primary-700">₹500 more each month</strong> by reducing unnecessary cash withdrawals. Would you like to automate this into a recurring deposit?') }} />
            </div>
          </motion.div>

          {/* Growth Timeline Chart */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-800 text-lg">{t('savings.growthTimeline', 'Growth Timeline')}</h3>
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

          {/* Recommended Products */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-800">{t('savings.investmentSuggestions', 'Investment Suggestions')}</h2>
            <div className="grid gap-4">
              {recommendedSavings.slice(0, 2).map((product) => (
                <motion.div
                  key={product.id}
                  whileHover={{ scale: 1.01, y: -2 }}
                  className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-4 justify-between group cursor-pointer"
                >
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <PiggyBank size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">{tData(product.name)}</h3>
                      <p className="text-xs text-slate-500 font-medium">{tData(product.provider)}</p>
                      <div className="flex gap-2 mt-2">
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded-md font-bold">{t('savings.min', 'Min:')} ₹{product.minBalance}</span>
                        {product.isGovBacked && <span className="text-[10px] bg-success-50 text-success-700 px-2 py-1 rounded-md font-bold flex items-center gap-1"><ShieldCheck size={12}/> {t('savings.govBacked', 'Gov Backed')}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="text-left sm:text-right flex flex-row sm:flex-col justify-between items-center sm:items-end">
                    <div>
                      <p className="text-xl font-black text-indigo-600">{product.interestRate}%</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">{t('savings.interest', 'Interest')}</p>
                    </div>
                    <ChevronRight size={20} className="text-slate-300 group-hover:text-indigo-600 transition-colors" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Goals & Health */}
        <div className="space-y-6 lg:space-y-8">
          
          {/* Financial Health Score */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 rounded-3xl p-6 text-white relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-success-500/20 rounded-full blur-2xl" />
            <div className="flex items-center gap-2 text-slate-400 font-medium text-sm mb-4">
              <HeartPulse size={16} className="text-success-400" /> {t('savings.financialHealth', 'Financial Health')}
            </div>
            
            <div className="flex items-end gap-2 mb-2">
              <span className="text-5xl font-black text-white">84</span>
              <span className="text-slate-400 font-bold mb-1">/ 100</span>
            </div>
            <p className="text-success-400 text-sm font-bold">{t('savings.excellent', 'Excellent! You are on track.')}</p>
            
            <div className="mt-6 space-y-3">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-300">{t('savings.savingsRate', 'Savings Rate')}</span>
                <span className="text-white">{t('savings.good', '18% (Good)')}</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5">
                <div className="bg-success-400 h-1.5 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
          </motion.div>

          {/* Goals - Progress Rings */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Target size={16} className="text-indigo-600" /> {t('savings.yourGoals', 'Your Goals')}
            </h3>
            
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
                    <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" strokeDasharray="175" strokeDashoffset="122" className="text-success-500" strokeLinecap="round" />
                  </svg>
                  <span className="absolute text-[11px] font-bold text-slate-700">30%</span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">{t('savings.newJacquardLoom', 'New Jacquard Loom')}</h4>
                  <p className="text-xs text-slate-500 font-medium mt-1">₹15,000 / ₹50,000</p>
                </div>
              </div>
            </div>
            
            <button className="w-full mt-6 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors">
              {t('savings.createNewGoal', '+ Create New Goal')}
            </button>
          </div>

          {/* Recent Transactions Mini */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-slate-800">{t('savings.recent', 'Recent')}</h3>
              <button className="text-[11px] font-bold text-indigo-600">{t('savings.viewAll', 'View All')}</button>
            </div>
            <div className="space-y-4">
              {userSavings.recentTransactions.slice(0, 3).map((tx) => (
                <div key={tx.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.type === 'credit' ? 'bg-success-50 text-success-600' : 'bg-slate-100 text-slate-600'}`}>
                      {tx.type === 'credit' ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 truncate max-w-[100px]">{tData(tx.title)}</p>
                      <p className="text-[9px] text-slate-400 font-medium">
                        {new Intl.DateTimeFormat('en-IN', { month: 'short', day: 'numeric' }).format(new Date(tx.date))}
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs font-bold ${tx.type === 'credit' ? 'text-success-600' : 'text-slate-800'}`}>
                    {tx.type === 'credit' ? '+' : '-'}₹{tx.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
