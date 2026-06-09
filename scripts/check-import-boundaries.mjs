import { readFileSync } from "node:fs";
import { globSync } from "node:fs";
import { relative } from "node:path";

const root = process.cwd();
const sourceFiles = globSync("{app,components,lib}/**/*.{ts,tsx}", {
  cwd: root,
  exclude: ["**/*.d.ts"],
});

const violations = [];

function importSpecifiers(source) {
  return [
    ...source.matchAll(/from\s+["']([^"']+)["']/g),
    ...source.matchAll(/import\s+["']([^"']+)["']/g),
  ].map((match) => match[1]);
}

for (const file of sourceFiles) {
  const source = readFileSync(file, "utf8");
  const specifiers = importSpecifiers(source);
  const normalizedFile = file.replaceAll("\\", "/");
  const isClientModule = source.startsWith('"use client";') || source.startsWith("'use client';");

  if (isClientModule) {
    for (const specifier of specifiers) {
      if (
        specifier === "server-only" ||
        specifier.includes("/ai/config") ||
        specifier.includes("/ai/tool-loop") ||
        specifier.includes("/security/")
      ) {
        violations.push(`${relative(root, file)} imports "${specifier}" from a client component.`);
      }
    }
  }

  if (normalizedFile.startsWith("app/api/")) {
    for (const specifier of specifiers) {
      if (specifier.startsWith("@/components") || specifier.startsWith("../../components")) {
        violations.push(`${relative(root, file)} imports UI component "${specifier}".`);
      }
    }
  }

  if (normalizedFile.startsWith("lib/")) {
    for (const specifier of specifiers) {
      if (specifier.startsWith("@/app") || specifier.startsWith("@/components")) {
        violations.push(`${relative(root, file)} imports app/UI code via "${specifier}".`);
      }
    }
  }
}

if (violations.length > 0) {
  console.error("Import boundary check failed:\n");
  for (const violation of violations) {
    console.error(`- ${violation}`);
  }
  process.exit(1);
}

console.log("Import boundary check passed.");
