const fs = require("fs");
const path = require("path");

const projectRoot = process.argv[2];
if (!projectRoot) {
  console.error("Usage: node fix-theme-imports.js <project-root>");
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

  // Check if file has static theme import
  const hasStaticImport =
    /import theme from ["'].*\/theme["'];?/.test(content) ||
    /import theme from ["'].*\/theme\.ts["'];?/.test(content);

  if (!hasStaticImport) return;

  // 1. Replace static import with useTheme import
  // Handle case where useTheme might already be imported from @mui/material/styles
  const alreadyHasUseTheme = /useTheme/.test(content);

  if (!alreadyHasUseTheme) {
    // Add useTheme import and remove static theme import
    content = content.replace(
      /import theme from ["'].*\/theme["'];?\n?/g,
      'import { useTheme } from "@mui/material/styles";\n'
    );
  } else {
    // Just remove the static theme import (useTheme already imported)
    content = content.replace(
      /import theme from ["'].*\/theme["'];?\n?/g,
      ""
    );
  }

  // 2. Find all function/component definitions and add const theme = useTheme(); if they use theme.*
  // Strategy: find the first usage of theme.* inside JSX/function body and add hook before it
  // We'll add it after the opening of the function body

  // Pattern: after the first { in a function/component that uses theme.*
  // Simple approach: add after first useState/useMemo/useQuery/useSnackbar/useNavigate hook line
  // or after function declaration opening brace if none

  // Check if theme is used as a function call (theme.spacing, theme.breakpoints, etc.)
  const usesThemeAsObject = /\btheme\.(spacing|breakpoints|palette|zIndex|typography|transitions|mixins|direction|shadows)/.test(content);

  if (usesThemeAsObject && !/const theme = useTheme\(\)/.test(content)) {
    // Add const theme = useTheme(); after first hook usage or after function body open
    // Find best insertion point: after a line containing use* hook or after function/return statement
    
    // Strategy: insert after the first line that starts with "  const" inside function body
    // Or more reliably: insert before the first usage of theme.*
    
    // Find the function body - look for export default function or const X = () => {
    // Insert const theme = useTheme(); as the first line inside the component function

    // Simple regex: find "export default function X(...) {" or "function X(...) {"
    // and insert after the opening brace
    
    // Better: find the first occurrence of theme. and insert before the enclosing statement
    // We'll use a line-by-line approach
    
    const lines = content.split("\n");
    let inserted = false;
    let braceDepth = 0;
    let inFunctionBody = false;
    let functionStarted = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Detect function/component start
      if (!functionStarted && (
        /^export default function\s/.test(line) ||
        /^function\s/.test(line) ||
        /^const\s+\w+\s*=\s*(\(\)|React\.memo)/.test(line) ||
        /^export const\s+\w+\s*=\s*(\(\)|React\.memo)/.test(line)
      )) {
        functionStarted = true;
      }

      if (functionStarted) {
        for (const char of line) {
          if (char === "{") braceDepth++;
          if (char === "}") braceDepth--;
        }

        // We're inside the first function body at depth 1
        if (braceDepth >= 1 && !inFunctionBody && functionStarted) {
          inFunctionBody = true;
          // Insert after this line (the opening { line)
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
