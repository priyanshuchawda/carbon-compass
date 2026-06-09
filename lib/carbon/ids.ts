export function makeClientId(prefix: string): string {
  if (
    typeof globalThis.crypto !== "undefined" &&
    typeof globalThis.crypto.randomUUID === "function"
  ) {
    return `${prefix}-${globalThis.crypto.randomUUID()}`;
  }

  const timestamp = Date.now().toString(36);
  const randomSuffix = Math.floor(Math.random() * 1e9).toString(36);
  return `${prefix}-${timestamp}-${randomSuffix}`;
}
