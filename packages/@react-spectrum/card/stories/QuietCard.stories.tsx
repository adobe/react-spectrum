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
import {classNames} from '@react-spectrum/utils';
import {ComponentMeta} from '@storybook/react';
import {Content} from '@react-spectrum/view';
import {File} from '../chromatic/Card.chromatic';
import {getDescription, getImage} from '../stories/utils';
import {Heading, Text} from '@react-spectrum/text';
import {Image} from '@react-spectrum/image';
import {Quiet, QuietNoDescription} from '../chromatic/QuietCard.chromatic';
import React from 'react';
import {SpectrumCardProps} from '@react-types/card';
import styles from '@adobe/spectrum-css-temp/components/card/vars.css';

export default {
  title: 'Card/quiet',
  component: Card
} as ComponentMeta<typeof Card>;

export const CardGrid = (props: SpectrumCardProps) => (
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
          <Card {...Quiet.args} {...props} layout="grid" key={`${index}${url}`}>
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

export const CardWaterfall = (props: SpectrumCardProps) => (
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
            <Card {...Quiet.args} {...props} layout="waterfall" key={`${index}${url}`}>
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

export const CardGallery = (props: SpectrumCardProps) => (
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
          <div style={{height: '339px', margin: '10px'}}>
            <Card {...Quiet.args} {...props} layout="gallery" key={`${index}${url}`}>
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
            <Card {...Quiet.args} {...props} key={`${index}${url}`}>
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

export const CardGridNoDescription = (props: SpectrumCardProps) => (
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
          <Card {...QuietNoDescription.args} {...props} layout="grid" key={`${index}${url}`}>
            <Image src={url} />
            <Heading>Title {index}</Heading>
            <Text slot="detail">PNG</Text>
          </Card>
        );
      })
    }
  </div>
);

export const CardGridIllustrations = (props: SpectrumCardProps) => (
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
          <Card {...QuietNoDescription.args} {...props} layout="grid" key={`${index}${url}`}>
            <File slot="illustration" />
            <Heading>Title {index}</Heading>
            <Text slot="detail">PNG</Text>
          </Card>
        );
      })
    }
  </div>
);

export const CardGridLongTitle = (props: SpectrumCardProps) => (
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
          <Card {...Quiet.args} {...props} layout="grid" key={`${index}${url}`}>
            <Image src={url} />
            <Heading>This is a long title about how dinosaurs used to rule the earth before a meteor came and wiped them all out {index}</Heading>
            <Text slot="detail">PNG</Text>
            <Content>Description</Content>
          </Card>
        );
      })
    }
  </div>
);


export const CardGridTallRows = (props: SpectrumCardProps) => (
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
          <Card {...Quiet.args} {...props} layout="grid" key={`${index}${url}`}>
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

export const CardGridMessyText = (props: SpectrumCardProps) => (
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
          <Card {...Quiet.args} {...props} layout="grid" key={`${index}${url}`}>
            <Image src={url} />
            <Heading>{index} Rechtsschutzversicherungsgesellschaften Nahrungsmittelunverträglichkeit Unabhängigkeitserklärungen Freundschaftsbeziehungen</Heading>
            <Text slot="detail">Rechtsschutzversicherungsgesellschaften Nahrungsmittelunverträglichkeit Unabhängigkeitserklärungen Freundschaftsbeziehungen</Text>
            <Content>Rechtsschutzversicherungsgesellschaften Nahrungsmittelunverträglichkeit Unabhängigkeitserklärungen Freundschaftsbeziehungen</Content>
          </Card>
        );
      })
    }
  </div>
);

export const CardWaterfallMessyText = (props: SpectrumCardProps) => (
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
            <Card {...Quiet.args} {...props} layout="waterfall" key={`${index}${url}`}>
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

export const CardGalleryMessyText = (props: SpectrumCardProps) => (
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
          <div style={{height: '339px', margin: '10px'}}>
            <Card {...Quiet.args} {...props} layout="gallery" key={`${index}${url}`}>
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
CardGalleryMessyText.decorators = [(Story) => (
  <>
    <div style={{position: 'absolute', top: '5px'}}>{'ignore extra horizontal space, it will not do this in a real gallery layout'}</div>
    <Story />
  </>
)];
