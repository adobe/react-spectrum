import fs from 'node:fs';

let data = fs.readFileSync('./package.json');
let pkg = JSON.parse(data);
pkg.resolutions['@types/react'] = 'npm:types-react@19.0.0-rc.0';
pkg.devDependencies['@types/react'] = 'npm:types-react@19.0.0-rc.0';
pkg.resolutions['@types/react-dom'] = 'npm:types-react-dom@19.0.0-rc.0';

let result =  JSON.stringify(pkg, false, 2);
fs.writeFileSync('./package.json', result);
