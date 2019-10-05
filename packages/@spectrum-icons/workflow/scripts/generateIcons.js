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
`import {${iconName} as IconComponent} from '@adobe/react-spectrum-workflow/dist/${importName}';
import {Icon} from '@react-spectrum/icon';
import React from 'react';

export default function ${iconRename}(props) {
  return <Icon {...props}><IconComponent /></Icon>;
}
`
  );
}

generateIcons(path.dirname(require.resolve('@adobe/react-spectrum-workflow')), path.join(__dirname, '..', 'src'), exportNameRegex, template);

