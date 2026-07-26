import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { languages } from '../data/languages';
import type { Language } from '../types';
import { Button } from '../components/ui/Button';
import { staggerContainer, staggerItem } from '../utils/animations';

const langColors = [
  'from-emerald-500 to-teal-600',
  'from-indigo-500 to-violet-600',
  'from-amber-500 to-orange-500',
  'from-pink-500 to-rose-600',
  'from-red-500 to-rose-600',
  'from-blue-500 to-cyan-600',
];

export default function LanguagePage() {
  const navigate = useNavigate();
  const { language, setLanguage } = useAppContext();

  const handleSelect = (lang: Language) => {
    setLanguage(lang);
  };

  const handleContinue = () => {
    navigate('/welcome');
  };

  return (
    <div className="w-full max-w-xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-indigo-600 rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-xl shadow-emerald-200">
          <span className="text-3xl">🌐</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-800 font-display">
          Choose Your Language
        </h1>
        <p className="text-slate-500 mt-2 text-sm">
          Select the language you're most comfortable with
        </p>
      </motion.div>

      {/* Language Cards */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8"
      >
        {languages.map((lang, idx) => {
          const isSelected = language.code === lang.code;
          return (
            <motion.button
              key={lang.code}
              variants={staggerItem}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleSelect(lang)}
              className={[
                'relative flex flex-col items-center justify-center gap-2 p-5 rounded-2xl border-2 transition-all duration-200 cursor-pointer',
                isSelected
                  ? `bg-gradient-to-br ${langColors[idx % langColors.length]} text-white border-transparent shadow-lg`
                  : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-300 hover:bg-emerald-50',
              ].join(' ')}
              aria-pressed={isSelected}
            >
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 right-2 w-5 h-5 bg-white/30 rounded-full flex items-center justify-center"
                >
                  <Check size={12} className="text-white" />
                </motion.div>
              )}
              <span className="text-3xl">{['🏴󠁧󠁢󠁥󠁮󠁧󠁿', '🇮🇳', '🇮🇳', '🇮🇳', '🇮🇳', '🇮🇳'][idx]}</span>
              <div className="text-center">
                <p className={`text-lg font-bold ${isSelected ? 'text-white' : 'text-slate-700'}`}>
                  {lang.nativeName}
                </p>
                <p className={`text-xs font-medium ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                  {lang.name}
                </p>
              </div>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Selected Language Banner */}
      {language && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-6 text-center"
        >
          <p className="text-sm text-slate-600">
            Selected: <span className="font-bold text-emerald-700">{language.name} ({language.nativeName})</span>
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Greeting: <span className="font-semibold text-slate-700">{language.greeting}</span>
          </p>
        </motion.div>
      )}

      <Button
        fullWidth
        size="lg"
        onClick={handleContinue}
        rightIcon={<ArrowRight size={18} />}
      >
        Continue with {language?.name}
      </Button>
    </div>
  );
}
