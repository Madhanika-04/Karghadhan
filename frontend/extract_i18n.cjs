const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const extractKeys = (dir) => {
  let results = {};
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      Object.assign(results, extractKeys(fullPath));
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      const regex = /t\(\s*['"`]([^'"`]+)['"`]\s*,\s*['"`]([^'"`]+)['"`]/g;
      let match;
      while ((match = regex.exec(content)) !== null) {
        results[match[1]] = match[2];
      }
      
      // For cases where there are options object, the regex above handles single/double quotes, 
      // but let's do a more robust one that captures anything up to the next comma or closing paren.
      const regexFallback = /t\(\s*['"`]([^'"`]+)['"`]\s*,\s*(?:"([^"]+)"|'([^']+)'|`([^`]+)`)/g;
      while ((match = regexFallback.exec(content)) !== null) {
        results[match[1]] = match[2] || match[3] || match[4];
      }
    }
  }
  return results;
};

const keys = extractKeys(srcDir);

// Merge with existing en.json if any
const enPath = path.join(srcDir, 'locales', 'en', 'translation.json');
let existingEn = {};
try {
  existingEn = JSON.parse(fs.readFileSync(enPath, 'utf8'));
} catch(e) {}

const flattenObject = (obj, prefix = '') => {
  return Object.keys(obj).reduce((acc, k) => {
    const pre = prefix.length ? prefix + '.' : '';
    if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
      Object.assign(acc, flattenObject(obj[k], pre + k));
    } else {
      acc[pre + k] = obj[k];
    }
    return acc;
  }, {});
};

const flatExisting = flattenObject(existingEn);
const mergedFlat = { ...flatExisting, ...keys };

// Reconstruct nested JSON
const resultObj = {};
for (const [key, value] of Object.entries(mergedFlat)) {
  const parts = key.split('.');
  let current = resultObj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!current[parts[i]]) current[parts[i]] = {};
    current = current[parts[i]];
  }
  current[parts[parts.length - 1]] = value;
}

fs.writeFileSync(enPath, JSON.stringify(resultObj, null, 2));
console.log('Extracted keys and wrote to en/translation.json');
console.log(JSON.stringify(resultObj, null, 2));
