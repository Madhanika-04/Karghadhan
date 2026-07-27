import { motion } from 'framer-motion';
import { BookOpen, GraduationCap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/Button';

export function LiteracyHero() {
  const { t } = useTranslation();
  return (
    <div className="relative w-full rounded-[24px] overflow-hidden shadow-lg bg-sky-900 h-[260px] sm:h-[340px] mb-8 flex flex-row">
      
      {/* Background Graphic */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-40 h-40 bg-cyan-400 rounded-full mix-blend-screen filter blur-3xl" />
        <div className="absolute bottom-10 right-20 w-60 h-60 bg-sky-500 rounded-full mix-blend-screen filter blur-3xl" />
      </div>
      
      {/* Image on Right */}
      <motion.img 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        src="/assets/loans/education_loan.png" 
        alt="Financial Literacy"
        className="absolute right-0 inset-y-0 h-full w-full sm:w-[60%] object-cover sm:object-contain object-right opacity-80 mix-blend-overlay sm:mix-blend-normal sm:opacity-100"
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-sky-950 via-sky-900/90 to-transparent sm:from-50%" />
      
      {/* Content (Left) */}
      <motion.div 
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        className="absolute inset-0 p-6 sm:p-12 flex flex-col justify-center max-w-[85%] sm:max-w-[55%] text-white z-10"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/20 text-cyan-300 font-bold text-xs rounded-full mb-4 w-fit border border-cyan-500/30">
          <BookOpen size={14} /> {t('hero.freeCourses', 'Free Courses')}
        </div>
        <h2 className="text-2xl sm:text-4xl font-black font-display leading-tight mb-3">
          {t('hero.literacyTitle', 'Master Your Finances')}
        </h2>
        <p className="text-sm sm:text-base text-sky-100 mb-6 font-medium leading-relaxed max-w-sm">
          {t('hero.literacySubtitle', 'Learn how to manage business capital, save for the future, and use digital tools through easy mobile lessons.')}
        </p>
        <div>
          <Button 
            variant="primary" 
            className="bg-cyan-500 text-slate-900 hover:bg-cyan-400 border-none shadow-lg shadow-cyan-500/30 px-8 rounded-xl font-bold"
            leftIcon={<GraduationCap size={18} />}
          >
            {t('literacy.startLearning', 'Start Learning')}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
