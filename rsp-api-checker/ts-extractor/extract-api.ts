/**
 * extract-api.ts
 *
 * Standalone TypeScript API extractor that reads .d.ts entry points
 * and produces api.json files compatible with the compareAPIs tool.
 *
 * Usage:
 *   npx tsx extract-api.ts --packages-dir <dir> --output-dir <dir>
 *
 * For each package found under packages-dir, it reads the `types` field
 * from package.json, walks all exported symbols using the TS compiler API,
 * and writes a dist/api.json alongside each package.
 */

import * as ts from "typescript";
import * as path from "path";
import * as fs from "fs";
import { isOurPackage, shouldSkipProperty, resolveTypesField, OUR_SCOPES, OUR_PACKAGES } from "./utils.js";

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

const args = parseCliArgs();

interface CliArgs {
  packagesDir: string;
  outputDir: string | null;
  verbose: boolean;
  debug: string | null; // export name to debug in detail
}

function parseCliArgs(): CliArgs {
  const argv = process.argv.slice(2);
  let packagesDir = "";
  let outputDir: string | null = null;
  let verbose = false;
  let debug: string | null = null;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--packages-dir" && argv[i + 1]) {
      packagesDir = argv[++i];
    } else if (argv[i] === "--output-dir" && argv[i + 1]) {
      outputDir = argv[++i];
    } else if (argv[i] === "--verbose" || argv[i] === "-v") {
      verbose = true;
    } else if (argv[i] === "--debug" && argv[i + 1]) {
      debug = argv[++i];
      verbose = true;
    }
  }
  if (!packagesDir) {
    console.error("Usage: npx tsx extract-api.ts --packages-dir <dir> [--output-dir <dir>] [--verbose] [--debug <exportName>]");
    process.exit(1);
  }
  return { packagesDir, outputDir, verbose, debug };
}

// ---------------------------------------------------------------------------
// Diagnostic file logger — writes to {outputDir}/extract-diag.log
// ---------------------------------------------------------------------------

let diagLogFd: number | null = null;

function initDiagLog() {
  const dir = args.outputDir ?? '.';
  fs.mkdirSync(dir, { recursive: true });
  const logPath = path.join(dir, 'extract-diag.log');
  diagLogFd = fs.openSync(logPath, 'w');
  diag('INIT', `Diagnostic log started at ${new Date().toISOString()}`);
  console.log(`Diagnostics → ${logPath}`);
}

function diag(tag: string, msg: string) {
  if (diagLogFd !== null) {
    fs.writeSync(diagLogFd, `[${tag}] ${msg}\n`);
  }
}

function closeDiagLog() {
  if (diagLogFd !== null) {
    fs.closeSync(diagLogFd);
    diagLogFd = null;
  }
}

// ---------------------------------------------------------------------------
// Scope detection — which packages are "ours" vs external
// (isOurPackage, OUR_SCOPES, OUR_PACKAGES imported from utils.ts)
// ---------------------------------------------------------------------------

function isExternalSymbol(symbol: ts.Symbol, checker: ts.TypeChecker): boolean {
  const decls = symbol.getDeclarations();
  if (!decls || decls.length === 0) return true;
  const fileName = decls[0].getSourceFile().fileName;
  // If it lives in node_modules for a package that isn't ours, it's external
  const nm = "/node_modules/";
  const idx = fileName.lastIndexOf(nm);
  if (idx === -1) return false; // local file
  const afterNm = fileName.slice(idx + nm.length);
  const pkgName = afterNm.startsWith("@")
    ? afterNm.split("/").slice(0, 2).join("/")
    : afterNm.split("/")[0];
  return !isOurPackage(pkgName);
}

/** Check if a property is declared directly on the given type symbol (not inherited). */
function isOwnProperty(prop: ts.Symbol, ownerSymbol: ts.Symbol): boolean {
  const propDecls = prop.getDeclarations();
  if (!propDecls || propDecls.length === 0) return false;
  const ownerDecls = ownerSymbol.getDeclarations();
  if (!ownerDecls || ownerDecls.length === 0) return false;

  const ownerFiles = new Set(ownerDecls.map((d) => d.getSourceFile().fileName));
  return propDecls.some((d) => ownerFiles.has(d.getSourceFile().fileName));
}

/** Check if a declaration is in an external (non-our-package) file. */
function isExternalDeclaration(decl: ts.Declaration): boolean {
  const fileName = decl.getSourceFile().fileName;
  const nm = "/node_modules/";
  const idx = fileName.lastIndexOf(nm);
  if (idx === -1) return false;
  const afterNm = fileName.slice(idx + nm.length);
  const pkgName = afterNm.startsWith("@")
    ? afterNm.split("/").slice(0, 2).join("/")
    : afterNm.split("/")[0];
  return !isOurPackage(pkgName);
}

// (shouldSkipProperty and resolveTypesField imported from utils.ts)

// ---------------------------------------------------------------------------
// Package discovery
// ---------------------------------------------------------------------------

interface PackageEntry {
  name: string;
  dir: string;
  typesEntryPoint: string;
  isPrivate: boolean;
}

function discoverPackages(rootDir: string): PackageEntry[] {
  const result: PackageEntry[] = [];
  const globDirs = findPackageJsonDirs(rootDir);
  for (const dir of globDirs) {
    const pkgPath = path.join(dir, "package.json");
    if (!fs.existsSync(pkgPath)) continue;
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
    if (!pkg.name) continue;

    // Find types entry point
    let typesEntry: string | undefined;
    if (pkg.exports?.["."]?.types) {
      typesEntry = resolveTypesField(pkg.exports["."].types);
    }
    if (!typesEntry && pkg.exports?.["."]) {
      // Some packages put types at the top level of the export condition
      typesEntry = resolveTypesField(pkg.exports["."]);
    }
    if (!typesEntry && pkg.types) {
      typesEntry = resolveTypesField(pkg.types);
    }
    if (!typesEntry && pkg.typings) {
      typesEntry = resolveTypesField(pkg.typings);
    }
    if (!typesEntry) continue;

    const resolved = path.resolve(dir, typesEntry);
    if (!fs.existsSync(resolved)) {
      if (args.verbose) console.warn(`  skip ${pkg.name}: types entry not found at ${resolved}`);
      continue;
    }

    result.push({
      name: pkg.name,
      dir,
      typesEntryPoint: resolved,
      isPrivate: !!pkg.private,
    });
  }
  return result;
}

function findPackageJsonDirs(rootDir: string): string[] {
  const dirs: string[] = [];
  function walk(dir: string, depth: number) {
    if (depth > 4) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name === "node_modules" || entry.name === ".git") continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (fs.existsSync(path.join(full, "package.json"))) {
          dirs.push(full);
        }
        walk(full, depth + 1);
      }
    }
  }
  walk(rootDir, 0);
  return dirs;
}

// ---------------------------------------------------------------------------
// Type serialization context
// ---------------------------------------------------------------------------

interface SerializeContext {
  checker: ts.TypeChecker;
  links: Record<string, any>;
  /** Track visited types to avoid infinite recursion */
  visiting: Set<number>;
  /** The depth of serialization recursion */
  depth: number;
}

const MAX_DEPTH = 8;
const MAX_UNION_LITERALS = 15; // Truncate string literal unions beyond this count

function makeCtx(checker: ts.TypeChecker): SerializeContext {
  return { checker, links: {}, visiting: new Set(), depth: 0 };
}

/** Safe wrapper for checker.typeToString that catches stack overflows */
function safeTypeToString(checker: ts.TypeChecker, type: ts.Type): string {
  // Try the symbol name first (cheap, no recursion risk)
  const sym = type.getSymbol() ?? type.aliasSymbol;
  if (sym) {
    const name = sym.getName();
    if (name && name !== "__type" && name !== "__object") return name;
  }
  // Fall back to typeToString (can overflow on circular types)
  try {
    return checker.typeToString(type, undefined, ts.TypeFormatFlags.NoTruncation);
  } catch {
    return "unknown";
  }
}

/** Create a child context with incremented depth */
function childCtx(ctx: SerializeContext): SerializeContext {
  return { ...ctx, depth: ctx.depth + 1 };
}

/**
 * Serialize a type argument for an external generic type.
 * - Primitives / literals → serialize normally
 * - Types from our packages → serialize normally (we want to show our own generics)
 * - External types / complex unions → just use the identifier name (don't expand)
 */
