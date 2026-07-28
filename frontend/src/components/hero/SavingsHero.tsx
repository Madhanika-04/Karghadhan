import workingCapital from '@/assets/loans/working_capital.png';
import { motion } from 'framer-motion';
import { TrendingUp, PiggyBank } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/Button';

export function SavingsHero() {
  const { t } = useTranslation();
  return (
    <div className="relative w-full rounded-[24px] overflow-hidden shadow-lg bg-gradient-to-r from-amber-900 via-orange-800 to-orange-600 h-[280px] sm:h-[360px] mb-8 flex flex-row">
      
      {/* Background Graphic */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M0,100 L0,50 Q25,30 50,60 T100,20 L100,100 Z" fill="currentColor" className="text-white" />
        </svg>
      </div>
      
      {/* Content (Left) */}
      <motion.div 
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="flex-1 p-6 sm:p-12 flex flex-col justify-center text-white z-10"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 text-orange-100 font-bold text-xs rounded-full mb-4 w-fit border border-white/30 backdrop-blur-md">
          <TrendingUp size={14} /> {t('hero.highReturns', '12% Returns')}
        </div>
        <h2 className="text-2xl sm:text-4xl font-black font-display leading-tight mb-3">
          {t('hero.savingsTitle', 'Grow Your Wealth')}
        </h2>
        <p className="text-sm sm:text-base text-orange-100 mb-6 font-medium leading-relaxed max-w-sm">
          {t('hero.savingsSubtitle', 'High-yield savings accounts, mutual funds, and fixed deposits tailored for weaving cooperatives.')}
        </p>
        <div>
          <Button 
            variant="primary" 
            className="bg-white text-orange-700 hover:bg-orange-50 border-none shadow-xl px-8 rounded-xl font-bold"
            leftIcon={<PiggyBank size={18} />}
          >
            {t('hero.startSaving', 'Start Saving')}
          </Button>
        </div>
      </motion.div>

      {/* Decorative Charts & Illustration (Right) */}
      <motion.div 
        initial={{ scale: 1.2, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="hidden sm:flex flex-1 relative overflow-hidden"
      >
        {/* Abstract Floating Chart Cards */}
        <motion.div 
          animate={{ y: [-10, 10, -10] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-12 left-0 w-32 h-24 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl z-20 flex items-end p-2 gap-1"
        >
          {[40, 70, 50, 90, 60].map((h, i) => (
            <div key={i} className="flex-1 bg-white/60 rounded-t-sm" style={{ height: `${h}%` }} />
          ))}
        </motion.div>
        
        <img 
          src={workingCapital} 
          alt="Wealth"
          className="absolute right-0 top-0 w-[120%] h-[120%] object-cover object-left opacity-90 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-orange-800/50 to-amber-900" />
      </motion.div>
    </div>
  );
}
