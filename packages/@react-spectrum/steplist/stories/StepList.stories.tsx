/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// import {action} from '@storybook/addon-actions';
import {Item} from '@react-stately/collections';
import React, {Key, useState} from 'react';
import {StepList} from '../';
import {storiesOf} from '@storybook/react';
import {useAsyncList} from '@react-stately/data';

const options = [{
  key: 'cat', value: 'Cat'
}, {
  key: 'dog', value: 'Dog'
}, {
  key: 'monkey', value: 'Monkey'
}, {
  key: 'skunk', value: 'Skunk'
}];

storiesOf('StepList', module)
  .add(
    'Does nothing!',
    () => render({})
  )
  .add('Controlled selection', 
    () => ControlledSelection()
  )
  .add('Uncontrolled selection', 
    () => UncontrolledSelection()
  )
  .add('ReadOnly',
    () => ReadOnly()
  )
  .add('Disabled', 
    () => Disabled()
  )
  .add('AsyncItems',
    () => AsyncItems()
  );

function render(props = {}) {
  return (
    <StepList defaultSelectedKey="offers" lastCompletedStep="details" {...props} size="S">
      <Item key="details">Details</Item>
      <Item key="offers">Select offers</Item>
      <Item key="fallback">Fallback offer</Item>
      <Item key="summary">Summary</Item>
    </StepList>
  );
}

function ControlledSelection() {
  const [selectedIdx, setSelected] = useState(0);
  function handleSelectionChange(key: Key) {
    const selectedIdx = options.findIndex(o => o.key === key);
    setSelected(selectedIdx);
  }
  const currKey = options[selectedIdx].key;
  return (<div>
    <StepList size="S" selectedKey={currKey} onSelectionChange={handleSelectionChange}>
      {options.map((o) => <Item key={o.key}>{o.value}</Item>)}
    </StepList>
    <div style={{padding: 20}}>
      <button onClick={() => setSelected(Math.max(0, selectedIdx - 1))}>Back</button>
      <button onClick={() => setSelected(Math.min(options.length - 1, selectedIdx + 1))}>Next</button>
    </div>    
  </div>);
}


function UncontrolledSelection() {
  return (
    <StepList size="S" defaultSelectedKey={options[3].key}>
      {options.map((o) => <Item key={o.key}>{o.value}</Item>)}
    </StepList>
  );
}

function ReadOnly() {
  return (
    <StepList size="S" isReadOnly defaultSelectedKey={options[1].key} defaultCompletedStep={options[2].key}>
      {options.map((o) => <Item key={o.key}>{o.value}</Item>)}
    </StepList>
  );
}

function Disabled() {
  return (
    <StepList size="S" isDisabled defaultSelectedKey={options[1].key} defaultCompletedStep={options[2].key}>
      {options.map((o) => <Item key={o.key}>{o.value}</Item>)}
    </StepList>
  );
}

function AsyncItems() {
  type PokeMon = { name: string };
  let list = useAsyncList<PokeMon>({
    async load({signal}) {
      let res = await fetch('https://pokeapi.co/api/v2/pokemon', {signal});
      let json = await res.json();
      return {items: json.results.slice(0, 8)};
    }
  });
  const [selectedKey, setSelectedKey] = useState<Key>('venusaur');
  return (<div>
    <StepList size="S" lastCompletedStep="charmeleon" items={list.items} selectedKey={selectedKey} onSelectionChange={setSelectedKey}>
      {(item: PokeMon) => <Item key={item.name}>{item.name}</Item>}
    </StepList>
  </div>);
}
