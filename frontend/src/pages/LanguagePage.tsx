import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useTranslation } from 'react-i18next';
import { languages } from '../data/languages';
import type { Language } from '../types';

export default function LanguagePage() {
  const navigate = useNavigate();
  const { language, setLanguage } = useAppContext();
  const { t } = useTranslation();

  const handleSelect = (lang: Language) => {
    setLanguage(lang);
  };

  const handleContinue = () => {
    navigate('/login');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 300, damping: 24 },
    },
  };

  return (
    <div className="min-h-screen w-full bg-[#F8F7F4] font-['Inter'] flex justify-center items-center selection:bg-[#0F766E] selection:text-white">
      <div className="w-full max-w-[420px] md:max-w-[520px] min-h-[100dvh] sm:min-h-0 flex flex-col justify-between sm:justify-center p-6 sm:py-12 relative mx-auto">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex flex-col items-center mt-8 sm:mt-0 mb-10"
        >
          <div className="flex items-center gap-2 mb-6">
            <div className="flex flex-col gap-[3px] opacity-90">
              <div className="flex gap-[3px]">
                <div className="w-[14px] h-[14px] rounded-sm bg-[#0F766E]"></div>
                <div className="w-[14px] h-[14px] rounded-sm bg-[#0F766E] opacity-70"></div>
              </div>
              <div className="flex gap-[3px]">
                <div className="w-[14px] h-[14px] rounded-sm bg-[#0F766E] opacity-70"></div>
                <div className="w-[14px] h-[14px] rounded-sm bg-[#D97706]"></div>
              </div>
            </div>
            <span className="text-sm font-bold tracking-[0.2em] text-[#1F2937]">KARGADHAN</span>
          </div>
          
          <h1 className="text-[32px] font-bold text-[#1F2937] leading-tight text-center">
            {t('common.chooseLanguage', 'Choose your preferred language')}
          </h1>
          <p className="text-[16px] font-medium text-gray-500 mt-3 text-center">
            {t('common.changeLater', 'You can always change this later')}
          </p>
        </motion.div>

        {/* Grid Container */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 gap-4 place-items-center mb-auto sm:mb-12 w-full max-w-[340px] mx-auto"
        >
          {languages.map((lang, idx) => {
            const isSelected = language?.code === lang.code;
            return (
              <motion.button
                key={lang.code}
                variants={itemVariants as any}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleSelect(lang)}
                className={`relative w-[160px] h-[100px] rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-colors duration-200 ${
                  isSelected
                    ? 'bg-[#F0FDF4] border-2 border-[#0F766E] shadow-sm'
                    : 'bg-white border border-[#E5E7EB] hover:border-[#0F766E]/30 hover:bg-[#F8F7F4] shadow-sm'
                }`}
                aria-pressed={isSelected}
              >
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2.5 right-2.5 w-5 h-5 bg-[#0F766E] rounded-full flex items-center justify-center shadow-sm"
                  >
                    <Check size={12} className="text-white" strokeWidth={3} />
                  </motion.div>
                )}
                
                <p className="text-[20px] font-semibold text-[#1F2937] leading-tight">
                  {lang.nativeName}
                </p>
                <p className="text-[14px] text-gray-500 font-medium">
                  {lang.name}
                </p>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="pt-6 pb-2 w-full max-w-[340px] mx-auto"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleContinue}
            className="w-full h-14 bg-[#0F766E] text-white rounded-full text-[16px] font-semibold flex items-center justify-center shadow-md hover:bg-[#0d635c] transition-colors"
          >
            {t('common.continue')}
          </motion.button>
        </motion.div>

      </div>
    </div>
  );
}
