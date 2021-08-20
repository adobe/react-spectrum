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

import {action} from '@storybook/addon-actions';
import {ActionMenu, Item} from '@react-spectrum/menu';
import assetStyles from '@adobe/spectrum-css-temp/components/asset/vars.css';
import {Button} from '@react-spectrum/button';
import {Card} from '../';
import {CardBase} from '../src/CardBase';
import {CardViewContext} from '../src/CardViewContext';
import {classNames, useSlotProps, useStyleProps} from '@react-spectrum/utils';
import {Content, Footer} from '@react-spectrum/view';
import {getImage} from './utils';
import {Heading, Text} from '@react-spectrum/text';
import {Image} from '@react-spectrum/image';
import {Meta, Story} from '@storybook/react';
import React from 'react';
import {SpectrumCardProps} from '@react-types/cards';


const meta: Meta<SpectrumCardProps> = {
  title: 'Card/default',
  component: Card
};

export default meta;


const Template = (): Story<SpectrumCardProps> => (args) => (
  <div style={{width: '208px'}}>
    <Card {...args} />
  </div>
);

/* This is a bit of a funny template, we can't get selected on a Card through context because
* if there's context it assumes it's being rendered in a collection. It's just here for a quick check of styles. */
let manager = {
  isSelected: () => true,
  select: action('select')
};
let state = {
  disabledKeys: new Set(),
  selectionManager: manager
};
const TemplateSelected = (): Story<SpectrumCardProps> => (args) => (
  <div style={{width: '208px'}}>
    <CardViewContext.Provider value={{state}}>
      <CardBase {...args} />
    </CardViewContext.Provider>
  </div>
);


export const Default = Template().bind({});
Default.args = {children: (
  <>
    <Image src="https://i.imgur.com/Z7AzH2c.jpg" />
    <Heading>Title</Heading>
    <Text slot="detail">PNG</Text>
    <Content>Description</Content>
    <ActionMenu>
      <Item>Action 1</Item>
      <Item>Action 2</Item>
    </ActionMenu>
    <Footer>
      <Button variant="primary">Something</Button>
    </Footer>
  </>
)};

export const DefaultSquare = Template().bind({});
DefaultSquare.args = {children: (
  <>
    <Image src="https://i.imgur.com/DhygPot.jpg" />
    <Heading>Title</Heading>
    <Text slot="detail">PNG</Text>
    <Content>Description</Content>
    <ActionMenu>
      <Item>Action 1</Item>
      <Item>Action 2</Item>
    </ActionMenu>
    <Footer>
      <Button variant="primary">Something</Button>
    </Footer>
  </>
)};

export const DefaultTall = Template().bind({});
DefaultTall.args = {children: (
  <>
    <Image src="https://i.imgur.com/3lzeoK7.jpg" />
    <Heading>Title</Heading>
    <Text slot="detail">PNG</Text>
    <Content>Description</Content>
    <ActionMenu>
      <Item>Action 1</Item>
      <Item>Action 2</Item>
    </ActionMenu>
    <Footer>
      <Button variant="primary">Something</Button>
    </Footer>
  </>
)};

export const DefaultPreviewAlt = Template().bind({});
DefaultPreviewAlt.args = {children: (
  <>
    <Image alt="preview" src="https://i.imgur.com/Z7AzH2c.jpg" />
    <Heading>Title</Heading>
    <Text slot="detail">PNG</Text>
    <Content>Description</Content>
    <ActionMenu>
      <Item>Action 1</Item>
      <Item>Action 2</Item>
    </ActionMenu>
    <Footer>
      <Button variant="primary">Something</Button>
    </Footer>
  </>
)};

export const LongContent = Template().bind({});
LongContent.args = {children: (
  <>
    <Image src="https://i.imgur.com/Z7AzH2c.png" />
    <Heading>Title</Heading>
    <Text slot="detail">PNG</Text>
    <Content>This is the description that never ends, it goes on and on my friends. Someone started typing without knowing what it was.</Content>
    <ActionMenu>
      <Item>Action 1</Item>
      <Item>Action 2</Item>
    </ActionMenu>
    <Footer>
      <Button variant="primary">Something</Button>
    </Footer>
  </>
)};

export const LongContentSquare = Template().bind({});
LongContentSquare.args = {children: (
  <>
    <Image src="https://i.imgur.com/DhygPot.png" />
    <Heading>Title</Heading>
    <Text slot="detail">PNG</Text>
    <Content>This is the description that never ends, it goes on and on my friends. Someone started typing without knowing what it was.</Content>
    <ActionMenu>
      <Item>Action 1</Item>
      <Item>Action 2</Item>
    </ActionMenu>
    <Footer>
      <Button variant="primary">Something</Button>
    </Footer>
  </>
)};

export const NoDescription = Template().bind({});
NoDescription.args = {children: (
  <>
    <Image src="https://i.imgur.com/Z7AzH2c.png" />
    <Heading>Title</Heading>
    <Text slot="detail">PNG</Text>
    <ActionMenu>
      <Item>Action 1</Item>
      <Item>Action 2</Item>
    </ActionMenu>
    <Footer>
      <Button variant="primary">Something</Button>
    </Footer>
  </>
)};

export const NoDescriptionSquare = Template().bind({});
NoDescriptionSquare.args = {children: (
  <>
    <Image src="https://i.imgur.com/DhygPot.jpg" />
    <Heading>Title</Heading>
    <Text slot="detail">PNG</Text>
    <ActionMenu>
      <Item>Action 1</Item>
      <Item>Action 2</Item>
    </ActionMenu>
    <Footer>
      <Button variant="primary">Something</Button>
    </Footer>
  </>
)};

