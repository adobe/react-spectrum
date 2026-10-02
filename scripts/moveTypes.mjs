import fs from 'fs';
import path from 'path';

// Move the generated types into the package dist folders.
for (let file of fs.globSync('dist/types/**/*.d.ts')) {
  if (file.includes('@spectrum-icons') || file.includes('/dev/')) {
    continue;
  }

  let dest = file.replace(/dist\/types\/((?:@[^/]+\/[^/]+)|[^/]+)/, 'packages/$1/dist/types');
  let contents = fs.readFileSync(file, 'utf8');

  // TypeScript generates absolute paths that don't work when published to npm. Fix that.
  contents = contents.replace(/import\(['"]\/(packages\/.+?)['"]\)/g, (_, p) => {
    let relative = path.relative(
      path.dirname(dest),
      p.replace(/packages\/((?:@[^/]+\/[^/]+)|[^/]+)/, 'packages/$1/dist/types')
    );
    return `import("${relative}")`;
  });

  fs.mkdirSync(path.dirname(dest), {recursive: true});
  fs.writeFileSync(dest, contents);
}
