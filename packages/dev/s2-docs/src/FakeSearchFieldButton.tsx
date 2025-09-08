'use client';

import {Button, ButtonProps} from 'react-aria-components';
import {fontRelative, style} from '@react-spectrum/s2/style' with { type: 'macro' };
import React, {CSSProperties} from 'react';
import Search from '@react-spectrum/s2/icons/Search';

export interface FakeSearchFieldButtonProps extends Omit<ButtonProps, 'children' | 'className'> {
  onKeyDown: (e: React.KeyboardEvent<HTMLButtonElement>) => void,
  isSearchOpen: boolean,
  overlayId: string
}

export default function FakeSearchFieldButton({onPress, onKeyDown, isSearchOpen, overlayId, ...props}: FakeSearchFieldButtonProps) {
  return (
    <Button
      {...props}
      aria-label="Open search and menu"
      aria-expanded={isSearchOpen}
      aria-controls={isSearchOpen ? overlayId : undefined}
      onPress={onPress}
      onKeyDown={onKeyDown}
      className={({isHovered, isFocusVisible}) => style({
        height: 40,
        boxSizing: 'border-box',
        paddingX: 'edge-to-text',
        fontSize: 'ui-lg',
        borderRadius: 'full',
        borderWidth: 2,
        borderStyle: 'solid',
        transition: 'default',
        borderColor: {
          default: 'gray-300',
          isHovered: 'gray-400',
          isFocusVisible: 'gray-900'
        },
        backgroundColor: 'gray-25',
        color: 'neutral-subdued',
        cursor: 'text',
        width: '[500px]',
        display: 'flex',
        alignItems: 'center',
        gap: 'text-to-visual',
        outlineStyle: {
          default: 'none',
          isFocusVisible: 'solid'
        },
        outlineOffset: 2,
        outlineColor: {
          default: 'transparent',
          isFocusVisible: 'focus-ring'
        },
        outlineWidth: {
          default: 0,
          isFocusVisible: 2
        }
      })({isHovered, isFocusVisible})}
      style={{viewTransitionName: !isSearchOpen ? 'search-menu-search-field' : 'none'} as CSSProperties}>
      <Search
        UNSAFE_className={String(style({
          size: fontRelative(20),
          '--iconPrimary': {type: 'fill', value: 'currentColor'},
          flexShrink: 0
        }))} />
      <kbd
        className={style({
          marginStart: 'auto',
          font: 'detail',
          backgroundColor: 'layer-1',
          paddingY: 2,
          paddingX: 8,
          borderRadius: 'xl',
          borderWidth: 1,
          borderColor: 'gray-300',
          borderStyle: 'solid',
          pointerEvents: 'none',
          alignSelf: 'center'
        })}>⌘K</kbd>
    </Button>
  );
}
