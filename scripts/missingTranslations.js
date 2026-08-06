const glob = require('glob');
const fs = require('fs');

// Collect both top-level intl dirs and one level of named subdirs (e.g. intl/datepicker).
let dirs = [...glob.sync('packages/**/intl'), ...glob.sync('packages/**/intl/*/')].map(d =>
  d.endsWith('/') ? d.slice(0, -1) : d
);

for (let dir of dirs) {
  if (!fs.existsSync(`${dir}/en-US.json`)) {
    continue;
  }
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
