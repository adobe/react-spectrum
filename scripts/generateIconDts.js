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

const glob = require('glob').sync;
const fs = require('fs');
const path = require('path');

// Generate types for each icon/illustration so TypeScript's import autocomplete works.
for (let file of glob('packages/@react-spectrum/s2/{icons,illustrations/**}/*.mjs')) {
  let relative = path.relative(path.dirname(file), 'packages/@react-spectrum/s2/dist/types').replaceAll('\\', '/');
  fs.writeFileSync(file.replace('.mjs', '.d.ts'), `import type {IconProps} from '${relative}';
import type {ReactNode} from 'react';

declare function Icon(props: IconProps): ReactNode;
export default Icon;
`);
}
