'use client';

import {createContext, useEffect, useState} from 'react';
import {Key} from 'react-aria-components';
import {SegmentedControl, SegmentedControlItem} from '@react-spectrum/s2';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};

const exampleStyle = style({
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

export const ExampleSwitcherContext = createContext<Key | null>(null);

const DEFAULT_EXAMPLES = ['Vanilla CSS', 'Tailwind'] as Key[];

export function ExampleSwitcher({type = 'style', examples = DEFAULT_EXAMPLES, children}) {
  let [selected, setSelected] = useState<Key>(examples[0]);

  useEffect(() => {
    if (!type) {
      return;
    }

    let search = new URLSearchParams(location.search);
    let exampleType = search.get(type) ?? localStorage.getItem(type);
    if (exampleType && examples.includes(exampleType)) {
      setSelected(exampleType);
    }

    let controller = new AbortController();
    window.addEventListener('storage', e => {
      if (e.key === type && e.newValue && examples.includes(e.newValue)) {
        setSelected(e.newValue);
      }
    }, {signal: controller.signal});
    return () => controller.abort();
  }, [type, examples]);

  let onSelectionChange = key => {
    setSelected(key);
    
    if (type) {
      localStorage.setItem(type, key);
      window.dispatchEvent(new StorageEvent('storage', {
        key: type,
        oldValue: String(selected),
        newValue: String(key)
      }));
    }
  };

  return (
    <div className={exampleStyle} data-example-switcher>
      <SegmentedControl selectedKey={selected} onSelectionChange={onSelectionChange} styles={switcher}>
        {examples.map(example => <SegmentedControlItem key={example} id={example}>{example}</SegmentedControlItem>)}
      </SegmentedControl>
      <ExampleSwitcherContext.Provider value={selected}>
        {children[examples.indexOf(selected)]}
      </ExampleSwitcherContext.Provider>
    </div>
  );
}
