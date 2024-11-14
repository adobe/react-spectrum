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

import {Avatar} from '@react-spectrum/avatar';
import {Card} from '..';
import {CardBase} from '../src/CardBase';
import {CardViewContext} from '../src/CardViewContext';
import {ComponentMeta, ComponentStoryObj} from '@storybook/react';
import {Content} from '@react-spectrum/view';
import {getDescription, getImage} from './utils';
import {Heading, Text} from '@react-spectrum/text';
import {Image} from '@react-spectrum/image';
import React, {Dispatch, SetStateAction, useState} from 'react';
import {SpectrumCardProps} from '@react-types/card';
import {usePress} from '@react-aria/interactions';
import {useProvider} from '@react-spectrum/provider';

export default {
  title: 'Card/default',
  component: Card,
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

export type CardStory = ComponentStoryObj<typeof Card>;

export const Default: CardStory = {
  args: {
    children: (
      <>
        <Image src="https://i.imgur.com/Z7AzH2c.jpg" />
        <Avatar src="https://mir-s3-cdn-cf.behance.net/project_modules/disp/690bc6105945313.5f84bfc9de488.png" />
        <Heading>Title</Heading>
        <Text slot="detail">PNG</Text>
        <Content>Description</Content>
      </>
    )
  },
  decorators: [
    (Story) => (
      <div style={{width: '208px'}}>
        <Story />
      </div>
    )
  ]
};

export const CardGrid: CardStory = {
  render: (args, context) => <Card {...args} {...context} id={null} />,
  args: {layout: 'grid'},
  decorators: [(Story, context) => (
    <CardGridDecorator
      Story={Story}
      context={context} />
  )]
};

let CardGridDecorator = (props) => {
  let {Story, context} = props;
  let {args} = context;
  let {scale} = useProvider();
  return (
    <div
      style={{
        width: '100%',
        margin: '50px',
        display: 'grid',
        gap: '20px',
        gridTemplateColumns: 'repeat(auto-fit, 208px)',
        gridAutoRows: 'auto',
        justifyContent: 'center',
        justifyItems: 'center',
        alignItems: 'start'
      }}>
      {
        (new Array(15).fill(0)).map((_, index) => {
          let url = getImage(index);
          return (
            <div style={scale === 'medium' ? {width: '208px', height: '293px'} : {width: '208px', height: '355px'}} key={`${index}${url}`}>
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

export const CardWaterfall: CardStory = {
  render: (args, context) => <Card {...args} {...context} id={null} />,
  args: {layout: 'waterfall'},
  decorators: [(Story, context) => (
    <CardWaterfallDecorator
      Story={Story}
      context={context} />
  )]
};

let CardWaterfallDecorator = (props) => {
  let {Story, context} = props;
  let {args} = context;
  return (
    <div
      style={{
        width: '100%',
        height: '150vh',
        margin: '50px',
        display: 'flex',
        flexDirection: 'column',
        flexWrap: 'wrap',
        alignItems: 'start'
      }}>
      {
        (new Array(15).fill(0)).map((_, index) => {
          let url = getImage(index);
          return (
            <div style={{width: '208px', margin: '10px'}} key={`${index}${url}`}>
              <Story {...args}>
                <Image src={url} />
                <Heading>Title {index}</Heading>
                <Text slot="detail">PNG</Text>
                <Content>{getDescription(index)}</Content>
              </Story>
            </div>
          );
        })
      }
    </div>
  );
};

export const CardFloat: CardStory = {
  render: (args, context) => <Card {...args} {...context} id={null} />,
  decorators: [(Story, context) => (
    <CardFloatDecorator
      Story={Story}
      context={context} />
  )]
};

let CardFloatDecorator = (props) => {
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

export const CardGridMessyText: CardStory = {
  render: (args, context) => <Card {...args} {...context} id={null} />,
  args: {...Default.args, layout: 'grid'},
  decorators: [(Story, context) => (
    <CardGridMessyTextDecorator
      Story={Story}
      context={context} />
  )]
};

let CardGridMessyTextDecorator = (props) => {
  let {Story, context} = props;
  let {args} = context;
  let {scale} = useProvider();

  return (
    <div
      style={{
        width: '100%',
        margin: '50px',
        display: 'grid',
        gap: '20px',
        gridTemplateColumns: 'repeat(auto-fit, 208px)',
        gridAutoRows: 'auto',
        justifyContent: 'center',
        justifyItems: 'center',
        alignItems: 'start'
      }}>
      {
        (new Array(15).fill(0)).map((_, index) => {
          let url = getImage(index);
          return (
            <div style={scale === 'medium' ? {width: '208px', height: '293px'} : {width: '208px', height: '355px'}} key={`${index}${url}`}>
              <Story {...args}>
                <Image src={url} />
                <Heading>{index} Rechtsschutzversicherungsgesellschaften Nahrungsmittelunverträglichkeit Unabhängigkeitserklärungen Freundschaftsbeziehungen</Heading>
                <Text slot="detail">Rechtsschutzversicherungsgesellschaften Nahrungsmittelunverträglichkeit Unabhängigkeitserklärungen Freundschaftsbeziehungen</Text>
                <Content>Rechtsschutzversicherungsgesellschaften Nahrungsmittelunverträglichkeit Unabhängigkeitserklärungen Freundschaftsbeziehungen</Content>
              </Story>
            </div>
          );
        })
      }
    </div>
  );
};

export const CardWaterfallMessyText: CardStory = {
  render: (args, context) => <Card {...args} {...context} id={null} />,
  args: {...Default.args, layout: 'waterfall'},
  decorators: [(Story, context) => (
    <CardWaterfallMessyTextDecorator
      Story={Story}
      context={context} />
  )]
};

let CardWaterfallMessyTextDecorator = (props) => {
  let {Story, context} = props;
  let {args} = context;
  return (
    <div
      style={{
        width: '100%',
        height: '150vh',
        margin: '50px',
        display: 'flex',
        flexDirection: 'column',
        flexWrap: 'wrap',
        alignItems: 'start'
      }}>
      {
        (new Array(15).fill(0)).map((_, index) => {
          let url = getImage(index);
          return (
            <div style={{width: '208px', margin: '10px'}} key={`${index}${url}`}>
              <Story {...args}>
                <Image src={url} />
                <Heading>{index} Rechtsschutzversicherungsgesellschaften Nahrungsmittelunverträglichkeit Unabhängigkeitserklärungen Freundschaftsbeziehungen</Heading>
                <Text slot="detail">Rechtsschutzversicherungsgesellschaften Nahrungsmittelunverträglichkeit Unabhängigkeitserklärungen Freundschaftsbeziehungen</Text>
                <Content>Rechtsschutzversicherungsgesellschaften Nahrungsmittelunverträglichkeit Unabhängigkeitserklärungen Freundschaftsbeziehungen</Content>
              </Story>
            </div>
          );
        })
      }
    </div>
  );
};

export const CardGridNoPreview: CardStory = {
  render: (args, context) => <Card {...args} {...context} id={null} />,
  args: {...Default.args, layout: 'grid'},
  decorators: [(Story, context) => (
    <CardGridNoPreviewDecorator
      Story={Story}
      context={context} />
  )]
};

let CardGridNoPreviewDecorator = (props) => {
  let {Story, context} = props;
  let {args} = context;
  let {scale} = useProvider();

  return (
    <div
      style={{
        width: '100%',
        margin: '50px',
        display: 'grid',
        gap: '20px',
        gridTemplateColumns: 'repeat(auto-fit, 208px)',
        gridAutoRows: 'auto',
        justifyContent: 'center',
        justifyItems: 'center',
        alignItems: 'start'
      }}>
      {
        (new Array(15).fill(0)).map((_, index) => {
          let url = getImage(index);
          return (
            <div style={scale === 'medium' ? {width: '208px', height: '160px'} : {width: '208px', height: '200px'}} key={`${index}${url}`}>
              <Story {...args}>
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

export const CardWaterfallNoPreview: CardStory = {
  render: (args, context) => <Card {...args} {...context} id={null} />,
  args: {layout: 'waterfall'},
  decorators: [(Story, context) => (
    <CardWaterfallNoPreviewDecorator
      Story={Story}
      context={context} />
  )]
};

let CardWaterfallNoPreviewDecorator = (props) => {
  let {Story, context} = props;
  let {args} = context;

  return (
    <div
      style={{
        width: '100%',
        height: '150vh',
        margin: '50px',
        display: 'flex',
        flexDirection: 'column',
        flexWrap: 'wrap',
        alignItems: 'start'
      }}>
      {
        (new Array(15).fill(0)).map((_, index) => {
          let url = getImage(index);
          return (
            <div style={{width: '208px', margin: '10px'}} key={`${index}${url}`}>
              <Story {...args}>
                <Heading>Title {index}</Heading>
                <Text slot="detail">PNG</Text>
                <Content>{getDescription(index)}</Content>
              </Story>
            </div>
          );
        })
      }
    </div>
  );
};


/* This is a bit of a funny template, we can't get selected on a Card through context because
* if there's context it assumes it's being rendered in a collection. It's just here for a quick check of styles. */
interface ISelectableCard {
  disabledKeys: Set<any>,
  selectionManager: {
    isSelected: () => boolean,
    select: () => Dispatch<SetStateAction<ISelectableCard>>
  }
}
let SelectableCard = (props: SpectrumCardProps) => {
  let [state, setState] = useState<ISelectableCard>({
    disabledKeys: new Set(),
    selectionManager: {
      isSelected: () => true,
      select: () => setState(prev => ({
        ...prev,
        selectionManager: {
          ...prev.selectionManager,
          isSelected: () => !prev.selectionManager.isSelected()
        }
      }))
    }
  });
  let {pressProps} = usePress({onPress: () => setState(prev => ({
    ...prev,
    selectionManager: {
      ...prev.selectionManager,
      isSelected: () => !prev.selectionManager.isSelected()
    }
  }))});
  return (
    <div style={{width: '208px'}} {...pressProps}>
      <CardViewContext.Provider value={{state}}>
        <CardBase {...props} />
      </CardViewContext.Provider>
    </div>
  );
};

export const Selected: CardStory = {
  args: {...Default.args},
  render: (args) => <SelectableCard {...args} id={null} />
};
