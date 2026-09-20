const fs = require('fs');
const path = require('path');

function getAllJsxFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllJsxFiles(file));
    } else if (file.endsWith('.jsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = getAllJsxFiles('./src');

const enPath = './src/locales/en.json';
let enJson = {};
if (fs.existsSync(enPath)) {
  try { enJson = JSON.parse(fs.readFileSync(enPath, 'utf8')); } catch (e) {}
}
if (!enJson.auto) enJson.auto = {};

let keysAdded = 0;

function toSnakeCase(str) {
  return str.trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .split('_').slice(0, 5).join('_');
}

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Ensure useTranslation is imported
  if (!content.includes('useTranslation')) {
    content = `import { useTranslation } from 'react-i18next';\n` + content;
    changed = true;
  }
  
  // Ensure useTranslation() is called in the component
  if (content.includes('useTranslation') && !content.includes('const { t } = useTranslation()')) {
    // Only inject in the main export function
    content = content.replace(/(export default function \w+\([^)]*\)\s*\{)/, '$1\n  const { t } = useTranslation();\n');
    changed = true;
  }

  // Find >Text<
  content = content.replace(/>([^<>{}\n]+)</g, (match, p1) => {
    const text = p1.trim();
    if (!text || !/[a-zA-Z]{2,}/.test(text)) return match;
    // Skip if it's already translated or resembles code/props
    if (text.includes('t(') || text.includes('=') || text.includes('?') || text.includes('&&') || text.includes('||')) return match;
    
    const key = toSnakeCase(text);
    if (!key) return match;
    
    enJson.auto[key] = text;
    keysAdded++;
    changed = true;
    
    return `>{t('auto.${key}', '${text.replace(/'/g, "\\'")}')}<`;
  });

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});

fs.writeFileSync(enPath, JSON.stringify(enJson, null, 4));
console.log(`Added ${keysAdded} keys to en.json`);

// Sync
const prefixes = {
  ta: '[தமிழ்]',
  te: '[తెలుగు]',
  kn: '[ಕನ್ನಡ]',
  ml: '[മലയാളം]',
  ur: '[اردو]'
};

Object.entries(prefixes).forEach(([lang, prefix]) => {
  const p = `./src/locales/${lang}.json`;
  if (!fs.existsSync(p)) return;
  let data = JSON.parse(fs.readFileSync(p, 'utf8'));
  if (!data.auto) data.auto = {};
  
  Object.keys(enJson.auto).forEach(key => {
    if (!data.auto[key]) {
      data.auto[key] = `${prefix} ${enJson.auto[key]}`;
    }
  });
  
  fs.writeFileSync(p, JSON.stringify(data, null, 4));
  console.log(`Synced ${lang}.json`);
});
