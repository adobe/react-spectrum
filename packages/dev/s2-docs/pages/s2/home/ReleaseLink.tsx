'use client';

import { style } from "@react-spectrum/s2/style" with {type: 'macro'};
import { BaseLink } from "@react-spectrum/s2-docs/src/Link";
import { StatusLight, pressScale } from "@react-spectrum/s2";
import { useRef } from "react";

export function ReleaseLink() {
  let ref = useRef(null);
  return (
    <BaseLink
      href="releases/v1-0-0"
      ref={ref}
      style={pressScale(ref, {backdropFilter: 'blur(20px)'})}
      className={style({
        backgroundColor: 'black/45',
        boxShadow: 'elevated',
        borderRadius: 'full',
        padding: 16,
        paddingX: 24,
        marginStart: {
          default: 0,
          sm: -24
        },
        marginBottom: 32,
        position: 'relative',
        overflow: 'clip',
        display: 'flex',
        flexDirection: 'row',
        columnGap: 8,
        alignItems: 'center',
        outlineStyle: 'solid',
        outlineColor: 'transparent-white-100',
        outlineWidth: 1,
        width: 'fit',
        color: 'neutral',
        colorScheme: 'dark',
        transition: 'default',
        textDecoration: {
          default: 'none',
          isHovered: 'underline'
        }
      })}>
      <StatusLight variant="positive" size="XL">Spectrum 2 is now stable!</StatusLight>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10" fill="currentColor" aria-hidden="true" aria-label="" width="16" height="16">
        <path d="M9.26 4.406 6.528 1.672A.84.84 0 0 0 5.34 2.859l1.3 1.301H1.396a.84.84 0 0 0 0 1.68H6.64l-1.301 1.3a.84.84 0 0 0 1.188 1.188l2.734-2.734a.84.84 0 0 0 0-1.188z" />
      </svg>
    </BaseLink>
  );
}
