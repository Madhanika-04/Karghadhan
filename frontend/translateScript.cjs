const fs = require('fs');
const path = require('path');
const https = require('https');

const localesDir = path.join(__dirname, 'src', 'locales');
const enFile = path.join(localesDir, 'en', 'translation.json');

const languages = ['hi', 'ta', 'te', 'kn', 'ml'];

async function translateText(text, targetLang) {
  if (typeof text !== 'string' || text.trim() === '') return text;
  
  // Don't translate placeholders like {{name}} or <1>
  const placeholderRegex = /({{[^}]+}}|<[^>]+>)/g;
  const parts = text.split(placeholderRegex);
  
  let translatedText = '';
  for (const part of parts) {
    if (part.match(placeholderRegex)) {
      translatedText += part;
    } else if (part.trim() !== '') {
      try {
        const encodedText = encodeURIComponent(part);
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodedText}`;
        const response = await new Promise((resolve, reject) => {
          https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
          }).on('error', reject);
        });
        
        const json = JSON.parse(response);
        let translatedPart = '';
        if (json && json[0]) {
          json[0].forEach(segment => {
            if (segment[0]) translatedPart += segment[0];
          });
        }
        translatedText += translatedPart || part;
      } catch (err) {
        console.error('Error translating part:', part, err.message);
        translatedText += part; // fallback
      }
    } else {
      translatedText += part;
    }
  }
  
  // Quick timeout to avoid rate limit
  await new Promise(r => setTimeout(r, 100));
  return translatedText;
}

async function translateObject(obj, targetLang) {
  const result = {};
  for (const key of Object.keys(obj)) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      result[key] = await translateObject(obj[key], targetLang);
    } else if (typeof obj[key] === 'string') {
      result[key] = await translateText(obj[key], targetLang);
    } else {
      result[key] = obj[key];
    }
  }
  return result;
}

async function main() {
  const enData = JSON.parse(fs.readFileSync(enFile, 'utf8'));
  
  for (const lang of languages) {
    console.log(`Translating to ${lang}...`);
    const langDir = path.join(localesDir, lang);
    if (!fs.existsSync(langDir)) {
      fs.mkdirSync(langDir, { recursive: true });
    }
    
    const translatedData = await translateObject(enData, lang);
    fs.writeFileSync(path.join(langDir, 'translation.json'), JSON.stringify(translatedData, null, 2));
    console.log(`Finished ${lang}`);
  }
  console.log('All translations completed!');
}

main().catch(console.error);
