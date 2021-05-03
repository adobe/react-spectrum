import { getIllustrationProps, IllustrationProps } from "./utils";
import React from "react";

export default function NoSearchResults(props: IllustrationProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="99.039" height="94.342" {...getIllustrationProps(props)}>
      <g fill="none" strokeLinecap="round" strokeLinejoin="round" >
        <path d="M93.113 88.415a5.38 5.38 0 0 1-7.61 0L58.862 61.773a1.018 1.018 0 0 1 0-1.44l6.17-6.169a1.018 1.018 0 0 1 1.439 0l26.643 26.643a5.38 5.38 0 0 1 0 7.608z" strokeWidth="2.99955"/>
        <path strokeWidth="2" d="M59.969 59.838l-3.246-3.246M61.381 51.934l3.246 3.246M64.609 61.619l13.327 13.327" />
        <path strokeWidth="3" d="M13.311 47.447A28.87 28.87 0 1 0 36.589 1.5c-10.318 0-20.141 5.083-24.7 13.46M2.121 38.734l15.536-15.536M17.657 38.734L2.121 23.198" />
      </g>
    </svg>
  );
}
