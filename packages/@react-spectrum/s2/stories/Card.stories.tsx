/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {ActionMenu, AssetCard, Avatar, Badge, Button, Card, CardPreview, CardProps, CollectionCardPreview, Content, Divider, Footer, Image, MenuItem, Meter, ProductCard, Skeleton, StatusLight, Text, UserCard} from '../src';
import Folder from '../s2wf-icons/S2_Icon_Folder_20_N.svg';
import FolderGradient from '../spectrum-illustrations/gradient/generic2/FolderClose';
import type {Meta} from '@storybook/react';
import Project from '../s2wf-icons/S2_Icon_Project_20_N.svg';
import Select from '../s2wf-icons/S2_Icon_Select_20_N.svg';
import {style} from '../style/spectrum-theme' with {type: 'macro'};

const meta: Meta<CardProps & {isLoading?: boolean}> = {
  component: Card,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  args: {
    isLoading: false
  },
  argTypes: {
    href: {table: {disable: true}},
    download: {table: {disable: true}},
    hrefLang: {table: {disable: true}},
    referrerPolicy: {table: {disable: true}},
    rel: {table: {disable: true}},
    routerOptions: {table: {disable: true}},
    ping: {table: {disable: true}},
    target: {table: {disable: true}},
    value: {table: {disable: true}},
    textValue: {table: {disable: true}},
    onAction: {table: {disable: true}},
    isDisabled: {table: {disable: true}}
  },
  decorators: (children, {args}) => (
    <Skeleton isLoading={args.isLoading || false}>
      {children(args)}
    </Skeleton>
  ),
  title: 'Card'
};

export default meta;

export const Example = (args: any) => (
  <div style={{display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'end', justifyContent: 'center'}}>
    <Card {...args}>
      <CardPreview>
        <Image src={new URL('assets/preview.png', import.meta.url).toString()} />
      </CardPreview>
      <Content>
        <Text slot="title">Card title</Text>
        <ActionMenu>
          <MenuItem>Test</MenuItem>
        </ActionMenu>
        <Text slot="description">Card description. Give a concise overview of the context or functionality that's mentioned in the card title.</Text>
      </Content>
      {args.size !== 'XS' && <>
        <Divider />
        <Footer>
          <StatusLight size="S" variant="positive">Published</StatusLight>
        </Footer>
      </>}
    </Card>
    <Card {...args}>
      <Content>
        <Text slot="title">Card title</Text>
        <Text slot="description">Card description. Give a concise overview of the context or functionality that's mentioned in the card title.</Text>
      </Content>
      {args.size !== 'XS' && <>
        <Divider />
        <Footer>
          <StatusLight size="S" variant="positive">Published</StatusLight>
        </Footer>
      </>}
    </Card>
  </div>
);

const specificArgTypes = {
  density: {
    table: {
      disable: true
    }
  }
};

export const Asset = (args: any) => (
  <div style={{display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'end', justifyContent: 'center'}}>
    <AssetCard {...args}>
      <CardPreview>
        <Image src="https://images.unsplash.com/photo-1705034598432-1694e203cdf3?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" />
      </CardPreview>
      <Content>
        <Text slot="title">Desert Sunset</Text>
        <Text slot="description">PNG • 2/3/2024</Text>
      </Content>
    </AssetCard>
    <AssetCard {...args}>
      <CardPreview>
        <FolderGradient />
      </CardPreview>
      <Content>
        <Text slot="title">Projects</Text>
        <Text slot="description">10 items • 6/14/2024</Text>
      </Content>
    </AssetCard>
  </div>
);

Asset.argTypes = specificArgTypes;