function serializeTypeArgShallow(type: ts.Type, ctx: SerializeContext): any {
  const { checker } = ctx;

  // Primitives always serialize cheaply
  if (type.flags & (ts.TypeFlags.String | ts.TypeFlags.Number | ts.TypeFlags.Boolean
    | ts.TypeFlags.Void | ts.TypeFlags.Undefined | ts.TypeFlags.Null
    | ts.TypeFlags.Any | ts.TypeFlags.Unknown | ts.TypeFlags.Never
    | ts.TypeFlags.StringLiteral | ts.TypeFlags.NumberLiteral
    | ts.TypeFlags.BooleanLiteral | ts.TypeFlags.BigInt)) {
    return serializeType(type, ctx);
  }

  // If it has a symbol, check if it's ours or external
  const sym = type.getSymbol() ?? type.aliasSymbol;
  if (sym) {
    const decls = sym.getDeclarations();
    if (decls && decls.length > 0) {
      const isExternal = isExternalDeclaration(decls[0]);
      if (!isExternal) {
        // Our type — serialize normally
        return serializeType(type, ctx);
      }
    }
    // External type — just use the name
    const name = sym.getName();
    if (name && name !== "__type" && name !== "__object") {
      return { type: "identifier", name };
    }
  }

  // For unions/intersections with an alias, use the alias name
  if (type.aliasSymbol) {
    return { type: "identifier", name: type.aliasSymbol.getName() };
  }

  // Fallback: use safeTypeToString
  return { type: "identifier", name: safeTypeToString(checker, type) };
}

/**
 * Serialize a TypeNode from the declaration AST, substituting type parameters.
 * This preserves references like ReactNode as identifiers instead of expanding them.
 */
function serializeTypeNode(
  node: ts.TypeNode,
  typeParamMap: Map<string, ts.Type>,
  ctx: SerializeContext,
): any {
  const { checker } = ctx;
  const deep = childCtx(ctx);

  if (ctx.depth > MAX_DEPTH) {
    const t = checker.getTypeFromTypeNode(node);
    return { type: "identifier", name: safeTypeToString(checker, t) };
  }

  // Union
  if (ts.isUnionTypeNode(node)) {
    // Apply the same string-literal truncation as serializeType
    const stringLitNodes = node.types.filter(
      (t) => ts.isLiteralTypeNode(t) && ts.isStringLiteral(t.literal)
    );
    const otherNodes = node.types.filter(
      (t) => !(ts.isLiteralTypeNode(t) && ts.isStringLiteral(t.literal))
    );

    if (stringLitNodes.length > MAX_UNION_LITERALS) {
      const kept = stringLitNodes.slice(0, MAX_UNION_LITERALS);
      const elements = [
        ...otherNodes.map((t) => serializeTypeNode(t, typeParamMap, deep)),
        ...kept.map((t) => serializeTypeNode(t, typeParamMap, deep)),
        { type: "string", value: `... ${stringLitNodes.length - MAX_UNION_LITERALS} more` },
      ];
      return { type: "union", elements };
    }

    const elements = node.types.map((t) => serializeTypeNode(t, typeParamMap, deep));
    return { type: "union", elements };
  }

  // Intersection
  if (ts.isIntersectionTypeNode(node)) {
    const types = node.types.map((t) => serializeTypeNode(t, typeParamMap, deep));
    return { type: "intersection", types };
  }

  // Parenthesized
  if (ts.isParenthesizedTypeNode(node)) {
    return serializeTypeNode(node.type, typeParamMap, deep);
  }

  // Type reference (e.g., ReactNode, T, ButtonRenderProps)
  if (ts.isTypeReferenceNode(node)) {
    const refName = node.typeName.getText();

    // Substitute type parameters
    if (typeParamMap.has(refName)) {
      const subst = typeParamMap.get(refName)!;
      // Expand our own types (e.g., ToggleButtonRenderProps) so their props are visible.
      // External types get identifier-only treatment.
      const substSym = subst.getSymbol() ?? subst.aliasSymbol;
      if (substSym) {
        const substDecls = substSym.getDeclarations();
        if (substDecls?.[0] && isExternalDeclaration(substDecls[0])) {
          return { type: "identifier", name: substSym.getName() };
        }
      }
      // Our type or primitive → serialize normally
      return serializeType(subst, deep);
    }

    // Check if external → identifier only
    const sym = checker.getSymbolAtLocation(node.typeName);
    if (sym) {
      const decls = sym.getDeclarations();
      if (decls?.[0] && isExternalDeclaration(decls[0])) {
        return { type: "identifier", name: refName };
      }
    }

    // Internal named type → keep as identifier (expansion happens at top-level props).
    // Only anonymous/inline types get expanded here.
    if (sym) {
      const symName = sym.getName();
      if (symName && symName !== "__type" && symName !== "__object") {
        // Serialize type arguments if present
        if (node.typeArguments && node.typeArguments.length > 0) {
          const typeArgs = node.typeArguments.map((ta) =>
            serializeTypeNode(ta, typeParamMap, deep)
          );
          return {
            type: "application",
            base: { type: "identifier", name: symName },
            typeParameters: typeArgs,
          };
        }
        return { type: "identifier", name: symName };
      }
    }

    // Unnamed/anonymous → resolve and serialize
    const resolved = checker.getTypeFromTypeNode(node);
    return serializeType(resolved, deep);
  }

  // Function type: (params) => ReturnType
  if (ts.isFunctionTypeNode(node)) {
    const parameters: Record<string, any> = {};
    for (const param of node.parameters) {
      const paramName = param.name.getText();
      const paramType = param.type
        ? serializeTypeNode(param.type, typeParamMap, deep)
        : { type: "any" };
      parameters[paramName] = { type: "parameter", name: paramName, value: paramType };
    }
    const retType = node.type
      ? serializeTypeNode(node.type, typeParamMap, deep)
      : { type: "void" };
    return { type: "function", parameters, return: retType };
  }

  // Object literal type: { prop: type, ... }
  if (ts.isTypeLiteralNode(node)) {
    const properties: Record<string, any> = {};
    for (const member of node.members) {
      if (ts.isPropertySignature(member) && member.name) {
        const propName = member.name.getText();
        const propType = member.type
          ? serializeTypeNode(member.type, typeParamMap, deep)
          : { type: "any" };
        properties[propName] = {
          type: "property",
          name: propName,
          value: propType,
          optional: !!member.questionToken,
          default: null,
          access: "public",
        };
      }
    }
    return { type: "object", properties: Object.keys(properties).length > 0 ? properties : null };
  }

  // Array type: T[]
  if (ts.isArrayTypeNode(node)) {
    return {
      type: "array",
      elementType: serializeTypeNode(node.elementType, typeParamMap, deep),
    };
  }

  // Keyword types (string, number, boolean, void, undefined, etc.)
  if (ts.isToken(node)) {
    switch (node.kind) {
      case ts.SyntaxKind.StringKeyword: return { type: "string" };
      case ts.SyntaxKind.NumberKeyword: return { type: "number" };
      case ts.SyntaxKind.BooleanKeyword: return { type: "boolean" };
      case ts.SyntaxKind.VoidKeyword: return { type: "void" };
      case ts.SyntaxKind.UndefinedKeyword: return { type: "undefined" };
      case ts.SyntaxKind.NullKeyword: return { type: "null" };
      case ts.SyntaxKind.NeverKeyword: return { type: "never" };
      case ts.SyntaxKind.AnyKeyword: return { type: "any" };
      case ts.SyntaxKind.UnknownKeyword: return { type: "unknown" };
    }
  }

  // Fallback: resolve via type checker and use serializeType
  const resolved = checker.getTypeFromTypeNode(node);
  return serializeType(resolved, deep);
}

// ---------------------------------------------------------------------------
// Main type serializer
// ---------------------------------------------------------------------------

