import { useState } from 'react';
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
  Wallet,
  Receipt,
  FileText,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { staggerContainer, staggerItem, fadeIn, slideInLeft } from '../utils/animations';
import { useAppContext } from '../context/AppContext';
import { tData } from '../utils/i18nData';
import { YarnTransactionHistoryModal } from '../components/documents/YarnTransactionHistoryModal';
import { transactionsApi } from '../services/api';
import { useEffect } from 'react';

const monthlyData = [
  { month: 'Jan', income: 15000, expense: 8000 },
  { month: 'Feb', income: 18000, expense: 9500 },
  { month: 'Mar', income: 16500, expense: 11000 },
  { month: 'Apr', income: 21000, expense: 10500 },
  { month: 'May', income: 19000, expense: 13000 },
  { month: 'Jun', income: 24500, expense: 14500 },
];

const upcomingReminders = [
  { id: 1, title: 'PMJJBY Premium', daysLeft: 5, amount: 436, type: 'insurance' },
  { id: 2, title: 'MUDRA Loan EMI', daysLeft: 12, amount: 2100, type: 'loan' },
];

export default function FinancialActivityPage() {
  const { t } = useTranslation();
  const { yarnPassbook, user } = useAppContext();
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const yarnTransactions = yarnPassbook?.transactions || [];

  const [realTransactions, setRealTransactions] = useState<any[]>([]);

  useEffect(() => {
    if (yarnPassbook?.isUploaded && user?.id) {
      transactionsApi.getTransactions(user.id).then((res) => {
        if (res && res.length > 0) {
          const mapped = res.map((tx: any) => ({
            id: `api-${tx.id}`,
            title: tx.description || (tx.transaction_type === 'INCOME' ? 'Saree Sale' : 'Yarn Purchase'),
            date: tx.transacted_at,
            amount: tx.amount,
            type: tx.transaction_type === 'INCOME' ? 'credit' : 'debit',
            category: tx.category || (tx.transaction_type === 'INCOME' ? 'Sales' : 'Purchase')
          }));
          setRealTransactions(mapped);
        }
      }).catch(console.error);
    }
  }, [user?.id, yarnPassbook?.isUploaded]);

  // Combine default activity with extracted Yarn Passbook transactions
  const combinedActivity = [
    ...realTransactions,
    ...yarnTransactions.map(tx => ({
      id: `ypb-${tx.id}`,
      title: `${tx.supplierName} (${tx.yarnPurchased})`,
      date: tx.fullDate,
      amount: tx.amount,
      type: tx.type === 'sales' ? 'credit' : 'debit',
      category: tx.category || (tx.type === 'sales' ? 'Saree Sales' : 'Yarn Purchase'),
    })),
    { id: 'act-1', title: 'Silk Subsidy Credit', date: '2024-06-15', amount: 15000, type: 'credit', category: 'Subsidy' },
    { id: 'act-2', title: 'Loom EMI Payment', date: '2024-06-10', amount: 4500, type: 'debit', category: 'Loan' },
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto pb-20">
      {/* Header */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <motion.h1 variants={fadeIn} className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
          <Activity className="text-indigo-600" size={32} />
          {t('finance.title', 'Financial Activity')}
        </motion.h1>

        <button
          onClick={() => setIsHistoryModalOpen(true)}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-primary-600 text-white font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-2xl shadow-md hover:shadow-indigo-200 transition-all self-start sm:self-auto"
        >
          <Receipt size={16} /> {t('documents.viewYarnPassbookHistory', 'Yarn Passbook Ledger')}
        </button>
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
              <h3 className="text-2xl font-bold text-slate-800">₹{(114000 + (yarnPassbook?.totalMonthlySales || 28500)).toLocaleString('en-IN')}</h3>
            </motion.div>
            
            <motion.div variants={staggerItem} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div className="w-10 h-10 rounded-xl bg-danger-50 text-danger-600 flex items-center justify-center">
                  <TrendingDown size={20} />
                </div>
              </div>
              <p className="text-sm text-slate-500 font-medium mb-1">{t('finance.totalExpenses', 'Total Expenses')}</p>
              <h3 className="text-2xl font-bold text-slate-800">₹{(66500 + (yarnPassbook?.totalMonthlyPurchase || 18000)).toLocaleString('en-IN')}</h3>
            </motion.div>

            <motion.div variants={staggerItem} className="bg-indigo-600 p-5 rounded-3xl border border-indigo-500 shadow-md text-white">
              <div className="flex justify-between items-start mb-2">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Wallet size={20} className="text-white" />
                </div>
              </div>
              <p className="text-sm text-indigo-100 font-medium mb-1">{t('finance.netSavings', 'Net Savings')}</p>
              <h3 className="text-2xl font-bold text-white">₹58,000</h3>
            </motion.div>
          </motion.div>

          {/* AI Passbook Insights Banner */}
          <motion.div
            variants={slideInLeft}
            initial="hidden"
            animate="visible"
            className="bg-gradient-to-r from-indigo-900 via-primary-900 to-slate-900 border border-indigo-500/30 p-6 rounded-3xl text-white shadow-lg relative overflow-hidden"
          >
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="text-amber-300 animate-pulse" size={20} />
              <h4 className="font-black text-sm uppercase tracking-wider text-amber-200">{t('finance.yarnPassbookInsights', 'Yarn Passbook AI Insights')}</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {yarnPassbook?.aiInsights?.map((insight, idx) => (
                <div key={idx} className="flex items-start gap-2 bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10 text-xs font-semibold leading-relaxed">
                  <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span>{tData(insight)}</span>
                </div>
              ))}
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

        {/* Right Column - Reminders & Repayment Tracking */}
        <div className="space-y-6 lg:space-y-8">
          
          {/* Step 9 & 10: Repayment Tracking & Credit Growth Widget */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-indigo-900 via-primary-950 to-slate-950 rounded-3xl p-6 text-white border border-indigo-500/30 shadow-xl relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                  <TrendingUp size={16} />
                </div>
                <div>
                  <h4 className="font-black text-sm text-white leading-tight">Repayment & Growth Tracker</h4>
                  <p className="text-[10px] text-indigo-200">Step 9 & 10 Workflow Tracking</p>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                On Track
              </span>
            </div>

            {/* Repayment Progress Bar */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 mb-4 space-y-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-300">Weaver MUDRA Micro-Loan</span>
                <span className="text-emerald-400">4 / 12 EMIs Paid</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-400 to-indigo-400 h-full rounded-full w-[33%]" />
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1">
                <span>Next Auto-Deduction: ₹2,100</span>
                <span>Due in 12 Days</span>
              </div>
            </div>

            {/* Financial Growth Impact */}
            <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
              <div className="flex items-center gap-2 text-xs text-emerald-200">
                <Sparkles size={14} className="text-amber-300 animate-pulse" />
                <span>Next On-time Payment Impact:</span>
              </div>
              <span className="text-xs font-black text-emerald-300">+25 Credit Points</span>
            </div>
          </motion.div>

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

          {/* Recent Activity including Yarn Passbook */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-slate-800">{t('finance.recentActivity', 'Recent Activity')}</h3>
              <button 
                onClick={() => setIsHistoryModalOpen(true)}
                className="text-[11px] font-bold text-indigo-600 uppercase tracking-wide bg-indigo-50 px-3 py-1 rounded-full hover:bg-indigo-100 transition-colors"
              >
                {t('documents.passbookLedger', 'Passbook Ledger')}
              </button>
            </div>
            <div className="space-y-4">
              {combinedActivity.slice(0, 6).map((tx) => (
                <div key={tx.id} className="flex items-center justify-between group cursor-pointer" onClick={() => setIsHistoryModalOpen(true)}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors ${tx.type === 'credit' ? 'bg-success-50 text-success-600 group-hover:bg-success-100' : 'bg-danger-50 text-danger-600 group-hover:bg-danger-100'}`}>
                      {tx.type === 'credit' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 line-clamp-1">{tData(tx.title)}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded uppercase">{tData(tx.category)}</span>
                        <p className="text-[10px] text-slate-400 font-medium">
                          {tx.date}
                        </p>
                      </div>
                    </div>
                  </div>
                  <span className={`text-sm font-black ${tx.type === 'credit' ? 'text-success-600' : 'text-slate-800'}`}>
                    {tx.type === 'credit' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Transaction History Modal */}
      <YarnTransactionHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
      />
    </div>
  );
}

