const fs = require('fs');
const path = require('path');

function walk(dir, acc = []) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) {
      walk(full, acc);
    } else if (name.endsWith('.html')) {
      acc.push(full);
    }
  }
  return acc;
}

const files = walk(path.join('src', 'app', 'demo', 'pages'));
const changed = [];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;

  content = content.replace(
    /<div class="col-4">\s*<nav class="page-breadcrumb">[\s\S]*?<\/nav>\s*<\/div>\s*<div class="col-8">/g,
    '<div class="col-12">'
  );
  content = content.replace(
    /<div class="col-4">\s*<nav class="page-breadcrumb">[\s\S]*?<\/nav>\s*<\/div>\s*/g,
    ''
  );
  content = content.replace(/<nav class="page-breadcrumb">[\s\S]*?<\/nav>\s*/g, '');
  content = content.replace(/<div class="row header">\s*<\/div>\s*/g, '');

  if (content !== original) {
    fs.writeFileSync(file, content);
    changed.push(file);
  }
}

console.log(changed.join('\n'));
console.log('count', changed.length);
