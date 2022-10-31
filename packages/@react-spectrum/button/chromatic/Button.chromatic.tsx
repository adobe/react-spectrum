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

import Bell from '@spectrum-icons/workflow/Bell';
import {Button} from '../';
import {classNames} from '@react-spectrum/utils';
import {Flex} from '@react-spectrum/layout';
import {generatePowerset} from '@react-spectrum/story-utils';
import {Grid, repeat} from '@react-spectrum/layout';
import React from 'react';
import {storiesOf} from '@storybook/react';
import styles from '@adobe/spectrum-css-temp/components/button/vars.css';
import {Text} from '@react-spectrum/text';

let states = [
  {UNSAFE_className: classNames(styles, 'is-hovered'), 'data-hover': true},
  {UNSAFE_className: classNames(styles, 'is-active'), 'data-active': true},
  {UNSAFE_className: classNames(styles, 'focus-ring'), 'data-focus': true},
  {style: 'fill'},
  {style: 'outline'},
  {staticColor: 'white'},
  {staticColor: 'black'},
  {isDisabled: true}
];

let combinations = generatePowerset(states, v => (v.UNSAFE_className && v.isDisabled) || (v['data-focus'] && (v['data-hover'] || v['data-active'])) || (v['data-hover'] && v['data-active']));

storiesOf('Button', module)
  .addParameters({chromaticProvider: {locales: ['en-US']}})
  .add(
    'variant: accent',
    () => render({variant: 'accent'})
  )
  .add(
    'variant: primary',
    () => render({variant: 'primary'})
  )
  .add(
    'variant: secondary',
    () => render({variant: 'secondary'})
  )
  .add(
    'variant: negative',
    () => render({variant: 'negative'})
  )
  .add(
    'element: a',
    () => render({elementType: 'a', variant: 'primary'})
  )
  .add(
    'with icon',
    () => (
      <Flex gap="size-200">
        <Button variant="primary">
          <Bell />
          <Text>Default</Text>
        </Button>
        <Button
          isDisabled
          variant="primary">
          <Text>Disabled</Text>
          <Bell />
        </Button>
      </Flex>
    ),
    {chromaticProvider: {locales: ['en-US', 'ar-AE']}}
  )
  .add(
    'icon only',
    () => (
      <Flex gap="size-200">
        <Button variant="primary" aria-label="Notifications">
          <Bell />
        </Button>
        <Button
          isDisabled
          variant="primary"
          aria-label="Notifications">
          <Bell />
        </Button>
      </Flex>
    ),
    {chromaticProvider: {locales: ['en-US', 'ar-AE']}}
  )
  .add(
    'double text node',
    () => (
      <Flex gap="size-200">
        <Button
          variant="primary">
          {0} Dogs
        </Button>
        <Button
          isDisabled
          variant="primary">
          {0} Dogs
        </Button>
      </Flex>
    )
  );

function render(props: any = {}) {
  return (
    <Grid columns={repeat(4, '1fr')} autoFlow="row" justifyItems="start" gap="size-300">
      {combinations.map(c => {
        let key = Object.keys(c).map(k => {
          if (k === 'UNSAFE_className') {
            return '';
          }
          return typeof c[k] === 'boolean' ? k.replace(/^data-/, '') : `${k}: ${c[k]}`;
        }).filter(Boolean).reverse().join(', ');
        if (!key) {
          key = 'default';
        }
        let button = <Button key={key} {...props} {...c}>{key}</Button>;
        if (props.variant === 'overBackground' || c.staticColor === 'white') {
          return (
            <div style={{backgroundColor: 'rgb(15, 121, 125)', color: 'rgb(15, 121, 125)', padding: '15px 20px', display: 'inline-block'}}>
              {button}
            </div>
          );
        }
        if (c.staticColor === 'black') {
          return (
            <div style={{backgroundColor: 'rgb(206, 247, 243)', color: 'rgb(15, 121, 125)', padding: '15px 20px', display: 'inline-block'}}>
              {button}
            </div>
          );
        }
        return button;
      })}
    </Grid>
  );
}
