const fs = require("fs");
const path = require("path");

const projectRoot = process.argv[2];
if (!projectRoot) {
  console.error("Usage: node fix-missing-hook.cjs <project-root>");
  process.exit(1);
}

let fixedFiles = 0;

function getAllTsxFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory() && file !== "node_modules" && file !== ".git") {
      results = results.concat(getAllTsxFiles(filePath));
    } else if (file.endsWith(".tsx") || file.endsWith(".ts")) {
      results.push(filePath);
    }
  }
  return results;
}

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, "utf8");

  // Skip if already has useTheme hook call
  if (/const theme = useTheme\(\)/.test(content)) return;

  // Skip if no theme.* usage
  const usesTheme = /\btheme\.(spacing|breakpoints|palette|zIndex|typography|transitions|mixins|direction|shadows)/.test(content);
  if (!usesTheme) return;

  // Has useTheme imported but hook not called
  const hasUseThemeImport = /useTheme/.test(content);
  
  let modified = content;

  // Add import if missing
  if (!hasUseThemeImport) {
    // Add after first import line
    modified = modified.replace(
      /(import .+;\n)/,
      '$1import { useTheme } from "@mui/material/styles";\n'
    );
  }

  // Add const theme = useTheme(); inside the first component/function body
  const lines = modified.split("\n");
  let inserted = false;
  let braceDepth = 0;
  let functionStarted = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (!functionStarted && (
      /^export default function\s/.test(line) ||
      /^function\s[A-Z]/.test(line) ||
      /^const\s+[A-Z]\w+\s*=\s*(\(|React\.memo)/.test(line) ||
      /^export const\s+[A-Z]\w+\s*=\s*(\(|React\.memo)/.test(line) ||
      /^export function\s/.test(line)
    )) {
      functionStarted = true;
    }

    if (functionStarted) {
      for (const char of line) {
        if (char === "{") braceDepth++;
        if (char === "}") braceDepth--;
      }

      if (braceDepth >= 1 && !inserted) {
        lines.splice(i + 1, 0, "  const theme = useTheme();");
        inserted = true;
        break;
      }
    }
  }

  if (inserted) {
    modified = lines.join("\n");
    fs.writeFileSync(filePath, modified, "utf8");
    console.log("✅ Fixed:", path.relative(projectRoot, filePath));
    fixedFiles++;
  }
}

const files = getAllTsxFiles(projectRoot);
console.log(`\nScanning ${files.length} files...\n`);

for (const file of files) {
  try {
    fixFile(file);
  } catch (err) {
    console.error("ERROR in", file, ":", err.message);
  }
}

console.log(`\nDone! Fixed: ${fixedFiles} files`);
