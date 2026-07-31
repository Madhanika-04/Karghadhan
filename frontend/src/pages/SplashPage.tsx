import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import logoKargha from '@/assets/logos/logoKargha.png';

export default function SplashPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/language');
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-primary-900 overflow-hidden text-white">
      {/* Background fabric pattern mockup (just subtle lines for now) */}
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="z-10 flex flex-col items-center"
      >
        <div className="flex items-center justify-center mb-6">
          <img src={logoKargha} alt="Karghadhan Logo" className="w-32 h-32 object-contain drop-shadow-2xl" />
        </div>
        <h1 className="text-4xl font-bold mb-2 tracking-tight">{t('landing.appName', 'KARGADHAN')}</h1>
        <p className="text-primary-200 font-medium tracking-wide text-center">
          {t('landing.heroSubtitle', 'Your AI Financial Partner for Every Weaver')}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-12 z-10"
      >
        <div className="flex gap-2">
          <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1, delay: 0 }}
            className="w-3 h-3 bg-secondary-400 rounded-full"
          />
          <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
            className="w-3 h-3 bg-secondary-400 rounded-full"
          />
          <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
            className="w-3 h-3 bg-secondary-400 rounded-full"
          />
        </div>
      </motion.div>
    </div>
  );
}