function serializeSymbol(symbol: ts.Symbol, ctx: SerializeContext): any {
  const { checker } = ctx;
  const name = symbol.getName();
  const isDebug = args.debug && (args.debug === name || args.debug === '*');
  const dbg = (...msg: any[]) => { if (isDebug) console.log(`  [DEBUG ${name}]`, ...msg); };

  dbg('--- START ---');
  dbg('symbol.flags:', symbolFlagsToString(symbol.flags));

  // Follow aliased symbols (re-exports like `export { Accordion } from './Accordion'`)
  let resolvedSymbol = symbol;
  if (symbol.flags & ts.SymbolFlags.Alias) {
    try {
      resolvedSymbol = checker.getAliasedSymbol(symbol);
      dbg('followed alias →', resolvedSymbol.getName(), 'flags:', symbolFlagsToString(resolvedSymbol.flags));
    } catch (e: any) {
      dbg('getAliasedSymbol threw:', e.message);
    }
  }

  const decls = resolvedSymbol.getDeclarations();
  const decl = decls?.[0];
  const isPascalCase = name.length > 0 && name[0] === name[0].toUpperCase() && name[0] !== name[0].toLowerCase();

  dbg('declarations:', decls?.length ?? 0);
  if (decl) {
    dbg('decl kind:', ts.SyntaxKind[decl.kind]);
    dbg('decl file:', decl.getSourceFile().fileName);
  }

  // --- Interface declaration ---
  if (decl && ts.isInterfaceDeclaration(decl)) {
    dbg('→ path: InterfaceDeclaration');
    return serializeInterface(resolvedSymbol, ctx);
  }

  // --- Type alias declaration ---
  if (decl && ts.isTypeAliasDeclaration(decl)) {
    dbg('→ path: TypeAliasDeclaration');
    const result = serializeTypeAlias(resolvedSymbol, decl, ctx);
    dbg('→ result type:', result?.type, 'props count:', result?.properties ? Object.keys(result.properties).length : 'N/A');
    if (result?.properties) {
      const propKeys = Object.keys(result.properties);
      const numericKeys = propKeys.filter(k => /^\d+$/.test(k));
      if (numericKeys.length > 0) {
        dbg('⚠ NUMERIC KEYS FOUND:', numericKeys.slice(0, 5));
      }
    }
    return result;
  }

  // --- Class declaration ---
  if (decl && ts.isClassDeclaration(decl)) {
    dbg('→ path: ClassDeclaration');
    return serializeClass(resolvedSymbol, ctx);
  }

  // --- Enum declaration ---
  if (decl && ts.isEnumDeclaration(decl)) {
    dbg('→ path: EnumDeclaration');
    return serializeEnum(resolvedSymbol, ctx);
  }

  // --- Get the type for further analysis ---
  const type = checker.getTypeOfSymbol(resolvedSymbol);
  const typeStr = safeTypeToString(checker, type);
  dbg('type flags:', typeFlagsToString(type.flags));
  dbg('typeToString:', typeStr.slice(0, 200));
  dbg('call signatures:', type.getCallSignatures().length);
  dbg('properties count:', type.getProperties().length);

  // --- ForwardRefExoticComponent / MemoExoticComponent ---
  if (
    isPascalCase &&
    (typeStr.includes("ForwardRefExoticComponent") ||
     typeStr.includes("MemoExoticComponent") ||
     typeStr.includes("ExoticComponent") ||
     typeStr.includes("NamedExoticComponent"))
  ) {
    dbg('→ path: ForwardRefExoticComponent');
    return serializeForwardRefComponent(name, type, decl, ctx);
  }

  // --- Callable types (functions, components) ---
  const callSigs = type.getCallSignatures();
  if (callSigs.length > 0) {
    const sig = callSigs[0];
    if (isPascalCase && looksLikeComponent(sig, checker)) {
      dbg('→ path: Component (via call sig)');
      return serializeComponent(symbol, sig, ctx);
    }
    dbg('→ path: Function');
    return serializeFunction(symbol, sig, ctx);
  }

  // --- PascalCase with `any` type — try declaration-based extraction ---
  if (isPascalCase && (type.flags & ts.TypeFlags.Any) && decl) {
    dbg('→ path: fromDeclaration (type is any)');
    return serializeFromDeclaration(name, decl, ctx);
  }

  // --- Fallback ---
  dbg('→ path: FALLBACK serializeType');
  const result = serializeType(type, ctx);
  dbg('→ fallback result:', JSON.stringify(result).slice(0, 200));
  return result;
}

function symbolFlagsToString(flags: ts.SymbolFlags): string {
  const names: string[] = [];
  if (flags & ts.SymbolFlags.Alias) names.push('Alias');
  if (flags & ts.SymbolFlags.Interface) names.push('Interface');
  if (flags & ts.SymbolFlags.TypeAlias) names.push('TypeAlias');
  if (flags & ts.SymbolFlags.Class) names.push('Class');
  if (flags & ts.SymbolFlags.Function) names.push('Function');
  if (flags & ts.SymbolFlags.Variable) names.push('Variable');
  if (flags & ts.SymbolFlags.BlockScopedVariable) names.push('BlockScopedVariable');
  if (flags & ts.SymbolFlags.RegularEnum) names.push('RegularEnum');
  if (flags & ts.SymbolFlags.ValueModule) names.push('ValueModule');
  if (flags & ts.SymbolFlags.NamespaceModule) names.push('NamespaceModule');
  if (flags & ts.SymbolFlags.ExportValue) names.push('ExportValue');
  return names.length ? names.join('|') : String(flags);
}

function typeFlagsToString(flags: ts.TypeFlags): string {
  const names: string[] = [];
  if (flags & ts.TypeFlags.Any) names.push('Any');
  if (flags & ts.TypeFlags.String) names.push('String');
  if (flags & ts.TypeFlags.Number) names.push('Number');
  if (flags & ts.TypeFlags.Boolean) names.push('Boolean');
  if (flags & ts.TypeFlags.Object) names.push('Object');
  if (flags & ts.TypeFlags.Union) names.push('Union');
  if (flags & ts.TypeFlags.Intersection) names.push('Intersection');
  if (flags & ts.TypeFlags.TypeParameter) names.push('TypeParameter');
  if (flags & ts.TypeFlags.Void) names.push('Void');
  if (flags & ts.TypeFlags.Undefined) names.push('Undefined');
  if (flags & ts.TypeFlags.Null) names.push('Null');
  if (flags & ts.TypeFlags.Never) names.push('Never');
  if (flags & ts.TypeFlags.StringLiteral) names.push('StringLiteral');
  if (flags & ts.TypeFlags.NumberLiteral) names.push('NumberLiteral');
  return names.length ? names.join('|') : String(flags);
}

/**
 * Serialize a ForwardRefExoticComponent<Props & RefAttributes<Ref>>.
 * Tries multiple strategies to extract the Props type.
 */
function serializeForwardRefComponent(
  name: string,
  type: ts.Type,
  decl: ts.Declaration | undefined,
  ctx: SerializeContext
): any {
  const { checker } = ctx;

  // Strategy 1: call signatures (works when React types fully resolve)
  const callSigs = type.getCallSignatures();
  if (callSigs.length > 0) {
    const sig = callSigs[0];
    const params = sig.getParameters();
    if (params.length > 0) {
      const propsType = checker.getTypeOfSymbol(params[0]);
      if (!(propsType.flags & ts.TypeFlags.Any)) {
        const cleaned = stripRefAttributes(propsType, checker);
        return {
          type: "component",
          name,
          props: serializeTypeExpanded(cleaned, ctx),
          typeParameters: serializeTypeParams(sig.typeParameters, ctx),
        };
      }
    }
  }

  // Strategy 2: type arguments on the TypeReference
  const typeRef = type as ts.TypeReference;
  const typeArgs = typeRef.typeArguments ?? (checker as any).getTypeArguments?.(typeRef) ?? [];
  if (typeArgs.length > 0) {
    const propsArg = typeArgs[0];
    if (!(propsArg.flags & ts.TypeFlags.Any)) {
      const cleaned = stripRefAttributes(propsArg, checker);
      return {
        type: "component",
        name,
        props: serializeTypeExpanded(cleaned, ctx),
        typeParameters: [],
      };
    }
  }

  // Strategy 3: parse type arguments from the declaration AST
  if (decl) {
    return serializeFromDeclaration(name, decl, ctx);
  }

  return { type: "component", name, props: { type: "object", properties: null }, typeParameters: [] };
}

/** Strip React.RefAttributes<T> from an intersection, leaving just the props. */
function stripRefAttributes(type: ts.Type, checker: ts.TypeChecker): ts.Type {
  if (type.isIntersection()) {
    const filtered = type.types.filter((t) => {
      const sym = t.getSymbol();
      return !sym || (sym.getName() !== "RefAttributes" && sym.getName() !== "ClassAttributes");
    });
    if (filtered.length === 1) return filtered[0];
    if (filtered.length > 0 && filtered.length < type.types.length) return filtered[0];
  }
  return type;
}

/**
 * Fallback: extract component props from the variable declaration's AST type annotation.
 * Handles cases where the TS checker can't fully resolve the type.
 */
function serializeFromDeclaration(
  name: string,
  decl: ts.Declaration,
  ctx: SerializeContext
): any {
  const { checker } = ctx;

  if (ts.isVariableDeclaration(decl) && decl.type && ts.isTypeReferenceNode(decl.type)) {
    const typeArgs = decl.type.typeArguments;
    if (typeArgs && typeArgs.length > 0) {
      const propsTypeNode = typeArgs[0];

      // Handle intersection: AccordionProps & RefAttributes<...>
      if (ts.isIntersectionTypeNode(propsTypeNode)) {
        for (const member of propsTypeNode.types) {
          if (ts.isTypeReferenceNode(member)) {
            const refName = ts.isIdentifier(member.typeName) ? member.typeName.text : undefined;
            if (refName && refName !== "RefAttributes" && refName !== "ClassAttributes") {
              const refType = checker.getTypeAtLocation(member);
              if (!(refType.flags & ts.TypeFlags.Any)) {
                return {
                  type: "component",
                  name,
                  props: serializeTypeExpanded(refType, ctx),
                  typeParameters: [],
                };
              }
              // Type is `any` — use the name as a reference
              return {
                type: "component",
                name,
                props: { type: "identifier", name: refName },
                typeParameters: [],
              };
            }
          }
        }
      }

      // Single type reference (no intersection)
      if (ts.isTypeReferenceNode(propsTypeNode)) {
        const refType = checker.getTypeAtLocation(propsTypeNode);
        if (!(refType.flags & ts.TypeFlags.Any)) {
          return {
            type: "component",
            name,
            props: serializeTypeExpanded(refType, ctx),
            typeParameters: [],
          };
        }
        const refName = ts.isIdentifier(propsTypeNode.typeName) ? propsTypeNode.typeName.text : undefined;
        if (refName) {
          return {
            type: "component",
            name,
            props: { type: "identifier", name: refName },
            typeParameters: [],
          };
        }
      }
    }
  }

  // For re-export specifiers — shouldn't reach here since we follow aliases above
  if (ts.isExportSpecifier(decl)) {
    const aliasedSymbol = checker.getAliasedSymbol(
      checker.getSymbolAtLocation(decl.name)!
    );
    if (aliasedSymbol) {
      return serializeSymbol(aliasedSymbol, ctx);
    }
  }

  return { type: "any" };
}

