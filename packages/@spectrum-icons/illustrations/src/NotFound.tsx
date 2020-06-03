import {getIllustrationProps, IllustrationProps} from './utils';
import React from 'react';

export default function Error404(props: IllustrationProps) {
  return (
    <svg width="135.321" height="87" {...getIllustrationProps(props)}>
      <g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10">
        <path d="M11.821 60.5v23a2.006 2.006 0 002 2h118a2.006 2.006 0 002-2v-80a2.006 2.006 0 00-2-2h-118a2.006 2.006 0 00-2 2v27" strokeWidth="3" />
        <path strokeWidth="2" d="M133.721 14h-122M29.721 8h-10" />
        <path strokeWidth="3" d="M2.121 55.1l19.3-19.2M21.421 55.1l-19.3-19.2" />
      </g>
    </svg>
  );
}
