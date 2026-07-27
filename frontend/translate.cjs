const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const localesDir = path.join(__dirname, 'public', 'locales');
const enFile = path.join(localesDir, 'en', 'translation.json');

const tRegex = /t\(['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]/g;

function findFiles(dir, files = []) {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    if (fs.statSync(fullPath).isDirectory()) {
      findFiles(fullPath, files);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      files.push(fullPath);
    }
  }
  return files;
}

const files = findFiles(srcDir);
const enJson = fs.existsSync(enFile) ? JSON.parse(fs.readFileSync(enFile, 'utf8')) : {};

// Extract all t('key', 'default value') from src files
for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = tRegex.exec(content)) !== null) {
    const key = match[1];
    const defaultValue = match[2];

    const keys = key.split('.');
    let obj = enJson;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!obj[keys[i]]) obj[keys[i]] = {};
      obj = obj[keys[i]];
    }
    
    if (!obj[keys[keys.length - 1]]) {
      obj[keys[keys.length - 1]] = defaultValue;
    }
  }
}

if (!fs.existsSync(path.dirname(enFile))) {
  fs.mkdirSync(path.dirname(enFile), { recursive: true });
}
fs.writeFileSync(enFile, JSON.stringify(enJson, null, 2));
console.log('Successfully updated en/translation.json');

const targetLangs = ['hi', 'ta', 'te', 'kn', 'ml'];

async function translateText(text, targetLang) {
  try {
    const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`);
    const data = await res.json();
    return data[0].map((x) => x[0]).join('');
  } catch (err) {
    console.error('Translation error:', err);
    return text;
  }
}

async function translateObject(obj, targetObj, targetLang) {
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'object') {
      if (!targetObj[key]) targetObj[key] = {};
      await translateObject(value, targetObj[key], targetLang);
    } else {
      if (!targetObj[key]) {
        console.log(`Translating [${targetLang}]: ${value}`);
        targetObj[key] = await translateText(value, targetLang);
        // Small delay to prevent rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  }
}

async function run() {
  for (const lang of targetLangs) {
    console.log(`Processing ${lang}...`);
    const langFile = path.join(localesDir, lang, 'translation.json');
    
    // Create directory if it doesn't exist
    const langDir = path.dirname(langFile);
    if (!fs.existsSync(langDir)) {
      fs.mkdirSync(langDir, { recursive: true });
    }
    
    let langJson = {};
    if (fs.existsSync(langFile)) {
      langJson = JSON.parse(fs.readFileSync(langFile, 'utf8'));
    }

    await translateObject(enJson, langJson, lang);
    fs.writeFileSync(langFile, JSON.stringify(langJson, null, 2));
    console.log(`Saved ${lang}/translation.json`);
  }
  console.log('All translations completed.');
}

run();
