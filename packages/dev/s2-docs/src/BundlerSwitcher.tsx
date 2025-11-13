'use client';

import {Key} from 'react-aria-components';
import React, {Children, ReactElement, ReactNode, useMemo} from 'react';
import {SegmentedControl, SegmentedControlItem} from '@react-spectrum/s2';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {useLocalStorage} from './useLocalStorage';

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

  let [bundler, setBundler] = useLocalStorage('bundler', items[0]?.id);
  let active = items.find(it => it.id === bundler) ?? items[0];

  let onSelectionChange = (key: Key) => {
    let value = String(key) as SwitcherKey;
    setBundler(value);
  };

  return (
    <div className={container}>
      <div className={style({overflowX: 'auto', width: 'auto', flexGrow: 1})}>
        <SegmentedControl selectedKey={active?.id} onSelectionChange={onSelectionChange} styles={switcher}>
          {items.map(it => (
            <SegmentedControlItem key={it.id} id={it.id}>{it.label}</SegmentedControlItem>
          ))}
        </SegmentedControl>
      </div>
      {active?.content}
    </div>
  );
}

export default BundlerSwitcher;
