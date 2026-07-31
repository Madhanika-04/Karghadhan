import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, CheckCircle2, Loader2, FileText, Cpu, Receipt, ArrowRight, ShieldCheck } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useTranslation } from 'react-i18next';

interface YarnPassbookProcessingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function YarnPassbookProcessingModal({
  isOpen,
  onClose,
  onComplete,
}: YarnPassbookProcessingModalProps) {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const processingSteps = [
    { label: t('documents.procStep1', 'Processing document...'), icon: FileText, detail: t('documents.procStep1Sub', 'Scanning Yarn Passbook layout & e-Dhaga QR') },
    { label: t('documents.procStep2', 'Reading transaction history...'), icon: Cpu, detail: t('documents.procStep2Sub', 'Running OCR passbook transaction parser') },
    { label: t('documents.procStep3', 'Extracting purchase records...'), icon: Receipt, detail: t('documents.procStep3Sub', 'Extracting supplier names, yarn types & quantities') },
    { label: t('documents.procStep4', 'Extracting sales records...'), icon: Receipt, detail: t('documents.procStep4Sub', 'Extracting saree sales vouchers & co-op deposits') },
    { label: t('documents.procStep5', 'Building financial profile...'), icon: Sparkles, detail: t('documents.procStep5Sub', 'Generating working capital eligibility & AI insights') },
  ];

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      setIsFinished(false);
      return;
    }

    setCurrentStep(0);
    setIsFinished(false);

    // Step animation timer (approx 800ms per step)
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < processingSteps.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setIsFinished(true);
          return prev;
        }
      });
    }, 850);

    return () => clearInterval(interval);
  }, [isOpen]);

  const progressPct = Math.round(((currentStep + (isFinished ? 1 : 0.5)) / processingSteps.length) * 100);

  const handleFinish = () => {
    onComplete();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={isFinished ? onClose : () => {}} title={t('documents.aiDocProcessingTitle', 'AI Passbook Processing')} size="md">
      <div className="space-y-6 py-2">
        {/* Header Hero Banner */}
        <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-primary-900 rounded-3xl p-6 text-white relative overflow-hidden shadow-lg shadow-indigo-200">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl translate-x-10 -translate-y-10" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-indigo-200 shadow-sm shrink-0">
              {isFinished ? (
                <ShieldCheck size={32} className="text-success-400" />
              ) : (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
                  <Sparkles size={30} className="text-indigo-300" />
                </motion.div>
              )}
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider font-bold text-indigo-300">{t('documents.karghaAiEngine', 'Karghadhan AI Engine')}</p>
              <h3 className="text-xl font-black text-white">
                {isFinished ? t('documents.passbookExtractedSuccess', 'Passbook Extracted Successfully!') : t('documents.extractingPassbookData', 'Extracting Passbook Data')}
              </h3>
              <p className="text-xs text-indigo-200/90 mt-1">
                {isFinished ? t('documents.dataSyncedNotice', 'Yarn purchases, sales & insights updated across Karghadhan.') : `${progressPct}% ${t('common.completed', 'Completed')}`}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-5 w-full bg-white/10 rounded-full h-2.5 overflow-hidden backdrop-blur-md border border-white/10">
            <motion.div
              className="h-full bg-gradient-to-r from-success-400 via-primary-400 to-indigo-300 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>

        {/* Multi-step checklist */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-5 space-y-3">
          {processingSteps.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = idx < currentStep || isFinished;
            const isCurrent = idx === currentStep && !isFinished;

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`flex items-start gap-3.5 p-3 rounded-2xl border transition-all duration-300 ${
                  isCurrent
                    ? 'bg-white border-primary-300 shadow-md shadow-primary-100/50 scale-[1.02]'
                    : isCompleted
                    ? 'bg-success-50/60 border-success-200/60'
                    : 'bg-slate-100/50 border-slate-200/50 opacity-60'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isCompleted ? (
                    <div className="w-6 h-6 rounded-full bg-success-500 text-white flex items-center justify-center shadow-sm">
                      <CheckCircle2 size={16} />
                    </div>
                  ) : isCurrent ? (
                    <div className="w-6 h-6 rounded-full bg-primary-600 text-white flex items-center justify-center">
                      <Loader2 size={14} className="animate-spin" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center text-xs font-bold">
                      {idx + 1}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold leading-tight ${isCurrent ? 'text-primary-700' : isCompleted ? 'text-slate-800' : 'text-slate-500'}`}>
                    {step.label}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">{step.detail}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Action button */}
        {isFinished ? (
          <Button
            fullWidth
            size="lg"
            variant="primary"
            onClick={handleFinish}
            rightIcon={<ArrowRight size={18} />}
            className="shadow-lg shadow-primary-300"
          >
            {t('documents.viewExtractedHistory', 'View Extracted Transaction History')}
          </Button>
        ) : (
          <p className="text-center text-xs text-slate-400 font-medium animate-pulse">
            {t('documents.doNotCloseWindow', 'Please hold tight while AI reads your Yarn Passbook...')}
          </p>
        )}
      </div>
    </Modal>
  );
}
