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
import {classNames, useSlotProps, useStyleProps} from '../../utils';
import {Content} from '@react-spectrum/view';
import {
  Default,
  DefaultSquare,
  DefaultTall, LongDescription, LongDetail, LongTitle, NoActionMenu,
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
import assetStyles from '@adobe/spectrum-css-temp/components/asset/vars.css';


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

export const QuietNoActionMenu = Template().bind({});
QuietNoActionMenu.args = {...NoActionMenu.args, isQuiet: true};

export const QuietWithIllustration = Template().bind({});
QuietWithIllustration.args = {...WithIllustration.args, isQuiet: true};

export const QuietLongTitle = Template().bind({});
QuietLongTitle.args = {...LongTitle.args, isQuiet: true};

export const QuietLongDescription = Template().bind({});
QuietLongDescription.args = {...LongDescription.args, isQuiet: true};

export const QuietLongDetail = Template().bind({});
QuietLongDetail.args = {...LongDetail.args, isQuiet: true};

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
          <div style={{width: '208px', height: '305px'}}>
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
          <div style={{width: '208px', height: '274px'}}>
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

export const GridOfCardsIllustrations = (props: SpectrumCardProps) => (
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
          <div style={{width: '208px', height: '274px'}}>
            <Card {...QuietNoDescription.args} {...props} key={`${index}${url}`}>
              <File slot="illustration" />
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

export const GridOfLongTitleCards = (props: SpectrumCardProps) => (
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
          <div style={{width: '208px', height: '305px'}}>
            <Card {...Quiet.args} {...props} key={`${index}${url}`}>
              <Image src={url} />
              <Heading>This is a long title about how dinosaurs used to rule the earth before a meteor came and wiped them all out {index}</Heading>
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

function File(props) {
  props = useSlotProps(props, 'asset');
  let {styleProps} = useStyleProps(props);
  return (
    <div className={classNames(assetStyles, styleProps.className)}>
      <svg
        viewBox="0 0 128 128"
        {...props}
        {...styleProps}
        className={classNames(assetStyles, 'spectrum-Asset-file')}
        aria-label={props.alt}
        aria-hidden={props.decorative || null}
        role="img">
        <g>
          <path
            className={classNames(assetStyles, 'spectrum-Asset-fileBackground')}
            d="M24,126c-5.5,0-10-4.5-10-10V12c0-5.5,4.5-10,10-10h61.5c2.1,0,4.1,0.8,5.6,2.3l20.5,20.4c1.5,1.5,2.4,3.5,2.4,5.7V116c0,5.5-4.5,10-10,10H24z" />
          <g>
            <path
              className={classNames(assetStyles, 'spectrum-Asset-fileOutline')}
              d="M113.1,23.3L92.6,2.9C90.7,1,88.2,0,85.5,0H24c-6.6,0-12,5.4-12,12v104c0,6.6,5.4,12,12,12h80c6.6,0,12-5.4,12-12V30.4C116,27.8,114.9,25.2,113.1,23.3z M90,6l20.1,20H92c-1.1,0-2-0.9-2-2V6z M112,116c0,4.4-3.6,8-8,8H24c-4.4,0-8-3.6-8-8V12c0-4.4,3.6-8,8-8h61.5c0.2,0,0.3,0,0.5,0v20c0,3.3,2.7,6,6,6h20c0,0.1,0,0.3,0,0.4V116z" />
          </g>
        </g>
      </svg>
    </div>
  );
}
