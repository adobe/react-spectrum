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
import {ComponentMeta} from '@storybook/react';
import {Content} from '@react-spectrum/view';
import {getImage} from '../stories/utils';
import {Heading, Text} from '@react-spectrum/text';
import {Horizontal} from '../chromatic/HorizontalCard.chromatic';
import {Image} from '@react-spectrum/image';
import React from 'react';
import {SpectrumCardProps} from '@react-types/card';

export default {
  title: 'Card/horizontal',
  component: Card
} as ComponentMeta<typeof Card>;


export const CardGrid = (props: SpectrumCardProps) => (
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
          <Card {...Horizontal.args} {...props} layout="grid" key={`${index}${url}`}>
            <Image src={url} />
            <Heading>Title {index}</Heading>
            <Text slot="detail">PNG</Text>
            <Content>Description</Content>
          </Card>
        );
      })
    }
  </div>
);


export const CardFloat = (props: SpectrumCardProps) => (
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
            <Card {...Horizontal.args} {...props} key={`${index}${url}`}>
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

export const CardGridTall = (props: SpectrumCardProps) => (
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
          <Card {...Horizontal.args} {...props} layout="grid" key={`${index}${url}`}>
            <Image src={url} />
            <Heading>Title {index}</Heading>
            <Text slot="detail">PNG</Text>
            <Content>Description</Content>
          </Card>
        );
      })
    }
  </div>
);
