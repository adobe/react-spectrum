'use client';

import {createContext, useEffect, useState} from 'react';
import {Key} from 'react-aria-components';
import {SegmentedControl, SegmentedControlItem} from '@react-spectrum/s2';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};

const exampleStyle = style({
  backgroundColor: 'layer-1',
  marginTop: 20,
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

export function ExampleSwitcher({examples = ['Vanilla CSS', 'Tailwind'] as Key[], children}) {
  let [selected, setSelected] = useState<Key>(examples[0]);

  useEffect(() => {
    let search = new URLSearchParams(location.search);
    let exampleType = search.get('exampleType') ?? localStorage.getItem('exampleType');
    if (exampleType && examples.includes(exampleType)) {
      setSelected(exampleType);
    }
  }, []);

  let onSelectionChange = key => {
    setSelected(key);
    localStorage.setItem('exampleType', key);
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
