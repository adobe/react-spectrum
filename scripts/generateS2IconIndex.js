/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

const fs = require('fs');
const path = require('path');

// This script generates the "index" wrapper components for UI icons and illustrations that have multiple sizes.
generate('packages/@react-spectrum/s2/ui-icons');
generate('packages/@react-spectrum/s2/spectrum-illustrations/linear');
generate('packages/@react-spectrum/s2/spectrum-illustrations/gradient/generic1');
generate('packages/@react-spectrum/s2/spectrum-illustrations/gradient/generic2');

function generate(dir) {
  let icons = new Map();
  let sizes = {
    // illustration sizes
    48: 'S',
    96: 'M',
    160: 'L',
    // ui icon sizes
    50: 'XS',
    75: 'S',
    100: 'M',
    200: 'L',
    300: 'XL',
    400: 'XXL',
    500: 'XXXL',
    600: 'XXXXL'
  };

  for (let fileName of fs.readdirSync(dir)) {
    let file = path.join(dir, fileName);
    let ext = path.extname(file);
    if (ext === '.tsx') {
      fs.rmSync(file);
    } else if (ext === '.svg' && !file.includes('S2_MoveHorizontalTableWidget')) {
      let match = file.match(/S2_(?:lin|fill)_(.+?)_(?:generic\d_)?(\d+)\.svg/) || file.match(/S2_(.+)Size(\d+)\.svg/);
      if (!match) {
        throw new Error('Unexpected file ' + file);
      }
      let [, name, size] = match;
      name = name[0].toUpperCase() + name.slice(1).replace(/_/g, '');
      if (!icons.has(name)) {
        icons.set(name, {});
      }
      icons.get(name)[sizes[size]] = fileName;
    }
  }

  let relative = path.relative(dir, 'packages/@react-spectrum/s2/src/Icon');
  let typeImport = dir.includes('ui-icons') ? "import {SVGProps} from 'react';" : `import {IconProps, IllustrationContext} from '${relative}';`;
  let ctx = dir.includes('spectrum-illustrations') ? '[props] = useContextProps(props, null, IllustrationContext);\n  ' : '';
  let type = dir.includes('ui-icons') ? 'SVGProps<SVGSVGElement>' : 'IconProps';
  let isIllustration =  dir.includes('spectrum-illustrations');

  for (let [name, sizes] of icons) {
    let importName = name;
    if (/^[0-9]/.test(name)) {
      importName = '_' + name;
    }
    let src = `/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

`;

    let imports = [typeImport];
    for (let size in sizes) {
      imports.push(`import ${importName}_${size} from '${isIllustration ? 'illustration:' : ''}./${sizes[size]}';`);
    }
    if (ctx) {
      imports.push("import {useContextProps} from 'react-aria-components';");
    }
    src += imports.sort((a, b) => {
      let a1 = a[7] === '{' ? a.slice(8).toLowerCase() : a.slice(7).toLowerCase();
      let b1 = b[7] === '{' ? b.slice(8).toLowerCase() : b.slice(7).toLowerCase();
      return a1 < b1 ? -1 : 1;
    }).join('\n') + '\n';

    src += `
export default function ${importName}(props: ${type} & {size?: ${Object.keys(sizes).map(s => `'${s}'`).join(' | ')}}) {
  ${ctx}let {size = 'M', ...otherProps} = props;
  switch (size) {${Object.keys(sizes).map(size => `
    case '${size}':
      return <${importName}_${size} {...otherProps} />;`
    ).join('')}
  }
}
`;

    fs.writeFileSync(path.join(dir, name + '.tsx'), src);
  }
}
