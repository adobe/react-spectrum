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
import {classNames} from '@react-spectrum/utils';
import {ComponentMeta} from '@storybook/react';
import {Content} from '@react-spectrum/view';
import {File} from '../chromatic/Card.stories';
import {getDescription, getImage} from '../stories/utils';
import {Heading, Text} from '@react-spectrum/text';
import {Image} from '@react-spectrum/image';
import {Quiet} from '../chromatic/QuietCard.stories';
import React from 'react';
import styles from '@adobe/spectrum-css-temp/components/card/vars.css';

export default {
  title: 'Card/quiet',
  component: Card,
  args: {
    isQuiet: true
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
    },
    isQuiet: {
      table: {
        disable: true
      }
    }
  }
} as ComponentMeta<typeof Card>;

export const CardGrid: CardStory = {
  render: (args, context) => <Card {...args} {...context} id={null} />,
  args: {...Quiet.args, layout: 'grid'},
  decorators: [(Story, context) => (
    <CardGridDecorator
      Story={Story}
      context={context} />
  )]
};

let CardGridDecorator = (props) => {
  let {Story, context} = props;
  let {args} = context;
  return (
    <div
      style={{
        width: '100%',
        margin: '50px',
        display: 'grid',
        gap: '20px',
        gridTemplateColumns: 'repeat(auto-fit, 208px)',
        gridAutoRows: '305px'
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


export const CardWaterfall: CardStory = {
  render: (args, context) => <Card {...args} {...context} id={null} />,
  args: {...Quiet.args, layout: 'waterfall'},
  decorators: [(Story, context) => (
    <CardWaterfallDecorator
      Story={Story}
      context={context} />
  )]
};

const CardWaterfallDecorator = (props) => {
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

export const CardGallery: CardStory = {
  render: (args, context) => <Card {...args} {...context} id={null} />,
  args: {...Quiet.args, layout: 'gallery'},
  decorators: [(Story, context) => (
    <CardGalleryDecorator
      Story={Story}
      context={context} />
  )]
};

const CardGalleryDecorator = (props) => {
  let {Story, context} = props;
  let {args} = context;
  return (
    <div
      style={{
        width: '100%',
        margin: '50px',
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap'
      }}>
      {
        (new Array(15).fill(0)).map((_, index) => {
          let url = getImage(index);
          return (
            <div style={{height: '339px', margin: '10px'}} key={`${index}${url}`}>
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

export const CardFloat: CardStory = {
  render: (args, context) => <Card {...args} {...context} id={null} />,
  args: {...Quiet.args},
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

export const CardGridNoDescription: CardStory = {
  render: (args, context) => <Card {...args} {...context} id={null} />,
  args: {...Quiet.args, layout: 'grid'},
  decorators: [(Story, context) => (
    <CardGridNoDescriptionDecorator
      Story={Story}
      context={context} />
  )]
};

const CardGridNoDescriptionDecorator = (props) => {
  let {Story, context} = props;
  let {args} = context;
  return (
    <div
      className={classNames(styles, 'spectrum-CardGrid')}
      style={{
        width: '100%',
        margin: '50px',
        display: 'grid',
        gap: '20px',
        gridTemplateColumns: 'repeat(auto-fit, 208px)',
        gridAutoRows: '274px'
      }}>
      {
        (new Array(15).fill(0)).map((_, index) => {
          let url = getImage(index);
          return (
            <Story {...args} key={`${index}${url}`}>
              <Image src={url} />
              <Heading>Title {index}</Heading>
              <Text slot="detail">PNG</Text>
            </Story>
          );
        })
      }
    </div>
  );
};

export const CardGridIllustrations: CardStory = {
  render: (args, context) => <Card {...args} {...context} id={null} />,
  args: {...Quiet.args, layout: 'grid'},
  decorators: [(Story, context) => (
    <CardGridIllustrationsDecorator
      Story={Story}
      context={context} />
  )]
};

const CardGridIllustrationsDecorator = (props) => {
  let {Story, context} = props;
  let {args} = context;
  return (
    <div
      className={classNames(styles, 'spectrum-CardGrid')}
      style={{
        width: '100%',
        margin: '50px',
        display: 'grid',
        gap: '20px',
        gridTemplateColumns: 'repeat(auto-fit, 208px)',
        gridAutoRows: '274px'
      }}>
      {
        (new Array(15).fill(0)).map((_, index) => {
          let url = getImage(index);
          return (
            <Story {...args} key={`${index}${url}`}>
              <File slot="illustration" alt="test illustration" />
              <Heading>Title {index}</Heading>
              <Text slot="detail">PNG</Text>
            </Story>
          );
        })
      }
    </div>
  );
};

export const CardGridLongTitle: CardStory = {
  render: (args, context) => <Card {...args} {...context} id={null} />,
  args: {...Quiet.args, layout: 'grid'},
  decorators: [(Story, context) => (
    <CardGridLongTitleDecorator
      Story={Story}
      context={context} />
  )]
};

const CardGridLongTitleDecorator = (props) => {
  let {Story, context} = props;
  let {args} = context;
  return (
    <div
      className={classNames(styles, 'spectrum-CardGrid')}
      style={{
        width: '100%',
        margin: '50px',
        display: 'grid',
        gap: '20px',
        gridTemplateColumns: 'repeat(auto-fit, 208px)',
        gridAutoRows: '305px'
      }}>
      {
        (new Array(15).fill(0)).map((_, index) => {
          let url = getImage(index);
          return (
            <Story {...args} key={`${index}${url}`}>
              <Image src={url} />
              <Heading>This is a long title about how dinosaurs used to rule the earth before a meteor came and wiped them all out {index}</Heading>
              <Text slot="detail">PNG</Text>
              <Content>Description</Content>
            </Story>
          );
        })
      }
    </div>
  );
};

export const CardGridTallRows: CardStory = {
  render: (args, context) => <Card {...args} {...context} id={null} />,
  args: {...Quiet.args, layout: 'grid'},
  decorators: [(Story, context) => (
    <CardGridTallRowsDecorator
      Story={Story}
      context={context} />
  )]
};

const CardGridTallRowsDecorator = (props) => {
  let {Story, context} = props;
  let {args} = context;
  return (
    <div
      className={classNames(styles, 'spectrum-CardGrid')}
      style={{
        width: '100%',
        margin: '50px',
        display: 'grid',
        gap: '20px',
        gridTemplateColumns: 'repeat(auto-fit, 208px)',
        gridAutoRows: '400px'
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

export const CardGridMessyText: CardStory = {
  render: (args, context) => <Card {...args} {...context} id={null} />,
  args: {...Quiet.args, layout: 'grid'},
  decorators: [(Story, context) => (
    <CardGridMessyTextDecorator
      Story={Story}
      context={context} />
  )]
};

const CardGridMessyTextDecorator = (props) => {
  let {Story, context} = props;
  let {args} = context;
  return (
    <div
      style={{
        width: '100%',
        margin: '50px',
        display: 'grid',
        gap: '20px',
        gridTemplateColumns: 'repeat(auto-fit, 208px)',
        gridAutoRows: '305px'
      }}>
      {
        (new Array(15).fill(0)).map((_, index) => {
          let url = getImage(index);
          return (
            <Story {...args} key={`${index}${url}`}>
              <Image src={url} />
              <Heading>{index} Rechtsschutzversicherungsgesellschaften Nahrungsmittelunverträglichkeit Unabhängigkeitserklärungen Freundschaftsbeziehungen</Heading>
              <Text slot="detail">Rechtsschutzversicherungsgesellschaften Nahrungsmittelunverträglichkeit Unabhängigkeitserklärungen Freundschaftsbeziehungen</Text>
              <Content>Rechtsschutzversicherungsgesellschaften Nahrungsmittelunverträglichkeit Unabhängigkeitserklärungen Freundschaftsbeziehungen</Content>
            </Story>
          );
        })
      }
    </div>
  );
};

export const CardWaterfallMessyText: CardStory = {
  render: (args, context) => <Card {...args} {...context} id={null} />,
  args: {...Quiet.args, layout: 'waterfall'},
  decorators: [(Story, context) => (
    <CardWaterfallMessyTextDecorator
      Story={Story}
      context={context} />
  )]
};

const CardWaterfallMessyTextDecorator = (props) => {
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

export const CardGalleryMessyText: CardStory = {
  render: (args, context) => <Card {...args} {...context} id={null} />,
  args: {...Quiet.args, layout: 'gallery'},
  decorators: [(Story, context) => (
    <CardGalleryMessyTextDecorator
      Story={Story}
      context={context} />
  )],
  parameters: {description: {data: 'ignore extra horizontal space, it will not do this in a real gallery layout'}}
};

const CardGalleryMessyTextDecorator = (props) => {
  let {Story, context} = props;
  let {args} = context;
  return (
    <div
      style={{
        width: '100%',
        margin: '50px',
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap'
      }}>
      {
        (new Array(15).fill(0)).map((_, index) => {
          let url = getImage(index);
          return (
            <div style={{height: '339px', margin: '10px'}} key={`${index}${url}`}>
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
