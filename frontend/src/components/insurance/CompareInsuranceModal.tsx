import { X, CheckCircle2 } from 'lucide-react';
import type { InsurancePolicy } from '../../types';
import { Button } from '../ui/Button';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  policy1: InsurancePolicy | null;
  policy2: InsurancePolicy | null;
}

export function CompareInsuranceModal({ isOpen, onClose, policy1, policy2 }: Props) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-none"
          >
            <div className="bg-white rounded-3xl w-full max-w-4xl max-h-full overflow-hidden shadow-2xl flex flex-col pointer-events-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 font-display">
                    {t('insurance.comparePolicies', 'Compare Policies')}
                  </h2>
                  <p className="text-sm text-slate-500">
                    {t('insurance.compareSubtitle', 'Side-by-side comparison of features')}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-200 text-slate-600 hover:bg-slate-300 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                {!policy1 || !policy2 ? (
                  <div className="text-center py-10">
                    <p className="text-slate-500">{t('insurance.selectTwoPolicies', 'Please select two policies to compare.')}</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {/* Headers */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-indigo-50 rounded-2xl p-5 border border-indigo-100">
                        <Badge variant="indigo" className="mb-3">{tData(policy1.category)}</Badge>
                        <h3 className="font-bold text-lg text-slate-900 leading-tight mb-2">{tData(policy1.name)}</h3>
                        <p className="text-sm text-slate-600 font-medium">{tData(policy1.provider)}</p>
                      </div>
                      <div className="bg-orange-50 rounded-2xl p-5 border border-orange-100">
                        <Badge variant="orange" className="mb-3">{tData(policy2.category)}</Badge>
                        <h3 className="font-bold text-lg text-slate-900 leading-tight mb-2">{tData(policy2.name)}</h3>
                        <p className="text-sm text-slate-600 font-medium">{tData(policy2.provider)}</p>
                      </div>
                    </div>

                    {/* Comparison Fields */}
                    <div className="space-y-6">
                      <ComparisonRow title={t('insurance.coverage', 'Coverage')} val1={tData(policy1.coverage)} val2={tData(policy2.coverage)} />
                      <ComparisonRow 
                        title={t('insurance.premium', 'Annual Premium')} 
                        val1={policy1.annualPremium === 0 ? t('common.free', 'FREE') : `₹${policy1.annualPremium.toLocaleString()}`} 
                        val2={policy2.annualPremium === 0 ? t('common.free', 'FREE') : `₹${policy2.annualPremium.toLocaleString()}`} 
                      />
                      <ComparisonRow title={t('insurance.suitableFor', 'Suitable For')} val1={tData(policy1.suitableFor)} val2={tData(policy2.suitableFor)} />
                      <ComparisonRow title={t('insurance.policyPeriod', 'Policy Period')} val1={tData(policy1.policyPeriod)} val2={tData(policy2.policyPeriod)} />
                      <ComparisonList title={t('insurance.benefits', 'Key Benefits')} list1={policy1.benefits} list2={policy2.benefits} />
                      <ComparisonList title={t('insurance.eligibility', 'Eligibility')} list1={policy1.eligibility} list2={policy2.eligibility} />
                      <ComparisonList title={t('insurance.requiredDocs', 'Required Documents')} list1={policy1.requiredDocuments} list2={policy2.requiredDocuments} />
                      <ComparisonList title={t('insurance.claimProcess', 'Claim Process')} list1={policy1.claimProcess} list2={policy2.claimProcess} />
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
                <Button onClick={onClose} variant="secondary" className="px-8 shadow-sm">
                  {t('common.close', 'Close Comparison')}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Helper Components
import { Badge } from '../ui/Badge';
import { tData } from '../../utils/i18nData';

const ComparisonRow = ({ title, val1, val2 }: { title: string, val1: string, val2: string }) => (
  <div>
    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">{title}</h4>
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center justify-center text-center min-h-[60px]">
        <span className="font-semibold text-slate-800 text-sm leading-snug">{val1}</span>
      </div>
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center justify-center text-center min-h-[60px]">
        <span className="font-semibold text-slate-800 text-sm leading-snug">{val2}</span>
      </div>
    </div>
  </div>
);

const ComparisonList = ({ title, list1, list2 }: { title: string, list1: string[], list2: string[] }) => (
  <div>
    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">{title}</h4>
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
        <ul className="space-y-2">
          {list1.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
              <CheckCircle2 size={14} className="text-indigo-400 mt-0.5 flex-shrink-0" />
              <span className="leading-relaxed">{tData(item)}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
        <ul className="space-y-2">
          {list2.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
              <CheckCircle2 size={14} className="text-orange-400 mt-0.5 flex-shrink-0" />
              <span className="leading-relaxed">{tData(item)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </div>
);
