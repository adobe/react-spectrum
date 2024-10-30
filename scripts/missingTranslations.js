const glob = require('glob');
const fs = require('fs');

for (let dir of glob.sync('packages/**/intl')) {
  let en = JSON.parse(fs.readFileSync(`${dir}/en-US.json`, 'utf8'));

  for (let file of glob.sync('*.json', {cwd: dir})) {
    let lang = JSON.parse(fs.readFileSync(`${dir}/${file}`, 'utf8'));
    let modified = false;
    for (let key in en) {
      if (!lang[key]) {
        lang[key] = en[key];
        modified = true;
      }
    }

    if (modified) {
      fs.writeFileSync(`${dir}/${file}`, JSON.stringify(lang, false, 2) + '\n');
    }
  }
}
