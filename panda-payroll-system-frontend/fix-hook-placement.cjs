const fs = require("fs");
const path = require("path");

const projectRoot = process.argv[2];
if (!projectRoot) {
  console.error("Usage: node fix-hook-placement.cjs <project-root>");
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

  // Check if hook is wrongly placed inside function parameters
  // Pattern: function Name({\n  const theme = useTheme();
  const wrongPlacementRegex = /(function\s+\w+\s*\(\s*\{)\s*\n\s*const theme = useTheme\(\);\s*\n/;
  
  if (!wrongPlacementRegex.test(content)) return;

  // Remove the wrongly placed hook from parameters
  content = content.replace(
    /(function\s+\w+\s*\(\s*\{)\s*\n\s*const theme = useTheme\(\);\s*\n/,
    '$1\n'
  );

  // Now add it correctly inside the function body (after the closing }) of params
  // Find "}) {" or "}: {" pattern end and add hook as first line of body
  const lines = content.split("\n");
  let inserted = false;
  let inParams = false;
  let braceDepth = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect function with destructured params start
    if (/function\s+\w+\s*\(\s*\{/.test(line)) {
      inParams = true;
    }

    if (inParams) {
      // Look for the closing of the type annotation and opening of function body
      // Pattern: "}) {" at start of line or after type block
      if (/^\}\)\s*\{/.test(line.trim()) || /^\}\s*\)\s*\{/.test(line.trim())) {
        // Insert after this line
        lines.splice(i + 1, 0, "  const theme = useTheme();");
        inserted = true;
        inParams = false;
        break;
      }
      // Handle case where it ends with just ") {" after type block "}"  
      if (/^\}\s*\{/.test(line.trim()) && i > 0) {
        lines.splice(i + 1, 0, "  const theme = useTheme();");
        inserted = true;
        inParams = false;
        break;
      }
    }
  }

  if (inserted) {
    content = lines.join("\n");
    fs.writeFileSync(filePath, content, "utf8");
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
