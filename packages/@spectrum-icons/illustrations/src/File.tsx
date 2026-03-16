import {Illustration, IllustrationPropsWithoutChildren} from '@react-spectrum/icon';
import React, {JSX} from 'react';

export default function File(props: IllustrationPropsWithoutChildren): JSX.Element {
  return (
    <Illustration {...props}>
      <svg viewBox="0 0 32 32" height="32" width="32">
        <path fill="var(--spectrum-global-color-gray-50)" d="M6 31.503a2.503 2.503 0 01-2.5-2.5v-26A2.503 2.503 0 016 .502h15.38a1.988 1.988 0 011.411.582l5.12 5.103a2.015 2.015 0 01.589 1.416v21.399a2.502 2.502 0 01-2.5 2.5z" />
        <path fill="var(--spectrum-global-color-gray-500)" d="M28.26 5.83L23.14.73A2.465 2.465 0 0021.38 0H6a3.009 3.009 0 00-3 3v26a3.002 3.002 0 003 3h20a3.002 3.002 0 003-3V7.6a2.515 2.515 0 00-.74-1.77zM22.5 1.5l5.02 5H23a.501.501 0 01-.5-.5zM28 29a2 2 0 01-2 2H6a2 2 0 01-2-2V3a2.006 2.006 0 012-2h15.38a.486.486 0 01.12.01V6A1.504 1.504 0 0023 7.5h4.99a.34.34 0 01.01.1z" />
      </svg>
    </Illustration>
  );
}
