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

function runExtractor(packagesDir: string, outputDir: string): void {
  execSync(
    `npx tsx ${EXTRACTOR} --packages-dir ${packagesDir} --output-dir ${outputDir}`,
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
});