export const User = (args: any) => (
  <div style={{display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center'}}>
    <UserCard {...args}>
      <CardPreview>
        <Image src={new URL('assets/preview.png', import.meta.url).toString()} />
      </CardPreview>
      <Avatar src="https://i.imgur.com/xIe7Wlb.png" />
      <Content>
        <Text slot="title">Card title</Text>
        <Text slot="description">Card description. Give a concise overview of the context or functionality that's mentioned in the card title.</Text>
      </Content>
      <Footer>
        <StatusLight size="S" variant="positive">Available</StatusLight>
      </Footer>
    </UserCard>
    <UserCard {...args}>
      <Avatar src="https://i.imgur.com/xIe7Wlb.png" />
      <Content>
        <Text slot="title">Card title</Text>
        <Text slot="description">Card description. Give a concise overview of the context or functionality that's mentioned in the card title.</Text>
      </Content>
      <Footer>
        <StatusLight size="S" variant="positive">Available</StatusLight>
      </Footer>
    </UserCard>
  </div>
);

User.argTypes = {
  ...specificArgTypes,
  variant: {
    control: 'radio',
    options: ['primary', 'secondary', 'tertiary']
  }
};

export const Product = (args: any) => (
  <div style={{display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center'}}>
    <ProductCard {...args}>
      <CardPreview>
        <Image
          slot="preview"
          src={new URL('assets/preview.png', import.meta.url).toString()} />
      </CardPreview>
      <Image 
        slot="thumbnail"
        src={new URL('assets/placeholder.png', import.meta.url).toString()} />
      <Content>
        <Text slot="title">Card title</Text>
        <Text slot="description">Card description. Give a concise overview of the context or functionality that's mentioned in the card title.</Text>
      </Content>
      <Footer>
        <Button variant="primary">Buy now</Button>
      </Footer>
    </ProductCard>
    <ProductCard {...args}>
      <Image
        slot="thumbnail"
        src={new URL('assets/placeholder.png', import.meta.url).toString()} />
      <Content>
        <Text slot="title">Card title</Text>
        <Text slot="description">Card description. Give a concise overview of the context or functionality that's mentioned in the card title.</Text>
      </Content>
      <Footer>
        <Button variant="primary">Buy now</Button>
      </Footer>
    </ProductCard>
  </div>
);

Product.argTypes = {
  ...specificArgTypes,
  variant: {
    control: 'radio',
    options: ['primary', 'secondary', 'tertiary']
  }
};

export const Collection = (args: any) => (
  <div style={{display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'end', justifyContent: 'center'}}>
    <Card {...args}>
      <CollectionCardPreview>
        <Image alt="" src="https://images.unsplash.com/photo-1705034598432-1694e203cdf3?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" />
        <Image alt="" src="https://images.unsplash.com/photo-1722233987129-61dc344db8b6?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" />
        <Image alt="" src="https://images.unsplash.com/photo-1722172118908-1a97c312ce8c?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" />
        <Image alt="" src="https://images.unsplash.com/photo-1718378037953-ab21bf2cf771?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" />
      </CollectionCardPreview>
      <Content>
        <Text slot="title">Travel</Text>
        <div className={style({gridColumnEnd: 'span 2', display: 'flex', alignItems: 'center', gap: 8})}>
          <Folder />
          <Text slot="description">20 photos</Text>
        </div>
      </Content>
    </Card>
    <Card {...args}>
      <CollectionCardPreview>
        <Image alt="" src="https://images.unsplash.com/photo-1721661657253-6621d52db753?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHx0b3BpYy1mZWVkfDYxfE04alZiTGJUUndzfHxlbnwwfHx8fHw%3D" />
        <Image alt="" src="https://images.unsplash.com/photo-1721598359121-363311b3b263?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHx0b3BpYy1mZWVkfDc0fE04alZiTGJUUndzfHxlbnwwfHx8fHw%3D" />
        <Image alt="" src="https://images.unsplash.com/photo-1720987517313-23d8c4092cfb?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHx0b3BpYy1mZWVkfDEzM3xNOGpWYkxiVFJ3c3x8ZW58MHx8fHx8" />
      </CollectionCardPreview>
      <Content>
        <Text slot="title">Architecture</Text>
        <div className={style({gridColumnEnd: 'span 2', display: 'flex', alignItems: 'center', gap: 8})}>
          <Folder />
          <Text slot="description">15 photos</Text>
        </div>
      </Content>
    </Card>
  </div>
);

export const PreviewOverlay = (args: any) => (
  <Card {...args}>
    <CardPreview>
      <Image alt="" src={new URL('assets/preview.png', import.meta.url).toString()} styles={style({width: 'full', aspectRatio: '[1/1]', objectFit: 'cover', pointerEvents: 'none'})} />
      <Badge
        variant="positive"
        styles={style({
          position: 'absolute',
          top: 16,
          insetEnd: 16
        })}>
        Free
      </Badge>
      <Avatar
        src="https://i.imgur.com/xIe7Wlb.png"
        size={24}
        isOverBackground
        styles={style({
          position: 'absolute',
          bottom: 16,
          insetStart: 16
        })} />
    </CardPreview>
  </Card>
);

export const Custom = (args: any) => (
  <div style={{display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'end', justifyContent: 'center'}}>
    <Card {...args}>
      <CardPreview>
        <Image 
          alt=""
          src="https://images.unsplash.com/photo-1671225137978-aa9a19071b9a?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" />
      </CardPreview>
      <Content>
        <div className={style({display: 'flex', alignItems: 'center', justifyContent: 'space-between'})}>
          <div className={style({display: 'flex', alignItems: 'center', gap: 4})}>
            <Select /> 
            <Text slot="description">Click through rate</Text>
          </div>
          <div className={style({display: 'flex', flexDirection: 'column'})}>
            <Text styles={style({font: 'title-xl'})}>1.012%</Text>
            <Text styles={style({font: 'ui-sm', color: 'positive-900'})}>21% ↑ average</Text>
          </div>
        </div>
      </Content>
    </Card>
    <Card {...args}>
      <CardPreview>
        <Image 
          alt=""
          src="https://images.unsplash.com/photo-1460306855393-0410f61241c7?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" />
      </CardPreview>
      <Content>
        <Text slot="title">Yummburger</Text>
        <div className={style({display: 'flex', alignItems: 'center', gap: 4})}>
          <Project />
          <Text slot="description"><span className={style({fontWeight: 'bold'})}>35k</span> experiences use this</Text>
        </div>
      </Content>
      <Footer styles={style({flexDirection: 'column', alignItems: 'start', gap: 4})}>
        <Text styles={style({font: 'ui-sm'})}><span className={style({font: 'title-xl'})}>25%</span> click through rate</Text>
        <Meter variant="positive" value={25} styles={style({marginY: 4})} />
        <Text styles={style({font: 'ui-sm'})}><span className={style({fontWeight: 'bold'})}>56k</span> clicks</Text>
        <Text styles={style({font: 'ui-sm'})}><span className={style({fontWeight: 'bold', color: 'positive-900'})}>3.46%</span> last month</Text>
      </Footer>
    </Card>
  </div>
);

Custom.argTypes = {
  size: {
    table: {
      disable: true
    }
  }
};
