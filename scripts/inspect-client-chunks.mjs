import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const chunkDirCandidates = [
  join(process.cwd(), ".next", "static", "chunks"),
];
const chunksDir = chunkDirCandidates.find((candidate) => existsSync(candidate));

if (!chunksDir) {
  console.log("No client chunks directory found. Run `pnpm build` first.");
  process.exit(0);
}

const chunkFiles = readdirSync(chunksDir)
  .filter((file) => file.endsWith(".js"))
  .map((file) => {
    const absolutePath = join(chunksDir, file);
    return {
      file,
      bytes: statSync(absolutePath).size,
    };
  })
  .sort((left, right) => right.bytes - left.bytes)
  .slice(0, 8);

if (chunkFiles.length === 0) {
  console.log("No client chunks found. Run `pnpm build` first.");
  process.exit(0);
}

const BUDGET_KB = 400; // 400 KiB limit per chunk
let exceededBudget = false;

console.log("Client JS Chunk Bundle Sizes:");
for (const chunkFile of chunkFiles) {
  const sizeKB = chunkFile.bytes / 1024;
  console.log(`- ${chunkFile.file}: ${sizeKB.toFixed(2)} KiB`);
  if (sizeKB > BUDGET_KB) {
    console.error(`  ❌ ERROR: Chunk ${chunkFile.file} exceeds the ${BUDGET_KB} KiB budget.`);
    exceededBudget = true;
  }
}

if (exceededBudget) {
  console.error("Bundle size budget exceeded. Build failed.");
  process.exit(1);
}
