import {
  addStoryEntries,
  buildStatsMap,
  isUserCode,
  type Module,
  normalize,
  rewriteStoryVirtuals,
  stripQueryParams,
  writeStats
} from '../helpers';
import fs from 'fs';
import os from 'os';
import path from 'path';

describe('stripQueryParams', () => {
  test('returns input unchanged when no query string', () => {
    expect(stripQueryParams('./src/Button.tsx')).toBe('./src/Button.tsx');
  });
  test('strips simple query string', () => {
    expect(stripQueryParams('./src/Button.tsx?v=1')).toBe('./src/Button.tsx');
  });
  test('strips query string with multiple params', () => {
    expect(stripQueryParams('./src/Button.tsx?v=1&t=2')).toBe('./src/Button.tsx');
  });
});

describe('normalize', () => {
  const root = '/repo';

  test('absolute path inside root → "./relative" POSIX form', () => {
    expect(normalize('/repo/src/Button.tsx', root)).toBe('./src/Button.tsx');
  });
  test('strips query params before normalizing', () => {
    expect(normalize('/repo/src/Button.tsx?v=42', root)).toBe('./src/Button.tsx');
  });
  test('Windows backslashes converted to forward slashes', () => {
    expect(normalize('/repo/src\\nested\\Button.tsx', root)).toMatch(
      /^\.\/src\/nested\/Button\.tsx$/
    );
  });
});

describe('isUserCode', () => {
  test('user source paths → true', () => {
    expect(isUserCode('./packages/foo/Button.tsx')).toBe(true);
  });
  test('node_modules paths → true (lockfile-bail prevention)', () => {
    expect(isUserCode('./node_modules/react/index.js')).toBe(true);
  });
  test('react/jsx-runtime → false (mirrors builder-vite filter)', () => {
    expect(isUserCode('./node_modules/react/jsx-runtime.js')).toBe(false);
  });
  test('bare @parcel/runtime-* → false', () => {
    expect(isUserCode('@parcel/runtime-js/foo.js')).toBe(false);
  });
  test('normalized node_modules @parcel/runtime-* → false', () => {
    expect(isUserCode('./node_modules/@parcel/runtime-js/lib/runtime-abc.js')).toBe(false);
  });
  test('virtual storybook-stories.js → true (it is the CSF-glob anchor)', () => {
    expect(isUserCode('./storybook-stories.js')).toBe(true);
  });
});

// Minimal stand-in satisfying the BundleGraph methods buildStatsMap uses.
// If Parcel ever renames these methods, this mock breaks first — and the test
// failure tells the maintainer where to look.
function makeMockGraph(opts: {
  assets: string[];
  edges?: [string, string][];
  asyncEdges?: [string, string][];
}) {
  const assetById = new Map<string, {id: string; filePath: string}>();
  for (const filePath of opts.assets) {
    assetById.set(filePath, {id: filePath, filePath});
  }
  const depsBySource = new Map<string, {id: string; target: string; isAsync?: boolean}[]>();
  for (const [src, dst] of opts.edges ?? []) {
    if (!depsBySource.has(src)) depsBySource.set(src, []);
    depsBySource.get(src)!.push({id: `${src}->${dst}`, target: dst});
  }
  for (const [src, dst] of opts.asyncEdges ?? []) {
    if (!depsBySource.has(src)) depsBySource.set(src, []);
    depsBySource.get(src)!.push({id: `${src}->${dst}`, target: dst, isAsync: true});
  }

  return {
    getBundles: () => [
      {
        traverseAssets: (visit: (a: any) => void) => {
          for (const a of assetById.values()) visit(a);
        }
      }
    ],
    getDependencies: (asset: {filePath: string}) => depsBySource.get(asset.filePath) ?? [],
    getResolvedAsset: (dep: {target: string; isAsync?: boolean}, _bundle: unknown) =>
      dep.isAsync ? null : (assetById.get(dep.target) ?? null),
    resolveAsyncDependency: (dep: {target: string; isAsync?: boolean}, _bundle: unknown) => {
      if (!dep.isAsync) return null;
      const target = assetById.get(dep.target);
      return target ? {type: 'asset', value: target} : null;
    },
    getAssetById: (id: string) => assetById.get(id)
  } as any;
}

