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
import styles from '@adobe/spectrum-css-temp/components/button/vars.css';
import {Text} from '@react-spectrum/text';
import {View} from '@react-spectrum/view';

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

export default {
  title: 'Button',
  parameters: {
    chromaticProvider: {locales: ['en-US']}
  }
};

export const VariantAccent = () => render({variant: 'accent'});

VariantAccent.story = {
  name: 'variant: accent'
};

export const VariantPrimary = () => render({variant: 'primary'});

VariantPrimary.story = {
  name: 'variant: primary'
};

export const VariantSecondary = () => render({variant: 'secondary'});

VariantSecondary.story = {
  name: 'variant: secondary'
};

export const VariantNegative = () => render({variant: 'negative'});

VariantNegative.story = {
  name: 'variant: negative'
};

export const ElementA = () => render({elementType: 'a', variant: 'primary'});

ElementA.story = {
  name: 'element: a'
};

export const WithIcon = () => (
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
);

WithIcon.story = {
  name: 'with icon',
  parameters: {chromaticProvider: {locales: ['en-US', 'ar-AE']}}
};

export const IconOnly = () => (
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
);

IconOnly.story = {
  name: 'icon only',
  parameters: {chromaticProvider: {locales: ['en-US', 'ar-AE']}}
};

export const DoubleTextNode = () => (
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
);

DoubleTextNode.story = {
  name: 'double text node'
};

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
            <View backgroundColor="static-blue-700" UNSAFE_style={{padding: '15px 20px', display: 'inline-block'}}>
              {button}
            </View>
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
