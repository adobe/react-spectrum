const {globSync} = require('glob');
const fs = require('fs');

for (let enPath of globSync('packages/**/intl/**/en-US.json')) {
  let dir = enPath.replace('/en-US.json', '');
  let en = JSON.parse(fs.readFileSync(enPath, 'utf8'));

  for (let file of globSync('*.json', {cwd: dir})) {
    if (file === 'en-US.json') {
      continue;
    }
    let lang = JSON.parse(fs.readFileSync(`${dir}/${file}`, 'utf8'));
    let missing = [];
    let modified = false;
    for (let key in en) {
      if (!lang[key]) {
        missing.push(key);
        lang[key] = en[key];
        modified = true;
      }
    }

    if (modified) {
      console.log(`\n${dir}/${file} — ${missing.length} missing key(s):`);
      for (let key of missing) {
        console.log(`  - ${key}`);
      }
      fs.writeFileSync(`${dir}/${file}`, JSON.stringify(lang, false, 2) + '\n');
    }
  }
}

console.log('\nDone.');
