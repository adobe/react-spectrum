import {fileURLToPath} from 'url';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '../../../../');

const assetsDir = path.join(scriptDir, '../assets');

const sharedPageTools = (libraryLabel, toolPrefix) => [
  {
    name: `list_${toolPrefix}_pages`,
    description: `Returns a list of available pages in the ${libraryLabel} docs.`
  },
  {
    name: `get_${toolPrefix}_page_info`,
    description: 'Returns page description and list of sections for a given page.'
  },
  {
    name: `get_${toolPrefix}_page`,
    description: 'Returns the full markdown content for a page, or a specific section if provided.'
  }
];

const libraries = {
  s2: {
    packageDir: path.join(repoRoot, 'packages/dev/mcp/s2'),
    packageName: '@react-spectrum/mcp',
    outputDir: path.join(repoRoot, 'packages/dev/s2-docs/dist/s2'),
    outputFile: 'react-spectrum-s2.mcpb',
    serverEntryPoint: 'server/s2/src/index.js',
    displayName: 'React Spectrum (S2)',
    extensionName: 'react-spectrum-s2',
    description: "Build apps with Adobe's React Spectrum component library.",
    longDescription:
      'Provides tools for browsing the React Spectrum (S2) documentation, including listing and reading pages, searching for available icons and illustrations, and looking up available styling token values. Uses the React Spectrum documentation content available at https://react-spectrum.adobe.com.',
    homepage: 'https://react-spectrum.adobe.com/',
    documentation: 'https://react-spectrum.adobe.com/ai.html',
    iconSvg: path.join(assetsDir, 'rsp-favicon.svg'),
    keywords: ['react', 'react-spectrum', 'spectrum', 'adobe', 'design-system', 'components'],
    tools: [
      ...sharedPageTools('React Spectrum (S2)', 's2'),
      {
        name: 'search_s2_icons',
        description:
          'Searches the S2 workflow icon set by one or more terms; returns matching icon names.'
      },
      {
        name: 'search_s2_illustrations',
        description:
          'Searches the S2 illustrations set by one or more terms; returns matching illustration names.'
      },
      {
        name: 'get_style_macro_property_values',
        description:
          'Returns the allowed values for a given S2 style macro property (including expanded color/spacing value lists where applicable).'
      }
    ],
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
    description: 'Build accessible UI components with React Aria.',
    longDescription:
      'Provides tools for browsing the React Aria documentation. Uses the React Aria documentation content available at https://react-aria.adobe.com.',
    homepage: 'https://react-aria.adobe.com/',
    documentation: 'https://react-aria.adobe.com/ai.html',
    iconSvg: path.join(assetsDir, 'react-aria-favicon.svg'),
    keywords: [
      'react',
      'react-aria',
      'adobe',
      'accessibility',
      'aria',
      'design-system',
      'components'
    ],
    tools: sharedPageTools('React Aria', 'react_aria'),
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
 * Generate an MCPB bundle for a given library. This makes the MCP servers easier to install in
 * certain MCP clients like Claude Desktop. Reference: https://github.com/modelcontextprotocol/mcpb.
 */
async function generateBundle(libraryName, config) {
  const packageJsonPath = path.join(config.packageDir, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const stagingDir = path.join(config.outputDir, config.extensionName);

  fs.rmSync(stagingDir, {recursive: true, force: true});
  fs.mkdirSync(stagingDir, {recursive: true});

  for (const dir of config.srcDirs) {
    if (!fs.existsSync(dir.from)) {
      throw new Error(
        `Missing built MCP output at ${dir.from}. Build ${config.packageName} first.`
      );
    }
    copyDirectory(dir.from, path.join(stagingDir, dir.to));
  }

  const bundledPackages = new Set();
  for (const dependency of Object.keys(packageJson.dependencies || {})) {
    copyDependencyTree(dependency, path.join(stagingDir, 'node_modules'), bundledPackages);
  }

  // Convert SVG icon to 512x512 PNG for the bundle.
  const iconFile = 'icon.png';
  let svg = fs.readFileSync(config.iconSvg, 'utf8');
  // The React Aria favicon uses light-dark() CSS which sharp doesn't support.
  // Replace it with the dark-mode color so the icon works on any background.
  svg = svg.replace(/light-dark\([^,]+,\s*([^)]+)\)/, '$1');
  await sharp(Buffer.from(svg))
    .resize(448, 448, {fit: 'contain', background: {r: 0, g: 0, b: 0, alpha: 0}})
    .extend({top: 32, bottom: 32, left: 32, right: 32, background: {r: 0, g: 0, b: 0, alpha: 0}})
    .png()
    .toFile(path.join(stagingDir, iconFile));

  fs.writeFileSync(
    path.join(stagingDir, 'package.json'),
    JSON.stringify(
      {
        name: config.extensionName,
        version: packageJson.version,
        private: true,
        type: 'module'
      },
      null,
      2
    ) + '\n'
  );

  fs.writeFileSync(
    path.join(stagingDir, 'manifest.json'),
    JSON.stringify(
      {
        manifest_version: '0.3',
        name: config.extensionName,
        display_name: config.displayName,
        version: packageJson.version,
        description: config.description,
        long_description: config.longDescription,
        author: {
          name: 'Adobe',
          url: 'https://www.adobe.com'
        },
        repository: {
          type: 'git',
          url: 'https://github.com/adobe/react-spectrum'
        },
        homepage: config.homepage,
        documentation: config.documentation,
        support: 'https://github.com/adobe/react-spectrum/issues',
        icon: iconFile,
        license: 'Apache-2.0',
        keywords: config.keywords,
        privacy_policies: ['https://www.adobe.com/privacy/policy.html'],
        tools: config.tools,
        compatibility: {
          platforms: ['darwin', 'win32', 'linux'],
          runtimes: {
            node: '>=18'
          }
        },
        server: {
          type: 'node',
          entry_point: config.serverEntryPoint,
          mcp_config: {
            command: 'node',
            args: [`\${__dirname}/${config.serverEntryPoint}`]
          }
        }
      },
      null,
      2
    ) + '\n'
  );

  fs.copyFileSync(path.join(config.packageDir, 'README.md'), path.join(stagingDir, 'README.md'));
  fs.copyFileSync(path.join(repoRoot, 'LICENSE'), path.join(stagingDir, 'LICENSE'));

  const outputPath = path.join(config.outputDir, config.outputFile);
  console.log(`Bundle prepared at ${stagingDir}`);
  console.log('To validate and pack, run:');
  console.log(`  npx @anthropic-ai/mcpb validate ${stagingDir}`);
  console.log(`  npx @anthropic-ai/mcpb pack ${stagingDir} ${outputPath}`);
}

function copyDependencyTree(
  packageName,
  outputNodeModulesDir,
  bundledPackages,
  fromDir = repoRoot
) {
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

const targets = requestedLibraries.length > 0 ? requestedLibraries : Object.keys(libraries);

for (const name of targets) {
  if (!(name in libraries)) {
    throw new Error(
      `Unknown MCP bundle target '${name}'. Expected one of: ${Object.keys(libraries).join(', ')}`
    );
  }
}

for (const name of targets) {
  await generateBundle(name, libraries[name]);
}
