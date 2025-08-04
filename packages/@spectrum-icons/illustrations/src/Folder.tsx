import {Illustration, IllustrationPropsWithoutChildren} from '@react-spectrum/icon';
import React, {JSX} from 'react';

export default function File(props: IllustrationPropsWithoutChildren): JSX.Element {
  return (
    <Illustration {...props}>
      <svg viewBox="0 0 32 32" height="32" width="32">
        <path fill="var(--spectrum-global-color-gray-300)" d="M3 29.5C1.6 29.5.5 28.4.5 27V5C.5 3.6 1.6 2.5 3 2.5h10.1c.5 0 1 .2 1.4.6l3.1 3.1c.2.2.4.3.7.3H29c1.4 0 2.5 1.1 2.5 2.5v18c0 1.4-1.1 2.5-2.5 2.5H3z" />
        <path fill="var(--spectrum-global-color-gray-500)" d="M29 6H18.3c-.1 0-.2 0-.4-.2l-3.1-3.1c-.4-.4-1-.7-1.7-.7H3C1.3 2 0 3.3 0 5v22c0 1.6 1.3 3 3 3h26c1.7 0 3-1.4 3-3V9c0-1.7-1.3-3-3-3zm2 21c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V7h28c1.1 0 2 .9 2 2v18z" />
      </svg>
    </Illustration>
  );
}
