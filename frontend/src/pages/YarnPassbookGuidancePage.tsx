import { motion } from 'framer-motion';
import { Receipt, Sparkles, TrendingUp, HandCoins, ShieldCheck, ArrowRight, Upload, BookOpen, CheckCircle2, HelpCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export default function YarnPassbookGuidancePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const benefits = [
    { title: t('yarnGuidance.b1Title', 'Credit Score Generation'), desc: t('yarnGuidance.b1Desc', 'AI analyzes monthly yarn turnover to compute a fintech score without traditional CIBIL requirements.'), icon: TrendingUp, color: 'text-indigo-600' },
    { title: t('yarnGuidance.b2Title', 'Micro-Credit & Loan Access'), desc: t('yarnGuidance.b2Desc', 'Qualify for Weaver Mudra working capital loans up to ₹2 Lakhs based on raw material purchases.'), icon: HandCoins, color: 'text-emerald-600' },
    { title: t('yarnGuidance.b3Title', 'Insurance Recommendations'), desc: t('yarnGuidance.b3Desc', 'Automated loom insurance & health subvention matching based on turnover volume.'), icon: ShieldCheck, color: 'text-blue-600' },
    { title: t('yarnGuidance.b4Title', 'AI Financial Analysis'), desc: t('yarnGuidance.b4Desc', 'Real-time expense ratio analysis to increase monthly thrift savings by ~₹2,000.'), icon: Sparkles, color: 'text-amber-600' },
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
        <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-secondary-600 rounded-2xl flex items-center justify-center text-white shadow-md shadow-indigo-200 shrink-0">
          <Receipt size={30} />
        </div>
        <div>
          <Badge variant="indigo" dot>{t('yarnGuidance.finProfileEngine', 'Financial Profile Engine')}</Badge>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            {t('yarnGuidance.title', 'Yarn Passbook Guidance')}
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            {t('yarnGuidance.subtitle', 'Learn how maintaining your yarn purchase ledger builds your digital credit profile')}
          </p>
        </div>
      </motion.div>

      {/* Hero Card */}
      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-indigo-500/30">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div>
            <span className="text-xs uppercase tracking-wider font-bold text-amber-300">{t('yarnGuidance.whyTxMatters', 'Why Transaction History Matters')}</span>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">{t('yarnGuidance.creditProof', 'Your Yarn Passbook is Your Credit Proof')}</h2>
            <p className="text-xs sm:text-sm text-indigo-200 mt-2 max-w-xl leading-relaxed">
              {t('yarnGuidance.creditProofDesc', 'Every cotton, silk, and dye purchase recorded in your passbook acts as verifiable business turnover. Karghadhan uses this data to unlock micro-credit without requiring salaried bank statements.')}
            </p>
          </div>
          <Button
            variant="primary"
            leftIcon={<Upload size={16} />}
            onClick={() => navigate('/documents')}
            className="shrink-0 shadow-lg shadow-primary-500/30"
          >
            {t('yarnGuidance.uploadNow', 'Upload Passbook Now')}
          </Button>
        </div>
      </motion.div>

      {/* Why & How Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-2 border-slate-100">
          <CardContent className="p-6 space-y-3">
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-base">
              <HelpCircle size={20} /> {t('yarnGuidance.howMaintained', 'How is Yarn Passbook Maintained?')}
            </div>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              {t('yarnGuidance.maintainedDesc', 'Issued by National Handloom Development Corporation (NHDC) or local weavers cooperative society. Suppliers stamp raw material purchases and saree sales deposits inside.')}
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-slate-100">
          <CardContent className="p-6 space-y-3">
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-base">
              <CheckCircle2 size={20} /> {t('yarnGuidance.buildProfile', 'Building Your Financial Profile')}
            </div>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              {t('yarnGuidance.buildProfileDesc', 'Uploading your passbook allows Karghadhan AI to calculate monthly business volume, net profit margin, and loan eligibility instantly.')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Benefits Grid */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Sparkles size={20} className="text-amber-500" /> {t('yarnGuidance.keyBenefitsTitle', 'Key Benefits of Maintaining a Yarn Passbook')}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {benefits.map((b, i) => {
            const Icon = b.icon;
            return (
              <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
                <div className="flex items-center gap-2">
                  <Icon size={18} className={b.color} />
                  <p className="text-sm font-bold text-slate-900">{b.title}</p>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">{b.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          fullWidth
          size="lg"
          variant="primary"
          leftIcon={<Upload size={18} />}
          onClick={() => navigate('/documents')}
        >
          {t('yarnGuidance.uploadBtn', 'Upload Passbook')}
        </Button>
        <Button
          fullWidth
          size="lg"
          variant="secondary"
          rightIcon={<ArrowRight size={18} />}
          onClick={() => navigate('/dashboard')}
        >
          {t('common.backToDashboard', 'Back to Dashboard')}
        </Button>
      </div>
    </div>
  );
}
