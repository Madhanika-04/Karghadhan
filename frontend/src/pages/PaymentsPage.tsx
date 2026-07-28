import { motion } from 'framer-motion';
import user1 from '@/assets/profile/user1.jpg';
import user2 from '@/assets/profile/user2.jpg';
import user3 from '@/assets/profile/user3.jpg';
import user4 from '@/assets/profile/user4.jpg';
import {
  QrCode,
  Send,
  ArrowRightLeft,
  History,
  Landmark,
  Smartphone,
  Wifi,
  Lightbulb,
  MoreHorizontal,
  ChevronRight,
  Search,
  CheckCircle2,
  BellRing
} from 'lucide-react';
import { PaymentsHero } from '../components/hero/PaymentsHero';
import { staggerContainer, staggerItem, fadeIn, hoverScale } from '../utils/animations';

const recentContacts = [
  { id: 1, name: 'Lakshmi Traders', image: user1 },
  { id: 2, name: 'Srinivas Silk', image: user2 },
  { id: 3, name: 'Murugan Dyes', image: user3 },
  { id: 4, name: 'Asha (Worker)', image: user4 },
];

const transactions = [
  { id: 'tx1', to: 'Lakshmi Traders', date: 'Today, 10:42 AM', amount: -4500, status: 'success' },
  { id: 'tx2', to: 'Kanchipuram Coop', date: 'Yesterday, 2:15 PM', amount: 12500, status: 'success', isCredit: true },
  { id: 'tx3', to: 'Asha (Worker)', date: 'Yesterday, 9:00 AM', amount: -1500, status: 'success' },
];

import { tData } from '../utils/i18nData';

import { useTranslation } from 'react-i18next';

