'use client';

import {Autocomplete, GridLayout, ListBox, ListBoxItem, Size, useFilter, Virtualizer} from 'react-aria-components';
import {focusRing, iconStyle, style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {iconAliases} from './iconAliases.js';
// eslint-disable-next-line
import icons from '/packages/@react-spectrum/s2/s2wf-icons/*.svg';
import {pressScale, SearchField} from '@react-spectrum/s2';
import React, {useCallback, useRef} from 'react';

const iconList = Object.keys(icons).map(name => ({id: name.replace(/^S2_Icon_(.*?)(Size\d+)?_2.*/, '$1'), icon: icons[name].default}));

const itemStyle = style({
  ...focusRing(),
  size: 'full',
  backgroundColor: {
    default: 'gray-50',
    isHovered: 'gray-100',
    isFocused: 'gray-100',
    isSelected: 'neutral'
  },
  '--iconPrimary': {
    type: 'color',
    value: {
      default: 'neutral',
      isSelected: 'gray-25'
    }
  },
  font: 'ui-sm',
  borderRadius: 'default',
  transition: 'default',
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  alignItems: 'center',
  justifyContent: 'center'
});

export function IconCards() {
  let {contains} = useFilter({sensitivity: 'base'});
  let filter = useCallback((textValue, inputValue) => {
    // check if we're typing part of a category alias
    for (const alias of Object.keys(iconAliases)) {
      if (contains(alias, inputValue) && iconAliases[alias].includes(textValue)) {
        return true;
      }
    }
    // also compare for substrings in the icon's actual name
    return textValue != null && contains(textValue, inputValue);
  }, [contains]);
  return (
    <Autocomplete filter={filter}>
      <div className={style({display: 'flex', flexDirection: 'column', gap: 8})}>
        <SearchField size="L" />
        <Virtualizer layout={GridLayout} layoutOptions={{minItemSize: new Size(64, 64), maxItemSize: new Size(64, 64), minSpace: new Size(8, 8), preserveAspectRatio: true}}>
          <ListBox items={iconList} layout="grid" className={style({height: 360, width: '100%', maxHeight: '100%', overflow: 'auto', scrollPaddingY: 4})}>
            {item => <IconItem item={item} />}
          </ListBox>
        </Virtualizer>
      </div>
    </Autocomplete>
  );
}

function IconItem({item}) {
  let Icon = item.icon;
  let ref = useRef(null);
  return (
    <ListBoxItem id={item.id} value={item} textValue={item.id} className={itemStyle} ref={ref} style={pressScale(ref)}>
      {({isFocused}) => {
        return (
          <>
            <Icon styles={iconStyle({size: 'XL'})} />
            {isFocused && (
              <div
                className={style({
                  position: 'absolute',
                  bottom: 0,
                  left: '50%',
                  translateX: '-50%',
                  translateY: '20%',
                  padding: 4,
                  backgroundColor: 'elevated',
                  borderRadius: 'default',
                  boxShadow: 'elevated'
                })}>
                {item.id}
              </div>
            )}
          </>
        );
      }}
    </ListBoxItem>
  );
}
