import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, FileText, CheckCircle2, ScanFace, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { staggerContainer, staggerItem } from '../utils/animations';
import { useTranslation } from 'react-i18next';

export default function VerifyPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const steps = [
    { icon: <FileText size={20} />, text: t('verify.step1', 'Upload Aadhaar & Weaver ID') },
    { icon: <ScanFace size={20} />, text: t('verify.step2', 'AI reads & verifies documents') },
    { icon: <CheckCircle2 size={20} />, text: t('verify.step3', 'Digital Weaver Profile created') },
  ];

  return (
    <div className="w-full max-w-md">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-xl shadow-primary-200/50">
          <ShieldCheck size={28} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 font-display tracking-tight">
          {t('verify.title', 'AI Weaver Verification')}
        </h1>
        <p className="text-slate-500 text-sm mt-2">
          {t('verify.subtitle', 'Verify your identity to unlock loans, insurance, and government schemes.')}
        </p>
      </motion.div>

      <Card className="mb-8">
        <CardContent className="p-6">
          <h3 className="font-semibold text-slate-800 mb-4">{t('verify.howItWorks', 'How it works')}</h3>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {steps.map((step, idx) => (
              <motion.div key={idx} variants={staggerItem} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  {step.icon}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700 mt-1">{step.text}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </CardContent>
      </Card>

      <div className="bg-secondary-50 border border-secondary-200 rounded-2xl p-4 mb-8">
        <div className="flex gap-3">
          <div className="w-6 h-6 rounded-full bg-secondary-100 flex items-center justify-center flex-shrink-0">
            <span className="text-secondary-600 text-xs font-bold">!</span>
          </div>
          <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
            {t('verify.keepReadyPt1', 'Please keep your')} <strong className="text-slate-800">{t('verify.aadhaarCard', 'Aadhaar Card')}</strong> {t('verify.and', 'and')}{' '}
            <strong className="text-slate-800">{t('verify.weaverId', 'Weaver ID')}</strong> {t('verify.keepReadyPt2', 'ready for the next step.')}
          </p>
        </div>
      </div>

      <Button
        fullWidth
        size="lg"
        onClick={() => navigate('/upload')}
        rightIcon={<ArrowRight size={18} />}
      >
        {t('verify.startVerification', 'Start Verification')}
      </Button>
    </div>
  );
}
