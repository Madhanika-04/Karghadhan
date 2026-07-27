import { motion } from 'framer-motion';
import { Star, ShieldCheck, Briefcase, Users, HandCoins } from 'lucide-react';
import type { UserProfile, InsurancePolicy } from '../../types';
import { Card, CardContent } from '../ui/Card';
import { useTranslation } from 'react-i18next';
import { tData } from '../../utils/i18nData';

interface Props {
  user: UserProfile;
  policies: InsurancePolicy[];
  onEnroll: (policy: InsurancePolicy) => void;
}

export function AIRecommendationEngine({ user, policies, onEnroll }: Props) {
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
              <span className="text-sm font-semibold text-slate-700">{t('profile.' + user.occupation.toLowerCase().replace(' ', ''), user.occupation)}</span>
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

          {/* Recommendations List */}
          <div className="space-y-4">
            {recommendedPolicies.map((policy, idx) => (
              <motion.div
                key={policy.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-2xl p-4 border border-indigo-50 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all cursor-pointer"
                onClick={() => onEnroll(policy)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex text-amber-400">
                        <Star size={12} fill="currentColor" />
                        <Star size={12} fill="currentColor" />
                        <Star size={12} fill="currentColor" />
                        <Star size={12} fill="currentColor" />
                        <Star size={12} fill="currentColor" />
                      </div>
                      <h3 className="font-bold text-slate-800 leading-tight">{tData(policy.name)}</h3>
                    </div>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed bg-indigo-50/50 inline-block px-2 py-1 rounded-md mt-1 border border-indigo-100/50">
                      <span className="text-indigo-600 font-bold mr-1">{t('insurance.reason', 'Reason:')}</span>
                      {tData(policy.aiRecommendation)}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-lg">
                      {policy.annualPremium === 0 ? t('common.free', 'FREE') : `₹${policy.annualPremium}/${t('common.yr', 'yr')}`}
                    </span>
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
