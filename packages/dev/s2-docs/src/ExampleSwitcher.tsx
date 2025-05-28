'use client';

import {Key} from 'react-aria-components';
import {SegmentedControl, SegmentedControlItem} from '@react-spectrum/s2';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {useState} from 'react';

const exampleStyle = style({
  backgroundColor: 'layer-1',
  marginTop: 20,
  borderRadius: 'xl',
  display: 'flex',
  flexDirection: 'column'
});

export function ExampleSwitcher({examples = ['Vanilla CSS', 'Tailwind'] as Key[], children}) {
  let [selected, setSelected] = useState<Key>(examples[0]);

  return (
    <div className={exampleStyle} data-example-switcher>
      <SegmentedControl selectedKey={selected} onSelectionChange={setSelected} styles={style({marginTop: 20, marginStart: 20})}>
        {examples.map(example => <SegmentedControlItem key={example} id={example}>{example}</SegmentedControlItem>)}
      </SegmentedControl>
      {children[examples.indexOf(selected)]}
    </div>
  );
}
