'use client';

import {baseColor, focusRing, style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {createStackBlitz} from './StackBlitz';
import type {DownloadFiles} from './CodeBlock';
import {Link, LinkRenderProps} from 'react-aria-components/Link';

const PLAYGROUND_EXAMPLE = `import {Button} from './Button';

export default function Example() {
  return <Button>Press me</Button>;
}
`;

interface PlaygroundLinkProps {
  files: DownloadFiles;
}

const link = style<LinkRenderProps>({
  ...focusRing(),
  borderRadius: 'sm',
  font: 'ui',
  color: {
    default: baseColor('neutral'),
    forcedColors: 'LinkText'
  },
  transition: 'default',
  textDecoration: 'underline',
  outlineColor: {
    default: 'focus-ring',
    forcedColors: 'Highlight'
  },
  cursor: 'pointer',
  width: 'fit',
  disableTapHighlight: true
});

export function PlaygroundLink({files}: PlaygroundLinkProps) {
  return (
    <Link
      className={link}
      onPress={() => {
        createStackBlitz(
          {...files.files, 'Example.tsx': {contents: PLAYGROUND_EXAMPLE}},
          files.deps,
          'vanilla',
          'Example'
        );
      }}>
      Start prototyping
    </Link>
  );
}
