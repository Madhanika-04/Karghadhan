import { X, CheckCircle2, Shield, Star, FileText, ArrowRight } from 'lucide-react';
import type { InsurancePolicy } from '../../types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { tData } from '../../utils/i18nData';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  policy: InsurancePolicy | null;
  onEnroll: (policy: InsurancePolicy) => void;
}

export function DetailedInsuranceModal({ isOpen, onClose, policy, onEnroll }: Props) {
  const { t } = useTranslation();

  if (!isOpen || !policy) return null;

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
            <div className="bg-white rounded-3xl w-full max-w-3xl max-h-full overflow-hidden shadow-2xl flex flex-col pointer-events-auto">
              {/* Header */}
              <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-violet-700 p-6 sm:p-8 flex-shrink-0">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                <div className="relative z-10 flex justify-between items-start gap-4">
                  <div className="text-white">
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge variant="success" dot className="bg-white/20 text-white border-transparent">
                        {tData(policy.officialStatus)}
                      </Badge>
                      <Badge variant="indigo" className="bg-white/20 text-white border-transparent">
                        {tData(policy.category)}
                      </Badge>
                    </div>
                    <h2 className="text-2xl font-bold font-display leading-tight mb-2">
                      {tData(policy.name)}
                    </h2>
                    <p className="text-indigo-100 font-medium">
                      {tData(policy.provider)}
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors flex-shrink-0"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 sm:p-8 scrollbar-hide space-y-8">
                
                {/* Stats Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">{t('insurance.coverage', 'Coverage')}</p>
                    <p className="text-sm font-bold text-slate-900 leading-tight">{tData(policy.coverage)}</p>
                  </div>
                  <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-100">
                    <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider mb-1">{t('insurance.premium', 'Premium')}</p>
                    <p className="text-sm font-bold text-indigo-700 leading-tight">
                      {policy.annualPremium === 0 ? 'FREE' : `₹${policy.annualPremium.toLocaleString()}/yr`}
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">{t('insurance.policyPeriod', 'Period')}</p>
                    <p className="text-sm font-bold text-slate-900 leading-tight">{tData(policy.policyPeriod)}</p>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">{t('insurance.renewal', 'Renewal')}</p>
                    <p className="text-sm font-bold text-slate-900 leading-tight">{tData(policy.renewal)}</p>
                  </div>
                </div>

                {/* Overview */}
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-3">
                    <FileText size={18} className="text-slate-400" />
                    {t('insurance.overview', 'Overview')}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl">
                    {tData(policy.shortDescription)}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  {/* Eligibility */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                      {t('insurance.eligibility', 'Eligibility Criteria')}
                    </h3>
                    <ul className="space-y-2">
                      {policy.eligibility.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                          <CheckCircle2 size={14} className="text-indigo-500 mt-0.5 flex-shrink-0" />
                          <span className="leading-relaxed">{tData(item)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Benefits */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                      {t('insurance.benefits', 'Key Benefits')}
                    </h3>
                    <ul className="space-y-2">
                      {policy.benefits.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                          <CheckCircle2 size={14} className="text-success-500 mt-0.5 flex-shrink-0" />
                          <span className="leading-relaxed">{tData(item)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  {/* Claim Process */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                      <Shield size={16} className="text-slate-400" />
                      {t('insurance.claimProcess', 'Claim Process')}
                    </h3>
                    <ol className="space-y-3 relative border-l border-slate-100 ml-2">
                      {policy.claimProcess.map((step, i) => (
                        <li key={i} className="pl-5 relative">
                          <span className="absolute -left-[11px] top-0.5 w-5 h-5 rounded-full bg-white border-2 border-slate-200 text-[10px] font-bold text-slate-500 flex items-center justify-center">
                            {i + 1}
                          </span>
                          <span className="text-sm text-slate-600 block leading-relaxed">{tData(step)}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Required Documents */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                      <FileText size={16} className="text-slate-400" />
                      {t('insurance.requiredDocs', 'Required Documents')}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {policy.requiredDocuments.map((doc, i) => (
                        <span key={i} className="bg-slate-50 border border-slate-200 text-slate-700 text-xs px-3 py-1.5 rounded-lg font-medium">
                          {tData(doc)}
                        </span>
                      ))}
                    </div>

                    <div className="mt-6">
                      <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                        <ArrowRight size={16} className="text-slate-400" />
                        {t('insurance.enrollmentChannel', 'Enrollment Channel')}
                      </h3>
                      <p className="text-sm text-slate-600">{tData(policy.enrollmentChannel)}</p>
                    </div>
                  </div>
                </div>

                {/* AI Recommendation Box */}
                <div className="bg-gradient-to-r from-indigo-50 to-indigo-100/50 border border-indigo-100 rounded-2xl p-5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-200/20 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <div className="flex items-start gap-4 relative z-10">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm shadow-indigo-200">
                      <Star size={20} className="text-amber-300" fill="currentColor" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 mb-1">{t('insurance.whyRecommend', 'Why Karghadhan Recommends This')}</h4>
                      <p className="text-sm text-indigo-900/80 leading-relaxed font-medium">
                        "{tData(policy.aiRecommendation)}"
                      </p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Footer Actions */}
              <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-4">
                <Button onClick={onClose} variant="outline" className="flex-1 bg-white">
                  {t('common.cancel', 'Cancel')}
                </Button>
                <Button 
                  onClick={() => { onClose(); onEnroll(policy); }} 
                  variant="secondary" 
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 border-transparent"
                >
                  {t('insurance.enrollNow', 'Enroll Now')}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
