import businessExpansion from '@/assets/loans/business_expansion.png';
import { motion } from 'framer-motion';
import { ChevronRight, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/Button';

interface LoansHeroProps {
  onApply?: () => void;
}

export function LoansHero({ onApply }: LoansHeroProps) {
  const { t } = useTranslation();
  return (
    <div className="relative w-full rounded-[28px] overflow-hidden shadow-xl bg-slate-950 group min-h-[280px] sm:min-h-[340px] mb-8 border border-slate-800">
      {/* Background Image on Right with Seamless Cover & Smooth Blend */}
      <motion.img 
        initial={{ scale: 1.05, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        src={businessExpansion} 
        alt="Business Expansion"
        className="absolute right-0 inset-y-0 h-full w-full sm:w-[60%] object-cover object-center sm:object-right opacity-80"
      />
      
      {/* Deep Navy/Slate Masking Gradient for Crystal Clear Text Contrast */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-transparent sm:from-45% sm:via-slate-950/80" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/30" />
      
      {/* Hero Content */}
      <motion.div 
        initial={{ x: -30, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
        className="relative inset-0 p-6 sm:p-10 flex flex-col justify-center max-w-full sm:max-w-[60%] text-white z-10 space-y-4"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 text-amber-300 font-bold text-xs rounded-full w-fit border border-amber-500/30">
          <Sparkles size={13} className="text-amber-400 animate-pulse" />
          <span>{t('hero.instantApproval', 'Instant Approval @ 6% Subvention')}</span>
        </div>

        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black font-display leading-tight text-white tracking-tight">
          {t('hero.loansTitle', 'Expand Your Handloom Business')}
        </h2>

        <p className="text-xs sm:text-sm lg:text-base text-slate-300 font-medium leading-relaxed max-w-lg">
          {t('hero.loansSubtitle', 'Get up to ₹5,00,000 for purchasing new handlooms, raw materials, and working capital at subsidised interest rates.')}
        </p>

        <div className="pt-2">
          <Button 
            variant="primary" 
            onClick={onApply}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black border-none shadow-xl shadow-amber-500/25 px-8 py-3.5 rounded-2xl text-sm sm:text-base transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
            rightIcon={<ChevronRight size={20} className="stroke-[3]" />}
          >
            {t('common.applyNow', 'Apply Now')}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
