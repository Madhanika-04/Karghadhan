import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownLeft,
  Sparkles,
  Calendar,
  AlertCircle,
  Wallet
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { staggerContainer, staggerItem, fadeIn, slideInLeft } from '../utils/animations';

const monthlyData = [
  { month: 'Jan', income: 15000, expense: 8000 },
  { month: 'Feb', income: 18000, expense: 9500 },
  { month: 'Mar', income: 16500, expense: 11000 },
  { month: 'Apr', income: 21000, expense: 10500 },
  { month: 'May', income: 19000, expense: 13000 },
  { month: 'Jun', income: 24500, expense: 14500 },
];

const recentActivity = [
  { id: 1, title: 'Silk Subsidy Credit', date: '2023-06-15', amount: 15000, type: 'credit', category: 'Subsidy' },
  { id: 2, title: 'Loom EMI Payment', date: '2023-06-10', amount: 4500, type: 'debit', category: 'Loan' },
  { id: 3, title: 'Yarn Purchase', date: '2023-06-05', amount: 8000, type: 'debit', category: 'Expense' },
  { id: 4, title: 'Handloom Sales', date: '2023-06-02', amount: 9500, type: 'credit', category: 'Income' },
];

const upcomingReminders = [
  { id: 1, title: 'PMJJBY Premium', daysLeft: 5, amount: 436, type: 'insurance' },
  { id: 2, title: 'MUDRA Loan EMI', daysLeft: 12, amount: 2100, type: 'loan' },
];

export default function FinancialActivityPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto pb-20">
      {/* Header */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="flex flex-col gap-2">
        <motion.h1 variants={fadeIn} className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
          <Activity className="text-indigo-600" size={32} />
          {t('finance.title', 'Financial Activity')}
        </motion.h1>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        
        {/* Left Column - Main Stats & Charts */}
        <div className="lg:col-span-2 space-y-6 lg:space-y-8">
          
          {/* Summary Cards */}
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <motion.div variants={staggerItem} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div className="w-10 h-10 rounded-xl bg-success-50 text-success-600 flex items-center justify-center">
                  <TrendingUp size={20} />
                </div>
              </div>
              <p className="text-sm text-slate-500 font-medium mb-1">{t('finance.totalIncome', 'Total Income')}</p>
              <h3 className="text-2xl font-bold text-slate-800">₹1,14,000</h3>
            </motion.div>
            
            <motion.div variants={staggerItem} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div className="w-10 h-10 rounded-xl bg-danger-50 text-danger-600 flex items-center justify-center">
                  <TrendingDown size={20} />
                </div>
              </div>
              <p className="text-sm text-slate-500 font-medium mb-1">{t('finance.totalExpenses', 'Total Expenses')}</p>
              <h3 className="text-2xl font-bold text-slate-800">₹66,500</h3>
            </motion.div>

            <motion.div variants={staggerItem} className="bg-indigo-600 p-5 rounded-3xl border border-indigo-500 shadow-md text-white">
              <div className="flex justify-between items-start mb-2">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Wallet size={20} className="text-white" />
                </div>
              </div>
              <p className="text-sm text-indigo-100 font-medium mb-1">{t('finance.netSavings', 'Net Savings')}</p>
              <h3 className="text-2xl font-bold text-white">₹47,500</h3>
            </motion.div>
          </motion.div>

          {/* AI Tips Card */}
          <motion.div
            variants={slideInLeft}
            initial="hidden"
            animate="visible"
            className="bg-gradient-to-r from-primary-50 to-indigo-50 border border-primary-100 p-5 rounded-3xl flex gap-4 items-start shadow-sm"
          >
            <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
              <Sparkles className="text-primary-600" size={24} />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm mb-1">{t('finance.aiInsightTitle', 'Kargha AI Insight')}</h4>
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                {t('finance.aiInsightText', 'You have received ₹15,000 from the Silk Subsidy scheme this month. Your next EMI is due in 5 days.')}
              </p>
            </div>
          </motion.div>

          {/* Monthly Summary Chart */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-800 text-lg">{t('finance.monthlySummary', 'Monthly Financial Summary')}</h3>
              <select className="bg-slate-50 border border-slate-200 text-sm font-bold text-slate-600 rounded-lg px-3 py-1 outline-none">
                <option>{t('finance.sixMonths', 'Last 6 Months')}</option>
                <option>{t('finance.thisYear', 'This Year')}</option>
              </select>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    cursor={{ fill: '#f8fafc' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: 'bold' }} />
                  <Bar dataKey="income" name={t('finance.income', 'Income')} fill="#10b981" radius={[4, 4, 0, 0]} barSize={12} />
                  <Bar dataKey="expense" name={t('finance.expense', 'Expense')} fill="#ef4444" radius={[4, 4, 0, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Right Column - Reminders & Activity */}
        <div className="space-y-6 lg:space-y-8">
          
          {/* Upcoming Reminders */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 rounded-3xl p-6 text-white relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl" />
            <div className="flex items-center gap-2 text-slate-400 font-medium text-sm mb-6">
              <Calendar size={16} className="text-indigo-400" /> {t('finance.reminders', 'Upcoming Reminders')}
            </div>
            
            <div className="space-y-4 relative z-10">
              {upcomingReminders.map(reminder => (
                <div key={reminder.id} className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 flex justify-between items-center">
                  <div className="flex gap-3 items-center">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${reminder.daysLeft <= 5 ? 'bg-danger-500/20 text-danger-400' : 'bg-warning-500/20 text-warning-400'}`}>
                      <AlertCircle size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">{reminder.title}</h4>
                      <p className={`text-xs font-medium mt-0.5 ${reminder.daysLeft <= 5 ? 'text-danger-400' : 'text-slate-400'}`}>
                        Due in {reminder.daysLeft} days
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-white">₹{reminder.amount}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recent Activity */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-slate-800">{t('finance.recentActivity', 'Recent Activity')}</h3>
              <button className="text-[11px] font-bold text-indigo-600 uppercase tracking-wide bg-indigo-50 px-3 py-1 rounded-full">{t('finance.viewAll', 'View All')}</button>
            </div>
            <div className="space-y-5">
              {recentActivity.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors ${tx.type === 'credit' ? 'bg-success-50 text-success-600 group-hover:bg-success-100' : 'bg-danger-50 text-danger-600 group-hover:bg-danger-100'}`}>
                      {tx.type === 'credit' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{tx.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded uppercase">{tx.category}</span>
                        <p className="text-[10px] text-slate-400 font-medium">
                          {new Intl.DateTimeFormat('en-IN', { month: 'short', day: 'numeric' }).format(new Date(tx.date))}
                        </p>
                      </div>
                    </div>
                  </div>
                  <span className={`text-sm font-black ${tx.type === 'credit' ? 'text-success-600' : 'text-slate-800'}`}>
                    {tx.type === 'credit' ? '+' : '-'}₹{tx.amount.toLocaleString()}
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
