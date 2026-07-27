import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, HandCoins, Activity, Landmark } from 'lucide-react';
import logoKargha from '../assets/logokargha.png';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { useTranslation } from 'react-i18next';
import { staggerContainer, staggerItem } from '../utils/animations';
import { mockUser } from '../data/mockUser';
import { tData } from '../utils/i18nData';

export default function OnboardingProfilePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="w-full max-w-lg">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <img src={logoKargha} alt="Karghadhan Logo" className="w-16 h-16 object-contain drop-shadow-md mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-slate-800 font-display tracking-tight">{t('onboarding.profileTitle', 'AI Financial Profile')}</h1>
        <p className="text-slate-500 text-sm mt-2">
          {t('onboarding.profileSub', 'Your profile is ready! Here is your AI-generated financial summary.')}
        </p>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-4 mb-8"
      >
        <motion.div variants={staggerItem}>
          <Card className="overflow-hidden border-0 shadow-lg shadow-slate-200/50">
            <div className="h-2 bg-gradient-to-r from-primary-500 to-secondary-500" />
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">{mockUser.name}</h2>
                  <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                    <ShieldCheck size={14} className="text-success-500" />
                    {t('common.verified', 'Verified')} {tData(mockUser.occupation)}
                  </p>
                </div>
                <div className="text-right">
                  <div className="inline-flex items-baseline gap-1 bg-primary-50 px-3 py-1 rounded-xl">
                    <span className="text-2xl font-bold text-primary-700">{mockUser.trustScore}</span>
                    <span className="text-xs font-semibold text-primary-600">/ 1000</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 font-medium">{t('onboarding.trustScore', 'AI Trust Score')}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <HandCoins size={16} className="text-blue-600" />
                    </div>
                    <p className="text-xs font-semibold text-slate-600">{t('onboarding.monthlyIncome', 'Avg Monthly Income')}</p>
                  </div>
                  <p className="text-lg font-bold text-slate-800">
                    ₹{(mockUser.monthlyIncome || 0).toLocaleString()}
                  </p>
                </div>
                
                <div className="bg-slate-50 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                      <Activity size={16} className="text-emerald-600" />
                    </div>
                    <p className="text-xs font-semibold text-slate-600">{t('onboarding.experience', 'Experience')}</p>
                  </div>
                  <p className="text-lg font-bold text-slate-800">
                    {mockUser.yearsOfExperience} {t('common.years', 'Years')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card>
            <CardContent className="p-6">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Landmark size={18} className="text-secondary-500" />
                {t('onboarding.unlockedOpp', 'Unlocked Opportunities')}
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-success-50 rounded-xl border border-success-100">
                  <span className="text-sm font-semibold text-success-800">{t('onboarding.preApproved', 'Pre-approved Micro Loans')}</span>
                  <span className="text-xs font-bold bg-success-100 text-success-700 px-2 py-1 rounded-lg">{t('onboarding.upTo50k', 'Up to ₹50,000')}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-primary-50 rounded-xl border border-primary-100">
                  <span className="text-sm font-semibold text-primary-800">{t('onboarding.govEligible', 'Gov. Scheme Eligibility')}</span>
                  <span className="text-xs font-bold bg-primary-100 text-primary-700 px-2 py-1 rounded-lg">3 {t('onboarding.schemesCount', 'Schemes')}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-xl border border-secondary-100">
                  <span className="text-sm font-semibold text-secondary-800">{t('onboarding.loomInsurance', 'Loom Insurance')}</span>
                  <span className="text-xs font-bold bg-secondary-100 text-secondary-700 px-2 py-1 rounded-lg">{t('common.available', 'Available')}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <Button
        fullWidth
        size="lg"
        onClick={() => navigate('/dashboard')}
        rightIcon={<ArrowRight size={18} />}
      >
        {t('common.dashboard', 'Go to Dashboard')}
      </Button>
    </div>
  );
}