describe('buildStatsMap', () => {
  const root = '';

  test('inverts a linear chain into reasons', () => {
    const g = makeMockGraph({
      assets: ['./Button.tsx', './Button.stories.tsx'],
      edges: [['./Button.stories.tsx', './Button.tsx']]
    });
    const m = buildStatsMap(g, root);
    expect(m.get('./Button.tsx')?.reasons).toEqual([{moduleName: './Button.stories.tsx'}]);
    expect(m.get('./Button.stories.tsx')?.reasons).toEqual([]);
  });

  test('accumulates reasons from multiple importers', () => {
    const g = makeMockGraph({
      assets: ['./shared.ts', './a.tsx', './b.tsx'],
      edges: [
        ['./a.tsx', './shared.ts'],
        ['./b.tsx', './shared.ts']
      ]
    });
    const m = buildStatsMap(g, root);
    const reasons = m
      .get('./shared.ts')!
      .reasons.map(r => r.moduleName)
      .sort();
    expect(reasons).toEqual(['./a.tsx', './b.tsx']);
  });

  test('dedupes repeated edges from the same importer', () => {
    const g = makeMockGraph({
      assets: ['./shared.ts', './a.tsx'],
      edges: [
        ['./a.tsx', './shared.ts'],
        ['./a.tsx', './shared.ts']
      ]
    });
    const m = buildStatsMap(g, root);
    expect(m.get('./shared.ts')!.reasons).toEqual([{moduleName: './a.tsx'}]);
  });

  test('skips filtered modules (react/jsx-runtime)', () => {
    const g = makeMockGraph({
      assets: ['./node_modules/react/jsx-runtime.js', './Button.tsx'],
      edges: [['./Button.tsx', './node_modules/react/jsx-runtime.js']]
    });
    const m = buildStatsMap(g, root);
    expect(m.has('./node_modules/react/jsx-runtime.js')).toBe(false);
    expect(m.has('./Button.tsx')).toBe(true);
  });

  test('leaf assets get a record with empty reasons', () => {
    const g = makeMockGraph({assets: ['./leaf.ts'], edges: []});
    const m = buildStatsMap(g, root);
    expect(m.get('./leaf.ts')).toEqual({id: './leaf.ts', name: './leaf.ts', reasons: []});
  });

  test('skips self-edges when two assets share a normalized name', () => {
    // Simulate Parcel emitting two Asset objects for the same source file
    // (different ids, same filePath): one with id='A', one with id='B'. The mock
    // graph indexes assets by filePath, so we use a single entry but add a
    // self-pointing edge to mimic the dep traversal landing on a sibling asset
    // that normalizes to the same name.
    const g = makeMockGraph({
      assets: ['./TagGroup.tsx'],
      edges: [['./TagGroup.tsx', './TagGroup.tsx']]
    });
    const m = buildStatsMap(g, root);
    expect(m.get('./TagGroup.tsx')!.reasons).toEqual([]);
  });

  test('resolves async deps past Parcel runtime wrappers to the target asset', () => {
    // Real Parcel: getResolvedAsset on an async dep returns the @parcel/runtime-js
    // wrapper, not the target. resolveAsyncDependency unwraps to the real asset.
    const g = makeMockGraph({
      assets: ['./entry.js', './Foo.stories.tsx'],
      asyncEdges: [['./entry.js', './Foo.stories.tsx']]
    });
    const m = buildStatsMap(g, root);
    expect(m.get('./Foo.stories.tsx')?.reasons).toEqual([{moduleName: './entry.js'}]);
  });
});

describe('rewriteStoryVirtuals', () => {
  const STORY_VIRTUAL = './packages/dev/storybook-builder-parcel/generated-entries/stories.js';
  const CANONICAL = './storybook-stories.js';

  test('renames a single stories.js virtual to the canonical name', () => {
    const m = new Map<string, Module>([
      [STORY_VIRTUAL, {id: STORY_VIRTUAL, name: STORY_VIRTUAL, reasons: []}]
    ]);
    rewriteStoryVirtuals(m);
    expect(m.has(STORY_VIRTUAL)).toBe(false);
    expect(m.get(CANONICAL)).toEqual({id: CANONICAL, name: CANONICAL, reasons: []});
  });

  test('rewrites any reason pointing at the old virtual', () => {
    const m = new Map<string, Module>([
      [STORY_VIRTUAL, {id: STORY_VIRTUAL, name: STORY_VIRTUAL, reasons: []}],
      [
        './Button.stories.tsx',
        {
          id: './Button.stories.tsx',
          name: './Button.stories.tsx',
          reasons: [{moduleName: STORY_VIRTUAL}]
        }
      ]
    ]);
    rewriteStoryVirtuals(m);
    expect(m.get('./Button.stories.tsx')!.reasons).toEqual([{moduleName: CANONICAL}]);
  });

  test('collapses multiple stories.js virtuals into one canonical entry', () => {
    const PATH_A = './a/storybook-builder-parcel/generated-entries/stories.js';
    const PATH_B = './b/storybook-builder-parcel/generated-entries/stories.js';
    const m = new Map<string, Module>([
      [PATH_A, {id: PATH_A, name: PATH_A, reasons: [{moduleName: './x.tsx'}]}],
      [PATH_B, {id: PATH_B, name: PATH_B, reasons: [{moduleName: './y.tsx'}]}]
    ]);
    rewriteStoryVirtuals(m);
    expect(m.size).toBe(1);
    const merged = m.get(CANONICAL)!;
    const moduleNames = merged.reasons.map(r => r.moduleName).sort();
    expect(moduleNames).toEqual(['./x.tsx', './y.tsx']);
  });

  test('leaves non-matching entries untouched', () => {
    const m = new Map<string, Module>([
      ['./Button.tsx', {id: './Button.tsx', name: './Button.tsx', reasons: []}]
    ]);
    rewriteStoryVirtuals(m);
    expect(m.has('./Button.tsx')).toBe(true);
    expect(m.has(CANONICAL)).toBe(false);
  });
});

