const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, 'src', 'modules');
const results = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
    } else if (entry.isFile() && entry.name.endsWith('.jsx')) {
      processFile(full);
    }
  }
}

// Matches: function Name(...) {   |  const Name = (...) => {  | const Name = function(...) {
const FUNC_START_RE = /(?:^|\n)\s*(?:export\s+(?:default\s+)?)?function\s+([A-Za-z_$][\w$]*)\s*\([^)]*\)\s*{|(?:^|\n)\s*(?:export\s+(?:default\s+)?)?const\s+([A-Za-z_$][\w$]*)\s*=\s*(?:\([^)]*\)|[A-Za-z_$][\w$]*)\s*=>\s*{|(?:^|\n)\s*(?:export\s+(?:default\s+)?)?const\s+([A-Za-z_$][\w$]*)\s*=\s*function\s*\([^)]*\)\s*{/g;

function findFunctionBodies(content) {
  const funcs = [];
  let match;
  FUNC_START_RE.lastIndex = 0;
  while ((match = FUNC_START_RE.exec(content)) !== null) {
    const name = match[1] || match[2] || match[3];
    // Only consider components: capitalized names (PascalCase) — heuristic for React components
    if (!/^[A-Z]/.test(name)) continue;

    const openBraceIndex = content.indexOf('{', match.index + match[0].length - 1);
    if (openBraceIndex === -1) continue;

    let depth = 1;
    let i = openBraceIndex + 1;
    while (i < content.length && depth > 0) {
      if (content[i] === '{') depth++;
      else if (content[i] === '}') depth--;
      i++;
    }
    const bodyStart = openBraceIndex + 1;
    const bodyEnd = i - 1;
    const body = content.slice(bodyStart, bodyEnd);

    funcs.push({ name, bodyStart, bodyEnd, body, headerEnd: match.index + match[0].length });
  }
  return funcs;
}

function lineNumberAt(content, index) {
  return content.slice(0, index).split('\n').length;
}

function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const funcs = findFunctionBodies(content);

  for (const fn of funcs) {
    const tCallRe = /\bt\(/g;
    let tMatch = tCallRe.exec(fn.body);
    if (!tMatch) continue;

    const hasUseTranslation = /\buseTranslation\s*\(/.test(fn.body);
    if (hasUseTranslation) continue;

    const tIndexInFile = fn.bodyStart + tMatch.index;
    const lineNum = lineNumberAt(content, tIndexInFile);

    results.push({
      file: path.relative(__dirname, filePath),
      component: fn.name,
      line: lineNum,
    });
  }
}

walk(SRC_DIR);

if (results.length === 0) {
  console.log('No matches found.');
} else {
  for (const r of results) {
    console.log(`${r.file} | ${r.component} | line ${r.line}`);
  }
}
