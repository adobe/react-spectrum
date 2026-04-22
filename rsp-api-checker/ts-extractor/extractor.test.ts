/**
 * Integration test: runs the extractor as a subprocess on a minimal fixture
 * package and verifies the produced api.json has the expected shape.
 */

import { describe, it, expect, afterEach } from "vitest";
import { execSync } from "child_process";
import { fileURLToPath } from "url";
import * as path from "path";
import * as fs from "fs";
import * as os from "os";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const EXTRACTOR = path.join(__dirname, "extract-api.ts");
const FIXTURES_DIR = path.join(__dirname, "tests", "fixtures", "packages");
const WITH_DEV_PKG_DIR = path.join(__dirname, "tests", "fixtures", "with-dev-pkg", "packages");
const WITH_PREVIOUS_TYPES_DIR = path.join(__dirname, "tests", "fixtures", "with-previous-types", "packages");

// Temporary output directories created during tests — cleaned up in afterEach.
const tmpDirs: string[] = [];

afterEach(() => {
  for (const dir of tmpDirs.splice(0)) {
    try { fs.rmSync(dir, { recursive: true, force: true }); } catch { /* ignore */ }
  }
});

function makeTmpDir(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "rsp-extractor-test-"));
  tmpDirs.push(dir);
  return dir;
}

function runExtractor(packagesDir: string, outputDir: string, extraArgs: string[] = []): void {
  const extra = extraArgs.length ? " " + extraArgs.join(" ") : "";
  execSync(
    `npx tsx ${EXTRACTOR} --packages-dir ${packagesDir} --output-dir ${outputDir}${extra}`,
    { cwd: __dirname, stdio: "pipe" },
  );
}

