const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'src', 'locales');
const languages = ['en', 'ta', 'te', 'hi', 'kn', 'ml'];

const keysToAdd = {
  common: {
    financialActivity: {
      en: "Financial Activity",
      ta: "நிதிச் செயல்பாடு",
      te: "ఆర్థిక కార్యకలాపాలు",
      hi: "वित्तीय गतिविधि",
      kn: "ಹಣಕಾಸು ಚಟುವಟಿಕೆ",
      ml: "സാമ്പത്തിക പ്രവർത്തനം"
    }
  },
  finance: {
    title: {
      en: "Financial Activity",
      ta: "நிதிச் செயல்பாடு",
      te: "ఆర్థిక కార్యకలాపాలు",
      hi: "वित्तीय गतिविधि",
      kn: "ಹಣಕಾಸು ಚಟುವಟಿಕೆ",
      ml: "സാമ്പത്തിക പ്രവർത്തനം"
    },
    totalIncome: {
      en: "Total Income",
      ta: "மொத்த வருமானம்",
      te: "మొత్తం ఆదాయం",
      hi: "कुल आय",
      kn: "ಒಟ್ಟು ಆದಾಯ",
      ml: "മൊത്തം വരുമാനം"
    },
    totalExpenses: {
      en: "Total Expenses",
      ta: "மொத்த செலவுகள்",
      te: "మొత్తం ఖర్చులు",
      hi: "कुल व्यय",
      kn: "ಒಟ್ಟು ವೆಚ್ಚಗಳು",
      ml: "മൊത്തം ചെലവുകൾ"
    },
    netSavings: {
      en: "Net Savings",
      ta: "நிகர சேமிப்பு",
      te: "నికర పొదుపు",
      hi: "शुद्ध बचत",
      kn: "ನಿವ್ವಳ ಉಳಿತಾಯ",
      ml: "അറ്റ സമ്പാദ്യം"
    },
    monthlySummary: {
      en: "Monthly Financial Summary",
      ta: "மாதாந்திர நிதிச் சுருக்கம்",
      te: "నెలవారీ ఆర్థిక సారాంశం",
      hi: "मासिक वित्तीय सारांश",
      kn: "ಮಾಸಿಕ ಹಣಕಾಸು ಸಾರಾಂಶ",
      ml: "പ്രതിമാസ സാമ്പത്തിക സംഗ്രഹം"
    },
    aiInsightTitle: {
      en: "Kargha AI Insight",
      ta: "கர்கா AI நுண்ணறிவு",
      te: "కర్ఘా AI అంతర్దృష్టి",
      hi: "करघा एआई इनसाइट",
      kn: "ಕರ್ಘಾ ಎಐ ಒಳನೋಟ",
      ml: "കർഘ എഐ ഉൾക്കാഴ്ച"
    },
    aiInsightText: {
      en: "You have received ₹15,000 from the Silk Subsidy scheme this month. Your next EMI is due in 5 days.",
      ta: "இந்த மாதம் பட்டு மானியத் திட்டத்திலிருந்து ₹15,000 பெற்றுள்ளீர்கள். உங்கள் அடுத்த EMI 5 நாட்களில் செலுத்தப்பட வேண்டும்.",
      te: "మీరు ఈ నెల సిల్క్ సబ్సిడీ స్కీమ్ నుండి ₹15,000 పొందారు. మీ తదుపరి EMI 5 రోజుల్లో గడువు ముగుస్తుంది.",
      hi: "आपको इस महीने सिल्क सब्सिडी योजना से ₹15,000 मिले हैं। आपकी अगली ईएमआई 5 दिनों में देय है।",
      kn: "ಈ ತಿಂಗಳು ರೇಷ್ಮೆ ಸಬ್ಸಿಡಿ ಯೋಜನೆಯಿಂದ ನೀವು ₹15,000 ಪಡೆದಿದ್ದೀರಿ. ನಿಮ್ಮ ಮುಂದಿನ ಇಎಂಐ 5 ದಿನಗಳಲ್ಲಿ ಪಾವತಿಸಬೇಕಿದೆ.",
      ml: "ഈ മാസം സിൽക്ക് സബ്സിഡി സ്കീമിൽ നിന്ന് നിങ്ങൾക്ക് ₹15,000 ലഭിച്ചു. നിങ്ങളുടെ അടുത്ത ഇഎംഐ 5 ദിവസത്തിനുള്ളിൽ അടയ്ക്കേണ്ടതുണ്ട്."
    },
    reminders: {
      en: "Upcoming Reminders",
      ta: "வரவிருக்கும் நினைவூட்டல்கள்",
      te: "రాబోయే రిమైండర్‌లు",
      hi: "आगामी अनुस्मारक",
      kn: "ಮುಂಬರುವ ಜ್ಞಾಪನೆಗಳು",
      ml: "വരാനിരിക്കുന്ന ഓർമ്മപ്പെടുത്തലുകൾ"
    },
    recentActivity: {
      en: "Recent Activity",
      ta: "சமீபத்திய செயல்பாடு",
      te: "ఇటీవలి కార్యాచరణ",
      hi: "हाल की गतिविधि",
      kn: "ಇತ್ತೀಚಿನ ಚಟುವಟಿಕೆ",
      ml: "സമീപകാല പ്രവർത്തനം"
    },
    viewAll: {
      en: "View All",
      ta: "அனைத்தையும் காண்",
      te: "అన్నింటినీ వీక్షించండి",
      hi: "सभी देखें",
      kn: "ಎಲ್ಲವನ್ನೂ ವೀಕ್ಷಿಸಿ",
      ml: "എല്ലാം കാണുക"
    },
    sixMonths: {
      en: "Last 6 Months",
      ta: "கடந்த 6 மாதங்கள்",
      te: "గత 6 నెలలు",
      hi: "पिछले 6 महीने",
      kn: "ಕಳೆದ 6 ತಿಂಗಳು",
      ml: "കഴിഞ്ഞ 6 മാസങ്ങൾ"
    },
    thisYear: {
      en: "This Year",
      ta: "இந்த ஆண்டு",
      te: "ఈ సంవత్సరం",
      hi: "इस वर्ष",
      kn: "ಈ ವರ್ಷ",
      ml: "ഈ വർഷം"
    },
    income: {
      en: "Income",
      ta: "வருமானம்",
      te: "ఆదాయం",
      hi: "आय",
      kn: "ಆದಾಯ",
      ml: "വരുമാനം"
    },
    expense: {
      en: "Expense",
      ta: "செலவு",
      te: "ఖర్చు",
      hi: "व्यय",
      kn: "ವೆಚ್ಚ",
      ml: "ചെലവ്"
    }
  }
};

languages.forEach(lang => {
  const filePath = path.join(localesDir, lang, 'translation.json');
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // Add common
    if (!data.common) data.common = {};
    Object.keys(keysToAdd.common).forEach(k => {
      data.common[k] = keysToAdd.common[k][lang];
    });

    // Add finance
    if (!data.finance) data.finance = {};
    Object.keys(keysToAdd.finance).forEach(k => {
      data.finance[k] = keysToAdd.finance[k][lang];
    });

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`Updated ${lang}/translation.json`);
  }
});
