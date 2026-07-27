import { motion } from 'framer-motion';
import { Sparkles, Mic } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/Button';

export function AssistantHero() {
  const { t } = useTranslation();
  return (
    <div className="relative w-full rounded-[24px] overflow-hidden shadow-lg bg-slate-900 h-[220px] sm:h-[280px] flex items-center justify-center">
      
      {/* Animated Deep Space / Particle Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900 via-slate-900 to-black opacity-80" />
      
      {/* Floating Particles */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ y: Math.random() * 100, x: Math.random() * 100, opacity: 0 }}
          animate={{ y: Math.random() * -100, x: Math.random() * -100, opacity: [0, 0.6, 0] }}
          transition={{ duration: 3 + Math.random() * 4, repeat: Infinity, ease: "linear" }}
          className="absolute w-1 h-1 bg-cyan-400 rounded-full blur-[1px]"
          style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%` }}
        />
      ))}
      
      {/* Floating AI Logo (Center Right) */}
      <motion.div 
        animate={{ y: [-10, 10, -10] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-10 sm:right-32 top-1/2 -translate-y-1/2 opacity-20 sm:opacity-40"
      >
        <div className="w-32 h-32 sm:w-48 sm:h-48 bg-gradient-to-br from-indigo-500 to-cyan-400 rounded-full blur-3xl opacity-50" />
      </motion.div>
      <motion.img 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        src="/assets/logokargha.png" 
        alt="Kargha AI"
        className="absolute right-12 sm:right-40 w-32 h-32 sm:w-40 sm:h-40 object-contain drop-shadow-[0_0_15px_rgba(34,211,238,0.5)] z-10"
      />
      
      {/* Content (Left) */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
        className="absolute inset-0 p-6 sm:p-12 flex flex-col justify-center max-w-[80%] sm:max-w-[60%] text-white z-20"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 font-bold text-xs rounded-full mb-4 w-fit border border-indigo-500/30">
          <Sparkles size={14} /> {t('hero.assistantBadge', 'Kargha AI v2.0')}
        </div>
        <h2 className="text-2xl sm:text-4xl font-black font-display leading-tight mb-3 text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-indigo-300">
          {t('hero.assistantTitle', 'Your Smart Financial Assistant')}
        </h2>
        <p className="text-sm sm:text-base text-slate-300 mb-6 font-medium leading-relaxed max-w-sm">
          {t('hero.assistantSubtitle', 'Ask questions, get scheme recommendations, and manage your weaving business using just your voice.')}
        </p>
        <div>
          <Button 
            variant="primary" 
            className="bg-indigo-600 text-white hover:bg-indigo-500 border-none shadow-lg shadow-indigo-600/30 px-8 rounded-xl font-bold"
            leftIcon={<Mic size={18} />}
          >
            {t('hero.talkToAi', 'Talk to AI')}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
