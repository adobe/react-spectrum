/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import fs from 'fs-extra';
import path from 'path';
import {compileSVG} from '@spectrum-icons/build-tools/compileSVG';

let dir = path.join(path.dirname(require.resolve('@adobe/spectrum-css-ccx-workflow-icons')), '18');

fs.ensureDirSync(path.join(__dirname, '..', 'src'));

for (let file of fs.readdirSync(dir)) {
  if (!file.endsWith('.svg')) {
    continue;
  }

  let componentName = path.basename(file, path.extname(file));
  if (/^[0-9]/.test(componentName)) {
    componentName = '_' + componentName;
  }

  let jsx = compileSVG(path.join(dir, file));
  let wrapper = `import {Icon, IconPropsWithoutChildren} from '@react-spectrum/icon';
import React, {JSX} from 'react';

${jsx}

export default function ${componentName}(props: IconPropsWithoutChildren): JSX.Element {
  return <Icon {...props}><IconComponent /></Icon>;
}
`;

  fs.writeFileSync(path.join(__dirname, '..', 'src', componentName + '.tsx'), wrapper);
}
