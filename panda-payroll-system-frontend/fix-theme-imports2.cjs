const fs = require("fs");
const path = require("path");

const projectRoot = process.argv[2];
if (!projectRoot) {
  console.error("Usage: node fix-theme-imports2.cjs <project-root>");
  process.exit(1);
}

let fixedFiles = 0;
let skippedFiles = 0;

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

  // Match ANY path ending in /theme or /theme.ts (with single or double quotes)
  const staticImportRegex = /import theme from ['"][^'"]*\/theme(?:\.ts)?['"]\s*;?\n?/g;
  const hasStaticImport = staticImportRegex.test(content);
  if (!hasStaticImport) return;

  // Reset regex
  const staticImportRegex2 = /import theme from ['"][^'"]*\/theme(?:\.ts)?['"]\s*;?\n?/g;

  const alreadyHasUseTheme = /useTheme/.test(content);

  if (!alreadyHasUseTheme) {
    content = content.replace(
      staticImportRegex2,
      'import { useTheme } from "@mui/material/styles";\n'
    );
  } else {
    content = content.replace(staticImportRegex2, "");
  }

  // Add const theme = useTheme(); inside component if theme.* is used
  const usesThemeAsObject = /\btheme\.(spacing|breakpoints|palette|zIndex|typography|transitions|mixins|direction|shadows)/.test(content);

  if (usesThemeAsObject && !/const theme = useTheme\(\)/.test(content)) {
    const lines = content.split("\n");
    let inserted = false;
    let braceDepth = 0;
    let functionStarted = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (!functionStarted && (
        /^export default function\s/.test(line) ||
        /^function\s/.test(line) ||
        /^const\s+\w+\s*=\s*(\(|React\.memo)/.test(line) ||
        /^export const\s+\w+\s*=\s*(\(|React\.memo)/.test(line) ||
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
      content = lines.join("\n");
    }
  }

  fs.writeFileSync(filePath, content, "utf8");
  console.log("✅ Fixed:", path.relative(projectRoot, filePath));
  fixedFiles++;
}

const files = getAllTsxFiles(projectRoot);
console.log(`\n🔍 Scanning ${files.length} files...\n`);

for (const file of files) {
  try {
    fixFile(file);
  } catch (err) {
    console.error("❌ Error in", file, ":", err.message);
    skippedFiles++;
  }
}

console.log(`\n✨ Done! Fixed: ${fixedFiles} files, Skipped/Errors: ${skippedFiles} files`);
