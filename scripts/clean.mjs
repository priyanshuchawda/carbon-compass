import { rm, readdir } from "fs/promises";
import { join } from "path";

const TARGET_DIRECTORIES = [
  ".next",
  "coverage",
  "test-results",
  ".playwright-mcp",
  "playwright-report",
];

async function clean() {
  const root = process.cwd();
  console.log(`Cleaning workspace at: ${root}`);

  // 1. Clean directories
  for (const dir of TARGET_DIRECTORIES) {
    const dirPath = join(root, dir);
    try {
      await rm(dirPath, { recursive: true, force: true });
      console.log(`✓ Cleaned directory: ${dir}`);
    } catch (err) {
      console.error(`✗ Failed to clean directory ${dir}:`, err);
    }
  }

  // 2. Clean root .agent*.log and other temp log files
  try {
    const files = await readdir(root);
    for (const file of files) {
      if (file.startsWith(".agent") && file.endsWith(".log")) {
        const filePath = join(root, file);
        await rm(filePath, { force: true });
        console.log(`✓ Cleaned log file: ${file}`);
      }
    }
  } catch (err) {
    console.error(`✗ Failed to clean root log files:`, err);
  }

  console.log("Workspace cleanup complete.");
}

clean();
