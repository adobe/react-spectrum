/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {Button, GridList, GridListItem, GridListItemProps, Group, Label, Tag, TagGroup, TagList} from 'react-aria-components';
import {CheckboxExample} from './Checkbox.stories';
import {CheckboxGroupExample} from './CheckboxGroup.stories';
import {ColorSwatchExample} from './ColorSwatch.stories';
import {ColorWheelExample} from './ColorWheel.stories';
import {DateFieldExample} from './DateField.stories';
import {NumberFieldExample} from './NumberField.stories';
import {RadioGroupExample} from './RadioGroup.stories';
import React, {useEffect, useRef, useState} from 'react';
import {SearchFieldExample} from './SearchField.stories';
import {SliderExample} from './Slider.stories';
import {SwitchExample} from './Switch.stories';
import {TextfieldExample} from './TextField.stories';
import {TimeFieldExample} from './TimeField.stories';
import {ToggleButtonExample} from './ToggleButton.stories';
import {userEvent, within} from '@storybook/testing-library';

export default {
  title: 'React Aria Components'
};

let TagGroupExample = () =>   (
  <TagGroup>
    <Label>Categories</Label>
    <TagList style={{display: 'flex', gap: 4}}>
      <Tag>News</Tag>
      <Tag>Travel</Tag>
      <Tag>Gaming</Tag>
      <Tag>Shopping</Tag>
    </TagList>
  </TagGroup>
);

let rows = [
    {id: 1, name: 'Button', children: <Button>Press me</Button>, isArrowEnabled: false},
    {id: 2, name: 'TextField', children: <TextfieldExample />, isArrowEnabled: true},
    {id: 3, name: 'ToggleButton', children: <ToggleButtonExample />, isArrowEnabled: false},
    {id: 4, name: 'Slider', children: <SliderExample />, isArrowEnabled: true},
    {id: 5, name: 'RadioGroup', children: <RadioGroupExample />, isArrowEnabled: true},
    {id: 6, name: 'NumberField', children: NumberFieldExample.render({}), isArrowEnabled: true},
    {id: 7, name: 'TimeField', children: <TimeFieldExample />, isArrowEnabled: true},
    {id: 8, name: 'DateField', children: <DateFieldExample />, isArrowEnabled: true},
    {id: 9, name: 'SearchField', children: <SearchFieldExample />, isArrowEnabled: false},
    {id: 10, name: 'Checkbox', children: <CheckboxExample />, isArrowEnabled: false},
    {id: 11, name: 'CheckboxGroup', children: <CheckboxGroupExample />, isArrowEnabled: false},
    {id: 12, name: 'Switch', children: <SwitchExample />, isArrowEnabled: false},
    {id: 13, name: 'TagGroup', children: <TagGroupExample />, isArrowEnabled: true},
    {id: 14, name: 'ColorWheel', children: <ColorWheelExample />, isArrowEnabled: true},
    {id: 15, name: 'ColorSwatch', children: <ColorSwatchExample />, isArrowEnabled: true}
];

let INTERACTION_KEYS = new Set([' ', 'Enter']);
let NAVIGATION_KEYS = new Set(['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown']);

const EventGridItem = (props: GridListItemProps) => {
  // @ts-expect-error
  let {name, children} = props;
  let itemRef = useRef<HTMLDivElement>(null);
  let [leakedNavigationKey, setLeakedNavigationKey] = useState<string | null>(null);
  let [leakedInteractionKey, setLeakedInteractionKey] = useState<string | null>(null);

  let onLeakedKeyboardEvent = (e) => {
    if (NAVIGATION_KEYS.has(e.key)) {
      setLeakedNavigationKey(e.key);
      let element = e.target as HTMLElement;
      let style = element.getAttribute('style');
      e.target.setAttribute('style', `${style}; box-shadow: purple 0 0 0 3px !important;`);
    } else if (INTERACTION_KEYS.has(e.key)) {
      setLeakedInteractionKey(e.key);
    }
  };

  useEffect(() => {
    requestAnimationFrame(() => {
      itemRef.current?.focus();
    });
  }, [leakedNavigationKey, leakedInteractionKey]);

  let warning = leakedNavigationKey || leakedInteractionKey;
  // eslint-disable-next-line no-nested-ternary
  let color = warning ? leakedNavigationKey ? 'red' : 'orange' : 'inherit';

  return (
    <GridListItem
      {...props}
      ref={itemRef}
      textValue={name}
      style={{
        display: 'flex',
        flexDirection: 'column',
        boxShadow: warning ? `0px 0px 0px 3px var(--spectrum-alias-background-color-default) inset, 0px 0px 0px 6px ${color} inset` : 'none',
        border: '1px dashed lightgrey',
        aspectRatio: '1 / 1',
        padding: 24,
        boxSizing: 'border-box'
      }}>
      <Label style={{color: warning ? color : 'inherit'}}>{name + (warning ? ` (${warning})` : '')}</Label>
      <Group
        // @ts-expect-error
        children={children}
        onKeyDown={onLeakedKeyboardEvent}
        style={{
          display: 'inline-flex',
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center'
        }} />
    </GridListItem>
  );
};

const Story = () => {
  return (
    <div style={{padding: 24, display: 'flex', flexDirection: 'column', gap: 10}}>
      <Group style={{display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', gap: 10}}>
        <Label style={{fontSize: 24}}>React Aria (Event Test Suite)</Label>
        <Group style={{display: 'flex', gap: 10}}>
          Orange: <span style={{color: 'orange'}}>Interaction key leaked</span>
          Red: <span style={{color: 'red'}}>Navigation key leaked</span>
        </Group>
      </Group>

      <GridList
        keyboardNavigationBehavior="tab"
        items={rows}
        layout="grid"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr'
        }}>
        {(item) => <EventGridItem {...item} />}
      </GridList>
    </div>
  );
};

let sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
export const EventLeakGrid = {
  render: Story,
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    let elements = (await canvas.findAllByRole('row')).filter(el => el.className === 'react-aria-GridListItem');

    for (const [index, element] of elements.entries()) {
      if (element.className !== 'react-aria-GridListItem') {
        continue;
      }

      await userEvent.click(element);
      await sleep(100);
  
      await userEvent.tab();
  
      await sleep(100);

      if (!rows[index]) {
        console.log('No row found for index', index);
        continue;
      }
  
      if (rows[index]?.isArrowEnabled) {
        for (const key of NAVIGATION_KEYS.values()) {

          await userEvent.keyboard(`{${key}}`);
          await sleep(100);

          if (document.activeElement === element) {
            break;
          }
        }
      }

      for (const key of INTERACTION_KEYS.values()) {
        await userEvent.keyboard(`{${key}}`);
        await sleep(100);
        
        if (document.activeElement === element) {
          break;
        }
      }
    }
    
  }
};
