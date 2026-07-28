import bannerProtect from '@/assets/banners/banner_protect.png';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/Button';

export function InsuranceHero() {
  const { t } = useTranslation();
  return (
    <div className="relative w-full rounded-[24px] overflow-hidden shadow-lg h-[260px] sm:h-[340px] mb-8">
      {/* Full-width Background Image */}
      <motion.img 
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        src={bannerProtect} 
        alt="Insurance Protection"
        className="absolute inset-0 w-full h-full object-cover object-[center_top] opacity-80"
      />
      
      {/* Green/Teal Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/95 via-teal-900/80 to-transparent from-20%" />
      
      {/* Content */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
        className="absolute inset-0 p-6 sm:p-12 flex flex-col justify-center max-w-[90%] sm:max-w-[60%] text-white z-10"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 font-bold text-xs rounded-full mb-4 w-fit border border-emerald-500/30">
          <ShieldCheck size={14} /> {t('hero.comprehensiveCover', 'Comprehensive Cover')}
        </div>
        <h2 className="text-2xl sm:text-4xl font-black font-display leading-tight mb-3">
          {t('hero.insuranceTitle', 'Secure Your Family & Loom')}
        </h2>
        <p className="text-sm sm:text-base text-emerald-100 mb-6 font-medium leading-relaxed max-w-sm">
          {t('hero.insuranceSubtitle', 'Protect your livelihood with health, life, and handloom insurance schemes tailored for weavers.')}
        </p>
        <div>
          <Button 
            variant="primary" 
            className="bg-teal-500 text-slate-900 hover:bg-teal-400 border-none shadow-lg shadow-teal-500/30 px-8 rounded-xl font-bold"
          >
            {t('hero.explorePlans', 'Explore Plans')}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
