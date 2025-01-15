
import fs from 'node:fs';

try {
  let content = fs.readFileSync('./package.json', 'utf8');
  let pkg = JSON.parse(content);
  pkg.resolutions['react'] = '^17.0.2';
  pkg.resolutions['react-dom'] = '^17.0.2';
  pkg.resolutions['@testing-library/dom'] = '8.20.1';
  fs.writeFileSync('./package.json', JSON.stringify(pkg, null, 2));
} catch (e) {
  console.error('Error:', e);
}

try {
  let content = fs.readFileSync('./packages/@react-aria/test-utils/package.json', 'utf8');
  let pkg = JSON.parse(content);
  pkg.peerDependencies['@testing-library/react'] = '^12';
  fs.writeFileSync('./packages/@react-aria/test-utils/package.json', JSON.stringify(pkg, null, 2));
} catch (e) {
  console.error('Error:', e);
}

try {
  let content = fs.readFileSync('./packages/@react-spectrum/test-utils/package.json', 'utf8');
  let pkg = JSON.parse(content);
  pkg.peerDependencies['@testing-library/react'] = '^12';
  fs.writeFileSync('./packages/@react-spectrum/test-utils/package.json', JSON.stringify(pkg, null, 2));
} catch (e) {
  console.error('Error:', e);
}

try {
  let content = fs.readFileSync('./packages/dev/test-utils/package.json', 'utf8');
  let pkg = JSON.parse(content);
  pkg.dependencies['@testing-library/react'] = '^12';
  fs.writeFileSync('./packages/dev/test-utils/package.json', JSON.stringify(pkg, null, 2));
} catch (e) {
  console.error('Error:', e);
}
