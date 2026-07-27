import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../context/AppContext';

const verificationSteps = [
  { id: 1, key: 'onboarding.step1', fallback: 'Scanning Aadhaar Document', duration: 1800 },
  { id: 2, key: 'onboarding.step2', fallback: 'Reading OCR Data', duration: 1500 },
  { id: 3, key: 'onboarding.step3', fallback: 'Matching Weaver ID', duration: 1600 },
  { id: 4, key: 'onboarding.step4', fallback: 'Checking Government Records', duration: 2000 },
  { id: 5, key: 'onboarding.step5', fallback: 'Analysing Financial Eligibility', duration: 1700 },
  { id: 6, key: 'onboarding.step6', fallback: 'Creating Digital Weaver Profile', duration: 1400 },
];

import logoKargha from '../assets/logokargha.png';

export default function VerifyingPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { setVerified } = useAppContext();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    let timeout = 0;
    let cumulativeDelay = 0;

    verificationSteps.forEach((step, idx) => {
      cumulativeDelay += idx === 0 ? 500 : verificationSteps[idx - 1].duration;

      timeout = window.setTimeout(() => {
        setCurrentStep(idx);
      }, cumulativeDelay);
    });

    // Complete each step after its duration
    let completionDelay = 500;
    verificationSteps.forEach((step, idx) => {
      completionDelay += step.duration;
      window.setTimeout(() => {
        setCompletedSteps((prev) => [...prev, idx]);
        if (idx === verificationSteps.length - 1) {
          window.setTimeout(() => {
            setVerified(true);
            setIsDone(true);
          }, 600);
        }
      }, completionDelay);
    });

    return () => clearTimeout(timeout);
  }, [setVerified]);

  return (
    <div className="w-full max-w-md">
      {!isDone ? (
        <>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            {/* Animated AI orb */}
            <div className="relative w-28 h-28 mx-auto mb-6">
              {[1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  animate={{
                    scale: [1, 1.4 + i * 0.2],
                    opacity: [0.6, 0],
                  }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    delay: i * 0.3,
                    ease: 'easeOut',
                  }}
                  className="absolute inset-0 rounded-full border-2 border-primary-400/40"
                />
              ))}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                  className="w-24 h-24 flex items-center justify-center"
                >
                  <img src={logoKargha} alt="Logo" className="w-24 h-24 object-contain drop-shadow-xl" />
                </motion.div>
              </div>
            </div>

            <h1 className="text-2xl font-bold text-slate-800 font-display tracking-tight">{t('onboarding.aiVerification', 'AI Verification')}</h1>
            <p className="text-slate-500 text-sm mt-2">{t('onboarding.verifyingIdentity', 'KarghaDhan AI is verifying your identity...')}</p>
          </motion.div>

          {/* Steps */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4 mb-6">
            {verificationSteps.map((step, idx) => {
              const isCompleted = completedSteps.includes(idx);
              const isCurrent = currentStep === idx && !isCompleted;
              const isPending = idx > currentStep;

              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  className="flex items-center gap-4"
                >
                  {/* Status Icon */}
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                    {isCompleted ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                      >
                        <CheckCircle size={24} className="text-success-500" />
                      </motion.div>
                    ) : isCurrent ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-slate-200" />
                    )}
                  </div>

                  {/* Label */}
                  <div className="flex-1">
                    <p
                      className={`text-sm font-semibold ${
                        isCompleted
                          ? 'text-success-700'
                          : isCurrent
                          ? 'text-slate-800'
                          : 'text-slate-400'
                      }`}
                    >
                      {t(step.key, step.fallback)}
                    </p>
                    {isCurrent && (
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: step.duration / 1000, ease: 'linear' }}
                        className="h-1 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full mt-1.5"
                      />
                    )}
                  </div>

                  {/* Status Badge */}
                  <div className="flex-shrink-0">
                    {isCompleted && (
                      <span className="text-xs font-bold text-success-600 bg-success-50 px-2 py-0.5 rounded-full border border-success-100">
                        {t('common.done', 'Done')}
                      </span>
                    )}
                    {isCurrent && (
                      <motion.span
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 1.2, repeat: Infinity }}
                        className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100"
                      >
                        {t('common.processing', 'Processing')}
                      </motion.span>
                    )}
                    {isPending && (
                      <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
                        {t('common.pending', 'Pending')}
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Progress bar */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <div className="flex justify-between text-xs text-slate-500 mb-2">
              <span>{t('onboarding.overallProgress', 'Overall Progress')}</span>
              <span className="font-bold text-primary-600">
                {Math.round((completedSteps.length / verificationSteps.length) * 100)}%
              </span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full"
                initial={{ width: 0 }}
                animate={{
                  width: `${(completedSteps.length / verificationSteps.length) * 100}%`,
                }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </>
      ) : (
        /* Success Screen */
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="text-center"
          >
            {/* Big success animation */}
            <div className="relative w-32 h-32 mx-auto mb-6">
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-success-100 rounded-full"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 10, delay: 0.2 }}
                  className="w-24 h-24 bg-gradient-to-br from-success-400 to-success-600 rounded-full flex items-center justify-center shadow-xl shadow-success-200"
                >
                  <CheckCircle size={48} className="text-white" />
                </motion.div>
              </div>
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-slate-800 font-display mb-2 tracking-tight"
            >
              {t('onboarding.verifiedTitle', 'Identity Verified!')}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-slate-500 mb-8"
            >
              {t('onboarding.verifiedSub', 'Your Aadhaar and Weaver ID have been securely verified.')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
            >
              <Button
                fullWidth
                size="lg"
                onClick={() => navigate('/onboarding-profile')}
                rightIcon={<ArrowRight size={18} />}
              >
                {t('onboarding.setupProfile', 'Setup AI Financial Profile')}
              </Button>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
