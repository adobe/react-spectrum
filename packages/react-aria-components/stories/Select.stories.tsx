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

import {
  Button, DEFAULT_SLOT,
  Label,
  ListBox,
  OverlayArrow,
  Popover,
  Provider,
  Select,
  SelectValue,
  Text, TextContext
} from 'react-aria-components';
import {MyListBoxItem} from './utils';
import React from 'react';
import styles from '../example/index.css';

export default {
  title: 'React Aria Components'
};

export const SelectExample = () => (
  <Select data-testid="select-example" id="select-example-id">
    <Label style={{display: 'block'}}>Test</Label>
    <Button>
      <SelectValue />
      <span aria-hidden="true" style={{paddingLeft: 5}}>▼</span>
    </Button>
    <Popover>
      <OverlayArrow>
        <svg width={12} height={12}><path d="M0 0,L6 6,L12 0" /></svg>
      </OverlayArrow>
      <ListBox className={styles.menu}>
        <MyListBoxItem>Foo</MyListBoxItem>
        <MyListBoxItem>Bar</MyListBoxItem>
        <MyListBoxItem>Baz</MyListBoxItem>
        <MyListBoxItem href="http://google.com">Google</MyListBoxItem>
      </ListBox>
    </Popover>
  </Select>
);

export const SelectRenderProps = () => (
  <Select data-testid="select-render-props">
    {({isOpen}) => (
      <>
        <Label style={{display: 'block'}}>Test</Label>
        <Button>
          <SelectValue />
          <span aria-hidden="true" style={{paddingLeft: 5}}>{isOpen ? '▲' : '▼'}</span>
        </Button>
        <Popover>
          <ListBox className={styles.menu}>
            <MyListBoxItem>Foo</MyListBoxItem>
            <MyListBoxItem>Bar</MyListBoxItem>
            <MyListBoxItem>Baz</MyListBoxItem>
            <MyListBoxItem href="http://google.com">Google</MyListBoxItem>
          </ListBox>
        </Popover>
      </>
    )}
  </Select>
);

let manyItems = [...Array(100)].map((_, i) => ({id: i, name: `Item ${i}`}));

export const SelectManyItems = () => (
  <Select>
    <Label style={{display: 'block'}}>Test</Label>
    <Button>
      <SelectValue />
      <span aria-hidden="true" style={{paddingLeft: 5}}>▼</span>
    </Button>
    <Popover>
      <OverlayArrow>
        <svg width={12} height={12}><path d="M0 0,L6 6,L12 0" /></svg>
      </OverlayArrow>
      <ListBox items={manyItems} className={styles.menu}>
        {item => <MyListBoxItem>{item.name}</MyListBoxItem>}
      </ListBox>
    </Popover>
  </Select>
);

export const SelectComplexItemsExample = () => (
  <Select className={styles.select} data-testid="select-example" id="select-example-id">
    <Label style={{display: 'block'}}>Test</Label>
    <Button>
      <SelectValue>
        {(value) => {
          return value.isPlaceholder ? 'Select an option...' : (
            <Provider
              values={[
                [TextContext, {
                  slots: {
                    label: {className: styles['selected-title']},
                    description: {className: styles['selected-description']}
                  }
                }]
              ]}>
              {value.selectedChildren}
            </Provider>
          );
        }}
      </SelectValue>
      <span aria-hidden="true" style={{paddingLeft: 5}}>▼</span>
    </Button>
    <Popover>
      <OverlayArrow>
        <svg width={12} height={12}><path d="M0 0,L6 6,L12 0" /></svg>
      </OverlayArrow>
      <ListBox className={styles.menu}>
        <MyListBoxItem textValue="Foo by Dre"><Text slot="label">Foo</Text><Text slot="description">by Dre</Text></MyListBoxItem>
        <MyListBoxItem textValue="Bar by Tiffany's"><Text slot="label">Bar</Text><Text slot="description">by Tiffany's</Text></MyListBoxItem>
        <MyListBoxItem textValue="Baz by Mark Jacob"><Text slot="label">Baz</Text><Text slot="description">by Mark Jacob</Text></MyListBoxItem>
        <MyListBoxItem textValue="Google by don't be evil" href="http://google.com"><Text slot="label">Google</Text><Text slot="description">by don't be evil</Text></MyListBoxItem>
      </ListBox>
    </Popover>
  </Select>
);
