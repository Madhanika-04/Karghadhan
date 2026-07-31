import { motion } from 'framer-motion';
import { Star, ShieldCheck, Briefcase, Users, HandCoins, Sparkles } from 'lucide-react';
import type { UserProfile, InsurancePolicy } from '../../types';
import { Card, CardContent } from '../ui/Card';
import { useTranslation } from 'react-i18next';
import { tData } from '../../utils/i18nData';

interface Props {
  user: UserProfile;
  policies: InsurancePolicy[];
  agentInsurance?: any;
  agentLoading?: boolean;
  onEnroll: (policy: InsurancePolicy) => void;
}

export function AIRecommendationEngine({ user, policies, agentInsurance, agentLoading, onEnroll }: Props) {
  const { t } = useTranslation();

  // Get recommended policies
  const recommendedPolicies = policies.filter(p => p.isRecommended);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
          <Star size={20} className="text-indigo-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800 font-display tracking-tight">
            {t('insurance.aiRecommendations', 'AI Recommendations')}
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            {t('insurance.personalizedFor', 'Personalized for')} {user.name}
          </p>
        </div>
      </div>

      <Card className="border-0 shadow-lg shadow-indigo-100/50 bg-gradient-to-br from-indigo-50 to-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
        <CardContent className="p-6 relative z-10">
          {/* User Context */}
          <div className="flex flex-wrap gap-4 mb-6 pb-6 border-b border-indigo-100/50">
            <div className="flex items-center gap-2">
              <Briefcase size={14} className="text-indigo-400" />
              <span className="text-sm font-semibold text-slate-700">{t('profile.' + (user.occupation || 'Handloom Weaver').toLowerCase().replace(' ', ''), user.occupation || 'Handloom Weaver')}</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-success-500" />
              <span className="text-sm font-semibold text-slate-700">{user.ownsLoom ? t('profile.loomOwner', 'Loom Owner') : t('profile.artisan', 'Artisan')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users size={14} className="text-indigo-400" />
              <span className="text-sm font-semibold text-slate-700">{user.familyMembers} {t('profile.dependents', 'Dependents')}</span>
            </div>
            <div className="flex items-center gap-2">
              <HandCoins size={14} className="text-indigo-400" />
              <span className="text-sm font-semibold text-slate-700">{user.hasExistingLoan ? t('profile.activeLoan', 'Active Loan') : t('profile.noLoans', 'No Loans')}</span>
            </div>
          </div>

          {/* AI Advisor Context & Total Deduction */}
          {(agentLoading || agentInsurance) && (
            <div className="mb-8 relative overflow-hidden bg-gradient-to-br from-indigo-900 to-violet-900 rounded-2xl p-6 border border-indigo-500/30 shadow-xl shadow-indigo-900/20">
               {/* Decorative background elements */}
               <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
               <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl" />
               
               {agentLoading ? (
                 <div className="flex items-center gap-3 animate-pulse relative z-10">
                   <div className="w-12 h-12 bg-white/10 rounded-full" />
                   <div className="space-y-2 flex-1">
                     <div className="h-4 bg-white/10 rounded w-1/3" />
                     <div className="h-3 bg-white/10 rounded w-2/3" />
                   </div>
                 </div>
               ) : (
                 <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
                   <div className="flex-1">
                     <div className="flex items-center gap-2 mb-2">
                       <ShieldCheck size={18} className="text-emerald-400" />
                       <h3 className="text-sm font-bold text-white uppercase tracking-widest">{t('insurance.totalMonthlyDeduction', 'Your Custom Protection Plan')}</h3>
                     </div>
                     <p className="text-sm text-indigo-100/90 leading-relaxed font-medium">{agentInsurance?.micro_deduction_guidance}</p>
                   </div>
                   <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-xl border border-white/20 shadow-inner shrink-0 flex flex-col items-end min-w-[160px]">
                     <span className="text-[10px] uppercase font-bold text-indigo-200 tracking-wider mb-1">Total Auto-Deduction</span>
                     <div className="flex items-baseline gap-1">
                       <span className="text-3xl font-black text-white">₹{agentInsurance?.total_recommended_monthly_deduction}</span>
                       <span className="text-sm text-indigo-200 font-semibold">/mo</span>
                     </div>
                   </div>
                 </div>
               )}
            </div>
          )}

          {/* Recommendations List */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">Top Policies For You</h3>
            {recommendedPolicies.map((policy, idx) => (
              <motion.div
                key={policy.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, type: "spring", stiffness: 100 }}
                className="group bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-indigo-100 hover:border-indigo-300 transition-all cursor-pointer relative overflow-hidden"
                onClick={() => onEnroll(policy)}
              >
                <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-indigo-500 to-violet-600 transform origin-left scale-y-0 group-hover:scale-y-100 transition-transform duration-300 ease-out" />
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="flex text-amber-400 drop-shadow-sm">
                        <Star size={14} fill="currentColor" />
                        <Star size={14} fill="currentColor" />
                        <Star size={14} fill="currentColor" />
                        <Star size={14} fill="currentColor" />
                        <Star size={14} fill="currentColor" />
                      </div>
                      <h3 className="font-extrabold text-slate-900 text-lg leading-tight group-hover:text-indigo-700 transition-colors">{tData(policy.name)}</h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                       <span className="text-[10px] font-bold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md uppercase tracking-wider">{tData(policy.type)}</span>
                       <span className="text-[10px] font-bold px-2.5 py-1 bg-success-50 text-success-700 rounded-md border border-success-200 uppercase tracking-wider">{tData(policy.coverage)} Cover</span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed bg-slate-50/80 inline-block px-3.5 py-2.5 rounded-lg border border-slate-200 group-hover:bg-indigo-50/50 group-hover:border-indigo-200 transition-colors">
                      <span className="text-indigo-600 font-bold mr-1 flex-inline items-center gap-1"><Sparkles size={12} className="inline mb-0.5"/> {t('insurance.reason', 'Why this?')}</span>
                      {tData(policy.aiRecommendation)}
                    </p>
                  </div>
                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-4 w-full sm:w-auto mt-2 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-0 border-slate-100">
                    <div className="flex flex-col items-start sm:items-end">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Premium</span>
                      <span className="text-sm font-black bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg border border-indigo-100">
                        {policy.annualPremium === 0 ? t('common.free', 'FREE') : `₹${policy.annualPremium}/${t('common.yr', 'yr')}`}
                      </span>
                    </div>
                    <button className="bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors flex items-center gap-1.5">
                      Review & Enroll
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
