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

    // Read the root package.json to get workspace patterns
    const rootPackageJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
    const workspacePatterns = rootPackageJson.workspaces || [];

    // Create releases object with all packages set to patch
    const releases = workspaces.reduce((acc, workspace) => {
      if (workspace.name) {
        // Only include packages that match the workspace patterns
        const location = workspace.location;
        if (workspacePatterns.some(pattern => {
          // For exact matches (no wildcards), do exact string comparison
          if (!pattern.includes('*')) {
            return location === pattern;
          }

          // For patterns with wildcards, convert to regex but exclude dev packages
          const regex = new RegExp('^' + pattern.replace(/\*/g, '[^/]+') + '$');
          const matches = regex.test(location) && !location.startsWith('packages/dev/');
          return matches;
        })) {
          acc[workspace.name] = 'patch';
        }
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
    console.log('Generated version.yml successfully');
  } catch (error) {
    console.error('Error generating version.yml:', error);
    process.exit(1);
  }
});
