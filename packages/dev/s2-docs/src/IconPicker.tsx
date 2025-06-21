'use client';

import {ActionButton, Popover, pressScale, SearchField} from '@react-spectrum/s2';
import {Autocomplete, GridLayout, Label, ListBox, ListBoxItem, Select, SelectValue, Size, useFilter, Virtualizer} from 'react-aria-components';
import {createElement, ReactNode, useRef, useState} from 'react';
import {focusRing, style} from '@react-spectrum/s2/style' with {type: 'macro'};
// eslint-disable-next-line
import icons from '/packages/@react-spectrum/s2/s2wf-icons/*.svg';
import {PressResponder} from '@react-aria/interactions';
import {useGlobalListeners} from '@react-aria/utils';

const iconList = Object.keys(icons).map(name => ({id: name.replace(/^S2_Icon_(.*?)(Size\d+)?_2.*/, '$1'), icon: icons[name].default}));
const iconMap = Object.fromEntries(iconList.map(item => [item.id, item.icon]));

const itemStyle = style({
  ...focusRing(),
  size: 'full',
  backgroundColor: {
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
  borderRadius: 'default',
  transition: 'default',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
});

type IconValue = string | {text?: string, icon?: string | null, iconJSX?: ReactNode} | null;
interface IconPickerProps {
  value: IconValue,
  onChange: (value: IconValue) => void,
  label?: string,
  contextualHelp?: ReactNode
}

export function IconPicker({value, onChange, label, contextualHelp}: IconPickerProps) {
  let {contains} = useFilter({sensitivity: 'base'});

  // For mouse interactions, pickers open on press start. When the popover underlay appears
  // it covers the trigger button, causing onPressEnd to fire immediately and no press scaling
  // to occur. We override this by listening for pointerup on the document ourselves.
  let [isPressed, setPressed] = useState(false);
  let {addGlobalListener} = useGlobalListeners();
  let onPressStart = (e) => {
    if (e.pointerType !== 'mouse') {
      return;
    }
    setPressed(true);
    addGlobalListener(document, 'pointerup', () => {
      setPressed(false);
    }, {once: true, capture: true});
  };

  let valueObject: IconValue = typeof value === 'string' ? {text: value} : value;

  return (
    <Select
      aria-label="Icon"
      selectedKey={valueObject?.icon ?? null}
      onSelectionChange={icon => {
        if (!icon || icon === valueObject?.icon) {
          onChange({...valueObject, icon: null, iconJSX: null});
        } else if (icon) {
          onChange({...valueObject, icon: icon as string, iconJSX: createElement(iconMap[icon])});
        }
      }}
      className={style({display: 'flex', flexDirection: 'column', gap: 2, width: 'fit'})}>
      {label && <div>
        <Label className={style({font: 'ui', color: 'neutral-subdued'})}>
          {label}
        </Label>
        {contextualHelp && <>&nbsp;<div style={{display: 'inline-flex'}}>{contextualHelp}</div></>}
      </div>}
      <PressResponder onPressStart={onPressStart} isPressed={isPressed}>
        <ActionButton
          // @ts-ignore
          isPressed={false}>
          <SelectValue<typeof iconList[0]> className={style({display: 'contents'})}>
            {({isPlaceholder, selectedItem}) => (
              isPlaceholder ? 'No icon' : (<>
                {createElement(selectedItem?.icon, {'aria-label': selectedItem?.id})}
              </>)
            )}
          </SelectValue>
        </ActionButton>
      </PressResponder>
      <Popover hideArrow>
        <Autocomplete filter={contains}>
          <div className={style({display: 'flex', flexDirection: 'column', gap: 8})}>
            <SearchField autoFocus />
            <Virtualizer layout={GridLayout} layoutOptions={{minItemSize: new Size(32, 32), maxItemSize: new Size(32, 32), minSpace: new Size(4, 4), preserveAspectRatio: true}}>
              <ListBox items={iconList} layout="grid" className={style({height: 300, width: 300, maxHeight: '100%', overflow: 'auto', scrollPaddingY: 4})}>
                {item => <IconItem item={item} />}
              </ListBox>
            </Virtualizer>
          </div>
        </Autocomplete>
      </Popover>
    </Select>
  );
}

function IconItem({item}) {
  let Icon = item.icon;
  let ref = useRef(null);
  return (
    <ListBoxItem id={item.id} value={item} textValue={item.id} className={itemStyle} ref={ref} style={pressScale(ref)}>
      <Icon />
    </ListBoxItem>
  );
}
