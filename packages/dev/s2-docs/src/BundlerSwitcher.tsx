'use client';

import {Key} from 'react-aria-components';
import React, {Children, ReactElement, ReactNode, useEffect, useMemo, useState} from 'react';
import {SegmentedControl, SegmentedControlItem} from '@react-spectrum/s2';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};

type SwitcherKey = string;

const container = style({
  backgroundColor: 'layer-1',
  marginY: 20,
  borderRadius: 'xl',
  display: 'flex',
  flexDirection: 'column'
});

const switcher = style({
  marginTop: {
    default: 12,
    lg: 24
  },
  marginStart: {
    default: 12,
    lg: 24
  }
});

export interface BundlerSwitcherProps {
  children: ReactNode
}

export interface BundlerSwitcherItemProps {
  id: SwitcherKey,
  label: string,
  children: ReactNode
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function BundlerSwitcherItem(_props: BundlerSwitcherItemProps) {
  return null;
}

export function BundlerSwitcher({children}: BundlerSwitcherProps) {
  const storageKey = 'bundler';
  let items = useMemo(() => {
    let arr = Children.toArray(children) as ReactElement<BundlerSwitcherItemProps>[];
    return arr
      .filter(el => React.isValidElement(el))
      .map(el => ({
        id: el.props.id as SwitcherKey,
        label: el.props.label,
        content: el.props.children as ReactNode
      }));
  }, [children]);

  let initial = useMemo(() => {
    let stored: string | null = null;
    if (storageKey && typeof window !== 'undefined') {
      stored = localStorage.getItem(storageKey);
    }
    let storedValid = items.find(it => it.id === stored)?.id;
    if (storedValid) {return storedValid;}
    return items[0]?.id;
  }, [items, storageKey]);

  let [selected, setSelected] = useState<SwitcherKey | undefined>(initial);

  useEffect(() => {
    // Update selected if items change and current is no longer valid
    if (selected && !items.find(it => it.id === selected)) {
      setSelected(items[0]?.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  let onSelectionChange = (key: Key) => {
    let value = String(key) as SwitcherKey;
    setSelected(value);
    if (storageKey && typeof window !== 'undefined') {
      localStorage.setItem(storageKey, value);
    }
  };

  let active = items.find(it => it.id === selected) ?? items[0];

  return (
    <div className={container}>
      <SegmentedControl selectedKey={active?.id} onSelectionChange={onSelectionChange} styles={switcher}>
        {items.map(it => (
          <SegmentedControlItem key={it.id} id={it.id}>{it.label}</SegmentedControlItem>
        ))}
      </SegmentedControl>
      {active?.content}
    </div>
  );
}

export default BundlerSwitcher;
