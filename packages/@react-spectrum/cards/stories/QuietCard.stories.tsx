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

import {ActionMenu, Item} from '@react-spectrum/menu';
import {Card} from '../';
import {classNames} from '../../utils';
import {Content} from '@react-spectrum/view';
import {
  Default,
  DefaultSquare,
  DefaultTall,
  NoDescription,
  NoDescriptionSquare,
  WithIllustration
} from './Card.stories';
import {getImage} from './utils';
import {Heading, Text} from '@react-spectrum/text';
import {Image} from '@react-spectrum/image';
import {Meta, Story} from '@storybook/react';
import React from 'react';
import {SpectrumCardProps} from '@react-types/cards';
import styles from '@adobe/spectrum-css-temp/components/card/vars.css';


const meta: Meta<SpectrumCardProps> = {
  title: 'Card/quiet',
  component: Card
};

export default meta;


const Template = (): Story<SpectrumCardProps> => (args) => (
  <div style={{width: '208px'}}>
    <Card {...args} />
  </div>
);

export const Quiet = Template().bind({});
Quiet.args = {...Default.args, isQuiet: true};

export const QuietSquare = Template().bind({});
QuietSquare.args = {...DefaultSquare.args, isQuiet: true};

export const QuietTall = Template().bind({});
QuietTall.args = {...DefaultTall.args, isQuiet: true};

export const QuietNoDescription = Template().bind({});
QuietNoDescription.args = {...NoDescription.args, isQuiet: true};

export const QuietNoDescriptionSquare = Template().bind({});
QuietNoDescriptionSquare.args = {...NoDescriptionSquare.args, isQuiet: true};

export const QuietWithIllustration = Template().bind({});
QuietWithIllustration.args = {...WithIllustration.args, isQuiet: true};

export const GridOfCards = (props: SpectrumCardProps) => (
  <div
    className={classNames(styles, 'spectrum-CardGrid')}
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
          <div style={{width: '208px', height: '276px'}}>
            <Card {...Quiet.args} {...props} key={`${index}${url}`}>
              <Image src={url} />
              <Heading>Title {index}</Heading>
              <Text slot="detail">PNG</Text>
              <Content>Description</Content>
              <ActionMenu>
                <Item>Action 1</Item>
                <Item>Action 2</Item>
              </ActionMenu>
            </Card>
          </div>
        );
      })
    }
  </div>
);

export const GridOfCardsNoDescription = (props: SpectrumCardProps) => (
  <div
    className={classNames(styles, 'spectrum-CardGrid')}
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
          <div style={{width: '208px', height: '256px'}}>
            <Card {...QuietNoDescription.args} {...props} key={`${index}${url}`}>
              <Image src={url} />
              <Heading>Title {index}</Heading>
              <Text slot="detail">PNG</Text>
              <ActionMenu>
                <Item>Action 1</Item>
                <Item>Action 2</Item>
              </ActionMenu>
            </Card>
          </div>
        );
      })
    }
  </div>
);
