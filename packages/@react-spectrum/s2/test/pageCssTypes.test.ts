import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  symlinkSync,
  writeFileSync
} from 'fs';
import {execFileSync} from 'child_process';
import os from 'os';
import path from 'path';

const REPO_ROOT = path.resolve(__dirname, '../../../..');
const PACKAGE_ROOT = path.resolve(__dirname, '..');
const TSC_PATH = path.join(REPO_ROOT, 'node_modules/typescript/bin/tsc');

test('page.css ships a declaration that supports strict side-effect imports', () => {
  const tempRoot = mkdtempSync(path.join(os.tmpdir(), 's2-page-css-types-'));

  try {
    const stagedPackage = path.join(tempRoot, 'packages/@react-spectrum/s2');
    mkdirSync(path.join(stagedPackage, 'src'), {recursive: true});
    copyFileSync(path.join(PACKAGE_ROOT, 'package.json'), path.join(stagedPackage, 'package.json'));
    copyFileSync(path.join(PACKAGE_ROOT, 'page.css'), path.join(stagedPackage, 'page.css'));
    copyFileSync(path.join(PACKAGE_ROOT, 'src/page.ts'), path.join(stagedPackage, 'src/page.ts'));

    execFileSync(
      process.execPath,
      [
        TSC_PATH,
        '--ignoreConfig',
        '--declaration',
        '--emitDeclarationOnly',
        '--rootDir',
        path.join(tempRoot, 'packages'),
        '--outDir',
        path.join(tempRoot, 'dist/types'),
        path.join(stagedPackage, 'src/page.ts')
      ],
      {cwd: tempRoot}
    );
    execFileSync(process.execPath, [path.join(REPO_ROOT, 'scripts/moveTypes.mjs')], {
      cwd: tempRoot
    });

    const packed = JSON.parse(
      execFileSync('npm', ['pack', '--ignore-scripts', '--pack-destination', tempRoot, '--json'], {
        cwd: stagedPackage,
        encoding: 'utf8'
      })
    )[0];
    const packedFiles = packed.files.map(file => file.path);
    expect(packedFiles).toContain('dist/types/src/page.d.ts');
    expect(packedFiles).toContain('page.css');

    const consumerRoot = path.join(tempRoot, 'consumer');
    const installedPackage = path.join(consumerRoot, 'node_modules/@react-spectrum/s2');
    mkdirSync(path.dirname(installedPackage), {recursive: true});
    symlinkSync(stagedPackage, installedPackage, process.platform === 'win32' ? 'junction' : 'dir');
    const fixture = path.join(consumerRoot, 'index.ts');
    writeFileSync(fixture, "import '@react-spectrum/s2/page.css';\n");

    expect(existsSync(path.join(installedPackage, 'dist/types/src/page.d.ts'))).toBe(true);
    execFileSync(
      process.execPath,
      [
        TSC_PATH,
        '--ignoreConfig',
        '--noEmit',
        '--skipLibCheck',
        '--moduleResolution',
        'bundler',
        '--module',
        'esnext',
        '--target',
        'esnext',
        '--noUncheckedSideEffectImports',
        fixture
      ],
      {cwd: consumerRoot}
    );
  } finally {
    rmSync(tempRoot, {recursive: true, force: true});
  }
});
