const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'src', 'locales');
const languages = ['en', 'ta', 'te', 'hi', 'kn', 'ml'];

const keysToAdd = {
  common: {
    verifiedWeaver: {
      en: "Verified Weaver",
      ta: "சரிபார்க்கப்பட்ட நெசவாளர்",
      te: "ధృవీకరించబడిన నేతకారుడు",
      hi: "सत्यापित बुनकर",
      kn: "ಪರಿಶೀಲಿಸಿದ ನೇಕಾರ",
      ml: "സ്ഥിരീകരിച്ച നെയ്ത്തുകാരൻ"
    }
  },
  dashboard: {
    alert1: {
      en: "PMJJBY renewal in 15 days",
      ta: "15 நாட்களில் PMJJBY புதுப்பித்தல்",
      te: "15 రోజుల్లో PMJJBY పునరుద్ధరణ",
      hi: "15 दिनों में PMJJBY नवीनीकरण",
      kn: "15 ದಿನಗಳಲ್ಲಿ PMJJBY ನವೀಕರಣ",
      ml: "15 ദിവസത്തിനുള്ളിൽ PMJJBY പുതുക്കൽ"
    },
    alert2: {
      en: "Yarn Subsidy Scheme closes Jun 30",
      ta: "நூல் மானியத் திட்டம் ஜூன் 30-ம் தேதியுடன் முடிகிறது",
      te: "నూలు సబ్సిడీ పథకం జూన్ 30తో ముగుస్తుంది",
      hi: "यार्न सब्सिडी योजना 30 जून को बंद हो रही है",
      kn: "ನೂಲು ಸಬ್ಸಿಡಿ ಯೋಜನೆ ಜೂನ್ 30 ರಂದು ಕೊನೆಗೊಳ್ಳುತ್ತದೆ",
      ml: "നൂൽ സബ്സിഡി പദ്ധതി ജൂൺ 30-ന് അവസാനിക്കുന്നു"
    },
    alert3: {
      en: "New Skill Training batch starting",
      ta: "புதிய திறன் பயிற்சி வகுப்பு தொடங்குகிறது",
      te: "కొత్త నైపుణ్య శిక్షణ బ్యాచ్ ప్రారంభం",
      hi: "नया कौशल प्रशिक्षण बैच शुरू हो रहा है",
      kn: "ಹೊಸ ಕೌಶಲ್ಯ ತರಬೇತಿ ಬ್ಯಾಚ್ ಪ್ರಾರಂಭವಾಗುತ್ತಿದೆ",
      ml: "പുതിയ നൈപുണ്യ പരിശീലന ബാച്ച് ആരംഭിക്കുന്നു"
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
      if (!data.common[k]) data.common[k] = keysToAdd.common[k][lang];
    });

    // Add dashboard
    if (!data.dashboard) data.dashboard = {};
    Object.keys(keysToAdd.dashboard).forEach(k => {
      if (!data.dashboard[k]) data.dashboard[k] = keysToAdd.dashboard[k][lang];
    });

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`Updated ${lang}/translation.json`);
  }
});
