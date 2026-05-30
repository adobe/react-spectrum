import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync
} from 'fs';
import os from 'os';
import path from 'path';
import {spawn, spawnSync} from 'child_process';

const REPO_ROOT = path.resolve(__dirname, '../../../../../..');
const CODEMODS_ROOT = path.join(REPO_ROOT, 'packages/dev/codemods');
const CODEMODS_DIST_DIR = path.join(CODEMODS_ROOT, 'dist');
const CODEMODS_TSCONFIG = path.join(CODEMODS_ROOT, 'tsconfig.json');
const CLI_PATH = path.join(CODEMODS_DIST_DIR, 'index.js');
const FIXTURES_ROOT = path.join(CODEMODS_ROOT, 'src/s1-to-s2/__testfixtures__/cli');
const PROMPT_TO_START = 'Press Enter to get started...';
const PROMPT_TO_UPGRADE = 'Press Enter to upgrade components...';

let tempDirs: string[] = [];

jest.setTimeout(60000);

function normalizeText(content: string) {
  return content.replace(/\r\n/g, '\n');
}

function normalizeFixtureRelativePath(relativePath: string) {
  return relativePath.replace(/package\.fixture\.json$/, 'package.json');
}

function listFiles(root: string, currentDir = root): string[] {
  return readdirSync(currentDir)
    .sort()
    .flatMap(entry => {
      let fullPath = path.join(currentDir, entry);
      let stats = statSync(fullPath);
      if (stats.isDirectory()) {
        return listFiles(root, fullPath);
      }

      let relativePath = path.relative(root, fullPath).split(path.sep).join('/');
      return [normalizeFixtureRelativePath(relativePath)];
    });
}

function expectProjectToMatchFixture(projectDir: string, fixtureName: string) {
  let expectedDir = path.join(FIXTURES_ROOT, fixtureName, 'output');
  let actualFiles = listFiles(projectDir);
  let expectedFiles = listFiles(expectedDir);

  expect(actualFiles).toEqual(expectedFiles);

  for (let relativePath of expectedFiles) {
    let actualContent = normalizeText(readFileSync(path.join(projectDir, relativePath), 'utf8'));
    let fixtureRelativePath = relativePath.replace(/package\.json$/, 'package.fixture.json');
    let expectedContent = normalizeText(
      readFileSync(path.join(expectedDir, fixtureRelativePath), 'utf8')
    );
    expect(actualContent).toBe(expectedContent);
  }
}

function copyFixtureProject(sourceDir: string, destinationDir: string) {
  mkdirSync(destinationDir, {recursive: true});

  for (let entry of readdirSync(sourceDir).sort()) {
    let sourcePath = path.join(sourceDir, entry);
    let destinationEntry = entry === 'package.fixture.json' ? 'package.json' : entry;
    let destinationPath = path.join(destinationDir, destinationEntry);
    let stats = statSync(sourcePath);

    if (stats.isDirectory()) {
      copyFixtureProject(sourcePath, destinationPath);
    } else {
      mkdirSync(path.dirname(destinationPath), {recursive: true});
      writeFileSync(destinationPath, readFileSync(sourcePath));
    }
  }
}

function createFakeYarn(tempRoot: string) {
  let fakeBinDir = path.join(tempRoot, 'fake-bin');
  let packageManagerLog = path.join(tempRoot, 'package-manager.log');

  mkdirSync(fakeBinDir, {recursive: true});
  writeFileSync(
    path.join(fakeBinDir, 'yarn'),
    '#!/bin/sh\nprintf "%s\\n" "$*" >> "$FAKE_PM_LOG"\nexit 0\n'
  );
  chmodSync(path.join(fakeBinDir, 'yarn'), 0o755);

  return {fakeBinDir, packageManagerLog};
}

