import bannerUpgrade from '@/assets/banners/banner_upgrade.png';
import { motion } from 'framer-motion';
import { FileSignature } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/Button';

export function SchemesHero() {
  const { t } = useTranslation();
  return (
    <div className="relative w-full rounded-[24px] overflow-hidden shadow-lg bg-white h-[280px] sm:h-[360px] mb-8 flex items-center justify-center">
      
      {/* Saffron, White, Green subtle background */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-emerald-50 opacity-90" />
      
      {/* Centered Illustration */}
      <motion.div 
        initial={{ clipPath: 'inset(0 50% 0 50%)' }}
        animate={{ clipPath: 'inset(0 0% 0 0%)' }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
        className="absolute inset-0 flex justify-center"
      >
        <img 
          src={bannerUpgrade} 
          alt="Government Schemes"
          className="w-full h-full object-cover sm:object-contain object-center opacity-30 mix-blend-multiply blur-[2px]"
        />
      </motion.div>
      
      {/* Content Center */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center text-center max-w-2xl px-6"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-100 text-orange-700 font-bold text-xs rounded-full mb-4 w-fit border border-orange-200">
          <FileSignature size={14} /> {t('hero.govtSubsidy', 'Govt. Subsidy')}
        </div>
        <h2 className="text-3xl sm:text-5xl font-black font-display text-slate-900 leading-tight mb-4 tracking-tight">
          {t('hero.schemesTitle', 'PMEGP & Weaver Schemes')}
        </h2>
        <p className="text-sm sm:text-base text-slate-600 mb-8 font-medium leading-relaxed">
          {t('hero.schemesSubtitle', 'Avail up to 35% margin money subsidy on new machinery. Let Karghadhan guide you through the registration and approval process seamlessly.')}
        </p>
        <div>
          <Button 
            variant="primary" 
            className="bg-emerald-600 text-white hover:bg-emerald-500 border-none shadow-xl shadow-emerald-600/30 px-10 py-3 rounded-xl font-bold"
          >
            {t('hero.checkEligibility', 'Check Eligibility')}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