/**
 * Heuristic: does this call signature look like a React component?
 * i.e., (props: SomeType) => ReactNode | JSX.Element | null
 */
function looksLikeComponent(sig: ts.Signature, checker: ts.TypeChecker): boolean {
  const params = sig.getParameters();
  // Components have 0 or 1 parameter (the props)
  // Some also have a second `ref` parameter (forwardRef render functions)
  if (params.length > 2) return false;

  const returnType = checker.getReturnTypeOfSignature(sig);
  const returnStr = safeTypeToString(checker, returnType);

  return (
    returnStr.includes("Element") ||
    returnStr.includes("ReactNode") ||
    returnStr.includes("ReactElement") ||
    returnStr === "null" ||
    // If return type is `any`, still treat as component for PascalCase functions
    // (this happens when React types can't be fully resolved)
    returnStr === "any"
  );
}

function serializeComponent(
  symbol: ts.Symbol,
  sig: ts.Signature,
  ctx: SerializeContext
): any {
  const { checker } = ctx;
  const params = sig.getParameters();
  let propsNode: any = { type: "object", properties: null };

  if (params.length > 0) {
    const propsType = checker.getTypeOfSymbol(params[0]);
    propsNode = serializeTypeExpanded(propsType, ctx);
  }

  return {
    type: "component",
    name: symbol.getName(),
    props: propsNode,
    typeParameters: serializeTypeParams(sig.typeParameters, ctx),
  };
}

/**
 * Handle React.ForwardRefExoticComponent<Props> and similar wrapper types.
 * Extract the Props type argument and serialize as a component.
 */
function serializeReactWrapperComponent(
  symbol: ts.Symbol,
  type: ts.Type,
  ctx: SerializeContext
): any {
  const { checker } = ctx;

  // Try to get the props from the type argument of the wrapper
  // e.g., ForwardRefExoticComponent<ButtonProps & RefAttributes<HTMLButtonElement>>
  let propsNode: any = { type: "object", properties: null };

  const typeRef = type as ts.TypeReference;
  const typeArgs = typeRef.typeArguments ?? (typeRef as any).resolvedTypeArguments;

  if (typeArgs && typeArgs.length > 0) {
    // First type arg is the props type (possibly intersected with RefAttributes)
    let propsType = typeArgs[0];

    // If it's an intersection, strip out RefAttributes
    if (propsType.isIntersection()) {
      const filtered = propsType.types.filter((t) => {
        const sym = t.getSymbol();
        return !sym || !sym.getName().includes("RefAttributes");
      });
      if (filtered.length === 1) {
        propsType = filtered[0];
      }
    }

    propsNode = serializeTypeExpanded(propsType, ctx);
  } else {
    // Fallback: try call signatures
    const callSigs = type.getCallSignatures();
    if (callSigs.length > 0 && callSigs[0].getParameters().length > 0) {
      const propsType = checker.getTypeOfSymbol(callSigs[0].getParameters()[0]);
      propsNode = serializeTypeExpanded(propsType, ctx);
    }
  }

  // Extract type parameters from the symbol's declaration
  const decls = symbol.getDeclarations();
  let typeParameters: any[] = [];
  if (decls && decls.length > 0) {
    const decl = decls[0];
    if (ts.isVariableDeclaration(decl) && decl.type && ts.isTypeReferenceNode(decl.type)) {
      // Type params come from the variable's type annotation
      typeParameters = (decl.type.typeArguments ?? [])
        .filter(ts.isTypeParameterDeclaration as any)
        .map((tp: any) => ({
          type: "typeParameter",
          name: tp.name?.text ?? safeTypeToString(checker, checker.getTypeAtLocation(tp)),
        }));
    }
  }

  return {
    type: "component",
    name: symbol.getName(),
    props: propsNode,
    typeParameters,
  };
}

function serializeFunction(
  symbol: ts.Symbol,
  sig: ts.Signature,
  ctx: SerializeContext
): any {
  const { checker } = ctx;
  const parameters: Record<string, any> = {};
  for (const param of sig.getParameters()) {
    const paramType = checker.getTypeOfSymbol(param);
    const paramDecl = param.getDeclarations()?.[0];
    const isOptional = paramDecl ? checker.isOptionalParameter(paramDecl as ts.ParameterDeclaration) : false;
    parameters[param.getName()] = {
      type: "parameter",
      name: param.getName(),
      value: serializeType(paramType, ctx),
      optional: isOptional,
    };
  }

  const returnType = checker.getReturnTypeOfSignature(sig);

  return {
    type: "function",
    name: symbol.getName(),
    parameters,
    return: serializeType(returnType, ctx),
    typeParameters: serializeTypeParams(sig.typeParameters, ctx),
  };
}

/**
 * Serialize a property's VALUE by checking the declaration AST first.
 * This preserves external type references (ReactNode, ElementType, CSSProperties, etc.)
 * as identifiers instead of expanding them through the resolved type.
 */
function serializePropertyValue(
  prop: ts.Symbol,
  propDecl: ts.Declaration,
  ctx: SerializeContext,
): any {
  const { checker } = ctx;

  // Try to use the declaration's type node (preserves type references)
  if (
    (ts.isPropertySignature(propDecl) || ts.isPropertyDeclaration(propDecl))
    && propDecl.type
  ) {
    return serializeTypeNode(propDecl.type, new Map(), ctx);
  }

  // For method signatures, serialize from the declaration if possible
  if (ts.isMethodSignature(propDecl) || ts.isMethodDeclaration(propDecl)) {
    const params: Record<string, any> = {};
    for (const param of propDecl.parameters) {
      const paramName = param.name.getText();
      const paramType = param.type
        ? serializeTypeNode(param.type, new Map(), ctx)
        : { type: "any" };
      params[paramName] = { type: "parameter", name: paramName, value: paramType };
    }
    const retType = propDecl.type
      ? serializeTypeNode(propDecl.type, new Map(), ctx)
      : { type: "void" };
    return { type: "function", parameters: params, return: retType };
  }

  // Fallback: use resolved type
  const propType = checker.getTypeOfSymbol(prop);
  return serializeType(propType, ctx);
}

