import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(__dirname, "../..");
const markdownLinkPattern = /\[[^\]]+\]\(([^)]+)\)/g;

function getMarkdownFiles() {
  const files = [resolve(root, "README.md")];

  const docsDir = resolve(root, "docs");
  if (existsSync(docsDir)) {
    readdirSync(docsDir)
      .filter((entry) => entry.endsWith(".md"))
      .forEach((entry) => files.push(resolve(docsDir, entry)));
  }

  const evidenceDir = resolve(root, "evidence");
  if (existsSync(evidenceDir)) {
    readdirSync(evidenceDir)
      .filter((entry) => entry.endsWith(".md"))
      .forEach((entry) => files.push(resolve(evidenceDir, entry)));
  }

  return files;
}

function isExternalOrRouteLink(href: string) {
  return href.startsWith("#") || href.startsWith("/") || /^[a-z][a-z0-9+.-]*:/i.test(href);
}

function getLocalMarkdownLinks(filePath: string) {
  const content = readFileSync(filePath, "utf8");
  return [...content.matchAll(markdownLinkPattern)]
    .map((match) => match[1]?.trim() ?? "")
    .filter((href) => href && !isExternalOrRouteLink(href))
    .map((href) => href.replace(/#.*/, "")); // remove anchor links
}

describe("local documentation links", () => {
  it("points README and docs markdown links at existing local files", () => {
    const missingLinks = getMarkdownFiles().flatMap((filePath) =>
      getLocalMarkdownLinks(filePath)
        .map((href) => ({
          filePath,
          href,
          targetPath: resolve(dirname(filePath), href),
        }))
        .filter(({ targetPath }) => !existsSync(targetPath))
    );

    expect(missingLinks).toEqual([]);
  });
});