async function runFixtureCLI(options: {
  fixtureName: string;
  args?: string[];
  interactive?: boolean;
}) {
  let {fixtureName, args = [], interactive = false} = options;

  let tempRoot = mkdtempSync(path.join(os.tmpdir(), 's1-to-s2-cli-'));
  tempDirs.push(tempRoot);

  let projectDir = path.join(tempRoot, 'project');
  copyFixtureProject(path.join(FIXTURES_ROOT, fixtureName, 'input'), projectDir);

  let {fakeBinDir, packageManagerLog} = createFakeYarn(tempRoot);
  let env = {
    ...process.env,
    FORCE_COLOR: '0',
    NODE_ENV: 'test',
    FAKE_PM_LOG: packageManagerLog,
    PATH: `${fakeBinDir}${path.delimiter}${process.env.PATH ?? ''}`
  };

  let child = spawn(process.execPath, [CLI_PATH, 's1-to-s2', '--path', 'src', ...args], {
    cwd: projectDir,
    env,
    stdio: ['pipe', 'pipe', 'pipe']
  });

  let stdout = '';
  let stderr = '';
  let startPromptHandled = false;
  let upgradePromptHandled = false;

  let maybeRespondToPrompt = () => {
    if (!interactive) {
      return;
    }

    if (!startPromptHandled && stdout.includes(PROMPT_TO_START)) {
      startPromptHandled = true;
      child.stdin.write('\n');
    }

    if (!upgradePromptHandled && stdout.includes(PROMPT_TO_UPGRADE)) {
      upgradePromptHandled = true;
      child.stdin.write('\n');
      child.stdin.end();
    }
  };

  child.stdout.on('data', chunk => {
    stdout += chunk.toString();
    maybeRespondToPrompt();
  });

  child.stderr.on('data', chunk => {
    stderr += chunk.toString();
  });

  if (!interactive) {
    child.stdin.end();
  }

  let exitCode = await new Promise<number>((resolve, reject) => {
    let timeout = setTimeout(() => {
      child.kill('SIGKILL');
      reject(new Error(`CLI test timed out for fixture ${fixtureName}.`));
    }, 15000);

    child.on('error', error => {
      clearTimeout(timeout);
      reject(error);
    });

    child.on('close', code => {
      clearTimeout(timeout);
      resolve(code ?? -1);
    });
  });

  let packageManagerCalls = existsSync(packageManagerLog)
    ? normalizeText(readFileSync(packageManagerLog, 'utf8')).trim().split('\n').filter(Boolean)
    : [];

  return {
    exitCode,
    stdout: normalizeText(stdout),
    stderr: normalizeText(stderr),
    projectDir,
    packageManagerCalls
  };
}

beforeAll(() => {
  rmSync(CODEMODS_DIST_DIR, {recursive: true, force: true});

  let buildResult = spawnSync(
    process.execPath,
    [require.resolve('typescript/bin/tsc'), '-p', CODEMODS_TSCONFIG],
    {
      cwd: REPO_ROOT,
      env: {
        ...process.env,
        FORCE_COLOR: '0'
      },
      encoding: 'utf8'
    }
  );

  if (buildResult.status !== 0) {
    throw new Error(
      'Failed to build @react-spectrum/codemods for CLI e2e tests.\n' +
        `${buildResult.stdout}\n${buildResult.stderr}`
    );
  }
});

afterEach(() => {
  for (let tempDir of tempDirs) {
    rmSync(tempDir, {recursive: true, force: true});
  }

  tempDirs = [];
});

test('runs the shipped assistant in agent mode', async () => {
  let result = await runFixtureCLI({
    fixtureName: 'full-project',
    args: ['--agent']
  });

  expect(result.exitCode).toBe(0);
  expect(result.stderr).toBe('');
  expect(result.stdout).toContain(
    'Running s1-to-s2 in agent mode (non-interactive, transform-only).'
  );
  expect(result.stdout).toContain('Upgrade complete!');
  expect(result.stdout).toContain('Next steps:');
  expect(result.stdout).not.toContain(PROMPT_TO_START);
  expect(result.stdout).not.toContain(PROMPT_TO_UPGRADE);
  expect(result.packageManagerCalls).toEqual([]);
  expectProjectToMatchFixture(result.projectDir, 'full-project');
});

test('respects --components in agent mode', async () => {
  let result = await runFixtureCLI({
    fixtureName: 'subset-project',
    args: ['--agent', '--components', 'Button']
  });

  expect(result.exitCode).toBe(0);
  expect(result.stderr).toBe('');
  expect(result.stdout).toContain(
    'Running s1-to-s2 in agent mode (non-interactive, transform-only).'
  );
  expect(result.stdout).toContain('Upgrade complete!');
  expect(result.stdout).not.toContain(PROMPT_TO_START);
  expect(result.stdout).not.toContain(PROMPT_TO_UPGRADE);
  expect(result.packageManagerCalls).toEqual([]);
  expectProjectToMatchFixture(result.projectDir, 'subset-project');
});

test('runs the interactive assistant flow against a real project fixture', async () => {
  let result = await runFixtureCLI({
    fixtureName: 'full-project',
    interactive: true
  });

  expect(result.exitCode).toBe(0);
  expect(result.stderr).toBe('');
  expect(result.stdout).toContain(
    'Welcome to the React Spectrum v3 to Spectrum 2 upgrade assistant!'
  );
  expect(result.stdout).toContain(PROMPT_TO_START);
  expect(result.stdout).toContain('Installing @react-spectrum/s2 using yarn...');
  expect(result.stdout).toContain('Successfully installed @react-spectrum/s2!');
  expect(result.stdout).toContain(
    'Parcel detected in package.json. Macros are supported by default in v2.12.0 and newer.'
  );
  expect(result.stdout).toContain(PROMPT_TO_UPGRADE);
  expect(result.stdout).toContain('Upgrade complete!');
  expect(result.stdout).toContain('Next steps:');
  expect(result.stdout).not.toContain('Running s1-to-s2 in agent mode');
  expect(result.packageManagerCalls).toEqual(['add @react-spectrum/s2@latest']);
  expectProjectToMatchFixture(result.projectDir, 'full-project');
});
