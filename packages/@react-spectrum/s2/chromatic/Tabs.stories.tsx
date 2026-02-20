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

import Bell from '../s2wf-icons/S2_Icon_Bell_20_N.svg';
import {Button, Tab, TabList, TabPanel, Tabs} from '../src';
import {Collection, Text} from '@react-spectrum/s2';
import Edit from '../s2wf-icons/S2_Icon_Edit_20_N.svg';
import Heart from '../s2wf-icons/S2_Icon_Heart_20_N.svg';
import type {Meta, StoryObj} from '@storybook/react';
import {style} from '../style/spectrum-theme' with { type: 'macro' };
import {userEvent} from '@storybook/test';
import {useState} from 'react';

const meta: Meta<typeof Tabs> = {
  component: Tabs,
  parameters: {
    chromaticProvider: {disableAnimations: true}
  },
  title: 'S2 Chromatic/Tabs'
};

export default meta;
type Story = StoryObj<typeof Tabs>;

export const Example: Story = {
  render: (args) => (
    <Tabs {...args} styles={style({width: 450, height: 256})} aria-label="History of Ancient Rome">
      <TabList>
        <Tab id="FoR">Founding of Rome</Tab>
        <Tab id="MaR">Monarchy and Republic</Tab>
        <Tab id="Emp">Empire</Tab>
      </TabList>
      <TabPanel id="FoR">
        <div className={style({overflow: 'auto', height: 'full'})}>
          <div>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum non rutrum augue, a dictum est. Sed ultricies vel orci in blandit. Morbi sed tempor leo. Phasellus et sollicitudin nunc, a volutpat est. In volutpat molestie velit, nec rhoncus felis vulputate porttitor. In efficitur nibh tortor, maximus imperdiet libero sollicitudin sed. Pellentesque dictum, quam id scelerisque rutrum, lorem augue suscipit est, nec ultricies ligula lorem id dui. Cras lacus tortor, fringilla nec ligula quis, semper imperdiet ex.</div>
        </div>
      </TabPanel>
      <TabPanel id="MaR">
        <div className={style({overflow: 'auto', height: 'full'})}>
          <div>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ut vulputate justo. Suspendisse potenti. Nunc id fringilla leo, at luctus quam. Maecenas et ipsum nisi. Curabitur in porta purus, a pretium est. Fusce eu urna diam. Sed nunc neque, consectetur ut purus nec, consequat elementum libero. Sed ut diam in quam maximus condimentum at non erat. Vestibulum sagittis rutrum velit, vitae suscipit arcu. Nulla ac feugiat ante, vitae laoreet ligula. Maecenas sed molestie ligula. Nulla sed fringilla ex. Nulla viverra tortor at enim condimentum egestas. Nulla sed tristique sapien. Integer ligula quam, vulputate eget mollis eu, interdum sit amet justo.</div>
          <div>Vivamus dignissim tortor ut sapien congue tristique. Sed ac aliquet mauris. Nulla metus dui, elementum sit amet luctus eu, condimentum id elit. Praesent id nibh sed ligula congue venenatis. Pellentesque urna turpis, eleifend id pellentesque a, auctor nec neque. Vestibulum ipsum mauris, rutrum sit amet magna et, aliquet mollis tellus. Pellentesque nec ultricies nibh, at tempus massa. Phasellus dictum turpis et interdum scelerisque. Aliquam fermentum tincidunt ipsum sit amet suscipit. Fusce non dui sed diam lacinia mattis fermentum eu urna. Cras pretium id nunc in elementum. Mauris laoreet odio vitae laoreet dictum. In non justo nec nunc vehicula posuere non non ligula. Nullam eleifend scelerisque nibh, in sollicitudin tortor ullamcorper vel. Praesent sagittis risus in erat dignissim, non lacinia elit efficitur. Quisque maximus nulla vel luctus pharetra.</div>
        </div>
      </TabPanel>
      <TabPanel id="Emp">
        <div className={style({overflow: 'auto', height: 'full'})}>
          <div>Alea jacta est.</div>
        </div>
      </TabPanel>
    </Tabs>
  )
};

