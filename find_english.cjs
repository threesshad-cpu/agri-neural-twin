const fs = require('fs');

const ta = require('./src/locales/ta.json');

const englishStrings = [];
function findEnglish(obj, path = '') {
  for (const k in obj) {
    if (typeof obj[k] === 'string') {
      if (/[a-zA-Z]{4,}/.test(obj[k])) {
        englishStrings.push({ path: path ? `${path}.${k}` : k, text: obj[k] });
      }
    } else if (typeof obj[k] === 'object' && obj[k] !== null) {
      findEnglish(obj[k], path ? `${path}.${k}` : k);
    }
  }
}

findEnglish(ta);
console.log(englishStrings);
