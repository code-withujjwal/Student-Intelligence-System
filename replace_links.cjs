const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(filePath));
    } else {
      if (filePath.endsWith('.tsx') || filePath.endsWith('.jsx')) {
        results.push(filePath);
      }
    }
  });
  return results;
}

const dirs = [
  'c:/Users/ASUS/OneDrive/Desktop/modern-interface-makeover-main/nexusiq-platform/src',
  'c:/Users/ASUS/OneDrive/Desktop/modern-interface-makeover-main/src'
];

let files = [];
dirs.forEach(d => {
  files = files.concat(walk(d));
});

let modifiedFiles = [];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Replace import NextLink from 'next/link' with React Router link
  content = content.replace(/import\s+Link\s+from\s+['"]next\/link['"];?/g, 'import { Link } from "react-router-dom";');

  // Replace href= with to= inside <Link ... >
  content = content.replace(/<Link\s+([^>]*?)>/g, (match, innerProps) => {
    let newProps = innerProps.replace(/\bhref=/g, 'to=');
    return `<Link ${newProps}>`;
  });

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    modifiedFiles.push(file);
  }
});

console.log("Modified files:\n" + modifiedFiles.join("\n"));
