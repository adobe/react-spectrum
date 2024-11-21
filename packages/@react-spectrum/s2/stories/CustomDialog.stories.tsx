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

import {ActionButton, Button, ButtonGroup, CloseButton, Content, CustomDialog, DialogTrigger, DropZone, Heading, IllustratedMessage, Image, TextField} from '../src';
import Checkmark from '../spectrum-illustrations/gradient/generic1/Checkmark';
import DropToUpload from '../spectrum-illustrations/linear/DropToUpload';
import type {Meta} from '@storybook/react';
import {style} from '../style/spectrum-theme' with {type: 'macro'};

const meta: Meta<typeof CustomDialog> = {
  component: CustomDialog,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  title: 'CustomDialog'
};

export default meta;

export const EdgeToEdge = (args: any) => (
  <DialogTrigger>
    <ActionButton>Open dialog</ActionButton>
    <CustomDialog padding="none" {...args} isDismissible styles={style({maxWidth: {isSizeUnset: '[800px]'}})({isSizeUnset: args.size == null})}>
      <div className={style({display: 'flex', size: 'full'})}>
        <div className={style({display: 'flex', flexDirection: 'column', rowGap: 32, padding: 32, backgroundColor: 'layer-1', width: 192, flexShrink: 0})}>
          <Heading slot="title" styles={style({font: 'title-3xl', marginY: 0})}>Example</Heading>
          <ul className={style({listStyleType: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8})}>
            <li className={style({height: 32, font: 'ui'})}>Lorem ipsum</li>
            <li className={style({height: 32, font: 'ui'})}>Consectetur adipiscing</li>
            <li className={style({height: 32, font: 'ui'})}>Tempor incididunt</li>
            <li className={style({height: 32, font: 'ui'})}>Colore magna</li>
            <li className={style({height: 32, font: 'ui'})}>Exercitation ullamco</li>
            <li className={style({height: 32, font: 'ui'})}>Commodo consequat</li>
          </ul>
        </div>
        <div className={style({flexGrow: 1})}>
          <Image src={new URL('./assets/placeholder.png', import.meta.url).toString()} styles={style({width: 'full'})} />
          <div className={style({padding: 32, paddingEnd: 16})}>
            <h3 className={style({font: 'title-lg', marginY: 0})}>Example Heading</h3>
            <p className={style({font: 'body'})}>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in</p>
          </div>
        </div>
        <CloseButton staticColor="black" styles={style({position: 'absolute', top: 12, insetEnd: 12})} />
      </div>
    </CustomDialog>
  </DialogTrigger>
);

EdgeToEdge.args = {
  padding: 'none'
};

export const Illustration = (args: any) => (

  <DialogTrigger>
    <ActionButton>Open dialog</ActionButton>
    <CustomDialog {...args}>
      <div className={style({display: 'flex', flexDirection: 'column', rowGap: 8, alignItems: 'center'})}>
        <Checkmark />
        <Heading slot="title" styles={style({font: 'heading-lg', textAlign: 'center', marginY: 0})}>Thank you!</Heading>
        <p className={style({font: 'body', textAlign: 'center', marginY: 0})}>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
        <CloseButton styles={style({position: 'absolute', top: 12, insetEnd: 12})} />
      </div>
    </CustomDialog>
  </DialogTrigger>
);

Illustration.args = {
  size: 'M'
};

export const SideImage = (args: any) => (
  <DialogTrigger>
    <ActionButton>Open dialog</ActionButton>
    <CustomDialog padding="none" {...args}>
      <div className={style({display: 'flex', size: 'full', flexDirection: {default: 'column', sm: 'row'}})}>
        <Image
          alt=""
          src={new URL('./assets/preview.png', import.meta.url).toString()}
          styles={style({
            width: {default: 'full', sm: 208},
            height: {default: 112, sm: 'auto'},
            objectFit: 'cover'
          })} />
        <div className={style({padding: {default: 24, sm: 32}, flexGrow: 1, display: 'flex', flexDirection: 'column', rowGap: 32})}>
          <div className={style({display: 'flex', flexDirection: 'column', rowGap: 32, flexGrow: 1})}>
            <Heading slot="title" styles={style({font: 'heading', marginY: 0})}>Add new</Heading>
            <TextField label="Name" isRequired />
            <DropZone>
              <IllustratedMessage orientation="horizontal" size="S">
                <DropToUpload />
                <Heading>Drop file here</Heading>
                <Content>Or select a file from your computer</Content>
              </IllustratedMessage>
            </DropZone>
          </div>
          <ButtonGroup styles={style({marginStart: 'auto'})}>
            <Button slot="close" variant="secondary">Close</Button>
            <Button variant="accent">Add</Button>
          </ButtonGroup>
        </div>
      </div>
    </CustomDialog>
  </DialogTrigger>
);
