import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import logoKargha from '../assets/logokargha.png';
import { useAppContext } from '../context/AppContext';
import { Button } from '../components/ui/Button';
import { useTranslation } from 'react-i18next';

const greetingMessages = [
  { lang: 'ta', greeting: 'வணக்கம்! நான் Kargha AI.' },
  { lang: 'hi', greeting: 'नमस्ते! मैं Kargha AI हूँ।' },
  { lang: 'te', greeting: 'నమస్కారం! నేను Kargha AI.' },
  { lang: 'en', greeting: 'Hello! I am Kargha AI.' },
  { lang: 'kn', greeting: 'ನಮಸ್ಕಾರ! ನಾನು Kargha AI.' },
  { lang: 'ml', greeting: 'നമസ്കാരം! ഞാൻ Kargha AI.' },
];

const steps = [
  'Verifying your identity...',
  'Matching your Weaver profile...',
  'Checking eligible schemes...',
  'Loading your personalized dashboard...',
];

export default function WelcomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { language } = useAppContext();
  const [displayText, setDisplayText] = useState('');
  const [showFeatures, setShowFeatures] = useState(false);

  const fullGreeting =
    greetingMessages.find((g) => g.lang === language.code)?.greeting ||
    t('welcome.defaultGreeting', 'Hello! I am Kargha AI.');

  // Typewriter effect
  useEffect(() => {
    let i = 0;
    setDisplayText('');
    const timer = setInterval(() => {
      setDisplayText(fullGreeting.slice(0, i + 1));
      i++;
      if (i >= fullGreeting.length) {
        clearInterval(timer);
        setTimeout(() => setShowFeatures(true), 400);
      }
    }, 60);
    return () => clearInterval(timer);
  }, [fullGreeting]);

  return (
    <div className="w-full max-w-md flex flex-col items-center text-center">
      {/* AI Avatar */}
      <div className="relative mb-8">
        {/* Pulsing rings */}
        <div className="absolute inset-0 flex items-center justify-center">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.5 + i * 0.3, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                delay: i * 0.4,
                ease: 'easeInOut',
              }}
              className="absolute w-24 h-24 rounded-full border-2 border-emerald-400/50"
            />
          ))}
        </div>

        {/* Avatar */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
          className="relative w-24 h-24 flex items-center justify-center drop-shadow-2xl"
        >
          <img src={logoKargha} alt="Karghadhan Logo" className="w-24 h-24 object-contain" />

          {/* Status dot */}
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="absolute -bottom-1.5 -right-1.5 w-5 h-5 bg-emerald-400 border-2 border-white rounded-full"
          />
        </motion.div>
      </div>

      {/* Name */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-2"
      >
        <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full">
          Kargha AI
        </span>
      </motion.div>

      {/* Typewriter Greeting */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold text-slate-800 font-display mb-2 min-h-[2.5rem]">
          {displayText}
          <span className="inline-block w-0.5 h-6 bg-emerald-500 ml-1 animate-pulse" />
        </h1>
      </motion.div>

      {/* Description */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mb-8"
      >
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 text-left space-y-3">
          <p className="text-slate-700 text-sm leading-relaxed">
            {t('welcome.description', "I'll verify your identity and help you discover the <1>best financial services</1> available for you as a handloom weaver.", {
              components: { 1: <span className="font-bold text-emerald-600" /> }
            }) || (
              <>
                I'll verify your identity and help you discover the <span className="font-bold text-emerald-600">best financial services</span> available for you as a handloom weaver.
              </>
            )}
          </p>

          {showFeatures && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-2 pt-2 border-t border-slate-100"
            >
              {[
                { icon: '🔍', text: t('welcome.feature1', 'AI-powered identity verification') },
                { icon: '💰', text: t('welcome.feature2', 'Personalised loan recommendations') },
                { icon: '🛡️', text: t('welcome.feature3', 'Insurance tailored for you') },
                { icon: '🏛️', text: t('welcome.feature4', 'Government schemes you qualify for') },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.15 }}
                  className="flex items-center gap-3 text-sm text-slate-600"
                >
                  <span className="text-lg">{item.icon}</span>
                  {item.text}
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="w-full"
      >
        <Button
          fullWidth
          size="lg"
          onClick={() => navigate('/verify')}
          rightIcon={<ArrowRight size={18} />}
        >
          {language.greeting} {t('verify.startVerification', 'Start Verification')}
        </Button>
        <p className="text-xs text-slate-400 mt-3">
          🔒 {t('welcome.secureData', 'Your data is encrypted and secure. We follow DPDP Act guidelines.')}
        </p>
      </motion.div>
    </div>
  );
}
