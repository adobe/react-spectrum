import {execFileSync} from 'child_process';
import {fileURLToPath} from 'url';
import fs from 'fs';
import os from 'os';
import path from 'path';
import sharp from 'sharp';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '../../../../');

const assetsDir = path.join(scriptDir, '../assets');

const libraries = {
  s2: {
    packageDir: path.join(repoRoot, 'packages/dev/mcp/s2'),
    packageName: '@react-spectrum/mcp',
    outputDir: path.join(repoRoot, 'packages/dev/s2-docs/dist/s2'),
    outputFile: 'react-spectrum-s2.mcpb',
    serverEntryPoint: 'server/s2/src/index.js',
    displayName: 'React Spectrum (S2)',
    extensionName: 'react-spectrum-s2',
    description: 'Browse the React Spectrum docs, icons, illustrations, and style macro values.',
    homepage: 'https://react-spectrum.adobe.com/ai.html',
    documentation: 'https://react-spectrum.adobe.com/ai.html',
    iconSvg: path.join(assetsDir, 'rsp-favicon.svg'),
    srcDirs: [
      {
        from: path.join(repoRoot, 'packages/dev/mcp/s2/dist/s2/src'),
        to: 'server/s2/src'
      },
      {
        from: path.join(repoRoot, 'packages/dev/mcp/s2/dist/shared/src'),
        to: 'server/shared/src'
      },
      {
        from: path.join(repoRoot, 'packages/dev/mcp/s2/dist/data'),
        to: 'server/data'
      }
    ]
  },
  'react-aria': {
    packageDir: path.join(repoRoot, 'packages/dev/mcp/react-aria'),
    packageName: '@react-aria/mcp',
    outputDir: path.join(repoRoot, 'packages/dev/s2-docs/dist/react-aria'),
    outputFile: 'react-aria.mcpb',
    serverEntryPoint: 'server/react-aria/src/index.js',
    displayName: 'React Aria',
    extensionName: 'react-aria',
    description: 'Browse the React Aria docs.',
    homepage: 'https://react-aria.adobe.com/ai.html',
    documentation: 'https://react-aria.adobe.com/ai.html',
    iconSvg: path.join(assetsDir, 'react-aria-favicon.svg'),
    srcDirs: [
      {
        from: path.join(repoRoot, 'packages/dev/mcp/react-aria/dist/react-aria/src'),
        to: 'server/react-aria/src'
      },
      {
        from: path.join(repoRoot, 'packages/dev/mcp/react-aria/dist/shared/src'),
        to: 'server/shared/src'
      }
    ]
  }
};

const requestedLibraries = process.argv.slice(2);

/**
 * Generate an MCPB bundle for a given library. This makes the MCP servers easier to install in certain MCP clients like Claude Desktop.
 * Reference: https://github.com/modelcontextprotocol/mcpb
 */