export const Vertical: Story = {
  render: (args) => (
    <Tabs {...args} styles={style({width: 450, height: 256})} aria-label="History of Ancient Rome">
      <TabList>
        <Tab id="FoR">User Profile Settings</Tab>
        <Tab id="MaR"><span lang="ja">バナーおよびディスプレイ広告</span></Tab>
        <Tab id="Emp"><span lang="de" style={{hyphens: 'auto'}}>Rindfleischetikettierungsüberwachungsaufgabenübertragungsgesetz</span></Tab>
      </TabList>
      <TabPanel id="FoR">
        <div className={style({overflow: 'auto', height: 'full'})}>
          <div>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum non rutrum augue, a dictum est. Sed ultricies vel orci in blandit. Morbi sed tempor leo. Phasellus et sollicitudin nunc, a volutpat est. In volutpat molestie velit, nec rhoncus felis vulputate porttitor. In efficitur nibh tortor, maximus imperdiet libero sollicitudin sed. Pellentesque dictum, quam id scelerisque rutrum, lorem augue suscipit est, nec ultricies ligula lorem id dui. Cras lacus tortor, fringilla nec ligula quis, semper imperdiet ex.</div>
        </div>
      </TabPanel>
      <TabPanel id="MaR">
        <div className={style({overflow: 'auto', height: 'full'})}>
          <div>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ut vulputate justo. Suspendisse potenti. Nunc id fringilla leo, at luctus quam. Maecenas et ipsum nisi. Curabitur in porta purus, a pretium est. Fusce eu urna diam. Sed nunc neque, consectetur ut purus nec, consequat elementum libero. Sed ut diam in quam maximus condimentum at non erat. Vestibulum sagittis rutrum velit, vitae suscipit arcu. Nulla ac feugiat ante, vitae laoreet ligula. Maecenas sed molestie ligula. Nulla sed fringilla ex. Nulla viverra tortor at enim condimentum egestas. Nulla sed tristique sapien. Integer ligula quam, vulputate eget mollis eu, interdum sit amet justo.</div>
          <div>Vivamus dignissim tortor ut sapien congue tristique. Sed ac aliquet mauris. Nulla metus dui, elementum sit amet luctus eu, condimentum id elit. Praesent id nibh sed ligula congue venenatis. Pellentesque urna turpis, eleifend id pellentesque a, auctor nec neque. Vestibulum ipsum mauris, rutrum sit amet magna et, aliquet mollis tellus. Pellentesque nec ultricies nibh, at tempus massa. Phasellus dictum turpis et interdum scelerisque. Aliquam fermentum tincidunt ipsum sit amet suscipit. Fusce non dui sed diam lacinia mattis fermentum eu urna. Cras pretium id nunc in elementum. Mauris laoreet odio vitae laoreet dictum. In non justo nec nunc vehicula posuere non non ligula. Nullam eleifend scelerisque nibh, in sollicitudin tortor ullamcorper vel. Praesent sagittis risus in erat dignissim, non lacinia elit efficitur. Quisque maximus nulla vel luctus pharetra.</div>
        </div>
      </TabPanel>
      <TabPanel id="Emp">
        <div className={style({overflow: 'auto', height: 'full'})}>
          <div>Alea jacta est.</div>
        </div>
      </TabPanel>
    </Tabs>
  ),
  args: {
    orientation: 'vertical'
  }
};

