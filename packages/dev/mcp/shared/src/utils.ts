import {dirname, join, parse} from 'path';
import {existsSync, readFileSync} from 'fs';
import {fileURLToPath} from 'url';

// Resolves the version from the nearest package.json above the CLI entry point.
export function readPackageVersion(entryUrl: string): string {
  let currentDir = dirname(fileURLToPath(entryUrl));
  const root = parse(currentDir).root;
  while (true) {
    const pkgPath = join(currentDir, 'package.json');
    if (existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
        if (typeof pkg.version === 'string' && pkg.version.length > 0) {
          return pkg.version;
        }
      } catch {
        // continue walking upward
      }
    }
    if (currentDir === root) {
      break;
    }
    currentDir = dirname(currentDir);
  }
  return '0.0.0';
}

export function errorToString(err: unknown): string {
  if (err && typeof err === 'object' && 'stack' in err && typeof (err as any).stack === 'string') {
    return (err as any).stack as string;
  }
  if (
    err &&
    typeof err === 'object' &&
    'message' in err &&
    typeof (err as any).message === 'string'
  ) {
    return (err as any).message as string;
  }
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

export function parseServerCliArgs(argv: string[]): {help: boolean; cwd?: string} {
  let help = false;
  let cwd: string | undefined;
  for (let i = 0; i < argv.length; i++) {
    const arg = (argv[i] || '').trim();
    if (arg === '--help' || arg === '-h' || arg === 'help') {
      help = true;
    } else if (arg === '--cwd' && argv[i + 1]) {
      cwd = argv[++i];
    } else if (arg.startsWith('--cwd=')) {
      cwd = arg.slice('--cwd='.length);
    }
  }
  return {help, cwd};
}
