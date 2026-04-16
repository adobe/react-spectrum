/**
 * Pure utility functions shared by the extractor and its tests.
 */

// ---------------------------------------------------------------------------
// Scope detection
// ---------------------------------------------------------------------------

export const OUR_SCOPES = [
  "@react-spectrum/",
  "@react-aria/",
  "@react-stately/",
  "@react-types/",
  "@internationalized/",
  "@adobe/react-spectrum",
];

export const OUR_PACKAGES = [
  "react-aria-components",
  "react-aria",
  "react-stately",
];

/** Returns true if the npm package name belongs to our monorepo. */
export function isOurPackage(name: string): boolean {
  if (OUR_PACKAGES.includes(name)) return true;
  return OUR_SCOPES.some((scope) => name.startsWith(scope));
}

// ---------------------------------------------------------------------------
// Property filtering
// ---------------------------------------------------------------------------

/** Returns true for property names that should always be omitted. */
export function shouldSkipProperty(name: string): boolean {
  if (name.startsWith("__@")) return true;
  // Purely numeric names are TS-internal type IDs leaking through
  if (/^\d+$/.test(name)) return true;
  return false;
}

// ---------------------------------------------------------------------------
// package.json `types` field resolution
// ---------------------------------------------------------------------------

/**
 * Recursively resolve a `.d.ts` path from the `types` / `exports` field of a
 * `package.json`, which can be a string, array, or conditional-exports object.
 */
export function resolveTypesField(value: unknown): string | undefined {
  if (typeof value === "string") {
    return value.endsWith(".d.ts") || value.endsWith(".d.mts") || value.endsWith(".d.cts")
      ? value
      : undefined;
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      const resolved = resolveTypesField(item);
      if (resolved) return resolved;
    }
    return undefined;
  }
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    // Prefer well-known keys in order, then fall back to any string value
    for (const key of ["types", "import", "default", "require"]) {
      if (obj[key]) {
        const resolved = resolveTypesField(obj[key]);
        if (resolved) return resolved;
      }
    }
    for (const v of Object.values(obj)) {
      const resolved = resolveTypesField(v);
      if (resolved) return resolved;
    }
  }
  return undefined;
}
