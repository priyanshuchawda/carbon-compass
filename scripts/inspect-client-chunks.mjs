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

console.log("Client JS Chunk Bundle Sizes:");
for (const chunkFile of chunkFiles) {
  console.log(`- ${chunkFile.file}: ${(chunkFile.bytes / 1024).toFixed(2)} KiB`);
}
