import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/Button';

export function LoansHero() {
  const { t } = useTranslation();
  return (
    <div className="relative w-full rounded-[24px] overflow-hidden shadow-lg bg-slate-900 group h-[260px] sm:h-[340px] mb-8">
      {/* Background Image on Right */}
      <motion.img 
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        src="/assets/loans/business_expansion.png" 
        alt="Business Expansion"
        className="absolute right-0 inset-y-0 h-full w-full sm:w-[65%] object-cover sm:object-contain object-right opacity-90 mix-blend-luminosity sm:mix-blend-normal"
      />
      
      {/* Royal Blue / Gold Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-950 via-blue-900/90 to-transparent sm:from-60%" />
      
      {/* Content */}
      <motion.div 
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        className="absolute inset-0 p-6 sm:p-12 flex flex-col justify-center max-w-[85%] sm:max-w-[55%] text-white z-10"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 text-amber-300 font-bold text-xs rounded-full mb-4 w-fit border border-amber-500/30">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" /> {t('hero.instantApproval', 'Instant Approval')}
        </div>
        <h2 className="text-3xl sm:text-5xl font-black font-display leading-tight mb-4">
          {t('hero.loansTitle', 'Expand Your Business')}
        </h2>
        <p className="text-sm sm:text-base text-blue-100 mb-8 font-medium leading-relaxed max-w-sm">
          {t('hero.loansSubtitle', 'Get up to ₹5,00,000 for purchasing new handlooms, raw materials, and working capital at subsidised interest rates.')}
        </p>
        <div>
          <Button 
            variant="primary" 
            className="bg-amber-500 text-slate-900 hover:bg-amber-400 border-none shadow-xl shadow-amber-500/20 px-8 py-3 rounded-xl font-bold text-base"
            rightIcon={<ChevronRight size={20} />}
          >
            {t('common.applyNow', 'Apply Now')}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