describe("extract-api.ts (integration)", () => {
  it("creates api.json for a minimal .d.ts fixture", () => {
    const outputDir = makeTmpDir();
    runExtractor(FIXTURES_DIR, outputDir);

    const apiJsonPath = path.join(
      outputDir,
      "@react-aria",
      "test-widget",
      "dist",
      "api.json",
    );
    expect(fs.existsSync(apiJsonPath), `api.json not found at ${apiJsonPath}`).toBe(true);
  });

  it("api.json has top-level exports and links keys", () => {
    const outputDir = makeTmpDir();
    runExtractor(FIXTURES_DIR, outputDir);

    const apiJson = JSON.parse(
      fs.readFileSync(
        path.join(outputDir, "@react-aria", "test-widget", "dist", "api.json"),
        "utf8",
      ),
    );
    expect(apiJson).toHaveProperty("exports");
    expect(apiJson).toHaveProperty("links");
  });

  it("extracts WidgetProps interface with expected properties", () => {
    const outputDir = makeTmpDir();
    runExtractor(FIXTURES_DIR, outputDir);

    const { exports } = JSON.parse(
      fs.readFileSync(
        path.join(outputDir, "@react-aria", "test-widget", "dist", "api.json"),
        "utf8",
      ),
    );

    expect(exports).toHaveProperty("WidgetProps");
    const widgetProps = exports["WidgetProps"];
    expect(widgetProps.type).toBe("interface");
    expect(widgetProps.properties).toHaveProperty("label");
    expect(widgetProps.properties).toHaveProperty("isDisabled");
    expect(widgetProps.properties["isDisabled"].optional).toBe(true);
    expect(widgetProps.properties["label"].optional).toBe(false);
  });

  it("extracts WidgetVariant type alias as a union", () => {
    const outputDir = makeTmpDir();
    runExtractor(FIXTURES_DIR, outputDir);

    const { exports } = JSON.parse(
      fs.readFileSync(
        path.join(outputDir, "@react-aria", "test-widget", "dist", "api.json"),
        "utf8",
      ),
    );

    expect(exports).toHaveProperty("WidgetVariant");
    const variant = exports["WidgetVariant"];
    expect(variant.type).toBe("alias");
    // The value should be a union of two string literals
    expect(variant.value.type).toBe("union");
    const values = variant.value.elements.map((e: { value: string }) => e.value);
    expect(values).toContain("primary");
    expect(values).toContain("secondary");
  });

  it("extracts useWidget as a function export", () => {
    const outputDir = makeTmpDir();
    runExtractor(FIXTURES_DIR, outputDir);

    const { exports } = JSON.parse(
      fs.readFileSync(
        path.join(outputDir, "@react-aria", "test-widget", "dist", "api.json"),
        "utf8",
      ),
    );

    expect(exports).toHaveProperty("useWidget");
    // Functions may be serialized as "function" or as an interface-like type
    expect(["function", "interface"]).toContain(exports["useWidget"].type);
  });

  it("writes a package.json alongside the api.json", () => {
    const outputDir = makeTmpDir();
    runExtractor(FIXTURES_DIR, outputDir);

    const pkgJsonPath = path.join(outputDir, "@react-aria", "test-widget", "package.json");
    expect(fs.existsSync(pkgJsonPath)).toBe(true);
    const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8"));
    expect(pkg.name).toBe("@react-aria/test-widget");
  });

  // health.json is the diagnostic companion to api.json: it reports how many
  // type nodes in the extracted API are `any`, which is the signature of
  // TS resolution falling back. Comparing these counts between environments
  // (local vs CI) pinpoints cross-package resolution failures quickly.
  it("writes a health.json with any-count metrics alongside api.json", () => {
    const outputDir = makeTmpDir();
    runExtractor(FIXTURES_DIR, outputDir);

    const healthPath = path.join(outputDir, "@react-aria", "test-widget", "dist", "health.json");
    expect(fs.existsSync(healthPath)).toBe(true);
    const health = JSON.parse(fs.readFileSync(healthPath, "utf8"));
    expect(health).toHaveProperty("topLevelExports");
    expect(health).toHaveProperty("topLevelAnyExports");
    expect(health).toHaveProperty("totalTypeNodes");
    expect(health).toHaveProperty("anyTypeNodes");
    expect(health).toHaveProperty("anyRatio");
    // The minimal fixture has clean types — anyRatio should be low.
    expect(health.anyRatio).toBeLessThan(0.5);
  });

  // Packages under a directory named "dev/" are build tools, not public API.
  // The Rust walk_for_packages already skips "dev/" when collecting packages
  // to install from npm. The TypeScript extractor must apply the same exclusion
  // so that local and published extractions are symmetric — otherwise packages
  // in packages/dev/ appear as "added" in every diff run.
  it("does not extract packages from dev/ subdirectory", () => {
    const outputDir = makeTmpDir();
    runExtractor(WITH_DEV_PKG_DIR, outputDir);

    // The normal package should be extracted
    const normalApiPath = path.join(
      outputDir,
      "@react-aria",
      "normal-widget",
      "dist",
      "api.json",
    );
    expect(
      fs.existsSync(normalApiPath),
      `expected @react-aria/normal-widget to be extracted at ${normalApiPath}`,
    ).toBe(true);

    // The package inside dev/ must NOT be extracted
    const devApiPath = path.join(
      outputDir,
      "@react-spectrum",
      "dev-tool",
      "dist",
      "api.json",
    );
    expect(
      fs.existsSync(devApiPath),
      "packages inside dev/ must not be extracted (they are build tools, not public API, " +
        "and the npm check already excludes the dev/ directory)",
    ).toBe(false);
  });

  // When a developer adds a prop to a source .ts file but has not re-run
  // `yarn build`, the dist/types/*.d.ts represents the *previous* build —
  // the baseline before the current edit. The extractor reads .d.ts only
  // (a single, consistent path for both the published and local sides),
  // so if source is newer than types we cannot silently fall back to
  // reading source — that would introduce a second extraction path whose
  // output can diverge subtly from the .d.ts path. Instead, fail loudly
  // with a "run yarn build" message so the user fixes the real problem.
  // This guards against the "isFoo added to ButtonProps but never appears
  // in the diff" class of bug.
  it("errors when source is newer than dist/types (build is out of date)", () => {
    const outputDir = makeTmpDir();

    // Both files may have identical mtimes after a fresh checkout. Force
    // the .d.ts to be older than the .ts so the mtime comparison kicks in.
    const srcPath = path.join(
      WITH_PREVIOUS_TYPES_DIR,
      "@react-aria",
      "previous-widget",
      "src",
      "index.ts",
    );
    const previousTypesPath = path.join(
      WITH_PREVIOUS_TYPES_DIR,
      "@react-aria",
      "previous-widget",
      "dist",
      "types",
      "src",
      "index.d.ts",
    );
    const now = Date.now();
    fs.utimesSync(previousTypesPath, new Date(now - 60_000), new Date(now - 60_000));
    fs.utimesSync(srcPath, new Date(now), new Date(now));

    let threw = false;
    let stderr = "";
    try {
      runExtractor(WITH_PREVIOUS_TYPES_DIR, outputDir, ["--check-build-freshness"]);
    } catch (err) {
      threw = true;
      const e = err as { stderr?: Buffer; stdout?: Buffer };
      stderr = (e.stderr?.toString() ?? "") + (e.stdout?.toString() ?? "");
    }

    expect(
      threw,
      "extractor must fail when src/ is newer than dist/types/ — silently " +
        "falling back to source would introduce a second extraction path " +
        "whose output can diverge from the .d.ts path.",
    ).toBe(true);
    expect(stderr).toMatch(/@react-aria\/previous-widget/);
    expect(stderr).toMatch(/yarn build/);
  });

  // The freshness check is only meaningful against the live workspace —
  // published npm tarballs are immutable, so their src/ vs dist/types/
  // mtime relationship doesn't imply an out-of-date build. Without the
  // --check-build-freshness flag, the extractor must accept the package
  // as-is even when source is newer than types.
  it("does not error when --check-build-freshness is not set", () => {
    const outputDir = makeTmpDir();

    const srcPath = path.join(
      WITH_PREVIOUS_TYPES_DIR,
      "@react-aria",
      "previous-widget",
      "src",
      "index.ts",
    );
    const previousTypesPath = path.join(
      WITH_PREVIOUS_TYPES_DIR,
      "@react-aria",
      "previous-widget",
      "dist",
      "types",
      "src",
      "index.d.ts",
    );
    const now = Date.now();
    fs.utimesSync(previousTypesPath, new Date(now - 60_000), new Date(now - 60_000));
    fs.utimesSync(srcPath, new Date(now), new Date(now));

    // No extra flag → no freshness check → no error, even though src/ is newer.
    runExtractor(WITH_PREVIOUS_TYPES_DIR, outputDir);

    const apiJsonPath = path.join(
      outputDir,
      "@react-aria",
      "previous-widget",
      "dist",
      "api.json",
    );
    expect(fs.existsSync(apiJsonPath)).toBe(true);
  });

  // The inverse: when the .d.ts is *up to date* (same mtime or newer than
  // src/), the extractor must keep using types. Reading from source when
  // unnecessary changes the resolution behaviour in a monorepo (relative
  // `import` paths into un-built sibling packages → TS falls back to `any`),
  // which produces spurious "removed" diffs against the published side.
  it("keeps using dist/types when it is current (same or newer than source)", () => {
    const outputDir = makeTmpDir();

    // Force .d.ts to be newer than .ts
    const srcPath = path.join(
      WITH_PREVIOUS_TYPES_DIR,
      "@react-aria",
      "previous-widget",
      "src",
      "index.ts",
    );
    const typesPath = path.join(
      WITH_PREVIOUS_TYPES_DIR,
      "@react-aria",
      "previous-widget",
      "dist",
      "types",
      "src",
      "index.d.ts",
    );
    const now = Date.now();
    fs.utimesSync(srcPath, new Date(now - 60_000), new Date(now - 60_000));
    fs.utimesSync(typesPath, new Date(now), new Date(now));

    runExtractor(WITH_PREVIOUS_TYPES_DIR, outputDir, ["--check-build-freshness"]);

    const apiJsonPath = path.join(
      outputDir,
      "@react-aria",
      "previous-widget",
      "dist",
      "api.json",
    );
    const { exports } = JSON.parse(fs.readFileSync(apiJsonPath, "utf8"));
    const widgetProps = exports["WidgetProps"];
    // The previous .d.ts doesn't have isFresh — since it's current enough
    // per mtime, we stick with it and isFresh must NOT appear.
    expect(
      widgetProps.properties,
      "when the .d.ts is newer than src/, the extractor must stick with the " +
        "declaration file — switching to source unnecessarily causes spurious " +
        "diffs in monorepos where un-built sibling packages can't resolve from .ts.",
    ).not.toHaveProperty("isFresh");
  });
});
