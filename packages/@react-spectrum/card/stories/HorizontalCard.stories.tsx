// @ts-nocheck
/*
 * Copyright 2021 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {Card} from '../index';
import {CardStory} from './Card.stories';
import {ComponentMeta} from '@storybook/react';
import {Content} from '@react-spectrum/view';
import {getImage} from '../stories/utils';
import {Heading, Text} from '@react-spectrum/text';
import {Horizontal} from '../chromatic/HorizontalCard.stories';
import {Image} from '@react-spectrum/image';
import React from 'react';

export default {
  title: 'Card/horizontal',
  component: Card,
  args: {
    orientation: 'horizontal'
  },
  argTypes: {
    layout: {
      table: {
        disable: true
      }
    },
    children: {
      table: {
        disable: true
      }
    }
  }
} as ComponentMeta<typeof Card>;

export const CardGrid: CardStory = {
  render: (args, context) => <Card {...args} {...context} id={null} />,
  args: {...Horizontal.args, layout: 'grid'},
  decorators: [(Story, context) => (
    <CardGridDecorator
      Story={Story}
      context={context} />
  )]
};

const CardGridDecorator = (props) => {
  let {Story, context} = props;
  let {args} = context;
  return (
    <div
      style={{
        width: '100%',
        margin: '50px',
        display: 'grid',
        gap: '20px',
        gridTemplateColumns: 'repeat(auto-fit, 360px)',
        gridAutoRows: '104px'
      }}>
      {
        (new Array(15).fill(0)).map((_, index) => {
          let url = getImage(index);
          return (
            <Story {...args} key={`${index}${url}`}>
              <Image src={url} />
              <Heading>Title {index}</Heading>
              <Text slot="detail">PNG</Text>
              <Content>Description</Content>
            </Story>
          );
        })
      }
    </div>
  );
};

export const CardFloat: CardStory = {
  render: (args, context) => <Card {...args} {...context} id={null} />,
  args: {...Horizontal.args},
  decorators: [(Story, context) => (
    <CardFloatDecorator
      Story={Story}
      context={context} />
  )]
};

const CardFloatDecorator = (props) => {
  let {Story, context} = props;
  let {args} = context;
  return (
    <div
      style={{
        width: '100%',
        margin: '50px'
      }}>
      {
        (new Array(15).fill(0)).map((_, index) => {
          let url = getImage(index);
          return (
            <div style={{float: 'left', margin: '10px'}} key={`${index}${url}`}>
              <Story {...args}>
                <Image src={url} />
                <Heading>Title {index}</Heading>
                <Text slot="detail">PNG</Text>
                <Content>Description</Content>
              </Story>
            </div>
          );
        })
      }
    </div>
  );
};

export const CardGridTall: CardStory = {
  render: (args, context) => <Card {...args} {...context} id={null} />,
  args: {...Horizontal.args, layout: 'grid'},
  decorators: [(Story, context) => (
    <CardGridTallDecorator
      Story={Story}
      context={context} />
  )]
};

const CardGridTallDecorator = (props) => {
  let {Story, context} = props;
  let {args} = context;
  return (
    <div
      style={{
        width: '100%',
        margin: '50px',
        display: 'grid',
        gap: '20px',
        gridTemplateColumns: 'repeat(auto-fit, 360px)',
        gridAutoRows: '150px'
      }}>
      {
        (new Array(15).fill(0)).map((_, index) => {
          let url = getImage(index);
          return (
            <Story {...args} key={`${index}${url}`}>
              <Image src={url} />
              <Heading>Title {index}</Heading>
              <Text slot="detail">PNG</Text>
              <Content>Description</Content>
            </Story>
          );
        })
      }
    </div>
  );
};
