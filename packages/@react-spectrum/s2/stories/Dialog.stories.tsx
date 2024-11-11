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

import {ActionButton, Avatar, Button, ButtonGroup, Card, CardPreview, CloseButton, Content, Dialog, DialogTrigger, Divider, DropZone, Form, Heading, IllustratedMessage, Image, Menu, MenuItem, MenuSection, SearchField, SubmenuTrigger, Switch, Tab, TabList, TabPanel, Tabs, Text, TextField} from '../src';
import Checkmark from '../spectrum-illustrations/gradient/generic1/Checkmark';
import Cloud from '../s2wf-icons/S2_Icon_Cloud_20_N.svg';
import DropToUpload from '../spectrum-illustrations/linear/DropToUpload';
import Education from '../s2wf-icons/S2_Icon_Education_20_N.svg';
import File from '../s2wf-icons/S2_Icon_File_20_N.svg';
import Help from '../s2wf-icons/S2_Icon_HelpCircle_20_N.svg';
import Lightbulb from '../s2wf-icons/S2_Icon_Lightbulb_20_N.svg';
import type {Meta} from '@storybook/react';
import Org from '../s2wf-icons/S2_Icon_Buildings_20_N.svg';
import Settings from '../s2wf-icons/S2_Icon_Settings_20_N.svg';
import {style} from '../style/spectrum-theme' with {type: 'macro'};
import User from '../s2wf-icons/S2_Icon_User_20_N.svg';
import Users from '../s2wf-icons/S2_Icon_UserGroup_20_N.svg';

const meta: Meta<typeof Dialog> = {
  component: Dialog as any,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  title: 'Dialog',
  argTypes: {
    isFullBleed: {table: {disable: true}}
  }
};

export default meta;

export const HelpCenter = (args: any) => (
  <DialogTrigger {...args}>
    <ActionButton aria-label="Help" styles={style({marginX: 'auto'})}>
      <Help />
    </ActionButton>
    <Dialog {...args} type="popover">
      <Tabs density="compact">
        <TabList styles={style({marginX: 12})}>
          <Tab id="help">Help</Tab>
          <Tab id="support">Support</Tab>
          <Tab id="feedback">Feedback</Tab>
        </TabList>
        <TabPanel id="help">
          <SearchField label="Search Experience League"  styles={style({marginTop: 12, marginX: 12})} />
          <Menu aria-label="Help" styles={style({marginTop: 12})}>
            <MenuSection>
              <MenuItem href="#">
                <File />
                <Text slot="label">Adobe Experience Cloud Learn & Support</Text>
              </MenuItem>
            </MenuSection>
            <MenuSection>
              <MenuItem href="#">
                <Education />
                <Text slot="label">Learning</Text>
              </MenuItem>
              <MenuItem href="#">
                <Users />
                <Text slot="label">Community</Text>
              </MenuItem>
            </MenuSection>
            <MenuSection>
              <MenuItem href="#">
                <User />
                <Text slot="label">Customer Care</Text>
              </MenuItem>
              <MenuItem href="#">
                <Cloud />
                <Text slot="label">Status</Text>
              </MenuItem>
              <MenuItem href="#">
                <Lightbulb />
                <Text slot="label">Developer Connection</Text>
              </MenuItem>
            </MenuSection>
          </Menu>
        </TabPanel>
        <TabPanel id="support" styles={style({margin: 12})}>
          <Card size="L" styles={style({width: 'full'})}>
            <CardPreview>
              <Image src="https://cdn.experience-stage.adobe.net/assets/support.7d96ed11.svg" />
            </CardPreview>
            <Content>
              <Text slot="title">Go to support at Experience League</Text>
              <Text slot="description">Find support resources or submit a ticket</Text>
            </Content>
          </Card>
        </TabPanel>
        <TabPanel id="feedback" styles={style({margin: 12})}>
          <p className={style({font: 'body', marginTop: 0})}>How are we doing? Share your feedback here.</p>
          <Form>
            <TextField label="Subject" />
            <TextField label="Description" isRequired />
            <DropZone />
            <Switch>Adobe can contact me for further questions concerning this feedback</Switch>
            <Button styles={style({marginStart: 'auto'})}>Submit</Button>
          </Form>
        </TabPanel>
      </Tabs>
    </Dialog>
  </DialogTrigger>
);

HelpCenter.parameters = {
  layout: 'padded'
};

HelpCenter.args = {
  size: 'S'
};

HelpCenter.argTypes = {
  type: {table: {disable: true}},
  isDismissable: {table: {disable: true}}
};

