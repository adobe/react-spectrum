import {generateIcons} from '@spectrum-icons/build-tools/generateIcons';
import * as path from 'path';

let displayNameRegex = /.*?\.displayName = '(?<name>.*?)';/;

function template(iconName) {
  return (
`import {${iconName} as IconComponent} from '@adobe/react-spectrum-ui/dist/${iconName}';
import {UIIcon} from '@react-spectrum/icon';
import React from 'react';

export default function ${iconName}(props) {
  return <UIIcon {...props}><IconComponent /></UIIcon>;
}
`
  );
}

generateIcons(path.dirname(require.resolve('@adobe/react-spectrum-ui')), path.join(__dirname, '..', 'src'), displayNameRegex, template);

