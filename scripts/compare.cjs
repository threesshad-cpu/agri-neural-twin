const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '../src/locales');
const enFile = path.join(localesDir, 'en.json');
const targetLangs = ['ta', 'te', 'kn', 'ml', 'ur'];

const enData = JSON.parse(fs.readFileSync(enFile, 'utf8'));

function getKeys(obj, prefix = '') {
    let keys = [];
    for (const key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
            keys = keys.concat(getKeys(obj[key], `${prefix}${key}.`));
        } else {
            keys.push(`${prefix}${key}`);
        }
    }
    return keys;
}

const enKeys = getKeys(enData);
console.log(`Total keys in en.json: ${enKeys.length}`);

for (const lang of targetLangs) {
    const langFile = path.join(localesDir, `${lang}.json`);
    if (fs.existsSync(langFile)) {
        const langData = JSON.parse(fs.readFileSync(langFile, 'utf8'));
        const langKeys = getKeys(langData);
        
        const missingKeys = enKeys.filter(k => !langKeys.includes(k));
        console.log(`[${lang.toUpperCase()}] Missing keys: ${missingKeys.length}`);
    } else {
        console.log(`[${lang.toUpperCase()}] File not found!`);
    }
}
