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

import {generateIcons} from '@spectrum-icons/build-tools/generateIcons';
import path from 'path';

let exportNameRegex = /exports\.(?<name>.*?) = .*?;/;

function template(iconName) {
  let importName = iconName.replace('A4u', '');
  let iconRename = importName;
  if (/^[0-9]/.test(importName)) {
    iconRename = '_' + importName;
  }
  return (
`import {${iconName} as IconComponent} from '@adobe/react-spectrum-workflow-color/dist/${iconRename}';
import {Icon} from '@react-spectrum/icon';
import React from 'react';

export default function ${iconRename}(props) {
  return <Icon {...props}><IconComponent /></Icon>;
}
`
  );
}

generateIcons(path.dirname(require.resolve('@adobe/react-spectrum-workflow-color')), path.join(__dirname, '..', 'src'), exportNameRegex, template);