export const VerticalMaxWidth: Story = {
  render: (args) => (
    <Tabs {...args} styles={style({width: 450, height: 256})} aria-label="History of Ancient Rome">
      <TabList styles={style({width: 120})}>
        <Tab id="FoR">User Profile Settings</Tab>
        <Tab id="MaR"><span lang="ja">バナーおよびディスプレイ広告</span></Tab>
        <Tab id="Emp"><span lang="de" style={{hyphens: 'auto'}}>Rindfleischetikettierungsüberwachungsaufgabenübertragungsgesetz</span></Tab>
      </TabList>
      <TabPanel id="FoR">
        <div className={style({overflow: 'auto', height: 'full'})}>
          <div>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum non rutrum augue, a dictum est. Sed ultricies vel orci in blandit. Morbi sed tempor leo. Phasellus et sollicitudin nunc, a volutpat est. In volutpat molestie velit, nec rhoncus felis vulputate porttitor. In efficitur nibh tortor, maximus imperdiet libero sollicitudin sed. Pellentesque dictum, quam id scelerisque rutrum, lorem augue suscipit est, nec ultricies ligula lorem id dui. Cras lacus tortor, fringilla nec ligula quis, semper imperdiet ex.</div>
        </div>
      </TabPanel>
      <TabPanel id="MaR">
        <div className={style({overflow: 'auto', height: 'full'})}>
          <div>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ut vulputate justo. Suspendisse potenti. Nunc id fringilla leo, at luctus quam. Maecenas et ipsum nisi. Curabitur in porta purus, a pretium est. Fusce eu urna diam. Sed nunc neque, consectetur ut purus nec, consequat elementum libero. Sed ut diam in quam maximus condimentum at non erat. Vestibulum sagittis rutrum velit, vitae suscipit arcu. Nulla ac feugiat ante, vitae laoreet ligula. Maecenas sed molestie ligula. Nulla sed fringilla ex. Nulla viverra tortor at enim condimentum egestas. Nulla sed tristique sapien. Integer ligula quam, vulputate eget mollis eu, interdum sit amet justo.</div>
          <div>Vivamus dignissim tortor ut sapien congue tristique. Sed ac aliquet mauris. Nulla metus dui, elementum sit amet luctus eu, condimentum id elit. Praesent id nibh sed ligula congue venenatis. Pellentesque urna turpis, eleifend id pellentesque a, auctor nec neque. Vestibulum ipsum mauris, rutrum sit amet magna et, aliquet mollis tellus. Pellentesque nec ultricies nibh, at tempus massa. Phasellus dictum turpis et interdum scelerisque. Aliquam fermentum tincidunt ipsum sit amet suscipit. Fusce non dui sed diam lacinia mattis fermentum eu urna. Cras pretium id nunc in elementum. Mauris laoreet odio vitae laoreet dictum. In non justo nec nunc vehicula posuere non non ligula. Nullam eleifend scelerisque nibh, in sollicitudin tortor ullamcorper vel. Praesent sagittis risus in erat dignissim, non lacinia elit efficitur. Quisque maximus nulla vel luctus pharetra.</div>
        </div>
      </TabPanel>
      <TabPanel id="Emp">
        <div className={style({overflow: 'auto', height: 'full'})}>
          <div>Alea jacta est.</div>
        </div>
      </TabPanel>
    </Tabs>
  ),
  args: {
    orientation: 'vertical'
  }
};

export const Disabled: Story = {
  render: (args) => (
    <Tabs {...args} aria-label="History of Ancient Rome" styles={style({width: 450, height: 144})} disabledKeys={['FoR', 'MaR', 'Emp']}>
      <TabList>
        <Tab id="FoR" aria-label="Edit"><Edit /><Text>Edit</Text></Tab>
        <Tab id="MaR" aria-label="Notifications"><Bell /><Text>Notifications</Text></Tab>
        <Tab id="Emp" aria-label="Likes"><Heart /><Text>Likes</Text></Tab>
      </TabList>
      <TabPanel id="FoR">
        Arma virumque cano, Troiae qui primus ab oris.
      </TabPanel>
      <TabPanel id="MaR">
        Senatus Populusque Romanus.
      </TabPanel>
      <TabPanel id="Emp">
        Alea jacta est.
      </TabPanel>
    </Tabs>
  )
};

