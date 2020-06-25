import {getIllustrationProps, IllustrationProps} from './utils';
import React from 'react';

export default function Error403(props: IllustrationProps) {
  return (
    <svg width="125" height="87" {...getIllustrationProps(props)}>
      <g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10">
        <path d="M1.5 83.5a2.006 2.006 0 002 2h118a2.006 2.006 0 002-2v-80a2.006 2.006 0 00-2-2H3.5a2.006 2.006 0 00-2 2z" strokeWidth="3" />
        <path strokeWidth="2" d="M123.4 14H1.4M19.4 8h-10" />
        <path d="M46.5 69.5h30a2.006 2.006 0 002-2v-22a2.006 2.006 0 00-2-2h-30a2.006 2.006 0 00-2 2v22a2.006 2.006 0 002 2zM71.5 43.5v-7.2A10.238 10.238 0 0063 26.1 10.014 10.014 0 0051.5 36v6.5" strokeWidth="3" />
      </g>
    </svg>
  );
}
