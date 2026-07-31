import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Receipt, Sparkles, TrendingUp, TrendingDown, CheckCircle2, Filter, ShoppingBag, ArrowUpRight, ArrowDownLeft, ShieldCheck, Wallet, DollarSign } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useAppContext } from '../../context/AppContext';
import { useTranslation } from 'react-i18next';
import { tData } from '../../utils/i18nData';
import type { YarnTransaction } from '../../types';

interface YarnTransactionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function YarnTransactionHistoryModal({ isOpen, onClose }: YarnTransactionHistoryModalProps) {
  const { t } = useTranslation();
  const { yarnPassbook } = useAppContext();
  const [filter, setFilter] = useState<'all' | 'purchase' | 'sales'>('all');
  const [selectedTx, setSelectedTx] = useState<YarnTransaction | null>(null);

  const transactions = yarnPassbook?.transactions || [];

  const filteredTx = transactions.filter((tx) => {
    if (filter === 'all') return true;
    return tx.type === filter;
  });

  const totalPurchases = yarnPassbook?.totalMonthlyPurchase || 18000;
  const totalSales = yarnPassbook?.totalMonthlySales || 28500;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('documents.txHistoryTitle', 'Transaction History')} size="lg">
      <div className="space-y-6 pb-2">

        {/* Monthly Summary Header */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-indigo-50 to-primary-50 border border-indigo-100 p-4 rounded-2xl">
            <div className="flex items-center gap-2 mb-1 text-xs font-bold text-indigo-700 uppercase tracking-wider">
              <ShoppingBag size={14} /> {t('documents.totalMonthlyPurchase', 'Total Monthly Purchase')}
            </div>
            <p className="text-2xl font-black text-indigo-900">₹{totalPurchases.toLocaleString('en-IN')}</p>
            <p className="text-xs text-slate-500 font-medium mt-1">{t('documents.avgYarnTurnover', 'Avg. ₹18,000 / month')}</p>
          </div>

          <div className="bg-gradient-to-br from-success-50 to-emerald-50 border border-success-100 p-4 rounded-2xl">
            <div className="flex items-center gap-2 mb-1 text-xs font-bold text-success-700 uppercase tracking-wider">
              <TrendingUp size={14} /> {t('documents.totalMonthlySales', 'Total Monthly Sales')}
            </div>
            <p className="text-2xl font-black text-success-900">₹{totalSales.toLocaleString('en-IN')}</p>
            <p className="text-xs text-success-600 font-bold mt-1">+12% {t('documents.vsLastMonth', 'vs last month')}</p>
          </div>
        </div>

        {/* AI Insights Card */}
        <div className="bg-gradient-to-r from-primary-900 via-indigo-900 to-slate-900 rounded-3xl p-5 text-white shadow-md relative overflow-hidden border border-primary-500/30">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={18} className="text-primary-300 animate-pulse" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-primary-200">{t('documents.aiExtractedInsights', 'AI Generated Insights')}</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {yarnPassbook?.aiInsights?.map((insight, idx) => (
              <div key={idx} className="flex items-start gap-2 bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10 text-xs font-medium leading-relaxed">
                <CheckCircle2 size={14} className="text-success-400 shrink-0 mt-0.5" />
                <span>{tData(insight)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-400" />
            <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl">
              {[
                { key: 'all', label: t('documents.filterAll', 'All Records') },
                { key: 'purchase', label: t('documents.filterPurchases', 'Yarn Purchases') },
                { key: 'sales', label: t('documents.filterSales', 'Sales Deposits') },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    filter === tab.key
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          <span className="text-xs font-semibold text-slate-400">{filteredTx.length} {t('documents.records', 'records')}</span>
        </div>

        {/* Transaction History List - Premium format matching user example */}
        <div className="border border-slate-200 rounded-3xl overflow-hidden bg-white shadow-sm divide-y divide-slate-100">
          <div className="bg-slate-50 px-5 py-3 flex justify-between text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
            <span>{t('documents.txDetails', 'Transaction Details')}</span>
            <span>{t('documents.amount', 'Amount')}</span>
          </div>

          <AnimatePresence mode="popLayout">
            {filteredTx.map((tx) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedTx(tx)}
                className="p-4 sm:p-5 hover:bg-slate-50/80 transition-colors cursor-pointer flex items-start justify-between gap-4 group"
              >
                <div className="flex gap-3.5 items-start">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${
                    tx.type === 'sales'
                      ? 'bg-success-50 border-success-200 text-success-600'
                      : 'bg-indigo-50 border-indigo-200 text-indigo-600'
                  }`}>
                    {tx.type === 'sales' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{tx.date}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        tx.paymentStatus === 'Received' || tx.paymentStatus === 'Completed' || tx.paymentStatus === 'Paid'
                          ? 'bg-success-100 text-success-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {tData(tx.paymentStatus)}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-base group-hover:text-primary-600 transition-colors">
                      {tData(tx.supplierName)}
                    </h4>

                    <p className="text-xs font-semibold text-slate-500 mt-0.5">
                      {tData(tx.yarnPurchased)} • <span className="text-slate-400">{tData(tx.quantity)}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className={`text-lg font-black ${
                    tx.type === 'sales' ? 'text-success-600' : 'text-slate-900'
                  }`}>
                    {tx.type === 'sales' ? '+' : ''}₹{tx.amount.toLocaleString('en-IN')}
                  </p>
                  <span className="text-[11px] font-medium text-slate-400 block mt-0.5">
                    {tData(tx.category)}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredTx.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-sm">
              {t('documents.noTxRecords', 'No transaction records found for selected filter.')}
            </div>
          )}
        </div>

        {/* Selected Transaction Drill-down Modal */}
        {selectedTx && (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-xs text-slate-600">
            <div className="flex justify-between font-bold text-slate-800 text-sm pb-1 border-b border-slate-200">
              <span>{tData(selectedTx.yarnPurchased)}</span>
              <span>₹{selectedTx.amount.toLocaleString('en-IN')}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div><span className="font-semibold text-slate-400">{t('documents.supplier', 'Supplier')}:</span> {tData(selectedTx.supplierName)}</div>
              <div><span className="font-semibold text-slate-400">{t('documents.date', 'Date')}:</span> {selectedTx.fullDate}</div>
              <div><span className="font-semibold text-slate-400">{t('documents.quantity', 'Quantity')}:</span> {tData(selectedTx.quantity)}</div>
              <div><span className="font-semibold text-slate-400">{t('documents.status', 'Status')}:</span> {tData(selectedTx.paymentStatus)}</div>
            </div>
          </div>
        )}

        <Button fullWidth variant="outline" onClick={onClose} className="border-slate-200 text-slate-700">
          {t('common.close', 'Close')}
        </Button>
      </div>
    </Modal>
  );
}
