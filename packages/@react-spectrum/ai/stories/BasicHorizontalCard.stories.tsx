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

import {ActionButton} from '@react-spectrum/s2/ActionButton';
import {ActionMenu} from '@react-spectrum/s2/ActionMenu';
import {type BasicCardProps, BasicHorizontalCard} from '../src/HorizontalCard';
import {categorizeArgTypes, getActionArgs} from '../../s2/stories/utils';
import ChevronRight from '@react-spectrum/s2/icons/ChevronRight';
import {Content} from '@react-spectrum/s2/Content';
import {Footer} from '@react-spectrum/s2/Footer';
import {Image} from '@react-spectrum/s2/Image';
import {MenuItem} from '@react-spectrum/s2/Menu';
import type {Meta, StoryObj} from '@storybook/react';
import {Skeleton} from '@react-spectrum/s2/Skeleton';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {Text} from '@react-spectrum/s2/Text';

const events = ['onAction'];

const meta: Meta<BasicCardProps & {isLoading?: boolean}> = {
  component: BasicHorizontalCard,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  args: {
    isLoading: false,
    ...getActionArgs(events)
  },
  argTypes: {
    ...categorizeArgTypes('Events', events),
    href: {table: {disable: true}},
    download: {table: {disable: true}},
    hrefLang: {table: {disable: true}},
    referrerPolicy: {table: {disable: true}},
    rel: {table: {disable: true}},
    routerOptions: {table: {disable: true}},
    ping: {table: {disable: true}},
    target: {table: {disable: true}},
    value: {table: {disable: true}},
    textValue: {table: {disable: true}},
    onAction: {table: {disable: true, category: 'Events'}},
    isDisabled: {table: {disable: true}},
    children: {table: {disable: true}}
  },
  decorators: (children, {args}) => (
    <Skeleton isLoading={args.isLoading || false}>{children(args)}</Skeleton>
  ),
  title: 'AI/BasicHorizontalCard'
};

export default meta;

type BasicStory = StoryObj<typeof BasicHorizontalCard>;

export const Basic: BasicStory = {
  render: args => (
    <div
      className={style({
        display: 'flex',
        gap: 16,
        flexWrap: 'wrap',
        alignItems: 'start',
        justifyContent: 'center',
        padding: 16,
        backgroundColor: {
          default: 'layer-1',
          variant: {
            secondary: 'layer-2'
          }
        }
      })({variant: args.variant})}>
      <BasicHorizontalCard {...args} styles={style({maxWidth: 400})}>
        <Image
          slot="thumbnail"
          src={new URL('../../s2/stories/assets/placeholder.png', import.meta.url).toString()}
        />
        <Content>
          <Text slot="title">Card title</Text>
          <Text slot="description">Card description.</Text>
        </Content>
        <Footer>
          <ActionMenu>
            <MenuItem>Test</MenuItem>
          </ActionMenu>
        </Footer>
      </BasicHorizontalCard>
      <BasicHorizontalCard {...args} styles={style({maxWidth: 400})}>
        <Image
          slot="thumbnail"
          src={new URL('../../s2/stories/assets/placeholder.png', import.meta.url).toString()}
        />
        <Content>
          <Text slot="title">Card title</Text>
          <Text slot="description">Card description.</Text>
        </Content>
        <Footer>
          <ActionButton isQuiet>
            <ChevronRight />
          </ActionButton>
        </Footer>
      </BasicHorizontalCard>
      <BasicHorizontalCard {...args} styles={style({maxWidth: 400})}>
        <Image
          slot="thumbnail"
          src={new URL('../../s2/stories/assets/placeholder.png', import.meta.url).toString()}
        />
        <Content>
          <Text slot="title">Card title</Text>
          <Text slot="description">Card description.</Text>
        </Content>
      </BasicHorizontalCard>
      <BasicHorizontalCard {...args} styles={style({maxWidth: 400})}>
        <Image
          slot="thumbnail"
          src={new URL('../../s2/stories/assets/placeholder.png', import.meta.url).toString()}
        />
        <Content>
          <Text slot="title">Card title</Text>
          <Text slot="description">Card description.</Text>
        </Content>
      </BasicHorizontalCard>
      <BasicHorizontalCard {...args} aria-label="Demo file.pdf">
        <Image
          slot="thumbnail"
          src={new URL('../../s2/stories/assets/placeholder.png', import.meta.url).toString()}
        />
      </BasicHorizontalCard>
    </div>
  ),
  argTypes: {
    variant: {
      control: 'radio',
      options: ['primary', 'secondary', 'tertiary', 'quiet']
    }
  }
};
