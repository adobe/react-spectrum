/*
 * Copyright 2024 Adobe. All rights reserved.
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
  Content,
  ContextualHelp,
  Footer,
  Heading,
  Link,
  NumberField,
  Text
} from '../src';
import {generatePowerset} from '@react-spectrum/story-utils';
import type {Meta} from '@storybook/react';
import {shortName} from './utils';
import {style} from '../style/spectrum-theme' with {type: 'macro'};

const meta: Meta<typeof NumberField> = {
  component: NumberField,
  parameters: {
    chromaticProvider: {disableAnimations: true}
  },
  title: 'S2 Chromatic/NumberField'
};

export default meta;

let states = [
  {hideStepper: true},
  {isDisabled: true},
  {isInvalid: true},
  {isReadOnly: true},
  {isRequired: true},
  {size: ['S', 'M', 'L', 'XL']}
];

let combinations = generatePowerset(states);

const Template = ({...args}) => {
  return (
    <div className={style({display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 250px))', gridAutoFlow: 'row', alignItems: 'center', justifyItems: 'start', gap: 24, width: '[100vw]'})}>
      {combinations.map(c => {
        let fullComboName = Object.keys(c).map(k => `${k}: ${c[k]}`).join(' ');
        let key = Object.keys(c).map(k => shortName(k, c[k])).join(' ');
        if (!key) {
          key = 'default';
        }

        return <NumberField label={key} data-testid={fullComboName} key={key} {...args} {...c} />;
      })}
    </div>
  );
};

export const Default = {
  render: Template
};

export const DefaultValue = {
  render: Template,
  args: {
    defaultValue: 10
  }
};

export const LabelPositionSide = {
  render: Template,
  args: {
    labelPosition: 'side',
    value: 10
  }
};

export const ContextualHelpExample = {
  render: (args: any) => <NumberField {...args} />,
  args: {
    label: 'Quantity',
    contextualHelp: (
      <ContextualHelp>
        <Heading>Quantity</Heading>
        <Content>
          <Text>
            Pick a number between negative infinity and positive infinity.
          </Text>
        </Content>
        <Footer>
          <Link
            isStandalone
            href="https://en.wikipedia.org/wiki/Quantity"
            target="_blank">Learn more about quantity</Link>
        </Footer>
      </ContextualHelp>
    )
  }
};