export const Icons: Story = {
  render: (args) => (
    <Tabs {...args} aria-label="History of Ancient Rome" styles={style({width: 208, height: 144})} labelBehavior="hide">
      <TabList>
        <Tab id="FoR" aria-label="Edit"><Edit /><Text>Edit</Text></Tab>
        <Tab id="MaR" aria-label="Notifications"><Bell /><Text>Notifications</Text></Tab>
        <Tab id="Emp" aria-label="Likes"><Heart /><Text>Likes</Text></Tab>
      </TabList>
      <TabPanel id="FoR">
        Arma virumque cano, Troiae qui primus ab oris.
      </TabPanel>
      <TabPanel id="MaR">
        Senatus Populusque Romanus.
      </TabPanel>
      <TabPanel id="Emp">
        Alea jacta est.
      </TabPanel>
    </Tabs>
  )
};

export const Collasped = {
  render: (args: any) => (
    <Tabs {...args} aria-label="Settings" styles={style({width: 200, height: 144})}>
      <TabList>
        <Tab id="Mouse">Mouse settings</Tab>
        <Tab id="Keyboard">Keyboard settings</Tab>
        <Tab id="Gamepad">Gamepad settings</Tab>
      </TabList>
      <TabPanel id="Mouse">
        Adjust the sensitivity and speed of your mouse
      </TabPanel>
      <TabPanel id="Keyboard">
        Customize the layout and function of your keyboard.
      </TabPanel>
      <TabPanel id="Gamepad">
        Configure the buttons and triggers on your gamepad.
      </TabPanel>
    </Tabs>
  ),
  play: async () => {
    await userEvent.tab();
    await userEvent.keyboard('{Enter}');
  }
};

function AddRemoveExample(props) {
  let [tabs, setTabs] = useState([
    {id: 1, title: 'Tab 1', content: 'Tab body 1'},
    {id: 2, title: 'Tab 2', content: 'Tab body 2'},
    {id: 3, title: 'Tab 3', content: 'Tab body 3'}, 
    {id: 4, title: 'Tab 4', content: 'Tab body 4'},
    {id: 5, title: 'Tab 5', content: 'Tab body 5'},
    {id: 6, title: 'Tab 6', content: 'Tab body 6'},
    {id: 7, title: 'Tab 7', content: 'Tab body 7'},
    {id: 8, title: 'Tab 8', content: 'Tab body 8'},
    {id: 9, title: 'Tab 9', content: 'Tab body 9'}
  ]);

  let addTab = () => {
    setTabs(tabs => [
      ...tabs,
      {
        id: tabs.length + 1,
        title: `Tab ${tabs.length + 1}`,
        content: `Tab body ${tabs.length + 1}`
      }
    ]);
  };

  let removeTab = () => {
    if (tabs.length > 1) {
      setTabs(tabs => tabs.slice(0, -1));
    }
  };

  return (
    <div className={style({width: 600})}>
      <Tabs {...props} aria-label="Tabs">
        <div className={style({display: 'flex', alginSelf: 'stretch'})}>
          <TabList items={tabs} styles={style({flexShrink: 1, flexGrow: 1, flexBasis: 'auto'})}>
            {tab => <Tab id={tab.id}>{tab.title}</Tab>}
          </TabList>
          <div className={style({display: 'flex', alignItems: 'center', flexShrink: 0, flexGrow: 0, flexBasis: 'auto'})}>
            <Button onPress={addTab}>Add tab</Button>
            <Button onPress={removeTab}>Remove tab</Button>
          </div>
        </div>
        <Collection items={tabs}>
          {tab => (
            <TabPanel id={tab.id}>
              {tab.content}
            </TabPanel>
          )}
        </Collection>
      </Tabs>
    </div>
  );
}

export const CustomizedLayout = {
  render: (args: any) => (<AddRemoveExample {...args} />
  )
};
