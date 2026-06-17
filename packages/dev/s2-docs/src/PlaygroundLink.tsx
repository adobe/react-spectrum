'use client';

import {createStackBlitz} from './StackBlitz';
import type {DownloadFiles} from './CodeBlock';
import {Link} from '@react-spectrum/s2';

const PLAYGROUND_EXAMPLE = `import {Button} from './Button';

export default function Example() {
  return <Button>Press me</Button>;
}
`;

interface PlaygroundLinkProps {
  files: DownloadFiles;
}

export function PlaygroundLink({files}: PlaygroundLinkProps) {
  return (
    <Link
      isStandalone
      variant="secondary"
      href="/#"
      UNSAFE_style={{width: 'fit-content'}}
      onClick={e => {
        e.preventDefault();
      }}
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
