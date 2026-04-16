import { describe, it, expect } from "vitest";
import { isOurPackage, shouldSkipProperty, resolveTypesField, OUR_SCOPES, OUR_PACKAGES } from "./utils.js";

// ---------------------------------------------------------------------------
// isOurPackage
// ---------------------------------------------------------------------------

describe("isOurPackage", () => {
  it("recognises all documented scopes", () => {
    expect(isOurPackage("@react-spectrum/button")).toBe(true);
    expect(isOurPackage("@react-aria/button")).toBe(true);
    expect(isOurPackage("@react-stately/tree")).toBe(true);
    expect(isOurPackage("@react-types/shared")).toBe(true);
    expect(isOurPackage("@internationalized/date")).toBe(true);
    expect(isOurPackage("@adobe/react-spectrum")).toBe(true);
  });

  it("recognises the top-level package names in OUR_PACKAGES", () => {
    for (const name of OUR_PACKAGES) {
      expect(isOurPackage(name)).toBe(true);
    }
  });

  it("rejects unrelated packages", () => {
    expect(isOurPackage("react")).toBe(false);
    expect(isOurPackage("@types/react")).toBe(false);
    expect(isOurPackage("lodash")).toBe(false);
    expect(isOurPackage("@emotion/react")).toBe(false);
  });

  it("requires the full scope prefix — partial match is not enough", () => {
    // '@react-aria' without trailing slash should NOT match
    expect(isOurPackage("@react-aria")).toBe(false);
    // A package whose name starts the same but doesn't match any scope
    expect(isOurPackage("@react-aria-other/something")).toBe(false);
  });

  it("is case-sensitive", () => {
    expect(isOurPackage("@React-Aria/button")).toBe(false);
  });

  it("handles empty string", () => {
    expect(isOurPackage("")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// shouldSkipProperty
// ---------------------------------------------------------------------------

describe("shouldSkipProperty", () => {
  it("skips properties starting with __@", () => {
    expect(shouldSkipProperty("__@iterator")).toBe(true);
    expect(shouldSkipProperty("__@Symbol.iterator")).toBe(true);
  });

  it("skips purely numeric property names", () => {
    expect(shouldSkipProperty("0")).toBe(true);
    expect(shouldSkipProperty("42")).toBe(true);
    expect(shouldSkipProperty("12345")).toBe(true);
  });

  it("keeps normal property names", () => {
    expect(shouldSkipProperty("isDisabled")).toBe(false);
    expect(shouldSkipProperty("onPress")).toBe(false);
    expect(shouldSkipProperty("label")).toBe(false);
    expect(shouldSkipProperty("__privateField")).toBe(false); // __ but not __@
  });

  it("keeps alphanumeric property names", () => {
    expect(shouldSkipProperty("prop1")).toBe(false);
    expect(shouldSkipProperty("1prop")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// resolveTypesField
// ---------------------------------------------------------------------------

describe("resolveTypesField", () => {
  // String forms
  it("returns a .d.ts string directly", () => {
    expect(resolveTypesField("./dist/index.d.ts")).toBe("./dist/index.d.ts");
  });

  it("returns a .d.mts string directly", () => {
    expect(resolveTypesField("./dist/index.d.mts")).toBe("./dist/index.d.mts");
  });

  it("returns a .d.cts string directly", () => {
    expect(resolveTypesField("./dist/index.d.cts")).toBe("./dist/index.d.cts");
  });

  it("returns undefined for a non-.d.ts string", () => {
    expect(resolveTypesField("./dist/index.js")).toBeUndefined();
    expect(resolveTypesField("./dist/index.ts")).toBeUndefined();
    expect(resolveTypesField("")).toBeUndefined();
  });

  // Array forms
  it("picks the first .d.ts from an array", () => {
    expect(resolveTypesField(["./a.js", "./b.d.ts", "./c.d.ts"])).toBe("./b.d.ts");
  });

  it("returns undefined for an array with no .d.ts entries", () => {
    expect(resolveTypesField(["./a.js", "./b.ts"])).toBeUndefined();
  });

  it("handles an empty array", () => {
    expect(resolveTypesField([])).toBeUndefined();
  });

  // Object / conditional-exports forms
  it("prefers the 'types' key over other keys", () => {
    const val = { types: "./types.d.ts", import: "./import.d.ts" };
    expect(resolveTypesField(val)).toBe("./types.d.ts");
  });

  it("falls back to 'import' when 'types' is absent", () => {
    const val = { import: "./import.d.ts", default: "./default.d.ts" };
    expect(resolveTypesField(val)).toBe("./import.d.ts");
  });

  it("falls back to 'default' when 'types' and 'import' are absent", () => {
    const val = { default: "./default.d.ts" };
    expect(resolveTypesField(val)).toBe("./default.d.ts");
  });

  it("falls back to any value when preferred keys are absent", () => {
    const val = { require: "./require.d.ts" };
    expect(resolveTypesField(val)).toBe("./require.d.ts");
  });

  it("resolves nested conditional exports objects", () => {
    const val = { node: { types: "./node.d.ts" } };
    expect(resolveTypesField(val)).toBe("./node.d.ts");
  });

  it("returns undefined for an object with no .d.ts values", () => {
    expect(resolveTypesField({ import: "./index.js" })).toBeUndefined();
  });

  // Edge cases
  it("returns undefined for non-object / non-string / non-array input", () => {
    expect(resolveTypesField(null)).toBeUndefined();
    expect(resolveTypesField(undefined)).toBeUndefined();
    expect(resolveTypesField(42)).toBeUndefined();
    expect(resolveTypesField(true)).toBeUndefined();
  });
});
