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

import {Card} from '..';
import {ComponentMeta, ComponentStoryObj} from '@storybook/react';
import {Content} from '@react-spectrum/view';
import {Default} from '../chromatic/Card.chromatic';
import {getDescription, getImage} from './utils';
import {Heading, Text} from '@react-spectrum/text';
import {Image} from '@react-spectrum/image';
import React from 'react';
import {SpectrumCardProps} from '@react-types/card';
import {useProvider} from '@react-spectrum/provider';

export default {
  title: 'Card/default',
  component: Card
} as ComponentMeta<typeof Card>;

export type CardStory = ComponentStoryObj<typeof Card>;

export const CardGrid: ComponentStoryObj<typeof _CardGrid> = {
  render: (args) => <_CardGrid {...args} />,
  args: {...Default.args}
};
let _CardGrid = (props: Omit<SpectrumCardProps, 'children'>) => {
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
            <div style={scale === 'medium' ? {width: '208px', height: '293px'} : {width: '208px', height: '355px'}}>
              <Card {...props} layout="grid" key={`${index}${url}`}>
                <Image src={url} />
                <Heading>Title {index}</Heading>
                <Text slot="detail">PNG</Text>
                <Content>Description</Content>
              </Card>
            </div>
          );
        })
      }
    </div>
  );
};

export const CardWaterfall: ComponentStoryObj<typeof _CardWaterfall> = {
  render: (args) => <_CardWaterfall {...args} />,
  args: {...Default.args}
};

let _CardWaterfall = (props: SpectrumCardProps) => (
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
          <div style={{width: '208px', margin: '10px'}}>
            <Card {...props} layout="waterfall" key={`${index}${url}`}>
              <Image src={url} />
              <Heading>Title {index}</Heading>
              <Text slot="detail">PNG</Text>
              <Content>{getDescription(index)}</Content>
            </Card>
          </div>
        );
      })
    }
  </div>
);

export const CardFloat: ComponentStoryObj<typeof _CardFloat> = {
  render: (args) => <_CardFloat {...args} />,
  args: {...Default.args}
};

let _CardFloat = (props: SpectrumCardProps) => (
  <div
    style={{
      width: '100%',
      margin: '50px'
    }}>
    {
      (new Array(15).fill(0)).map((_, index) => {
        let url = getImage(index);
        return (
          <div style={{float: 'left', margin: '10px'}}>
            <Card {...props} key={`${index}${url}`}>
              <Image src={url} />
              <Heading>Title {index}</Heading>
              <Text slot="detail">PNG</Text>
              <Content>Description</Content>
            </Card>
          </div>
        );
      })
    }
  </div>
);

export const CardGridMessyText: ComponentStoryObj<typeof _CardGridMessyText> = {
  render: (args) => <_CardGridMessyText {...args} />,
  args: {...Default.args}
};

let _CardGridMessyText = (props: SpectrumCardProps) => {
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
            <div style={scale === 'medium' ? {width: '208px', height: '293px'} : {width: '208px', height: '355px'}}>
              <Card {...props} layout="grid" key={`${index}${url}`}>
                <Image src={url} />
                <Heading>{index} Rechtsschutzversicherungsgesellschaften Nahrungsmittelunverträglichkeit Unabhängigkeitserklärungen Freundschaftsbeziehungen</Heading>
                <Text slot="detail">Rechtsschutzversicherungsgesellschaften Nahrungsmittelunverträglichkeit Unabhängigkeitserklärungen Freundschaftsbeziehungen</Text>
                <Content>Rechtsschutzversicherungsgesellschaften Nahrungsmittelunverträglichkeit Unabhängigkeitserklärungen Freundschaftsbeziehungen</Content>
              </Card>
            </div>
          );
        })
      }
    </div>
  );
};

export const CardWaterfallMessyText: ComponentStoryObj<typeof _CardWaterfallMessyText> = {
  render: (args) => <_CardWaterfallMessyText {...args} />,
  args: {...Default.args}
};

let _CardWaterfallMessyText = (props: SpectrumCardProps) => (
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
          <div style={{width: '208px', margin: '10px'}}>
            <Card {...props} layout="waterfall" key={`${index}${url}`}>
              <Image src={url} />
              <Heading>{index} Rechtsschutzversicherungsgesellschaften Nahrungsmittelunverträglichkeit Unabhängigkeitserklärungen Freundschaftsbeziehungen</Heading>
              <Text slot="detail">Rechtsschutzversicherungsgesellschaften Nahrungsmittelunverträglichkeit Unabhängigkeitserklärungen Freundschaftsbeziehungen</Text>
              <Content>Rechtsschutzversicherungsgesellschaften Nahrungsmittelunverträglichkeit Unabhängigkeitserklärungen Freundschaftsbeziehungen</Content>
            </Card>
          </div>
        );
      })
    }
  </div>
);

export const CardGridNoPreview: ComponentStoryObj<typeof _CardGridNoPreview> = {
  render: (args) => <_CardGridNoPreview {...args} />,
  args: {...Default.args}
};

let _CardGridNoPreview = (props: SpectrumCardProps) => {
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
            <div style={scale === 'medium' ? {width: '208px', height: '160px'} : {width: '208px', height: '200px'}}>
              <Card {...props} layout="grid" key={`${index}${url}`}>
                <Heading>Title {index}</Heading>
                <Text slot="detail">PNG</Text>
                <Content>Description</Content>
              </Card>
            </div>
          );
        })
      }
    </div>
  );
};

export const CardWaterfallNoPreview: ComponentStoryObj<typeof _CardWaterfallNoPreview> = {
  render: (args) => <_CardWaterfallNoPreview {...args} />,
  args: {...Default.args}
};

let _CardWaterfallNoPreview = (props: SpectrumCardProps) => (
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
          <div style={{width: '208px', margin: '10px'}}>
            <Card {...Default.args} {...props} layout="waterfall" key={`${index}${url}`}>
              <Heading>Title {index}</Heading>
              <Text slot="detail">PNG</Text>
              <Content>{getDescription(index)}</Content>
            </Card>
          </div>
        );
      })
    }
  </div>
);
