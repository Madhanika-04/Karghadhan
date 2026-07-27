import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationEN from './locales/en/translation.json';
import translationHI from './locales/hi/translation.json';
import translationTA from './locales/ta/translation.json';
import translationTE from './locales/te/translation.json';
import translationKN from './locales/kn/translation.json';
import translationML from './locales/ml/translation.json';

import dataEN from './locales/en/data.json';
import dataHI from './locales/hi/data.json';
import dataTA from './locales/ta/data.json';
import dataTE from './locales/te/data.json';
import dataKN from './locales/kn/data.json';
import dataML from './locales/ml/data.json';

const resources = {
  en: { translation: translationEN, data: dataEN },
  hi: { translation: translationHI, data: dataHI },
  ta: { translation: translationTA, data: dataTA },
  te: { translation: translationTE, data: dataTE },
  kn: { translation: translationKN, data: dataKN },
  ml: { translation: translationML, data: dataML },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    }
  });

export default i18n;