export const NoFooter = Template().bind({});
NoFooter.args = {children: (
  <>
    <Image src="https://i.imgur.com/Z7AzH2c.png" />
    <Heading>Title</Heading>
    <Text slot="detail">PNG</Text>
    <Content>Description</Content>
    <ActionMenu>
      <Item>Action 1</Item>
      <Item>Action 2</Item>
    </ActionMenu>
  </>
)};

export const NoActionMenu = Template().bind({});
NoActionMenu.args = {children: (
  <>
    <Image src="https://i.imgur.com/Z7AzH2c.png" />
    <Heading>Title</Heading>
    <Text slot="detail">PNG</Text>
    <Content>Description</Content>
    <Footer>
      <Button variant="primary">Something</Button>
    </Footer>
  </>
)};

export const NoFooterOrDescription = Template().bind({});
NoFooterOrDescription.args = {children: (
  <>
    <Image src="https://i.imgur.com/Z7AzH2c.png" />
    <Heading>Title</Heading>
    <Text slot="detail">PNG</Text>
    <ActionMenu>
      <Item>Action 1</Item>
      <Item>Action 2</Item>
    </ActionMenu>
  </>
)};

export const NoImage = Template().bind({});
NoImage.args = {children: (
  <>
    <Heading>Title</Heading>
    <Text slot="detail">PNG</Text>
    <ActionMenu>
      <Item>Action 1</Item>
      <Item>Action 2</Item>
    </ActionMenu>
  </>
)};

export const GridOfCards2ConstrainedAxis = (props: SpectrumCardProps) => (
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
          <div style={{width: '208px', height: '268px'}}>
            <Card {...Default.args} {...props} constrainedX constrainedY key={`${index}${url}`}>
              <Image src={url} />
              <Heading>Title {index}</Heading>
              <Text slot="detail">PNG</Text>
              <Content>Description</Content>
              <ActionMenu>
                <Item>Action 1</Item>
                <Item>Action 2</Item>
              </ActionMenu>
              <Footer>
                <Button variant="secondary">Button</Button>
              </Footer>
            </Card>
          </div>
        );
      })
    }
  </div>
);

export const GridOfCardsHorizontallyConstrained = (props: SpectrumCardProps) => (
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
            <Card {...Default.args} {...props} constrainedX key={`${index}${url}`}>
              <Image src={url} />
              <Heading>Title {index}</Heading>
              <Text slot="detail">PNG</Text>
              <Content>Description</Content>
              <ActionMenu>
                <Item>Action 1</Item>
                <Item>Action 2</Item>
              </ActionMenu>
              <Footer>
                <Button variant="secondary">Button</Button>
              </Footer>
            </Card>
          </div>
        );
      })
    }
  </div>
);

export const GridOfCardsUnconstrained = (props: SpectrumCardProps) => (
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
            <Card {...Default.args} {...props} key={`${index}${url}`}>
              <Image src={url} />
              <Heading>Title {index}</Heading>
              <Text slot="detail">PNG</Text>
              <Content>Description</Content>
              <ActionMenu>
                <Item>Action 1</Item>
                <Item>Action 2</Item>
              </ActionMenu>
              <Footer>
                <Button variant="secondary">Button</Button>
              </Footer>
            </Card>
          </div>
        );
      })
    }
  </div>
);

export const WithIllustration = Template().bind({});
WithIllustration.args = {children: (
  <>
    <File alt="file" slot="illustration" width={50} height={50} />
    <Heading>Title</Heading>
    <Text slot="detail">PNG</Text>
    <ActionMenu>
      <Item>Action 1</Item>
      <Item>Action 2</Item>
    </ActionMenu>
  </>
)};

export const LongTitle = Template().bind({});
LongTitle.args = {children: (
  <>
    <Image src="https://i.imgur.com/Z7AzH2c.jpg" />
    <Heading>This is a long title about how dinosaurs used to rule the earth before a meteor came and wiped them all out</Heading>
    <Text slot="detail">PNG</Text>
    <Content>Description</Content>
    <ActionMenu>
      <Item>Action 1</Item>
      <Item>Action 2</Item>
    </ActionMenu>
    <Footer>
      <Button variant="primary">Something</Button>
    </Footer>
  </>
)};

export const LongDescription = Template().bind({});
LongDescription.args = {children: (
  <>
    <Image src="https://i.imgur.com/Z7AzH2c.jpg" />
    <Heading>Title</Heading>
    <Text slot="detail">PNG</Text>
    <Content>This is a long description about the Pterodactyl, a pterosaur of the late Jurassic period, with a long slender head and neck and a very short tail.</Content>
    <ActionMenu>
      <Item>Action 1</Item>
      <Item>Action 2</Item>
    </ActionMenu>
    <Footer>
      <Button variant="primary">Something</Button>
    </Footer>
  </>
)};

export const LongDetail = Template().bind({});
LongDetail.args = {children: (
  <>
    <Image src="https://i.imgur.com/Z7AzH2c.jpg" />
    <Heading>Title</Heading>
    <Text slot="detail">Stats: Genus: Pterodactylus; Rafinesque, 1815 Order: Pterosauria Kingdom: Animalia Phylum: Chordata</Text>
    <Content>Description</Content>
    <ActionMenu>
      <Item>Action 1</Item>
      <Item>Action 2</Item>
    </ActionMenu>
    <Footer>
      <Button variant="primary">Something</Button>
    </Footer>
  </>
)};

export const Selected = TemplateSelected().bind({});
Selected.args = {...Default.args};

// actually use Illustration???
// where to get the three asset svgs to use with Illustration
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
