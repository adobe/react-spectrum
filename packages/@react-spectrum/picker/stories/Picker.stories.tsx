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

import {Item, Picker, Section} from '../';
import React from 'react';
import {storiesOf} from '@storybook/react';

let flatOptions = [
  {name: 'Aardvark'},
  {name: 'Kangaroo'},
  {name: 'Snake'},
  {name: 'Danni'},
  {name: 'Devon'},
  {name: 'Ross'},
  {name: 'Puppy'},
  {name: 'Doggo'},
  {name: 'Floof'}
];

let withSection = [
  {name: 'Animals', children: [
    {name: 'Aardvark'},
    {name: 'Kangaroo'},
    {name: 'Snake'}
  ]},
  {name: 'People', children: [
    {name: 'Danni'},
    {name: 'Devon'},
    {name: 'Ross'}
  ]}
];


storiesOf('Picker', module)
  .add(
    'default',
    () => (
      <Picker label="Test">
        <Item>One</Item>
        <Item>Two</Item>
        <Item>Three</Item>
      </Picker>
    )
  )
  .add(
    'sections',
    () => (
      <Picker label="Test">
        <Section title="Animals">
          <Item>Aardvark</Item>
          <Item>Kangaroo</Item>
          <Item>Snake</Item>
        </Section>
        <Section title="People">
          <Item>Danni</Item>
          <Item>Devon</Item>
          <Item>Ross</Item>
        </Section>
      </Picker>
    )
  )
  .add(
    'dynamic',
    () => (
      <Picker label="Test" items={flatOptions} itemKey="name">
        {item => <Item>{item.name}</Item>}
      </Picker>
    )
  )
  .add(
    'dynamic with sections',
    () => (
      <Picker label="Test" items={withSection} itemKey="name">
        {item => (
          <Section items={item.children} title={item.name}>
            {item => <Item>{item.name}</Item>}
          </Section>
        )}
      </Picker>
    )
  )
  .add(
    'isDisabled',
    () => (
      <Picker label="Test" isDisabled>
        <Item>One</Item>
        <Item>Two</Item>
        <Item>Three</Item>
      </Picker>
    )
  )
  .add(
    'isQuiet',
    () => (
      <Picker isQuiet label="Test">
        <Item>One</Item>
        <Item>Two</Item>
        <Item>Three</Item>
      </Picker>
    )
  )
  .add(
    'labelAlign: end',
    () => (
      <Picker label="Test" labelAlign="end">
        <Item>One</Item>
        <Item>Two</Item>
        <Item>Three</Item>
      </Picker>
    )
  )
  .add(
    'labelPosition: side',
    () => (
      <Picker label="Test" labelPosition="side">
        <Item>One</Item>
        <Item>Two</Item>
        <Item>Three</Item>
      </Picker>
    )
  )
  .add(
    'isRequired',
    () => (
      <Picker label="Test" isRequired>
        <Item>One</Item>
        <Item>Two</Item>
        <Item>Three</Item>
      </Picker>
    )
  )
  .add(
    'isRequired, necessityIndicator: label',
    () => (
      <Picker label="Test" isRequired necessityIndicator="label">
        <Item>One</Item>
        <Item>Two</Item>
        <Item>Three</Item>
      </Picker>
    )
  )
  .add(
    'optional, necessityIndicator: label',
    () => (
      <Picker label="Test" necessityIndicator="label">
        <Item>One</Item>
        <Item>Two</Item>
        <Item>Three</Item>
      </Picker>
    )
  )
  .add(
    'validationState: invalid',
    () => (
      <Picker label="Test" validationState="invalid">
        <Item>One</Item>
        <Item>Two</Item>
        <Item>Three</Item>
      </Picker>
    )
  );