export default function PaymentsPage() {
  const { t } = useTranslation();
  return (
    <div className="space-y-6 max-w-lg mx-auto pb-24 sm:max-w-4xl">
      <PaymentsHero />

      {/* Header & Balance Card */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="relative bg-gradient-to-br from-indigo-900 to-slate-900 rounded-[2rem] p-6 sm:p-8 text-white shadow-2xl overflow-hidden"
      >
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl" />
        
        <div className="relative z-10 flex justify-between items-start mb-8">
          <motion.div variants={fadeIn}>
            <div className="flex items-center gap-2 text-indigo-200 text-sm font-medium mb-1">
              <Landmark size={16} /> {t('payments.title', 'Karghadhan Payments')}
            </div>
            <p className="text-xs text-indigo-300 font-mono">UPI ID: {tData('ramesh.weaver@kargha')}</p>
          </motion.div>
          
          <motion.div variants={fadeIn} className="flex gap-3">
            <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition">
              <QrCode size={18} />
            </button>
            <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition relative">
              <BellRing size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
            </button>
          </motion.div>
        </div>

        <motion.div variants={staggerItem} className="relative z-10">
          <p className="text-indigo-200 text-sm mb-1 font-medium">{t('payments.availableBalance', 'Available Balance')}</p>
          <div className="flex items-end gap-3">
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight">₹42,500</h2>
            <button className="mb-2 text-xs font-bold bg-white/10 px-3 py-1.5 rounded-full hover:bg-white/20 transition">
              {t('payments.checkBalance', 'Check Balance')}
            </button>
          </div>
        </motion.div>
      </motion.div>

      {/* Main Actions Grid */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="bg-white rounded-[2rem] p-6 shadow-xl shadow-slate-200/40 border border-slate-50 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
        <h3 className="text-sm font-black text-slate-800 mb-6 px-2 tracking-wide uppercase">{t('payments.transferMoney', 'Transfer Money')}</h3>
        <div className="grid grid-cols-4 gap-y-6 gap-x-3">
          {[
            { icon: QrCode, label: t('payments.scanQr', 'Scan QR'), color: 'bg-indigo-50 text-indigo-700 shadow-indigo-100' },
            { icon: Send, label: t('payments.toMobile', 'To Mobile'), color: 'bg-purple-50 text-purple-700 shadow-purple-100' },
            { icon: Landmark, label: t('payments.toBank', 'To Bank'), color: 'bg-blue-50 text-blue-700 shadow-blue-100' },
            { icon: ArrowRightLeft, label: t('payments.toSelf', 'To Self'), color: 'bg-emerald-50 text-emerald-700 shadow-emerald-100' },
          ].map((action, idx) => (
            <motion.button key={idx} variants={staggerItem} {...hoverScale} className="flex flex-col items-center gap-3 group">
              <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-sm group-hover:shadow-lg group-hover:-translate-y-1 ${action.color}`}>
                <action.icon size={26} strokeWidth={2.5} />
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-slate-700 text-center leading-tight">{action.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Bills & Recharges */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="bg-white rounded-[2rem] p-6 shadow-xl shadow-slate-200/40 border border-slate-50 relative overflow-hidden"
      >
        <div className="flex justify-between items-center mb-6 px-2">
          <h3 className="text-sm font-black text-slate-800 tracking-wide uppercase">{t('payments.rechargeBills', 'Recharge & Pay Bills')}</h3>
          <button className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl hover:bg-indigo-100 transition-colors">{t('payments.viewAll', 'View All')}</button>
        </div>
        <div className="grid grid-cols-4 gap-y-6 gap-x-3">
          {[
            { icon: Smartphone, label: t('payments.mobileRecharge', 'Mobile Recharge'), color: 'bg-slate-50 text-slate-700 hover:text-indigo-600 hover:bg-indigo-50' },
            { icon: Lightbulb, label: t('payments.electricity', 'Electricity'), color: 'bg-slate-50 text-slate-700 hover:text-amber-600 hover:bg-amber-50' },
            { icon: Wifi, label: t('payments.broadband', 'Broadband'), color: 'bg-slate-50 text-slate-700 hover:text-blue-600 hover:bg-blue-50' },
            { icon: MoreHorizontal, label: t('payments.more', 'More'), color: 'bg-slate-50 text-slate-700 hover:text-slate-900 hover:bg-slate-200' },
          ].map((action, idx) => (
            <motion.button key={idx} variants={staggerItem} {...hoverScale} className="flex flex-col items-center gap-3 group">
              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm border border-slate-100 group-hover:shadow-md ${action.color}`}>
                <action.icon size={22} strokeWidth={2.5} />
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-slate-600 text-center leading-tight">{action.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Recent Payments */}
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="bg-white rounded-[2rem] p-6 shadow-xl shadow-slate-200/40 border border-slate-50 relative overflow-hidden"
      >
        <div className="flex justify-between items-center mb-6 px-2">
          <h3 className="text-sm font-black text-slate-800 tracking-wide uppercase">{t('payments.sendMoneyAgain', 'Send Money Again')}</h3>
          <div className="p-1.5 bg-slate-50 rounded-full cursor-pointer hover:bg-slate-100 transition-colors">
            <Search size={16} className="text-slate-500" />
          </div>
        </div>
        
        <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide px-2">
          {recentContacts.map((contact) => (
            <motion.button key={contact.id} {...hoverScale} className="flex flex-col items-center gap-2 flex-shrink-0 w-16 group">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-transparent group-hover:border-indigo-500 transition-all shadow-md group-hover:shadow-indigo-200 p-0.5">
                <div className="w-full h-full rounded-full overflow-hidden">
                  <img src={contact.image} alt={contact.name} className="w-full h-full object-cover" />
                </div>
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-slate-700 text-center truncate w-full leading-tight">{tData(contact.name)}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Transaction History */}
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="bg-white rounded-[2rem] p-6 shadow-xl shadow-slate-200/40 border border-slate-50 relative overflow-hidden"
      >
        <div className="flex justify-between items-center mb-6 px-2">
          <h3 className="text-sm font-black text-slate-800 tracking-wide uppercase">{t('payments.recentTransactions', 'Recent Transactions')}</h3>
          <button className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl hover:bg-indigo-100 transition-colors">
            {t('payments.history', 'History')} <ChevronRight size={14} />
          </button>
        </div>

        <div className="space-y-1 px-2">
          {transactions.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between group cursor-pointer hover:bg-slate-50 p-3 -mx-3 rounded-2xl transition-all border border-transparent hover:border-slate-100">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shadow-sm border ${tx.isCredit ? 'bg-success-50 text-success-600 border-success-100' : 'bg-slate-50 text-slate-600 border-slate-100'}`}>
                  {tx.to.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 tracking-tight">{tData(tx.to)}</h4>
                  <p className="text-[11px] font-bold text-slate-500 mt-0.5">{tData(tx.date)}</p>
                </div>
              </div>
              <div className="text-right flex flex-col items-end">
                <span className={`text-[15px] tracking-tight font-black ${tx.isCredit ? 'text-success-600' : 'text-slate-900'}`}>
                  {tx.isCredit ? '+' : ''}{tx.amount > 0 ? `₹${tx.amount.toLocaleString()}` : `-₹${Math.abs(tx.amount).toLocaleString()}`}
                </span>
                <div className="flex items-center gap-1 mt-1">
                  <CheckCircle2 size={12} className="text-success-500" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{t('payments.paid', 'Paid')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
