"use client";

import type {PageProps} from '../types';
import React, { useRef } from 'react';
import { Link } from 'react-aria-components';
import { style, size, focusRing } from '@react-spectrum/s2/style' with {type: 'macro'};
import {pressScale} from '@react-spectrum/s2'
// import { centerPadding } from '@react-spectrum/s2/src/style-utils' with {type: 'macro'};

export function Nav({pages, currentPage}: PageProps) {
  return (
    <nav>
      <ul className={style({
        listStyleType: 'none',
        padding: 0,
        margin: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        minWidth: 160,
        width: 192,
        maxWidth: 240
      })}>
        <div className={style({font: 'ui-sm', color: 'gray-600', minHeight: 32, paddingX: 12, display: 'flex', alignItems: 'center'})}>Title</div>
        {pages.map(page => (
          <SideNavItem key={page.url} href={page.url} isSelected={page.url === currentPage.url}>{page.name.replace('.html', '')}</SideNavItem>
        ))}
      </ul>
    </nav>
  );
}

function SideNavItem(props) {
  let linkRef = useRef(null);
  return (
    <li>
      <Link
        {...props}
        ref={linkRef}
        aria-current={props.isSelected ? 'page' : undefined}
        style={pressScale(linkRef)}
        className={style({
          ...focusRing(),
          minHeight: 32,
          boxSizing: 'border-box',
          paddingX: 4,
          // paddingY: centerPadding(),
          display: 'flex',
          alignItems: 'center',
          gap: size(6),
          font: 'ui',
          fontWeight: {
            default: 'normal',
            isCurrent: 'bold'
          },
          textDecoration: 'none',
          borderRadius: 'default',
          transition: 'default'
        })}>
        {({isHovered}) => (<>
          <span className={style({
            width: 2,
            height: '[1lh]',
            borderRadius: 'full',
            transition: 'default',
            backgroundColor: {
              default: 'transparent',
              isHovered: 'gray-400',
              isSelected: 'gray-800'
            }
          })({isHovered, isSelected: props.isSelected})} />
          {props.children}
        </>)}
      </Link>
    </li>
  );
}
