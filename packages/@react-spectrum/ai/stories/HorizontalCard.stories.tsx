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

import {CardPreview, HorizontalCard, type HorizontalCardProps} from '../src/HorizontalCard';
import {categorizeArgTypes, getActionArgs} from '../../s2/stories/utils';
import {Content} from '@react-spectrum/s2/Content';
import {Image} from '@react-spectrum/s2/Image';
import type {Meta, StoryObj} from '@storybook/react';
import {Skeleton} from '@react-spectrum/s2/Skeleton';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {Text} from '@react-spectrum/s2/Text';

const events = ['onAction'];

const meta: Meta<HorizontalCardProps & {isLoading?: boolean}> = {
  component: HorizontalCard,
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
  title: 'AI/HorizontalCard'
};

export default meta;

type Story = StoryObj<typeof HorizontalCard>;

export const Horizontal: Story = {
  render: args => (
    <div
      style={{
        display: 'flex',
        gap: 16,
        flexWrap: 'wrap',
        alignItems: 'start',
        justifyContent: 'center'
      }}>
      <HorizontalCard {...args} styles={style({maxWidth: 600})}>
        <CardPreview>
          <Image
            slot="preview"
            src={new URL('../../s2/stories/assets/preview.png', import.meta.url).toString()}
          />
        </CardPreview>
        <Image
          slot="thumbnail"
          src={new URL('../../s2/stories/assets/placeholder.png', import.meta.url).toString()}
        />
        <Content>
          <Text slot="title">Card title</Text>
          <Text slot="description">
            Card description. Give a concise overview of the context or functionality that's
            mentioned in the card title.
          </Text>
        </Content>
      </HorizontalCard>
      <HorizontalCard {...args} styles={style({maxWidth: 600})}>
        <CardPreview>
          <Image
            slot="preview"
            src={new URL('../../s2/stories/assets/preview.png', import.meta.url).toString()}
          />
        </CardPreview>
        <Content>
          <Text slot="title">
            <Image
              slot="thumbnail"
              src={new URL('../../s2/stories/assets/placeholder.png', import.meta.url).toString()}
            />
            Card title
          </Text>
          <Text slot="description">
            Card description. Give a concise overview of the context or functionality that's
            mentioned in the card title.
          </Text>
        </Content>
      </HorizontalCard>
    </div>
  )
};