const silentLogger = {info: () => {}};
// Minimal FileSystem stub: writeStats only calls .writeFile, so we adapt node's
// fs.promises.writeFile to match @parcel/types FileSystem's signature.
const nodeFS = {
  writeFile: (p: string, c: string | Buffer) => fs.promises.writeFile(p, c)
} as any;

describe('writeStats — validation', () => {
  test('throws when modules map is empty', async () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ts-empty-'));
    await expect(writeStats(tmp, new Map(), nodeFS, silentLogger)).rejects.toThrow(
      /empty modules array/
    );
  });

  test('throws when no module references ./storybook-stories.js', async () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ts-nocsf-'));
    const m = new Map<string, Module>([
      ['./Foo.tsx', {id: './Foo.tsx', name: './Foo.tsx', reasons: []}]
    ]);
    await expect(writeStats(tmp, m, nodeFS, silentLogger)).rejects.toThrow(
      /no module references \.\/storybook-stories\.js/
    );
  });
});

describe('writeStats — happy path', () => {
  test('writes preview-stats.json to distDir with expected shape', async () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ts-write-'));
    const m = new Map<string, Module>([
      [
        './storybook-stories.js',
        {
          id: './storybook-stories.js',
          name: './storybook-stories.js',
          reasons: [{moduleName: './preview-main.js'}]
        }
      ],
      [
        './Button.stories.tsx',
        {
          id: './Button.stories.tsx',
          name: './Button.stories.tsx',
          reasons: [{moduleName: './storybook-stories.js'}]
        }
      ]
    ]);

    let infoLog: string | undefined;
    const logger = {
      info: (m: {message: string}) => {
        infoLog = m.message;
      }
    };
    await writeStats(tmp, m, nodeFS, logger);

    const written = JSON.parse(fs.readFileSync(path.join(tmp, 'preview-stats.json'), 'utf8'));
    expect(Object.keys(written)).toEqual(['modules']);
    expect(written.modules).toHaveLength(2);
    // writeStats sorts modules by name, so use find() rather than asserting index.
    const storiesEntry = written.modules.find((mod: any) => mod.name === './storybook-stories.js');
    expect(storiesEntry).toEqual({
      id: './storybook-stories.js',
      name: './storybook-stories.js',
      reasons: [{moduleName: './preview-main.js'}]
    });
    expect(infoLog).toMatch(/wrote preview-stats\.json \(2 modules\)/);
  });
});

describe('addStoryEntries', () => {
  const CSF_GLOB = './parcel-csf-glob.js';
  const CANONICAL = './storybook-stories.js';

  test('rewrites the storybook-stories.js reason on a story file to the synthetic glob', () => {
    const m = new Map<string, Module>([
      [
        './Foo.stories.tsx',
        {
          id: './Foo.stories.tsx',
          name: './Foo.stories.tsx',
          reasons: [{moduleName: CANONICAL}]
        }
      ]
    ]);
    addStoryEntries(m);
    expect(m.get('./Foo.stories.tsx')!.reasons).toEqual([{moduleName: CSF_GLOB}]);
  });

  test('inserts the synthetic CSF-glob node with ./storybook-stories.js as its reason', () => {
    const m = new Map<string, Module>([
      [
        './Foo.stories.tsx',
        {
          id: './Foo.stories.tsx',
          name: './Foo.stories.tsx',
          reasons: [{moduleName: CANONICAL}]
        }
      ]
    ]);
    addStoryEntries(m);
    expect(m.get(CSF_GLOB)).toEqual({
      id: CSF_GLOB,
      name: CSF_GLOB,
      reasons: [{moduleName: CANONICAL}]
    });
  });

  test('preserves other reasons besides storybook-stories.js', () => {
    const m = new Map<string, Module>([
      [
        './Foo.stories.tsx',
        {
          id: './Foo.stories.tsx',
          name: './Foo.stories.tsx',
          reasons: [{moduleName: CANONICAL}, {moduleName: './docs.mdx'}]
        }
      ]
    ]);
    addStoryEntries(m);
    expect(m.get('./Foo.stories.tsx')!.reasons).toEqual([
      {moduleName: CSF_GLOB},
      {moduleName: './docs.mdx'}
    ]);
  });

  test('does nothing and skips synthetic node insertion when no story files match', () => {
    const m = new Map<string, Module>([
      ['./Button.tsx', {id: './Button.tsx', name: './Button.tsx', reasons: []}]
    ]);
    const tagged = addStoryEntries(m);
    expect(tagged).toBe(0);
    expect(m.get('./Button.tsx')!.reasons).toEqual([]);
    expect(m.has(CSF_GLOB)).toBe(false);
  });
});
