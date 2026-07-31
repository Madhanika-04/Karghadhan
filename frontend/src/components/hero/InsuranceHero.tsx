import bannerProtect from '@/assets/banners/banner_protect.png';
import { motion } from 'framer-motion';
import { ShieldCheck, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/Button';

interface InsuranceHeroProps {
  onExplore?: () => void;
}

export function InsuranceHero({ onExplore }: InsuranceHeroProps) {
  const { t } = useTranslation();
  return (
    <div className="relative w-full rounded-[36px] overflow-hidden shadow-2xl bg-slate-950 group min-h-[320px] sm:min-h-[380px] mb-10 border border-emerald-500/20">
      {/* Decorative Floating Orbs */}
      <motion.div 
        animate={{ y: [0, -20, 0], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-0 right-[20%] w-64 h-64 bg-emerald-500/30 rounded-full blur-[80px] z-0 pointer-events-none"
      />
      <motion.div 
        animate={{ x: [0, 30, 0], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-0 left-[10%] w-48 h-48 bg-indigo-500/20 rounded-full blur-[60px] z-0 pointer-events-none"
      />

      {/* Background Image with Clean Fit and Smooth Cover */}
      <motion.img 
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        src={bannerProtect} 
        alt="Insurance Protection"
        className="absolute right-0 inset-y-0 h-full w-full sm:w-[65%] object-cover object-[80%_center] opacity-60 mix-blend-luminosity group-hover:mix-blend-normal group-hover:opacity-80 transition-all duration-700"
      />
      
      {/* Deep Emerald / Dark Navy Masking Gradient for High Legibility */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/95 to-transparent sm:from-55% sm:via-slate-950/80 z-0" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-slate-950/30 z-0" />
      
      {/* Content Container */}
      <motion.div 
        initial={{ x: -30, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
        className="relative inset-0 p-8 sm:p-12 flex flex-col justify-center max-w-full sm:max-w-[65%] text-white z-10 space-y-5 h-full"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 text-emerald-400 font-bold text-xs rounded-full w-fit border border-emerald-500/30 backdrop-blur-md">
          <ShieldCheck size={16} className="text-emerald-400 drop-shadow-md" />
          <span className="tracking-widest uppercase text-[10px]">Comprehensive Handloom & Life Cover</span>
        </div>

        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black font-display leading-[1.1] text-white tracking-tight drop-shadow-xl">
          {t('hero.insuranceTitle', 'Secure Your Family & Loom')}
        </h2>

        <p className="text-sm sm:text-base lg:text-lg text-slate-300 font-medium leading-relaxed max-w-lg">
          {t('hero.insuranceSubtitle', 'Protect your livelihood with health, life, and handloom insurance schemes tailored for weavers.')}
        </p>

        <div className="pt-4">
          <Button 
            variant="primary" 
            onClick={onExplore}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black border-none shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)] px-8 py-4 rounded-2xl text-base transition-all transform hover:-translate-y-1 active:scale-95 cursor-pointer flex items-center gap-2"
            rightIcon={<ChevronRight size={20} className="stroke-[3]" />}
          >
            {t('hero.explorePlans', 'Explore Plans & Learn More')}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