function serializeInterface(symbol: ts.Symbol, ctx: SerializeContext): any {
  const { checker } = ctx;
  const decl = symbol.getDeclarations()![0] as ts.InterfaceDeclaration;
  const type = checker.getDeclaredTypeOfSymbol(symbol) as ts.InterfaceType;
  const typeId = (type as any).id;

  // Avoid infinite recursion
  if (ctx.visiting.has(typeId)) {
    return { type: "link", id: `${symbol.getName()}:${typeId}` };
  }
  ctx.visiting.add(typeId);

  // Collect extends clauses
  const extendsNodes: any[] = [];
  const flattenedExternalExtends: string[] = [];
  const UTILITY_TYPES = new Set([
    'Pick', 'Omit', 'Partial', 'Required', 'Readonly',
    'Record', 'Exclude', 'Extract',
  ]);

  if (type.getBaseTypes) {
    for (const baseType of type.getBaseTypes() ?? []) {
      const baseSymbol = baseType.getSymbol();
      const baseName = baseSymbol?.getName();

      // Detect utility type results (Omit, Pick, etc.) — inline their properties
      const isAnonymousBase = !baseSymbol
        || baseName === "__type"
        || baseName === "__object"
        || (baseSymbol!.getDeclarations()?.length ?? 0) === 0;
      const isUtilityTypeBase = !!(
        (baseName && UTILITY_TYPES.has(baseName))
        || (baseType.aliasSymbol && UTILITY_TYPES.has(baseType.aliasSymbol.getName()))
      );

      diag('BASE-TYPE-IFACE', `of ${symbol.getName()} baseSym=${baseName ?? 'null'}, aliasSymbol=${baseType.aliasSymbol?.getName() ?? 'null'}, isAnonymous=${isAnonymousBase}, isUtility=${isUtilityTypeBase}, typeToString=${safeTypeToString(checker, baseType).slice(0, 80)}`);

      if ((isAnonymousBase || isUtilityTypeBase) && (baseType.getProperties?.()?.length ?? 0) > 0) {
        // Utility type (Omit, Pick, etc.) — inline its resolved properties
        const inlineProps: Record<string, any> = {};
        for (const bp of baseType.getProperties() ?? []) {
          const propName = bp.getName();
          if (shouldSkipProperty(propName)) continue;
          const bpDecl = bp.getDeclarations()?.[0];
          const isOptional = !!(bp.flags & ts.SymbolFlags.Optional);
          const defaultVal = getJsDocDefault(bp);
          // Use declaration AST when available to preserve external type references
          const value = bpDecl
            ? serializePropertyValue(bp, bpDecl, ctx)
            : serializeType(checker.getTypeOfSymbol(bp), ctx);
          inlineProps[propName] = {
            type: "property",
            name: propName,
            value,
            optional: isOptional,
            default: defaultVal,
            access: "public",
          };
        }
        extendsNodes.push({ type: "interface", properties: inlineProps });
      } else if (baseSymbol && isExternalSymbol(baseSymbol, checker)) {
        // External type: keep as identifier, don't flatten
        flattenedExternalExtends.push(safeTypeToString(checker, baseType));
      } else {
        // Our type: serialize and flatten its properties
        const baseSerialized = serializeTypeExpanded(baseType, ctx);
        if (baseSerialized.type === "interface" && baseSerialized.properties) {
          // Merge properties from our base types
          // (handled below when we collect properties)
        }
        extendsNodes.push(baseSerialized);
      }
    }
  }

  // Collect own + inherited-from-our-types properties
  const properties: Record<string, any> = {};

  // First, flatten properties from our base types
  for (const ext of extendsNodes) {
    if (ext.type === "interface" && ext.properties) {
      for (const [key, prop] of Object.entries(ext.properties)) {
        if (!properties[key]) {
          properties[key] = prop;
        }
      }
    }
  }

  // Then own properties (override inherited)
  for (const prop of type.getProperties()) {
    const propName = prop.getName();
    if (shouldSkipProperty(propName)) continue;

    const propDecl = prop.getDeclarations()?.[0];
    if (!propDecl) continue;
    if (isExternalDeclaration(propDecl)) continue;
    // Skip private/protected
    const modifiers = ts.getCombinedModifierFlags(propDecl as ts.Declaration);
    if (modifiers & ts.ModifierFlags.Private || modifiers & ts.ModifierFlags.Protected) continue;

    const isOptional = !!(prop.flags & ts.SymbolFlags.Optional);
    const defaultVal = getJsDocDefault(prop);

    // Serialize the property value from the DECLARATION AST when possible.
    // This preserves external type references (ReactNode, ElementType, etc.)
    // instead of expanding them through the resolved type.
    const value = serializePropertyValue(prop, propDecl, ctx);

    properties[prop.getName()] = {
      type: "property",
      name: prop.getName(),
      value,
      optional: isOptional,
      default: defaultVal,
      access: "public",
    };
  }

  ctx.visiting.delete(typeId);

  const result: any = {
    type: "interface",
    name: symbol.getName(),
    properties,
    typeParameters: serializeTypeParamsFromDecl(decl.typeParameters, ctx),
    extends: flattenedExternalExtends.map((name) => ({
      type: "identifier",
      name,
    })),
  };

  return result;
}

function serializeTypeAlias(
  symbol: ts.Symbol,
  decl: ts.TypeAliasDeclaration,
  ctx: SerializeContext
): any {
  const { checker } = ctx;
  const name = symbol.getName();

  // Get the actual resolved type (not the alias declaration type)
  const type = checker.getTypeOfSymbol(symbol);
  const declaredType = checker.getDeclaredTypeOfSymbol(symbol);

  // External type alias (e.g., type TextAreaProps = React.TextareaHTMLAttributes<...>)
  // → just reference it by name, don't expand
  const targetSymbol = type.getSymbol() ?? type.aliasSymbol ?? declaredType.getSymbol();
  if (targetSymbol && isExternalSymbol(targetSymbol, checker)) {
    return {
      type: "alias",
      name,
      value: { type: "identifier", name: safeTypeToString(checker, type) },
      typeParameters: serializeTypeParamsFromDecl(decl.typeParameters, ctx),
    };
  }

  // Internal type that resolves to an object/interface — expand its properties
  const props = type.getProperties?.() ?? [];
  if (props.length > 0) {
    const expanded = serializeTypeExpanded(type, ctx);
    if (expanded.type === "interface" && expanded.properties && Object.keys(expanded.properties).length > 0) {
      return {
        type: "interface",
        name,
        properties: expanded.properties,
        typeParameters: serializeTypeParamsFromDecl(decl.typeParameters, ctx),
        extends: expanded.extends ?? [],
      };
    }
  }

  // Simple type alias (union, literal, etc.)
  const serialized = serializeType(declaredType.flags & ts.TypeFlags.Any ? type : declaredType, ctx);
  return {
    type: "alias",
    name,
    value: serialized,
    typeParameters: serializeTypeParamsFromDecl(decl.typeParameters, ctx),
  };
}

function serializeClass(symbol: ts.Symbol, ctx: SerializeContext): any {
  const { checker } = ctx;
  const type = checker.getDeclaredTypeOfSymbol(symbol);
  const decl = symbol.getDeclarations()![0] as ts.ClassDeclaration;

  // Collect extends
  const extendsNodes: any[] = [];
  if (decl.heritageClauses) {
    for (const clause of decl.heritageClauses) {
      if (clause.token === ts.SyntaxKind.ExtendsKeyword) {
        for (const expr of clause.types) {
          const extType = checker.getTypeAtLocation(expr);
          const extSymbol = extType.getSymbol();
          if (extSymbol && isExternalSymbol(extSymbol, checker)) {
            extendsNodes.push({
              type: "identifier",
              name: safeTypeToString(checker, extType),
            });
          } else {
            extendsNodes.push(serializeType(extType, ctx));
          }
        }
      }
    }
  }

  const properties: Record<string, any> = {};
  for (const prop of type.getProperties()) {
    const propName = prop.getName();
    if (shouldSkipProperty(propName)) continue;

    const propDecl = prop.getDeclarations()?.[0];
    if (!propDecl) continue;
    if (isExternalDeclaration(propDecl)) continue;
    const modifiers = ts.getCombinedModifierFlags(propDecl as ts.Declaration);
    if (modifiers & ts.ModifierFlags.Private || modifiers & ts.ModifierFlags.Protected) continue;

    const propType = checker.getTypeOfSymbol(prop);
    const isOptional = !!(prop.flags & ts.SymbolFlags.Optional);
    properties[prop.getName()] = {
      type: "property",
      name: prop.getName(),
      value: serializeType(propType, ctx),
      optional: isOptional,
      access: "public",
    };
  }

  return {
    type: "interface",
    name: symbol.getName(),
    properties,
    typeParameters: serializeTypeParamsFromDecl(decl.typeParameters, ctx),
    extends: extendsNodes,
  };
}

function serializeEnum(symbol: ts.Symbol, ctx: SerializeContext): any {
  const { checker } = ctx;
  const type = checker.getDeclaredTypeOfSymbol(symbol);
  if (type.isUnion()) {
    return {
      type: "alias",
      name: symbol.getName(),
      value: {
        type: "union",
        elements: type.types.map((t) => serializeType(t, ctx)),
      },
      typeParameters: [],
    };
  }
  return { type: "identifier", name: symbol.getName() };
}

// ---------------------------------------------------------------------------
// Core type serializer (produces the type-node JSON)
// ---------------------------------------------------------------------------

