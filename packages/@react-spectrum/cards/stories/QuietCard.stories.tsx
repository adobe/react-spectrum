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

import {Card} from '../';
import {Default, DefaultSquare, NoDescription, NoDescriptionSquare, WithIllustration} from './Card.stories';
import {Meta, Story} from '@storybook/react';
import React from 'react';
import {SpectrumCardProps} from '@react-types/cards';


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

export const QuietNoDescription = Template().bind({});
QuietNoDescription.args = {...NoDescription.args, isQuiet: true};

export const QuietNoDescriptionSquare = Template().bind({});
QuietNoDescriptionSquare.args = {...NoDescriptionSquare.args, isQuiet: true};

export const QuietWithIllustration = Template().bind({});
QuietWithIllustration.args = {...WithIllustration.args, isQuiet: true};

export const GridOfCards = () => (
  <div
    style={{
      width: '100%',
      display: 'grid',
      gap: '20px',
      gridTemplateColumns: 'repeat(auto-fit, 250px)',
      gridAutoRows: 'auto',
      justifyItems: 'center',
      alignItems: 'start'
    }}>
    <Default {...Quiet.args} />
    <Default {...QuietSquare.args} />
    <Default {...Quiet.args} />
    <Default {...QuietSquare.args} />
    <Default {...Quiet.args} />
  </div>
);

export const GridOfCardsNoDescription = () => (
  <div
    style={{
      width: '100%',
      display: 'grid',
      gap: '20px',
      gridTemplateColumns: 'repeat(auto-fit, 250px)',
      gridAutoRows: 'auto',
      justifyItems: 'center',
      alignItems: 'start'
    }}>
    <Default {...QuietNoDescription.args} />
    <Default {...QuietNoDescriptionSquare.args} />
    <Default {...QuietNoDescription.args} />
    <Default {...QuietNoDescriptionSquare.args} />
    <Default {...QuietNoDescription.args} />
  </div>
);
