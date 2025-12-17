import {createIcon} from '@react-spectrum/s2';
import {useId} from 'react';

export const NpmLogo = createIcon(props => {
  let maskId = useId();
  return (
    <svg {...props} viewBox="0 0 27.23 27.23" aria-hidden="true" height="22" fill="currentColor">
      <rect width="27.23" height="27.23" rx="2" mask={`url(#${maskId})`} />
      <mask id={maskId}>
        <rect width="27.23" height="27.23" rx="2" fill="white" />
        <polygon fill="black" points="5.8 21.75 13.66 21.75 13.67 9.98 17.59 9.98 17.58 21.76 21.51 21.76 21.52 6.06 5.82 6.04 5.8 21.75" />
      </mask>
    </svg>
  );
});