function serializeType(type: ts.Type, ctx: SerializeContext): any {
  const { checker } = ctx;

  // Depth guard: prevent infinite recursion on deeply nested types
  if (ctx.depth > MAX_DEPTH) {
    return { type: "identifier", name: safeTypeToString(checker, type) };
  }

  // Cycle guard: prevent infinite recursion on circular type references
  const typeId = (type as any).id;
  if (typeId !== undefined && ctx.visiting.has(typeId)) {
    return { type: "identifier", name: safeTypeToString(checker, type) };
  }

  // Track this type and increment depth for child calls
  const deep = childCtx(ctx);
  if (typeId !== undefined) deep.visiting = new Set(ctx.visiting).add(typeId);

  if (type.flags & ts.TypeFlags.Any) return { type: "any" };
  if (type.flags & ts.TypeFlags.Unknown) return { type: "unknown" };
  if (type.flags & ts.TypeFlags.Void) return { type: "void" };
  if (type.flags & ts.TypeFlags.Undefined) return { type: "undefined" };
  if (type.flags & ts.TypeFlags.Null) return { type: "null" };
  if (type.flags & ts.TypeFlags.Never) return { type: "never" };
  if (type.flags & ts.TypeFlags.Boolean || type.flags & ts.TypeFlags.BooleanLiteral) {
    if (type.flags & ts.TypeFlags.BooleanLiteral) {
      return { type: "boolean", value: safeTypeToString(checker, type) === "true" };
    }
    return { type: "boolean" };
  }
  if (type.flags & ts.TypeFlags.Number) return { type: "number" };
  if (type.flags & ts.TypeFlags.String) return { type: "string" };
  if (type.flags & ts.TypeFlags.NumberLiteral) {
    return { type: "number", value: (type as ts.LiteralType).value };
  }
  if (type.flags & ts.TypeFlags.StringLiteral) {
    return { type: "string", value: (type as ts.StringLiteralType).value };
  }
  if (type.flags & ts.TypeFlags.ESSymbol || type.flags & ts.TypeFlags.UniqueESSymbol) {
    return { type: "symbol" };
  }
  if (type.flags & ts.TypeFlags.BigInt) {
    return { type: "identifier", name: "bigint" };
  }
  if (type.flags & ts.TypeFlags.TemplateLiteral) {
    return { type: "string" };
  }

  // Aliased types (e.g., ReactNode, CSSProperties, Key) — use the alias name
  // This prevents expanding `type ReactNode = string | ReactElement | ...` into a huge union
  if (type.aliasSymbol) {
    const aliasDecls = type.aliasSymbol.getDeclarations();
    if (aliasDecls?.[0] && isExternalDeclaration(aliasDecls[0])) {
      const name = type.aliasSymbol.getName();
      const aliasArgs = type.aliasTypeArguments;
      if (aliasArgs && aliasArgs.length > 0) {
        return {
          type: "application",
          base: { type: "identifier", name },
          typeParameters: aliasArgs.map((t) => serializeType(t, deep)),
        };
      }
      return { type: "identifier", name };
    }

    // Internal type alias that resolves to a union/intersection: serialize from
    // the declaration AST so that references like ReactNode are preserved as
    // identifiers instead of being flattened into their constituent types.
    if (aliasDecls?.[0] && ts.isTypeAliasDeclaration(aliasDecls[0])) {
      const decl = aliasDecls[0] as ts.TypeAliasDeclaration;
      const declType = decl.type;
      if (ts.isUnionTypeNode(declType) || ts.isIntersectionTypeNode(declType)) {
        // DIAGNOSTIC
        diag('ALIAS-AST', `depth=${ctx.depth} ${type.aliasSymbol!.getName()} (${ts.isUnionTypeNode(declType) ? 'union' : 'intersection'}, ${declType.kind === ts.SyntaxKind.UnionType ? (declType as ts.UnionTypeNode).types.length + ' members' : '?'})`);
        const typeParamMap = new Map<string, ts.Type>();
        if (decl.typeParameters && type.aliasTypeArguments) {
          for (let i = 0; i < decl.typeParameters.length; i++) {
            if (i < type.aliasTypeArguments.length) {
              typeParamMap.set(decl.typeParameters[i].name.text, type.aliasTypeArguments[i]);
            }
          }
        }
        return serializeTypeNode(declType, typeParamMap, deep);
      } else {
        diag('ALIAS-FALLTHROUGH', `depth=${ctx.depth} ${type.aliasSymbol!.getName()} declType=${ts.SyntaxKind[declType.kind]} — NOT union/intersection, falling through`);
      }
    } else {
      diag('ALIAS-FALLTHROUGH', `depth=${ctx.depth} ${type.aliasSymbol!.getName()} — NOT a TypeAliasDeclaration (kind=${aliasDecls?.[0] ? ts.SyntaxKind[aliasDecls[0].kind] : 'no decls'}), falling through`);
    }
  }

  // Union
  if (type.isUnion()) {
    const elements = type.types;
    // Count string literals — if too many, this is likely a design token union (size-0, size-10, ...)
    // Truncate to keep output manageable
    const stringLiterals = elements.filter(t => t.flags & ts.TypeFlags.StringLiteral);
    const others = elements.filter(t => !(t.flags & ts.TypeFlags.StringLiteral));

    // DIAGNOSTIC: log union sizes
    if (stringLiterals.length > 5) {
      diag('UNION', `depth=${ctx.depth} total=${elements.length}, stringLits=${stringLiterals.length}, truncate=${stringLiterals.length > MAX_UNION_LITERALS}`);
    }

    if (stringLiterals.length > MAX_UNION_LITERALS) {
      // Keep some representative string literals + all non-literal members
      const kept = stringLiterals.slice(0, MAX_UNION_LITERALS);
      const serialized = [
        ...others.map(t => serializeType(t, deep)),
        ...kept.map(t => serializeType(t, deep)),
        { type: "string", value: `... ${stringLiterals.length - MAX_UNION_LITERALS} more` },
      ];
      return { type: "union", elements: serialized };
    }

    return {
      type: "union",
      elements: elements.map((t) => serializeType(t, deep)),
    };
  }

  // Intersection
  if (type.isIntersection()) {
    return {
      type: "intersection",
      types: type.types.map((t) => serializeType(t, deep)),
    };
  }

  // TypeParameter
  if (type.flags & ts.TypeFlags.TypeParameter) {
    const tp = type as ts.TypeParameter;
    const constraint = tp.getConstraint();
    const def = tp.getDefault();
    return {
      type: "typeParameter",
      name: type.getSymbol()?.getName() ?? safeTypeToString(checker, type),
      constraint: constraint ? serializeType(constraint, deep) : null,
      default: def ? serializeType(def, deep) : null,
    };
  }

  // Index
  if (type.flags & ts.TypeFlags.Index) {
    const indexType = type as ts.IndexType;
    return {
      type: "keyof",
      keyof: serializeType((indexType as any).type, deep),
    };
  }

  // IndexedAccess
  if (type.flags & ts.TypeFlags.IndexedAccess) {
    const ia = type as ts.IndexedAccessType;
    return {
      type: "indexedAccess",
      objectType: serializeType(ia.objectType, deep),
      indexType: serializeType(ia.indexType, deep),
    };
  }

  // Conditional
  if (type.flags & ts.TypeFlags.Conditional) {
    const ct = type as ts.ConditionalType;
    return {
      type: "conditional",
      checkType: serializeType(ct.checkType, deep),
      extendsType: serializeType(ct.extendsType, deep),
      trueType: serializeType(ct.resolvedTrueType ?? (ct as any).root?.trueType ?? checker.getAnyType(), deep),
      falseType: serializeType(ct.resolvedFalseType ?? (ct as any).root?.falseType ?? checker.getAnyType(), deep),
    };
  }

  // Object types (interfaces, classes, functions, arrays, tuples)
  if (type.flags & ts.TypeFlags.Object) {
    const objType = type as ts.ObjectType;

    // Array
    if (checker.isArrayType(type)) {
      const typeArgs = (type as ts.TypeReference).typeArguments;
      return {
        type: "array",
        elementType: typeArgs?.[0] ? serializeType(typeArgs[0], deep) : { type: "any" },
      };
    }

    // Tuple
    if (checker.isTupleType(type)) {
      const typeArgs = (type as ts.TypeReference).typeArguments ?? [];
      return {
        type: "tuple",
        elements: typeArgs.map((t) => serializeType(t, deep)),
      };
    }

    // Function/callable
    const callSigs = type.getCallSignatures();
    if (callSigs.length > 0 && !type.getProperties().length) {
      const sig = callSigs[0];
      return serializeFunctionSig(sig, deep);
    }

    // TypeReference with type arguments (generic application)
    if (objType.objectFlags & ts.ObjectFlags.Reference) {
      const ref = type as ts.TypeReference;
      const target = ref.target;
      const typeArgs = checker.getTypeArguments(ref);
      const targetSymbol = target.getSymbol();

      if (targetSymbol && typeArgs.length > 0) {
        // Check if this is an external type
        if (isExternalSymbol(targetSymbol, checker)) {
          // For external types, only expand type args that come from our packages.
          // External args (Element, Event, etc.) just get their name.
          return {
            type: "application",
            base: { type: "identifier", name: targetSymbol.getName() },
            typeParameters: typeArgs.map((t) => serializeTypeArgShallow(t, deep)),
          };
        }
      }

      if (targetSymbol && typeArgs.length > 0 && target !== type) {
        return {
          type: "application",
          base: serializeType(target, deep),
          typeParameters: typeArgs.map((t) => serializeType(t, deep)),
        };
      }
    }

    // Named object type (interface/class)
    const symbol = type.getSymbol() ?? type.aliasSymbol;
    if (symbol) {
      // External types: just use the name
      if (isExternalSymbol(symbol, checker)) {
        return { type: "identifier", name: safeTypeToString(checker, type) };
      }

      // Anonymous object literal types: inline the properties
      if (
        symbol.getName() === "__type" ||
        objType.objectFlags & ts.ObjectFlags.Anonymous
      ) {
        const props = type.getProperties();
        if (props.length > 30) {
          return { type: "identifier", name: safeTypeToString(checker, type) };
        }
        return serializeObjectLiteral(type, deep);
      }

      // Named internal type: use identifier
      diag('NAMED-INTERNAL', `depth=${ctx.depth} ${symbol.getName()} → identifier (not expanded)`);
      return { type: "identifier", name: symbol.getName() };
    }

    // Anonymous object with no symbol — check size before expanding
    const anonProps = type.getProperties();
    if (anonProps.length > 30) {
      return { type: "identifier", name: safeTypeToString(checker, type) };
    }
    return serializeObjectLiteral(type, deep);
  }

  // Fallback
  return { type: "identifier", name: safeTypeToString(checker, type) };
}