async function generateBundle(libraryName, config) {
  const packageJsonPath = path.join(config.packageDir, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), `rsp-${libraryName}-mcpb-`));

  try {
    for (const dir of config.srcDirs) {
      if (!fs.existsSync(dir.from)) {
        throw new Error(`Missing built MCP output at ${dir.from}. Build ${config.packageName} first.`);
      }
      copyDirectory(dir.from, path.join(tempDir, dir.to));
    }

    const bundledPackages = new Set();
    for (const dependency of Object.keys(packageJson.dependencies || {})) {
      copyDependencyTree(dependency, path.join(tempDir, 'node_modules'), bundledPackages);
    }

    // Convert SVG icon to 128x128 PNG for the bundle.
    const iconFile = 'icon.png';
    let svg = fs.readFileSync(config.iconSvg, 'utf8');
    // The React Aria favicon uses light-dark() CSS which sharp doesn't support.
    // Replace it with the dark-mode color so the icon works on any background.
    svg = svg.replace(/light-dark\([^,]+,\s*([^)]+)\)/, '$1');
    await sharp(Buffer.from(svg))
      .resize(112, 112, {fit: 'inside'})
      .extend({top: 8, bottom: 8, left: 8, right: 8, background: {r: 0, g: 0, b: 0, alpha: 0}})
      .png().toFile(path.join(tempDir, iconFile));

    fs.writeFileSync(path.join(tempDir, 'package.json'), JSON.stringify({
      name: config.extensionName,
      private: true,
      type: 'module'
    }, null, 2) + '\n');

    fs.writeFileSync(path.join(tempDir, 'manifest.json'), JSON.stringify({
      manifest_version: '0.3',
      name: config.extensionName,
      display_name: config.displayName,
      version: packageJson.version,
      description: config.description,
      author: {
        name: 'Adobe'
      },
      homepage: config.homepage,
      documentation: config.documentation,
      support: 'https://github.com/adobe/react-spectrum/issues',
      icon: iconFile,
      server: {
        type: 'node',
        entry_point: config.serverEntryPoint,
        mcp_config: {
          command: 'node',
          args: [`\${__dirname}/${config.serverEntryPoint}`]
        }
      }
    }, null, 2) + '\n');

    fs.mkdirSync(config.outputDir, {recursive: true});
    const outputPath = path.join(config.outputDir, config.outputFile);
    runMcpbCli(['validate', tempDir]);
    runMcpbCli(['pack', tempDir, outputPath]);

    const sizeKb = (fs.statSync(outputPath).size / 1024).toFixed(1);
    console.log(`Generated ${config.outputFile} (${sizeKb} kB)`);
  } finally {
    fs.rmSync(tempDir, {recursive: true, force: true});
  }
}

function copyDependencyTree(packageName, outputNodeModulesDir, bundledPackages, fromDir = repoRoot) {
  if (bundledPackages.has(packageName)) {
    return;
  }

  const packageDir = resolvePackageDir(packageName, fromDir);
  const packageJsonPath = path.join(packageDir, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  bundledPackages.add(packageName);

  copyDirectory(packageDir, path.join(outputNodeModulesDir, packageName));

  for (const dependency of Object.keys(packageJson.dependencies || {})) {
    copyDependencyTree(dependency, outputNodeModulesDir, bundledPackages, packageDir);
  }

  for (const dependency of Object.keys(packageJson.optionalDependencies || {})) {
    copyDependencyTree(dependency, outputNodeModulesDir, bundledPackages, packageDir);
  }
}

function resolvePackageDir(packageName, fromDir) {
  let currentDir = fromDir;
  const root = path.parse(currentDir).root;

  while (true) {
    const packageJsonPath = path.join(currentDir, 'node_modules', packageName, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      if (packageJson.name === packageName) {
        return path.dirname(packageJsonPath);
      }
    }

    if (currentDir === root) {
      break;
    }
    currentDir = path.dirname(currentDir);
  }

  throw new Error(`Could not resolve the package directory for ${packageName}`);
}

function copyDirectory(from, to) {
  fs.mkdirSync(path.dirname(to), {recursive: true});
  fs.cpSync(from, to, {
    recursive: true,
    dereference: true
  });
}

function runMcpbCli(args) {
  const mcpbPackageDir = resolvePackageDir('@anthropic-ai/mcpb', repoRoot);
  const cliPath = path.join(mcpbPackageDir, 'dist/cli/cli.js');
  if (!fs.existsSync(cliPath)) {
    throw new Error(`Could not find MCPB CLI at ${cliPath}`);
  }

  execFileSync(process.execPath, [cliPath, ...args], {
    cwd: repoRoot,
    stdio: 'inherit'
  });
}

const targets = requestedLibraries.length > 0 ? requestedLibraries : Object.keys(libraries);

for (const name of targets) {
  if (!(name in libraries)) {
    throw new Error(`Unknown MCP bundle target '${name}'. Expected one of: ${Object.keys(libraries).join(', ')}`);
  }
}

for (const name of targets) {
  await generateBundle(name, libraries[name]);
}
