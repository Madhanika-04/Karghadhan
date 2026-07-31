import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, FileText, CheckCircle2, ScanFace, ArrowRight, Sparkles, HelpCircle, Check, X } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { staggerContainer, staggerItem } from '../utils/animations';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../context/AppContext';

export default function VerifyPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setIsNewWeaver } = useAppContext();

  const [hasPehchan, setHasPehchan] = useState<boolean | null>(null);
  const [hasPassbook, setHasPassbook] = useState<boolean | null>(null);

  const isNewWeaverDetected = hasPehchan === false || hasPassbook === false;
  const isExistingWeaverConfirmed = hasPehchan === true && hasPassbook === true;

  const handleContinue = () => {
    if (isNewWeaverDetected) {
      setIsNewWeaver(true);
      navigate('/pehchan-guidance');
    } else if (isExistingWeaverConfirmed) {
      setIsNewWeaver(false);
      navigate('/upload');
    }
  };

  return (
    <div className="w-full max-w-lg space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-primary-700 rounded-3xl mx-auto mb-3 flex items-center justify-center shadow-xl shadow-primary-200/50">
          <ShieldCheck size={30} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 font-display tracking-tight">
          {t('verify.title', 'Weaver Onboarding & Verification')}
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          {t('verify.subtitle', 'Let us customize your financial journey based on your current weaver credentials.')}
        </p>
      </motion.div>

      {/* Step 1 Questions: Pehchan ID & Yarn Passbook */}
      <Card className="border-2 border-slate-100 shadow-sm">
        <CardContent className="p-6 space-y-6">
          {/* Question 1: Pehchan ID */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-800 block">
              {t('verify.q1', '1. Do you already have a Weaver Pehchan ID?')}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setHasPehchan(true)}
                className={`p-3.5 rounded-2xl border font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                  hasPehchan === true
                    ? 'bg-primary-600 text-white border-primary-600 shadow-md shadow-primary-200'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Check size={16} /> {t('common.yes', 'Yes')}
              </button>
              <button
                type="button"
                onClick={() => setHasPehchan(false)}
                className={`p-3.5 rounded-2xl border font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                  hasPehchan === false
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <X size={16} /> {t('common.no', 'No')}
              </button>
            </div>
          </div>

          {/* Question 2: Yarn Passbook */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <label className="text-sm font-bold text-slate-800 block">
              {t('verify.q2', '2. Do you already have a Yarn Passbook?')}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setHasPassbook(true)}
                className={`p-3.5 rounded-2xl border font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                  hasPassbook === true
                    ? 'bg-primary-600 text-white border-primary-600 shadow-md shadow-primary-200'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Check size={16} /> {t('common.yes', 'Yes')}
              </button>
              <button
                type="button"
                onClick={() => setHasPassbook(false)}
                className={`p-3.5 rounded-2xl border font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                  hasPassbook === false
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <X size={16} /> {t('common.no', 'No')}
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* NEW WEAVER WELCOME CARD (if user selects "No" for either) */}
      <AnimatePresence>
        {isNewWeaverDetected && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-gradient-to-br from-indigo-900 via-primary-900 to-slate-900 rounded-3xl p-6 text-white shadow-xl border border-indigo-500/30 space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0">
                <Sparkles size={20} className="animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">{t('verify.welcomeLabel', 'Welcome to Karghadhan!')}</span>
                <h3 className="text-lg font-black text-white leading-tight">{t('verify.newWeaverTitle', 'It looks like you\'re a new weaver')}</h3>
              </div>
            </div>
            <p className="text-xs text-indigo-100 leading-relaxed font-medium">
              {t('verify.newWeaverDesc', 'Let\'s help you become eligible for government benefits, free insurance, and future micro-credit. We will guide you step-by-step to get your official Weaver Pehchan ID and Yarn Passbook.')}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Button */}
      <Button
        fullWidth
        size="lg"
        disabled={hasPehchan === null || hasPassbook === null}
        onClick={handleContinue}
        rightIcon={<ArrowRight size={18} />}
        className="shadow-lg shadow-primary-200"
      >
        {isNewWeaverDetected ? t('verify.continueJourney', 'Continue to Guided Journey') : t('verify.proceedUpload', 'Proceed to Document Upload')}
      </Button>
    </div>
  );
}