/**
 * Like serializeType but expands interfaces (for component props, etc.)
 * instead of returning identifiers.
 */
function serializeTypeExpanded(type: ts.Type, ctx: SerializeContext): any {
  const { checker } = ctx;

  // Depth guard
  if (ctx.depth > MAX_DEPTH) {
    const sym = type.getSymbol() ?? type.aliasSymbol;
    return { type: "identifier", name: sym?.getName() ?? safeTypeToString(checker, type) };
  }

  const deep = childCtx(ctx);

  // Resolve alias types to their underlying type
  let resolved = type;
  if (type.aliasSymbol) {
    const aliasType = checker.getDeclaredTypeOfSymbol(type.aliasSymbol);
    if (aliasType && aliasType !== type) {
      resolved = aliasType;
    }
  }

  const symbol = resolved.getSymbol() ?? resolved.aliasSymbol ?? type.getSymbol() ?? type.aliasSymbol;

  // DIAGNOSTIC
  diag('EXPAND', `depth=${ctx.depth} symbol=${symbol?.getName() ?? 'null'}, alias=${type.aliasSymbol?.getName() ?? 'null'}, isExt=${symbol ? isExternalSymbol(symbol, checker) : 'N/A'}`);

  // Don't expand external or built-in types
  if (symbol && isExternalSymbol(symbol, checker)) {
    return serializeType(type, deep);
  }

  const allProps = resolved.getProperties?.() ?? type.getProperties?.() ?? [];
  if (allProps.length > 0 && symbol) {
    const typeId = (resolved as any).id ?? (type as any).id ?? 0;
    if (typeId && ctx.visiting.has(typeId)) {
      return { type: "identifier", name: symbol.getName() };
    }
    const visiting = new Set(ctx.visiting);
    if (typeId) visiting.add(typeId);
    const deepWithVisiting = { ...deep, visiting };

    // Collect base types and their property names so we can exclude inherited props
    const baseTypes = resolved.getBaseTypes?.() ?? type.getBaseTypes?.() ?? [];
    const externalExtends: any[] = [];
    const internalBaseProps: Record<string, any> = {};
    const inheritedPropNames = new Set<string>();

    for (const baseType of baseTypes) {
      const baseSym = baseType.getSymbol();
      const baseProps = baseType.getProperties?.() ?? [];
      for (const bp of baseProps) {
        inheritedPropNames.add(bp.getName());
      }

      // Detect computed base types that should be inlined rather than shown
      // as opaque "Omit<...>" or "Pick<...>" in extends:
      // 1. Truly anonymous (no symbol, __type, __object, no declarations)
      // 2. TS utility types — the resolved Omit<X,Y> has baseSym = Pick (from lib.d.ts)
      //    because Omit<T,K> = Pick<T, Exclude<keyof T, K>>
      // 3. Any base with aliasSymbol pointing to an external utility type
      const baseName = baseSym?.getName();
      const UTILITY_TYPES = new Set([
        'Pick', 'Omit', 'Partial', 'Required', 'Readonly',
        'Record', 'Exclude', 'Extract',
      ]);

      const isAnonymousBase = !baseSym
        || baseName === "__type"
        || baseName === "__object"
        || (baseSym.getDeclarations()?.length ?? 0) === 0;

      const isUtilityTypeBase = !!(
        (baseName && UTILITY_TYPES.has(baseName))
        || (baseType.aliasSymbol && UTILITY_TYPES.has(baseType.aliasSymbol.getName()))
      );

      // DIAGNOSTIC: log base type detection
      const symName = symbol?.getName() ?? '?';
      diag('BASE-TYPE', `of ${symName} baseSym=${baseName ?? 'null'}, aliasSymbol=${baseType.aliasSymbol?.getName() ?? 'null'}, isAnonymous=${isAnonymousBase}, isUtility=${isUtilityTypeBase}, propsCount=${baseProps.length}, typeToString=${safeTypeToString(checker, baseType).slice(0, 80)}`);

      if ((isAnonymousBase || isUtilityTypeBase) && baseProps.length > 0) {
        for (const bp of baseProps) {
          const propName = bp.getName();
          if (shouldSkipProperty(propName)) continue;
          const propType = checker.getTypeOfSymbol(bp);
          const isOptional = !!(bp.flags & ts.SymbolFlags.Optional);
          const defaultVal = getJsDocDefault(bp);
          internalBaseProps[propName] = {
            type: "property",
            name: propName,
            value: serializeType(propType, deepWithVisiting),
            optional: isOptional,
            default: defaultVal,
            access: "public",
          };
        }
      } else if (baseSym && isExternalSymbol(baseSym, checker)) {
        externalExtends.push({
          type: "identifier",
          name: safeTypeToString(checker, baseType),
        });
      } else {
        const expanded = serializeTypeExpanded(baseType, deepWithVisiting);
        if (expanded.properties) {
          Object.assign(internalBaseProps, expanded.properties);
        }
        if (expanded.extends) {
          externalExtends.push(...expanded.extends);
        }
      }
    }

    // Only include OWN properties — not inherited from any base type
    const properties: Record<string, any> = { ...internalBaseProps };
    for (const prop of allProps) {
      const propName = prop.getName();

      if (shouldSkipProperty(propName)) continue;
      if (inheritedPropNames.has(propName) && !isOwnProperty(prop, symbol)) continue;

      const propDecl = prop.getDeclarations()?.[0];
      if (!propDecl) continue;
      if (isExternalDeclaration(propDecl)) continue;

      const modifiers = ts.getCombinedModifierFlags(propDecl as ts.Declaration);
      if (modifiers & ts.ModifierFlags.Private || modifiers & ts.ModifierFlags.Protected) continue;

      const propType = checker.getTypeOfSymbol(prop);
      const isOptional = !!(prop.flags & ts.SymbolFlags.Optional);
      const defaultVal = getJsDocDefault(prop);

      properties[propName] = {
        type: "property",
        name: propName,
        value: serializeType(propType, deepWithVisiting),
        optional: isOptional,
        default: defaultVal,
        access: "public",
      };
    }

    return {
      type: "interface",
      name: symbol.getName(),
      properties,
      extends: externalExtends,
      typeParameters: [],
    };
  }

  // For intersections, try to merge properties from all branches
  if (resolved.isIntersection?.() || type.isIntersection?.()) {
    const interType = (resolved.isIntersection?.() ? resolved : type) as ts.IntersectionType;
    const allMergedProps: Record<string, any> = {};
    const externalExtends: any[] = [];

    for (const member of interType.types) {
      const memberSym = member.getSymbol();
      if (memberSym && isExternalSymbol(memberSym, checker)) {
        externalExtends.push({
          type: "identifier",
          name: safeTypeToString(checker, member),
        });
        continue;
      }
      const expanded = serializeTypeExpanded(member, deep);
      if (expanded.type === "interface" && expanded.properties) {
        Object.assign(allMergedProps, expanded.properties);
        if (expanded.extends) {
          externalExtends.push(...expanded.extends);
        }
      } else if (expanded.type === "identifier") {
        externalExtends.push(expanded);
      }
    }

    if (Object.keys(allMergedProps).length > 0 || externalExtends.length > 0) {
      return {
        type: "interface",
        name: symbol?.getName() ?? "__type",
        properties: allMergedProps,
        extends: externalExtends,
        typeParameters: [],
      };
    }
  }

  return serializeType(type, deep);
}

function serializeObjectLiteral(type: ts.Type, ctx: SerializeContext): any {
  const { checker } = ctx;
  const properties: Record<string, any> = {};

  for (const prop of type.getProperties()) {
    const propName = prop.getName();
    if (shouldSkipProperty(propName)) continue;

    const propType = checker.getTypeOfSymbol(prop);
    const isOptional = !!(prop.flags & ts.SymbolFlags.Optional);
    const defaultVal = getJsDocDefault(prop);

    properties[prop.getName()] = {
      type: "property",
      name: prop.getName(),
      value: serializeType(propType, ctx),
      optional: isOptional,
      default: defaultVal,
      access: "public",
    };
  }

  // Check for call signatures
  const callSigs = type.getCallSignatures();
  if (callSigs.length > 0 && Object.keys(properties).length === 0) {
    return serializeFunctionSig(callSigs[0], ctx);
  }

  if (Object.keys(properties).length === 0) {
    return { type: "object", properties: null };
  }

  return { type: "object", properties };
}

