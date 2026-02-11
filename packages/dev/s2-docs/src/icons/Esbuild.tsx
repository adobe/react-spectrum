'use client';

import {createIcon} from '@react-spectrum/s2';
import {useId} from 'react';

export default createIcon(props => {
  let mask = useId();
  return (
    <svg viewBox="0 0 200 200" {...props}>
      <mask id={mask} style={{maskType: 'luminance'}}>
        <rect width="100%" height="100%" fill="white" />
        <path
          d="M47.5 52.5L95 100l-47.5 47.5m60-95L155 100l-47.5 47.5"
          fill="none"
          stroke="black"
          strokeWidth="24" />
      </mask>
      <circle cx="100" cy="100" r="100" fill="var(--iconPrimary)" mask={`url(#${mask})`} />
    </svg>
  );
});
