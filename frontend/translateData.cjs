const fs = require('fs');
const path = require('path');
const https = require('https');
const crypto = require('crypto');

// Fake translation function for getLoans
const t = (key, defaultText) => defaultText;

const { getLoans } = require('./temp_data/data/loans.cjs');
const { insurancePolicies, insuranceProviders, insuranceTypes } = require('./temp_data/data/insurance.cjs');
const { govtSchemes } = require('./temp_data/data/schemes.cjs');
const { learningModules } = require('./temp_data/data/literacy.cjs');
const { savingsProducts } = require('./temp_data/data/savings.cjs');

const stringsToTranslate = new Set();

function extractStrings(obj) {
  if (typeof obj === 'string') {
    // Only translate meaningful text
    if (obj.length > 2 && !obj.startsWith('/') && !obj.match(/^[a-z0-9-]+$/)) {
      stringsToTranslate.add(obj);
    }
  } else if (Array.isArray(obj)) {
    obj.forEach(extractStrings);
  } else if (typeof obj === 'object' && obj !== null) {
    Object.values(obj).forEach(extractStrings);
  }
}

extractStrings(getLoans(t));
extractStrings(insurancePolicies);
extractStrings(insuranceProviders);
extractStrings(insuranceTypes);
extractStrings(govtSchemes);
extractStrings(learningModules);
extractStrings(savingsProducts);

const uniqueStrings = Array.from(stringsToTranslate);
console.log(`Found ${uniqueStrings.length} unique strings in data models.`);

const languages = ['en', 'hi', 'ta', 'te', 'kn', 'ml'];
const localesDir = path.join(__dirname, 'src', 'locales');

function hashKey(str) {
  return crypto.createHash('md5').update(str).digest('hex').substring(0, 10);
}

async function translateText(text, targetLang) {
  if (targetLang === 'en') return text;
  
  // Rate limit
  await new Promise(r => setTimeout(r, 100));

  try {
    const encodedText = encodeURIComponent(text);
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
    return translatedPart || text;
  } catch (err) {
    console.error('Error translating:', text, err.message);
    return text;
  }
}

async function main() {
  for (const lang of languages) {
    console.log(`Translating data models to ${lang}...`);
    const langDir = path.join(localesDir, lang);
    if (!fs.existsSync(langDir)) fs.mkdirSync(langDir, { recursive: true });
    
    const dataDict = {};
    for (const str of uniqueStrings) {
      const key = hashKey(str);
      const translated = await translateText(str, lang);
      dataDict[key] = translated;
    }
    
    fs.writeFileSync(path.join(langDir, 'data.json'), JSON.stringify(dataDict, null, 2));
    console.log(`Finished data translation for ${lang}`);
  }
  
  // We also need a utility in src/utils to look up these hashes
  const helperCode = `
import { t } from 'i18next';
import MD5 from 'crypto-js/md5';

export function tData(englishString: string): string {
  if (!englishString || typeof englishString !== 'string') return englishString;
  const hash = MD5(englishString).toString().substring(0, 10);
  // data namespace, fallback to englishString
  return t('data:' + hash, englishString);
}
  `;
  fs.writeFileSync(path.join(__dirname, 'src', 'utils', 'i18nData.ts'), helperCode);
  console.log('Done!');
}

main().catch(console.error);