function serializeFunctionSig(sig: ts.Signature, ctx: SerializeContext): any {
  const { checker } = ctx;
  const params = sig.getParameters().map((p) => {
    const pType = checker.getTypeOfSymbol(p);
    const pDecl = p.getDeclarations()?.[0];
    return {
      type: "parameter",
      name: p.getName(),
      value: serializeType(pType, ctx),
      optional: pDecl ? checker.isOptionalParameter(pDecl as ts.ParameterDeclaration) : false,
    };
  });
  const retType = checker.getReturnTypeOfSignature(sig);
  return {
    type: "function",
    parameters: params,
    return: serializeType(retType, ctx),
    typeParameters: serializeTypeParams(sig.typeParameters, ctx),
  };
}

function serializeTypeParams(
  typeParams: readonly ts.TypeParameter[] | undefined,
  ctx: SerializeContext
): any[] {
  if (!typeParams) return [];
  return typeParams.map((tp) => {
    const constraint = tp.getConstraint();
    const def = tp.getDefault();
    return {
      type: "typeParameter",
      name: tp.getSymbol()?.getName() ?? safeTypeToString(ctx.checker, tp),
      constraint: constraint && !(constraint.flags & ts.TypeFlags.Unknown)
        ? serializeType(constraint, ctx)
        : null,
      default: def ? serializeType(def, ctx) : null,
    };
  });
}

function serializeTypeParamsFromDecl(
  nodes: ts.NodeArray<ts.TypeParameterDeclaration> | undefined,
  ctx: SerializeContext
): any[] {
  if (!nodes) return [];
  const { checker } = ctx;
  return nodes.map((node) => {
    const symbol = checker.getSymbolAtLocation(node.name);
    const type = symbol ? checker.getDeclaredTypeOfSymbol(symbol) : undefined;
    const tp = type as ts.TypeParameter | undefined;
    const constraint = tp?.getConstraint();
    const def = tp?.getDefault();
    return {
      type: "typeParameter",
      name: node.name.text,
      constraint: constraint && !(constraint.flags & ts.TypeFlags.Unknown)
        ? serializeType(constraint, ctx)
        : null,
      default: def ? serializeType(def, ctx) : null,
    };
  });
}

// ---------------------------------------------------------------------------
// JSDoc @default extraction
// ---------------------------------------------------------------------------

function getJsDocDefault(symbol: ts.Symbol): string | null {
  const decls = symbol.getDeclarations();
  if (!decls) return null;
  for (const decl of decls) {
    const jsdocTags = ts.getJSDocTags(decl);
    for (const tag of jsdocTags) {
      if (tag.tagName.text === "default") {
        const text = ts.getTextOfJSDocComment(tag.comment);
        if (text) return text;
      }
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

/**
 * Validate a serialized export for common issues.
 */
function validateExport(pkgName: string, exportName: string, result: any, depth = 0): void {
  if (!result || typeof result !== 'object' || depth > 5) return;

  // Check for numeric keys in properties
  if (result.properties && typeof result.properties === 'object') {
    const keys = Object.keys(result.properties);
    const numericKeys = keys.filter(k => /^\d+$/.test(k));
    if (numericKeys.length > 0) {
      console.warn(`  ⚠ NUMERIC KEYS in ${pkgName}:${exportName} (result.type=${result.type}): [${numericKeys.slice(0, 3).join(', ')}]`);
      console.warn(`    Full output: ${JSON.stringify(result).slice(0, 500)}`);
    }
  }

  // Check props for components
  if (result.type === 'component' && result.props) {
    validateExport(pkgName, exportName + '.props', result.props, depth + 1);
  }

  // Check value for aliases
  if (result.type === 'alias' && result.value) {
    validateExport(pkgName, exportName + '.value', result.value, depth + 1);
  }
}

function main() {
  initDiagLog();
  const allPackages = discoverPackages(args.packagesDir);
  // Only process our packages, not transitive dependencies
  const packages = allPackages.filter((p) => isOurPackage(p.name));
  if (packages.length === 0) {
    console.error(`No react-spectrum packages with type entry points found in ${args.packagesDir}`);
    console.error(`(found ${allPackages.length} total packages, but none matched our scopes)`);
    process.exit(1);
  }

  console.log(`Found ${packages.length} packages to extract (${allPackages.length} total in directory)`);

  // Find node_modules/@types directories for type resolution
  // Walk up from packagesDir to find node_modules
  const typeRoots: string[] = [];
  let searchDir = path.resolve(args.packagesDir);
  for (let i = 0; i < 5; i++) {
    const candidate = path.join(searchDir, "@types");
    if (fs.existsSync(candidate)) {
      typeRoots.push(candidate);
      console.log(`  Found typeRoots: ${candidate}`);
    }
    const nmCandidate = path.join(searchDir, "node_modules", "@types");
    if (fs.existsSync(nmCandidate)) {
      typeRoots.push(nmCandidate);
      console.log(`  Found typeRoots: ${nmCandidate}`);
    }
    const parent = path.dirname(searchDir);
    if (parent === searchDir) break;
    searchDir = parent;
  }

  const entryFiles = packages.map((p) => p.typesEntryPoint);
  const compilerOptions: ts.CompilerOptions = {
    target: ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Node10,
    declaration: true,
    strict: false,
    skipLibCheck: true,
    noEmit: true,
    jsx: ts.JsxEmit.ReactJSX,
    ...(typeRoots.length > 0 ? { typeRoots } : {}),
  };
  const program = ts.createProgram(entryFiles, compilerOptions);
  const checker = program.getTypeChecker();

  // Diagnostic: check if React types are resolved
  const reactCheck = ts.resolveModuleName("react", entryFiles[0], compilerOptions, ts.sys);
  if (reactCheck.resolvedModule) {
    console.log(`  React types resolved: ${reactCheck.resolvedModule.resolvedFileName}`);
  } else {
    console.warn("  WARNING: Could not resolve 'react' module — component types may resolve to 'any'");
    console.warn("  Ensure @types/react is installed in node_modules");
  }

  for (const pkg of packages) {
    if (pkg.isPrivate) {
      if (args.verbose) console.log(`  skip private: ${pkg.name}`);
      continue;
    }

    const sourceFile = program.getSourceFile(pkg.typesEntryPoint);
    if (!sourceFile) {
      console.warn(`  could not load source file for ${pkg.name}: ${pkg.typesEntryPoint}`);
      continue;
    }

    const moduleSymbol = checker.getSymbolAtLocation(sourceFile);
    if (!moduleSymbol) {
      console.warn(`  no module symbol for ${pkg.name}`);
      continue;
    }

    const exports = checker.getExportsOfModule(moduleSymbol);
    const ctx = makeCtx(checker);
    const apiExports: Record<string, any> = {};

    for (const exp of exports) {
      try {
        diag('EXPORT', `--- ${pkg.name}:${exp.getName()} ---`);
        const result = serializeSymbol(exp, ctx);
        apiExports[exp.getName()] = result;

        // Validate: check for numeric property keys (TS internal IDs leaking)
        validateExport(pkg.name, exp.getName(), result);
      } catch (err: any) {
        if (args.verbose) {
          console.warn(`  error serializing ${pkg.name}:${exp.getName()}: ${err.message}`);
          console.warn(`    stack: ${err.stack?.split('\n').slice(0, 3).join('\n    ')}`);
        }
        apiExports[exp.getName()] = { type: "any" };
      }
    }

    const apiJson = { exports: apiExports, links: ctx.links };

    // Summary of problematic exports
    const anyCount = Object.values(apiExports).filter((v: any) => v?.type === 'any').length;
    if (anyCount > 0) {
      console.warn(`  ⚠ ${pkg.name}: ${anyCount}/${Object.keys(apiExports).length} exports resolved to 'any'`);
    }
    const outputBase = args.outputDir
      ? path.join(args.outputDir, pkg.name)
      : pkg.dir;
    const outputPath = path.join(outputBase, "dist", "api.json");
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(apiJson, null, 2));

    // Also ensure package.json exists in output dir (for compareAPIs to read the name)
    const outPkgJson = path.join(outputBase, "package.json");
    if (!fs.existsSync(outPkgJson)) {
      fs.writeFileSync(outPkgJson, JSON.stringify({ name: pkg.name }, null, 2));
    }

    if (args.verbose) {
      console.log(`  ${pkg.name}: ${Object.keys(apiExports).length} exports → ${outputPath}`);
    } else {
      console.log(`  ✓ ${pkg.name}`);
    }
  }

  closeDiagLog();
}

main();
