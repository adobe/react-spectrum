const {spawn} = require('child_process');

let args = [...process.argv.slice(2)];

// Skip v2 tests if it cannot be resolved
try {
  require.resolve('@react/react-spectrum/Button');
} catch (err) {
  console.log('Skipping v2 parity tests since it is not installed...');
  args.push('-t', '^((?!v2).)*$');
}

process.env.NODE_ICU_DATA = 'node_modules/full-icu';
let jest = spawn('jest', args, {
  stdio: 'inherit'
});

jest.on('close', (code) => {
  process.exit(code);
});
