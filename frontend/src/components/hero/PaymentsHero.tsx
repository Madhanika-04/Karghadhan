import { motion } from 'framer-motion';
import { ScanLine } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/Button';

export function PaymentsHero() {
  const { t } = useTranslation();
  return (
    <div className="relative w-full rounded-[24px] overflow-hidden shadow-lg bg-gradient-to-br from-indigo-900 via-purple-900 to-fuchsia-900 h-[280px] sm:h-[360px] mb-8 flex flex-row">
      
      {/* Abstract Background Elements */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
        className="absolute top-0 right-1/4 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl"
      />
      
      {/* Content (Left) */}
      <motion.div 
        initial={{ x: -30, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex-1 p-6 sm:p-12 flex flex-col justify-center text-white z-10"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/20 text-cyan-300 font-bold text-xs rounded-full mb-4 w-fit border border-cyan-500/30">
          <ScanLine size={14} /> {t('hero.zeroFees', 'Zero Fees')}
        </div>
        <h2 className="text-2xl sm:text-4xl font-black font-display leading-tight mb-3">
          {t('hero.paymentsTitle', 'Instant Digital Payments')}
        </h2>
        <p className="text-sm sm:text-base text-purple-100 mb-6 font-medium leading-relaxed max-w-sm">
          {t('hero.paymentsSubtitle', 'Send money to suppliers, receive payments from buyers, and pay bills instantly. Fast, secure, and made for weavers.')}
        </p>
        <div>
          <Button 
            variant="primary" 
            className="bg-cyan-500 text-slate-900 hover:bg-cyan-400 border-none shadow-lg shadow-cyan-500/30 px-8 rounded-xl font-bold"
            leftIcon={<ScanLine size={18} />}
          >
            {t('hero.scanAndPay', 'Scan & Pay')}
          </Button>
        </div>
      </motion.div>

      {/* Phone Mockup (Right) */}
      <motion.div 
        initial={{ y: 100, rotate: 10, opacity: 0 }}
        animate={{ y: 0, rotate: -5, opacity: 1 }}
        transition={{ duration: 1, type: "spring", bounce: 0.4 }}
        className="hidden sm:flex flex-1 items-end justify-center pb-0 pr-8"
      >
        <div className="relative w-[220px] h-[340px] bg-slate-900 rounded-t-[32px] border-[6px] border-b-0 border-slate-800 shadow-2xl overflow-hidden mt-12 flex flex-col items-center">
          {/* Phone Notch */}
          <div className="absolute top-0 w-24 h-5 bg-slate-800 rounded-b-xl z-20" />
          
          {/* Artwork inside phone */}
          <img 
            src="/assets/loans/micro_credit.png" 
            alt="Digital Payment"
            className="absolute inset-0 w-full h-full object-cover opacity-90 mix-blend-screen"
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-purple-900/90 to-transparent" />
        </div>
      </motion.div>
    </div>
  );
}