export const AccountMenu = (args: any) => (
  <DialogTrigger {...args}>
    <ActionButton aria-label="Account" styles={style({marginX: 'auto'})}>
      <Avatar src="https://i.imgur.com/xIe7Wlb.png" />
    </ActionButton>
    <Dialog {...args} type="popover" hideArrow placement="bottom end">
      <div className={style({paddingTop: 4, display: 'flex', flexDirection: 'column', gap: 12})}>
        <div className={style({display: 'flex', gap: 12, alignItems: 'center', marginX: 12})}>
          <Avatar src="https://i.imgur.com/xIe7Wlb.png" size={56} />
          <div>
            <div className={style({font: 'title'})}>Devon Govett</div>
            <div className={style({font: 'ui'})}>user@example.com</div>
            <Switch styles={style({marginTop: 4})}>Dark theme</Switch>
          </div>
        </div>
        <Divider styles={style({marginX: 12})} />
        <Menu aria-label="Account">
          <MenuSection>
            <SubmenuTrigger>
              <MenuItem>
                <Org />
                <Text slot="label">Organization</Text>
                <Text slot="value">Nike</Text>
              </MenuItem>
              <Menu selectionMode="single" selectedKeys={['nike']}>
                <MenuItem id="adobe">Adobe</MenuItem>
                <MenuItem id="nike">Nike</MenuItem>
                <MenuItem id="apple">Apple</MenuItem>
              </Menu>
            </SubmenuTrigger>
            <MenuItem>
              <Settings />
              <Text slot="label">Settings</Text>
            </MenuItem>
          </MenuSection>
          <MenuSection>
            <MenuItem>Legal notices</MenuItem>
            <MenuItem>Sign out</MenuItem>
          </MenuSection>
        </Menu>
      </div>
    </Dialog>
  </DialogTrigger>
);

AccountMenu.argTypes = {
  type: {table: {disable: true}},
  isDismissable: {table: {disable: true}}
};

export const WhatsNew = (args: any) => (
  <DialogTrigger>
    <ActionButton>Open dialog</ActionButton>
    <Dialog {...args} isFullBleed isDismissable styles={style({width: '[max(800px, 100%)]', maxWidth: {default: '[800px]', isFullScreen: 'none'}})({isFullScreen: args.type !== 'modal'})}>
      <div className={style({display: 'flex', size: 'full'})}>
        <div className={style({display: 'flex', flexDirection: 'column', rowGap: 32, padding: 32, backgroundColor: 'layer-1', width: 224, flexShrink: 0})}>
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
        <div>
          <Image src={new URL('./assets/placeholder.png', import.meta.url).toString()} styles={style({width: 'full'})} />
          <div className={style({padding: 32, paddingEnd: 16})}>
            <h3 className={style({font: 'title-lg', marginY: 0})}>Selective unlock</h3>
            <p className={style({font: 'body'})}>Now you can unlock objects right on the artboard, and easily find the right one when many overlap. No more searching in the Layers panel or unlocking everything at once.</p>
          </div>
        </div>
        <CloseButton staticColor="black" styles={style({position: 'absolute', top: 12, insetEnd: 12})} />
      </div>
    </Dialog>
  </DialogTrigger>
);

WhatsNew.argTypes = {
  type: {
    control: 'radio',
    options: ['modal', 'fullscreen', 'fullscreenTakeover']
  },
  size: {table: {disable: true}},
  placement: {table: {disable: true}},
  offset: {table: {disable: true}},
  crossOffset: {table: {disable: true}},
  hideArrow: {table: {disable: true}},
  containerPadding: {table: {disable: true}},
  shouldFlip: {table: {disable: true}}
};

export const ThankYou = (args: any) => (
  <DialogTrigger>
    <ActionButton>Open dialog</ActionButton>
    <Dialog {...args}>
      <div className={style({display: 'flex', flexDirection: 'column', rowGap: 8, alignItems: 'center'})}>
        <Checkmark />
        <Heading slot="title" styles={style({font: 'heading-lg', textAlign: 'center', marginY: 0})}>Thank you!</Heading>
        <p className={style({font: 'body', textAlign: 'center', marginY: 0})}>Your report has been submitted. Thank you for help keeping Adobe safe. You can learn more about our content policies by visiting our Transparency Center.</p>
        <CloseButton styles={style({position: 'absolute', top: 12, insetEnd: 12})} />
      </div>
    </Dialog>
  </DialogTrigger>
);

ThankYou.args = {
  size: 'M'
};

ThankYou.argTypes = {
  type: {table: {disable: true}},
  placement: {table: {disable: true}},
  offset: {table: {disable: true}},
  crossOffset: {table: {disable: true}},
  hideArrow: {table: {disable: true}},
  containerPadding: {table: {disable: true}},
  shouldFlip: {table: {disable: true}}
};

export const SideImage = (args: any) => (
  <DialogTrigger>
    <ActionButton>Open dialog</ActionButton>
    <Dialog {...args} isFullBleed>
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
    </Dialog>
  </DialogTrigger>
);

SideImage.argTypes = {
  type: {
    control: 'radio',
    options: ['modal', 'fullscreen', 'fullscreenTakeover']
  },
  placement: {table: {disable: true}},
  offset: {table: {disable: true}},
  crossOffset: {table: {disable: true}},
  hideArrow: {table: {disable: true}},
  containerPadding: {table: {disable: true}},
  shouldFlip: {table: {disable: true}}
};
