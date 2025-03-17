#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read JSON from stdin
let workspaceData = '';
process.stdin.on('data', chunk => {
  workspaceData += chunk;
});

process.stdin.on('end', () => {
  try {
    // Parse each line as a separate JSON object
    const workspaces = workspaceData
      .trim()
      .split('\n')
      .map(line => JSON.parse(line));

    // Create releases object with all packages set to patch
    const releases = workspaces.reduce((acc, workspace) => {
      if (workspace.name) {
        const location = workspace.location;

        // Handle packages in packages/dev/ directory
        if (location.startsWith('packages/dev/')) {
          const packageName = location.split('/').pop();
          // Only include specific dev tools
          if (['optimize-locales-plugin', 'parcel-resolver-optimize-locales', 'codemods',
            'parcel-transformer-s2-icon', 's2-icon-builder', 'ts-plugin'].includes(packageName)) {
            acc[workspace.name] = 'patch';
          }
          return acc;
        }

        // Skip packages in examples directory
        if (location.includes('/examples/')) {
          return acc;
        }

        // Skip packages in docs directory
        if (location.startsWith('packages/docs/')) {
          return acc;
        }

        // Skip private packages
        const packageJsonPath = path.join(process.cwd(), location, 'package.json');
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        if (packageJson.private) {
          return acc;
        }

        acc[workspace.name] = 'patch';
      }
      return acc;
    }, {});

    // Convert to YAML format
    const yamlContent = `releases:
${Object.entries(releases).map(([name, version]) => `  "${name}": ${version}`).join('\n')}

undecided:
  - react-spectrum-monorepo
`;

    // Write to .yarn/versions/version.yml
    const versionsDir = path.join(process.cwd(), '.yarn', 'versions');
    if (!fs.existsSync(versionsDir)) {
      fs.mkdirSync(versionsDir, {recursive: true});
    }

    fs.writeFileSync(path.join(versionsDir, 'version.yml'), yamlContent);
    console.log('\nGenerated version.yml successfully');
    console.log(`Total packages included: ${Object.keys(releases).length}`);
  } catch (error) {
    console.error('Error generating version.yml:', error);
    process.exit(1);
  }
});
