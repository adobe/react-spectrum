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
  title: 'CustomDialog',
  argTypes: {
    padding: {table: {disable: true}}
  }
};

export default meta;

export const WhatsNew = (args: any) => (
  <DialogTrigger>
    <ActionButton>Open dialog</ActionButton>
    <CustomDialog padding="none" {...args} isDismissible styles={style({maxWidth: {isSizeUnset: '[800px]'}})({isSizeUnset: args.size == null})}>
      <div className={style({display: 'flex', size: 'full'})}>
        <div className={style({display: 'flex', flexDirection: 'column', rowGap: 32, padding: 32, backgroundColor: 'layer-1', width: 192, flexShrink: 0})}>
          <Heading slot="title" styles={style({font: 'title-3xl', marginY: 0})}>What's new</Heading>
          <ul className={style({listStyleType: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8})}>
            <li className={style({height: 32, font: 'ui'})}>Selective unlock</li>
            <li className={style({height: 32, font: 'ui'})}>Drawing aids</li>
            <li className={style({height: 32, font: 'ui'})}>Brush previews</li>
            <li className={style({height: 32, font: 'ui'})}>Multiple color sampling</li>
            <li className={style({height: 32, font: 'ui'})}>Vector trimming</li>
            <li className={style({height: 32, font: 'ui'})}>Clipping masks</li>
            <li className={style({height: 32, font: 'ui'})}>Coming soon</li>
          </ul>
        </div>
        <div className={style({flexGrow: 1})}>
          <Image src={new URL('./assets/placeholder.png', import.meta.url).toString()} styles={style({width: 'full'})} />
          <div className={style({padding: 32, paddingEnd: 16})}>
            <h3 className={style({font: 'title-lg', marginY: 0})}>Selective unlock</h3>
            <p className={style({font: 'body'})}>Now you can unlock objects right on the artboard, and easily find the right one when many overlap. No more searching in the Layers panel or unlocking everything at once.</p>
          </div>
        </div>
        <CloseButton staticColor="black" styles={style({position: 'absolute', top: 12, insetEnd: 12})} />
      </div>
    </CustomDialog>
  </DialogTrigger>
);

export const ThankYou = (args: any) => (
  <DialogTrigger>
    <ActionButton>Open dialog</ActionButton>
    <CustomDialog {...args}>
      <div className={style({display: 'flex', flexDirection: 'column', rowGap: 8, alignItems: 'center'})}>
        <Checkmark />
        <Heading slot="title" styles={style({font: 'heading-lg', textAlign: 'center', marginY: 0})}>Thank you!</Heading>
        <p className={style({font: 'body', textAlign: 'center', marginY: 0})}>Your report has been submitted. Thank you for help keeping Adobe safe. You can learn more about our content policies by visiting our Transparency Center.</p>
        <CloseButton styles={style({position: 'absolute', top: 12, insetEnd: 12})} />
      </div>
    </CustomDialog>
  </DialogTrigger>
);

ThankYou.args = {
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
            <Heading slot="title" styles={style({font: 'heading', marginY: 0})}>Add new brand</Heading>
            <TextField label="Brand name" isRequired />
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
            <Button variant="accent">Add brand</Button>
          </ButtonGroup>
        </div>
      </div>
    </CustomDialog>
  </DialogTrigger>
);
