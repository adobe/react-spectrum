/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {action} from 'storybook/actions';
import {ActionGroup} from '../../src/actiongroup/ActionGroup';
import Bookmark from '@spectrum-icons/workflow/Bookmark';
import {Button} from '../../src/button/Button';
import {ButtonGroup} from '../../src/buttongroup/ButtonGroup';
import Calendar from '@spectrum-icons/workflow/Calendar';
import Dashboard from '@spectrum-icons/workflow/Dashboard';
import {Flex} from '../../src/layout/Flex';
import {Heading} from '../../src/text/Heading';
import {Item} from 'react-stately/Item';
import {Key} from '@react-types/shared';
import {Meta, StoryObj} from '@storybook/react';
import {Picker} from '../../src/picker/Picker';
import React, {ReactNode, useCallback, useState} from 'react';
import {RouterProvider} from 'react-aria/private/utils/openLink';
import {SpectrumTabsProps, TabList, TabPanels, Tabs} from '../../src/tabs/Tabs';
import {Text} from '../../src/text/Text';
import {TextField} from '../../src/textfield/TextField';

export default {
  title: 'Tabs'
} as Meta<typeof Tabs>;

export type TabsStory = StoryObj<typeof Tabs>;

export const Default: TabsStory = {
  render: () => render()
};
export const WithFalsyItemKey: TabsStory = {
  render: () => renderWithFalsyKey(),
  name: 'with falsy item key'
};

export const DefaultSelectedKeyVal2: TabsStory = {
  render: () => render({defaultSelectedKey: 'val2'}),
  name: 'defaultSelectedKey: val2'
};

export const ControlledSelectedKeyVal3: TabsStory = {
  render: () => render({selectedKey: 'val3'}),
  name: 'controlled: selectedKey: val3'
};

export const OrientationVertical: TabsStory = {
  render: () => render({orientation: 'vertical'}),
  name: 'orientation: vertical'
};

export const OrientationVerticalWrap: TabsStory = {
  render: () => renderWithVerticalWrap({maxWidth: 90, wrap: true}),
  name: 'orientation: vertical, wrap: true'
};

export const DensityCompact: TabsStory = {
  render: () => render({density: 'compact'}),
  name: 'density: compact'
};

export const IsQuiet: TabsStory = {
  render: () => render({isQuiet: true}),
  name: 'isQuiet'
};

export const IsQuietDensityCompact: TabsStory = {
  render: () => render({isQuiet: true, density: 'compact'}),
  name: 'isQuiet, density: compact'
};

export const DensityCompactOrientationVertical: TabsStory = {
  render: () => render({density: 'compact', orientation: 'vertical'}),
  name: 'density: compact, orientation: vertical'
};

export const Icons: TabsStory = {
  render: () => renderWithIcons(),
  name: 'icons'
};

export const IconsDensityCompact: TabsStory = {
  render: () => renderWithIcons({density: 'compact'}),
  name: 'icons, density: compact'
};

export const IconsOrientationVertical: TabsStory = {
  render: () => renderWithIcons({orientation: 'vertical'}),
  name: 'icons, orientation: vertical'
};

export const IconsDensityCompactOrientationVertical: TabsStory = {
  render: () => renderWithIcons({orientation: 'vertical', density: 'compact'}),
  name: 'icons, density: compact, orientation: vertical'
};

export const IsEmphasizedTrue: TabsStory = {
  render: () => render({isEmphasized: true}),
  name: 'isEmphasized: true'
};

export const IsEmphasizedTrueIconsIsQuietTrue: TabsStory = {
  render: () => renderWithIcons({isEmphasized: true, isQuiet: true}),
  name: 'isEmphasized: true, icons, isQuiet: true'
};

export const IsEmphasizedTrueOrientationVertical: TabsStory = {
  render: () => render({isEmphasized: true, orientation: 'vertical'}),
  name: 'isEmphasized: true, orientation: vertical'
};

export const DisableAllTabs: TabsStory = {
  render: () => render({isDisabled: true}),
  name: 'disable all tabs'
};

export const KeyboardActivationManual: TabsStory = {
  render: () => render({keyboardActivation: 'manual'}),
  name: 'keyboardActivation: manual'
};

export const MiddleDisabled: TabsStory = {
  render: () => render({disabledKeys: ['val2']}),
  name: 'middle disabled'
};

export const AllDisabled: TabsStory = {
  render: () => render({disabledKeys: ['val1', 'val2', 'val3', 'val4', 'val5']}),
  name: 'all disabled'
};

export const Resizeable: TabsStory = {
  render: () => (
    <div
      style={{
        minWidth: '100px',
        width: '300px',
        height: '400px',
        padding: '10px',
        resize: 'horizontal',
        overflow: 'auto',
        backgroundColor: 'var(--spectrum-global-color-gray-50)'
      }}>
      {render()}
    </div>
  ),
  name: 'resizeable'
};

export const CollapseBehavior: TabsStory = {
  render: () => <DynamicTabs />,
  name: 'collapse behavior'
};

export const CollapseBehaviorIsQuiet: TabsStory = {
  render: () => <DynamicTabs isQuiet />,
  name: 'collapse behavior, isQuiet'
};

export const CollapseBehaviorDensityCompact: TabsStory = {
  render: () => <DynamicTabs density="compact" />,
  name: 'collapse behavior, density: compact'
};

export const CollapseBehaviorDensityCompactIsQuiet: TabsStory = {
  render: () => <DynamicTabs isQuiet density="compact" />,
  name: 'collapse behavior, density: compact, isQuiet'
};

export const CollapseBehaviorIsEmphasizedTrue: TabsStory = {
  render: () => <DynamicTabs isEmphasized />,
  name: 'collapse behavior, isEmphasized: true'
};

export const _OrientationFlip: TabsStory = {
  render: () => <OrientationFlip />,
  name: 'orientation flip'
};

export const TestingTabsInFlex: TabsStory = {
  render: () => (
    <Flex
      minHeight={400}
      minWidth={400}
      UNSAFE_style={{
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: 'var(--spectrum-global-color-gray-800)',
        padding: '10px'
      }}>
      <Tabs>
        <TabList>
          <Item>Tab 1</Item>
          <Item>Tab 2</Item>
        </TabList>
        <TabPanels>
          <Item>Hello World</Item>
          <Item>Goodbye World</Item>
        </TabPanels>
      </Tabs>
    </Flex>
  ),
  name: 'testing: tabs in flex'
};

export const TransitionBetweenTabSizes: TabsStory = {
  render: () => (
    <Tabs maxWidth={500}>
      <TabList>
        <Item>
          <Text>Tab 1 long long long name</Text>
        </Item>
        <Item>
          <Text>Tab 2</Text>
        </Item>
      </TabList>
      <TabPanels>
        <Item>Text</Item>
        <Item>Text 2</Item>
      </TabPanels>
    </Tabs>
  ),
  name: 'transition between tab sizes'
};

export const TabWithFlexContainerInBetween: TabsStory = {
  render: () => <DynamicTabsWithDecoration />,
  name: 'Tab with flex container in between'
};

export const TabsAtTheBottom: TabsStory = {
  render: () => (
    <Tabs maxWidth={500}>
      <TabPanels height="size-1000">
        <Item>Text 1</Item>
        <Item>Text 2</Item>
      </TabPanels>
      <TabList>
        <Item>Tab 1</Item>
        <Item>Tab 2</Item>
      </TabList>
    </Tabs>
  ),
  name: 'tabs at the bottom'
};

export const TabsOnTheRight: TabsStory = {
  render: () => (
    <Tabs maxWidth={500} orientation="vertical">
      <TabPanels>
        <Item>Text 1</Item>
        <Item>Text 2</Item>
      </TabPanels>
      <TabList>
        <Item>Tab 1</Item>
        <Item>Tab 2</Item>
      </TabList>
    </Tabs>
  ),
  name: 'tabs on the right'
};

export const FocusableElementInTabPanel: TabsStory = {
  render: () => (
    <Tabs maxWidth={500}>
      <TabList>
        <Item>Tab 1</Item>
        <Item>Tab 2</Item>
      </TabList>
      <TabPanels>
        <Item>
          <TextField label="Tab 1" />
        </Item>
        <Item>
          <TextField label="Tab 2" isDisabled />
        </Item>
      </TabPanels>
    </Tabs>
  ),
  name: 'focusable element in tab panel'
};

export const Tab1ControlledChild: TabsStory = {
  render: function Tab1ControlledChild() {
    let [tab1Text, setTab1Text] = useState('');

    return (
      <Tabs maxWidth={500}>
        <TabList>
          <Item>Tab 1</Item>
          <Item>Tab 2</Item>
        </TabList>
        <TabPanels>
          <Item>
            <TextField label="Tab 1" value={tab1Text} onChange={setTab1Text} />
          </Item>
          <Item>
            <TextField label="Tab 2" />
          </Item>
        </TabPanels>
      </Tabs>
    );
  },
  name: 'Tab 1 controlled child'
};

export const ChangingTabTitles: TabsStory = {
  render: function ChangingTabTitles() {
    let [tab1Text, setTab1Text] = useState('Tab 1');
    let [tab2Text, setTab2Text] = useState('Tab 2');

    return (
      <Flex minHeight={400} minWidth={400} direction="column">
        <TextField label="Tab1 Title" value={tab1Text} onChange={setTab1Text} />
        <TextField label="Tab2 Title" value={tab2Text} onChange={setTab2Text} />
        <Tabs maxWidth={500}>
          <TabList>
            <Item>{tab1Text}</Item>
            <Item>{tab2Text}</Item>
          </TabList>
          <TabPanels>
            <Item>Tab 1 Content</Item>
            <Item>Tab 2 Content</Item>
          </TabPanels>
        </Tabs>
      </Flex>
    );
  },
  name: 'changing tab titles'
};

export const ChangingSelectionProgrammatically: TabsStory = {
  render: () => <ControlledSelection />,
  name: 'changing selection programmatically'
};

export const Links: StoryObj<SpectrumTabsProps<unknown> & {collapsed?: boolean}> = {
  render: function Links(args) {
    let [url, setUrl] = useState('/one');

    return (
      <RouterProvider navigate={setUrl}>
        <Tabs selectedKey={url} aria-label="Some tabs" width={args.collapsed ? 200 : 300}>
          <TabList>
            <Item key="/one" href="/one">
              Tab 1
            </Item>
            <Item key="/two" href="/two">
              Tab 2
            </Item>
            <Item key="/three" href="/three">
              Tab 3
            </Item>
            <Item key="/four" href="/four">
              Tab 4
            </Item>
            <Item key="/five" href="/five">
              Tab 5
            </Item>
          </TabList>
          <TabPanels>
            <Item key="/one">Foo</Item>
            <Item key="/two">Bar</Item>
            <Item key="/three">Tab 3</Item>
            <Item key="/four">Tab 4</Item>
            <Item key="/five">Tab 5</Item>
          </TabPanels>
        </Tabs>
      </RouterProvider>
    );
  },
  args: {
    collapsed: false
  }
};

export const Nested: TabsStory = {
  render: props => {
    return (
      <Tabs aria-label="Some tabs" width={'500px'} {...props}>
        <TabList>
          <Item key="one">Tab 1</Item>
          <Item key="two">Tab 2</Item>
          <Item key="three">Tab 3</Item>
          <Item key="four">Tab 4</Item>
          <Item key="five">Tab 5</Item>
        </TabList>
        <TabPanels>
          <Item key="one">
            <Heading>Nested</Heading>
            <Tabs {...props}>
              <TabList>
                <Item>Tab 1</Item>
                <Item>Tab 2</Item>
              </TabList>
              <TabPanels>
                <Item>
                  <TextField label="Tab 1" />
                </Item>
                <Item>
                  <TextField label="Tab 2" />
                </Item>
              </TabPanels>
            </Tabs>
          </Item>
          <Item key="two">
            <Heading>Bar</Heading>
            <Text>To bar or not to bar.</Text>
          </Item>
          <Item key="three">
            <Heading>Foobar</Heading>
            <Text>That is the foobar.</Text>
          </Item>
          <Item key="four">
            <Heading>Foofoo</Heading>
            <Text>Once more foo upon the foo.</Text>
          </Item>
          <Item key="five">
            <Heading>Barfoo</Heading>
            <Text>What's he that barfoos so?</Text>
          </Item>
        </TabPanels>
      </Tabs>
    );
  }
};

function render(props = {}) {
  return (
    <Tabs
      {...props}
      aria-label="Tab example"
      maxWidth={500}
      onSelectionChange={action('onSelectionChange')}>
      <TabList>
        <Item key="val1">Tab 1</Item>
        <Item key="val2">Tab 2</Item>
        <Item key="val3">Tab 3</Item>
        <Item key="val4">Tab 4</Item>
        <Item key="val5">Tab 5</Item>
      </TabList>
      <TabPanels>
        <Item key="val1">
          <Heading>Tab Body 1</Heading>
          <Text>
            Dolore ex esse laboris elit magna esse sunt. Pariatur in veniam Lorem est occaecat do
            magna nisi mollit ipsum sit adipisicing fugiat ex. Pariatur ullamco exercitation ea qui
            adipisicing. Id cupidatat aute id ut excepteur exercitation magna pariatur. Mollit irure
            irure reprehenderit pariatur eiusmod proident Lorem deserunt duis cillum mollit. Do
            reprehenderit sit cupidatat quis laborum in do culpa nisi ipsum. Velit aliquip commodo
            ea ipsum incididunt culpa nostrud deserunt incididunt exercitation. In quis proident sit
            ad dolore tempor. Eiusmod pariatur quis commodo labore cupidatat cillum enim eiusmod
            voluptate laborum culpa. Laborum cupidatat incididunt velit voluptate incididunt
            occaecat quis do. Consequat adipisicing irure Lorem commodo officia sint id. Velit sit
            magna aliquip eiusmod non id deserunt. Magna veniam ad consequat dolor cupidatat esse
            enim Lorem ullamco. Anim excepteur consectetur id in. Mollit laboris duis labore enim
            duis esse reprehenderit.
          </Text>
        </Item>
        <Item key="val2">
          <Heading>Tab Body 2</Heading>
          <Text>
            Dolore ex esse laboris elit magna esse sunt. Pariatur in veniam Lorem est occaecat do
            magna nisi mollit ipsum sit adipisicing fugiat ex. Pariatur ullamco exercitation ea qui
            adipisicing. Id cupidatat aute id ut excepteur exercitation magna pariatur. Mollit irure
            irure reprehenderit pariatur eiusmod proident Lorem deserunt duis cillum mollit. Do
            reprehenderit sit cupidatat quis laborum in do culpa nisi ipsum. Velit aliquip commodo
            ea ipsum incididunt culpa nostrud deserunt incididunt exercitation. In quis proident sit
            ad dolore tempor. Eiusmod pariatur quis commodo labore cupidatat cillum enim eiusmod
            voluptate laborum culpa. Laborum cupidatat incididunt velit voluptate incididunt
            occaecat quis do. Consequat adipisicing irure Lorem commodo officia sint id. Velit sit
            magna aliquip eiusmod non id deserunt. Magna veniam ad consequat dolor cupidatat esse
            enim Lorem ullamco. Anim excepteur consectetur id in. Mollit laboris duis labore enim
            duis esse reprehenderit.
          </Text>
        </Item>
        <Item key="val3">
          <Heading>Tab Body 3</Heading>
          <Text>
            Dolore ex esse laboris elit magna esse sunt. Pariatur in veniam Lorem est occaecat do
            magna nisi mollit ipsum sit adipisicing fugiat ex. Pariatur ullamco exercitation ea qui
            adipisicing. Id cupidatat aute id ut excepteur exercitation magna pariatur. Mollit irure
            irure reprehenderit pariatur eiusmod proident Lorem deserunt duis cillum mollit. Do
            reprehenderit sit cupidatat quis laborum in do culpa nisi ipsum. Velit aliquip commodo
            ea ipsum incididunt culpa nostrud deserunt incididunt exercitation. In quis proident sit
            ad dolore tempor. Eiusmod pariatur quis commodo labore cupidatat cillum enim eiusmod
            voluptate laborum culpa. Laborum cupidatat incididunt velit voluptate incididunt
            occaecat quis do. Consequat adipisicing irure Lorem commodo officia sint id. Velit sit
            magna aliquip eiusmod non id deserunt. Magna veniam ad consequat dolor cupidatat esse
            enim Lorem ullamco. Anim excepteur consectetur id in. Mollit laboris duis labore enim
            duis esse reprehenderit.
          </Text>
        </Item>
        <Item key="val4">
          <Heading>Tab Body 4</Heading>
          <Text>
            Dolore ex esse laboris elit magna esse sunt. Pariatur in veniam Lorem est occaecat do
            magna nisi mollit ipsum sit adipisicing fugiat ex. Pariatur ullamco exercitation ea qui
            adipisicing. Id cupidatat aute id ut excepteur exercitation magna pariatur. Mollit irure
            irure reprehenderit pariatur eiusmod proident Lorem deserunt duis cillum mollit. Do
            reprehenderit sit cupidatat quis laborum in do culpa nisi ipsum. Velit aliquip commodo
            ea ipsum incididunt culpa nostrud deserunt incididunt exercitation. In quis proident sit
            ad dolore tempor. Eiusmod pariatur quis commodo labore cupidatat cillum enim eiusmod
            voluptate laborum culpa. Laborum cupidatat incididunt velit voluptate incididunt
            occaecat quis do. Consequat adipisicing irure Lorem commodo officia sint id. Velit sit
            magna aliquip eiusmod non id deserunt. Magna veniam ad consequat dolor cupidatat esse
            enim Lorem ullamco. Anim excepteur consectetur id in. Mollit laboris duis labore enim
            duis esse reprehenderit.
          </Text>
        </Item>
        <Item key="val5">
          <Heading>Tab Body 5</Heading>
          <Text>
            Dolore ex esse laboris elit magna esse sunt. Pariatur in veniam Lorem est occaecat do
            magna nisi mollit ipsum sit adipisicing fugiat ex. Pariatur ullamco exercitation ea qui
            adipisicing. Id cupidatat aute id ut excepteur exercitation magna pariatur. Mollit irure
            irure reprehenderit pariatur eiusmod proident Lorem deserunt duis cillum mollit. Do
            reprehenderit sit cupidatat quis laborum in do culpa nisi ipsum. Velit aliquip commodo
            ea ipsum incididunt culpa nostrud deserunt incididunt exercitation. In quis proident sit
            ad dolore tempor. Eiusmod pariatur quis commodo labore cupidatat cillum enim eiusmod
            voluptate laborum culpa. Laborum cupidatat incididunt velit voluptate incididunt
            occaecat quis do. Consequat adipisicing irure Lorem commodo officia sint id. Velit sit
            magna aliquip eiusmod non id deserunt. Magna veniam ad consequat dolor cupidatat esse
            enim Lorem ullamco. Anim excepteur consectetur id in. Mollit laboris duis labore enim
            duis esse reprehenderit.
          </Text>
        </Item>
      </TabPanels>
    </Tabs>
  );
}

function renderWithIcons(props = {}) {
  return (
    <Tabs
      {...props}
      aria-label="Tab example"
      maxWidth={500}
      onSelectionChange={action('onSelectionChange')}>
      <TabList>
        <Item key="dashboard">
          <Dashboard />
          <Text>Dashboard</Text>
        </Item>
        <Item key="calendar">
          <Calendar />
          <Text>Calendar</Text>
        </Item>
        <Item key="bookmark">
          <Bookmark />
          <Text>Bookmark</Text>
        </Item>
      </TabList>
      <TabPanels>
        <Item key="dashboard">
          <Heading>Dashboard</Heading>
          <Text>
            Dolore ex esse laboris elit magna esse sunt. Pariatur in veniam Lorem est occaecat do
            magna nisi mollit ipsum sit adipisicing fugiat ex. Pariatur ullamco exercitation ea qui
            adipisicing. Id cupidatat aute id ut excepteur exercitation magna pariatur. Mollit irure
            irure reprehenderit pariatur eiusmod proident Lorem deserunt duis cillum mollit. Do
            reprehenderit sit cupidatat quis laborum in do culpa nisi ipsum. Velit aliquip commodo
            ea ipsum incididunt culpa nostrud deserunt incididunt exercitation. In quis proident sit
            ad dolore tempor. Eiusmod pariatur quis commodo labore cupidatat cillum enim eiusmod
            voluptate laborum culpa. Laborum cupidatat incididunt velit voluptate incididunt
            occaecat quis do. Consequat adipisicing irure Lorem commodo officia sint id. Velit sit
            magna aliquip eiusmod non id deserunt. Magna veniam ad consequat dolor cupidatat esse
            enim Lorem ullamco. Anim excepteur consectetur id in. Mollit laboris duis labore enim
            duis esse reprehenderit.
          </Text>
        </Item>
        <Item key="calendar">
          <Heading>Calendar</Heading>
          <Text>
            Dolore ex esse laboris elit magna esse sunt. Pariatur in veniam Lorem est occaecat do
            magna nisi mollit ipsum sit adipisicing fugiat ex. Pariatur ullamco exercitation ea qui
            adipisicing. Id cupidatat aute id ut excepteur exercitation magna pariatur. Mollit irure
            irure reprehenderit pariatur eiusmod proident Lorem deserunt duis cillum mollit. Do
            reprehenderit sit cupidatat quis laborum in do culpa nisi ipsum. Velit aliquip commodo
            ea ipsum incididunt culpa nostrud deserunt incididunt exercitation. In quis proident sit
            ad dolore tempor. Eiusmod pariatur quis commodo labore cupidatat cillum enim eiusmod
            voluptate laborum culpa. Laborum cupidatat incididunt velit voluptate incididunt
            occaecat quis do. Consequat adipisicing irure Lorem commodo officia sint id. Velit sit
            magna aliquip eiusmod non id deserunt. Magna veniam ad consequat dolor cupidatat esse
            enim Lorem ullamco. Anim excepteur consectetur id in. Mollit laboris duis labore enim
            duis esse reprehenderit.
          </Text>
        </Item>
        <Item key="bookmark">
          <Heading>Bookmark</Heading>
          <Text>
            Dolore ex esse laboris elit magna esse sunt. Pariatur in veniam Lorem est occaecat do
            magna nisi mollit ipsum sit adipisicing fugiat ex. Pariatur ullamco exercitation ea qui
            adipisicing. Id cupidatat aute id ut excepteur exercitation magna pariatur. Mollit irure
            irure reprehenderit pariatur eiusmod proident Lorem deserunt duis cillum mollit. Do
            reprehenderit sit cupidatat quis laborum in do culpa nisi ipsum. Velit aliquip commodo
            ea ipsum incididunt culpa nostrud deserunt incididunt exercitation. In quis proident sit
            ad dolore tempor. Eiusmod pariatur quis commodo labore cupidatat cillum enim eiusmod
            voluptate laborum culpa. Laborum cupidatat incididunt velit voluptate incididunt
            occaecat quis do. Consequat adipisicing irure Lorem commodo officia sint id. Velit sit
            magna aliquip eiusmod non id deserunt. Magna veniam ad consequat dolor cupidatat esse
            enim Lorem ullamco. Anim excepteur consectetur id in. Mollit laboris duis labore enim
            duis esse reprehenderit.
          </Text>
        </Item>
      </TabPanels>
    </Tabs>
  );
}

function renderWithFalsyKey(props = {}) {
  return (
    <Tabs
      {...props}
      aria-label="Tab example"
      maxWidth={500}
      onSelectionChange={action('onSelectionChange')}>
      <TabList>
        <Item key="">Tab 1</Item>
        <Item key="val2">Tab 2</Item>
        <Item key="val3">Tab 3</Item>
        <Item key="val4">Tab 4</Item>
        <Item key="val5">Tab 5</Item>
      </TabList>
      <TabPanels>
        <Item key="">
          <Heading>Tab Body 1</Heading>
          <Text>
            Dolore ex esse laboris elit magna esse sunt. Pariatur in veniam Lorem est occaecat do
            magna nisi mollit ipsum sit adipisicing fugiat ex. Pariatur ullamco exercitation ea qui
            adipisicing. Id cupidatat aute id ut excepteur exercitation magna pariatur. Mollit irure
            irure reprehenderit pariatur eiusmod proident Lorem deserunt duis cillum mollit. Do
            reprehenderit sit cupidatat quis laborum in do culpa nisi ipsum. Velit aliquip commodo
            ea ipsum incididunt culpa nostrud deserunt incididunt exercitation. In quis proident sit
            ad dolore tempor. Eiusmod pariatur quis commodo labore cupidatat cillum enim eiusmod
            voluptate laborum culpa. Laborum cupidatat incididunt velit voluptate incididunt
            occaecat quis do. Consequat adipisicing irure Lorem commodo officia sint id. Velit sit
            magna aliquip eiusmod non id deserunt. Magna veniam ad consequat dolor cupidatat esse
            enim Lorem ullamco. Anim excepteur consectetur id in. Mollit laboris duis labore enim
            duis esse reprehenderit.
          </Text>
        </Item>
        <Item key="val2">
          <Heading>Tab Body 2</Heading>
          <Text>
            Dolore ex esse laboris elit magna esse sunt. Pariatur in veniam Lorem est occaecat do
            magna nisi mollit ipsum sit adipisicing fugiat ex. Pariatur ullamco exercitation ea qui
            adipisicing. Id cupidatat aute id ut excepteur exercitation magna pariatur. Mollit irure
            irure reprehenderit pariatur eiusmod proident Lorem deserunt duis cillum mollit. Do
            reprehenderit sit cupidatat quis laborum in do culpa nisi ipsum. Velit aliquip commodo
            ea ipsum incididunt culpa nostrud deserunt incididunt exercitation. In quis proident sit
            ad dolore tempor. Eiusmod pariatur quis commodo labore cupidatat cillum enim eiusmod
            voluptate laborum culpa. Laborum cupidatat incididunt velit voluptate incididunt
            occaecat quis do. Consequat adipisicing irure Lorem commodo officia sint id. Velit sit
            magna aliquip eiusmod non id deserunt. Magna veniam ad consequat dolor cupidatat esse
            enim Lorem ullamco. Anim excepteur consectetur id in. Mollit laboris duis labore enim
            duis esse reprehenderit.
          </Text>
        </Item>
        <Item key="val3">
          <Heading>Tab Body 3</Heading>
          <Text>
            Dolore ex esse laboris elit magna esse sunt. Pariatur in veniam Lorem est occaecat do
            magna nisi mollit ipsum sit adipisicing fugiat ex. Pariatur ullamco exercitation ea qui
            adipisicing. Id cupidatat aute id ut excepteur exercitation magna pariatur. Mollit irure
            irure reprehenderit pariatur eiusmod proident Lorem deserunt duis cillum mollit. Do
            reprehenderit sit cupidatat quis laborum in do culpa nisi ipsum. Velit aliquip commodo
            ea ipsum incididunt culpa nostrud deserunt incididunt exercitation. In quis proident sit
            ad dolore tempor. Eiusmod pariatur quis commodo labore cupidatat cillum enim eiusmod
            voluptate laborum culpa. Laborum cupidatat incididunt velit voluptate incididunt
            occaecat quis do. Consequat adipisicing irure Lorem commodo officia sint id. Velit sit
            magna aliquip eiusmod non id deserunt. Magna veniam ad consequat dolor cupidatat esse
            enim Lorem ullamco. Anim excepteur consectetur id in. Mollit laboris duis labore enim
            duis esse reprehenderit.
          </Text>
        </Item>
        <Item key="val4">
          <Heading>Tab Body 4</Heading>
          <Text>
            Dolore ex esse laboris elit magna esse sunt. Pariatur in veniam Lorem est occaecat do
            magna nisi mollit ipsum sit adipisicing fugiat ex. Pariatur ullamco exercitation ea qui
            adipisicing. Id cupidatat aute id ut excepteur exercitation magna pariatur. Mollit irure
            irure reprehenderit pariatur eiusmod proident Lorem deserunt duis cillum mollit. Do
            reprehenderit sit cupidatat quis laborum in do culpa nisi ipsum. Velit aliquip commodo
            ea ipsum incididunt culpa nostrud deserunt incididunt exercitation. In quis proident sit
            ad dolore tempor. Eiusmod pariatur quis commodo labore cupidatat cillum enim eiusmod
            voluptate laborum culpa. Laborum cupidatat incididunt velit voluptate incididunt
            occaecat quis do. Consequat adipisicing irure Lorem commodo officia sint id. Velit sit
            magna aliquip eiusmod non id deserunt. Magna veniam ad consequat dolor cupidatat esse
            enim Lorem ullamco. Anim excepteur consectetur id in. Mollit laboris duis labore enim
            duis esse reprehenderit.
          </Text>
        </Item>
        <Item key="val5">
          <Heading>Tab Body 5</Heading>
          <Text>
            Dolore ex esse laboris elit magna esse sunt. Pariatur in veniam Lorem est occaecat do
            magna nisi mollit ipsum sit adipisicing fugiat ex. Pariatur ullamco exercitation ea qui
            adipisicing. Id cupidatat aute id ut excepteur exercitation magna pariatur. Mollit irure
            irure reprehenderit pariatur eiusmod proident Lorem deserunt duis cillum mollit. Do
            reprehenderit sit cupidatat quis laborum in do culpa nisi ipsum. Velit aliquip commodo
            ea ipsum incididunt culpa nostrud deserunt incididunt exercitation. In quis proident sit
            ad dolore tempor. Eiusmod pariatur quis commodo labore cupidatat cillum enim eiusmod
            voluptate laborum culpa. Laborum cupidatat incididunt velit voluptate incididunt
            occaecat quis do. Consequat adipisicing irure Lorem commodo officia sint id. Velit sit
            magna aliquip eiusmod non id deserunt. Magna veniam ad consequat dolor cupidatat esse
            enim Lorem ullamco. Anim excepteur consectetur id in. Mollit laboris duis labore enim
            duis esse reprehenderit.
          </Text>
        </Item>
      </TabPanels>
    </Tabs>
  );
}

function renderWithVerticalWrap(props = {}) {
  return (
    <Tabs
      orientation="vertical"
      aria-label="Tab example"
      maxWidth={500}
      onSelectionChange={action('onSelectionChange')}>
      <TabList {...props}>
        <Item key="val1">User Profile Settings</Item>
        <Item key="val2">
          <span lang="ja">バナーおよびディスプレイ広告</span>
        </Item>
        <Item key="val3">
          <span lang="de" style={{hyphens: 'auto'}}>
            Rindfleischetikettierungsüberwachungsaufgabenübertragungsgesetz
          </span>
        </Item>
        <Item key="val4">Tab 4</Item>
        <Item key="val5">Tab 5</Item>
      </TabList>
      <TabPanels>
        <Item key="val1">
          <Heading>Tab Body 1</Heading>
          <Text>
            Dolore ex esse laboris elit magna esse sunt. Pariatur in veniam Lorem est occaecat do
            magna nisi mollit ipsum sit adipisicing fugiat ex. Pariatur ullamco exercitation ea qui
            adipisicing. Id cupidatat aute id ut excepteur exercitation magna pariatur. Mollit irure
            irure reprehenderit pariatur eiusmod proident Lorem deserunt duis cillum mollit. Do
            reprehenderit sit cupidatat quis laborum in do culpa nisi ipsum. Velit aliquip commodo
            ea ipsum incididunt culpa nostrud deserunt incididunt exercitation. In quis proident sit
            ad dolore tempor. Eiusmod pariatur quis commodo labore cupidatat cillum enim eiusmod
            voluptate laborum culpa. Laborum cupidatat incididunt velit voluptate incididunt
            occaecat quis do. Consequat adipisicing irure Lorem commodo officia sint id. Velit sit
            magna aliquip eiusmod non id deserunt. Magna veniam ad consequat dolor cupidatat esse
            enim Lorem ullamco. Anim excepteur consectetur id in. Mollit laboris duis labore enim
            duis esse reprehenderit.
          </Text>
        </Item>
        <Item key="val2">
          <Heading>Tab Body 2</Heading>
          <Text>
            Dolore ex esse laboris elit magna esse sunt. Pariatur in veniam Lorem est occaecat do
            magna nisi mollit ipsum sit adipisicing fugiat ex. Pariatur ullamco exercitation ea qui
            adipisicing. Id cupidatat aute id ut excepteur exercitation magna pariatur. Mollit irure
            irure reprehenderit pariatur eiusmod proident Lorem deserunt duis cillum mollit. Do
            reprehenderit sit cupidatat quis laborum in do culpa nisi ipsum. Velit aliquip commodo
            ea ipsum incididunt culpa nostrud deserunt incididunt exercitation. In quis proident sit
            ad dolore tempor. Eiusmod pariatur quis commodo labore cupidatat cillum enim eiusmod
            voluptate laborum culpa. Laborum cupidatat incididunt velit voluptate incididunt
            occaecat quis do. Consequat adipisicing irure Lorem commodo officia sint id. Velit sit
            magna aliquip eiusmod non id deserunt. Magna veniam ad consequat dolor cupidatat esse
            enim Lorem ullamco. Anim excepteur consectetur id in. Mollit laboris duis labore enim
            duis esse reprehenderit.
          </Text>
        </Item>
        <Item key="val3">
          <Heading>Tab Body 3</Heading>
          <Text>
            Dolore ex esse laboris elit magna esse sunt. Pariatur in veniam Lorem est occaecat do
            magna nisi mollit ipsum sit adipisicing fugiat ex. Pariatur ullamco exercitation ea qui
            adipisicing. Id cupidatat aute id ut excepteur exercitation magna pariatur. Mollit irure
            irure reprehenderit pariatur eiusmod proident Lorem deserunt duis cillum mollit. Do
            reprehenderit sit cupidatat quis laborum in do culpa nisi ipsum. Velit aliquip commodo
            ea ipsum incididunt culpa nostrud deserunt incididunt exercitation. In quis proident sit
            ad dolore tempor. Eiusmod pariatur quis commodo labore cupidatat cillum enim eiusmod
            voluptate laborum culpa. Laborum cupidatat incididunt velit voluptate incididunt
            occaecat quis do. Consequat adipisicing irure Lorem commodo officia sint id. Velit sit
            magna aliquip eiusmod non id deserunt. Magna veniam ad consequat dolor cupidatat esse
            enim Lorem ullamco. Anim excepteur consectetur id in. Mollit laboris duis labore enim
            duis esse reprehenderit.
          </Text>
        </Item>
        <Item key="val4">
          <Heading>Tab Body 4</Heading>
          <Text>
            Dolore ex esse laboris elit magna esse sunt. Pariatur in veniam Lorem est occaecat do
            magna nisi mollit ipsum sit adipisicing fugiat ex. Pariatur ullamco exercitation ea qui
            adipisicing. Id cupidatat aute id ut excepteur exercitation magna pariatur. Mollit irure
            irure reprehenderit pariatur eiusmod proident Lorem deserunt duis cillum mollit. Do
            reprehenderit sit cupidatat quis laborum in do culpa nisi ipsum. Velit aliquip commodo
            ea ipsum incididunt culpa nostrud deserunt incididunt exercitation. In quis proident sit
            ad dolore tempor. Eiusmod pariatur quis commodo labore cupidatat cillum enim eiusmod
            voluptate laborum culpa. Laborum cupidatat incididunt velit voluptate incididunt
            occaecat quis do. Consequat adipisicing irure Lorem commodo officia sint id. Velit sit
            magna aliquip eiusmod non id deserunt. Magna veniam ad consequat dolor cupidatat esse
            enim Lorem ullamco. Anim excepteur consectetur id in. Mollit laboris duis labore enim
            duis esse reprehenderit.
          </Text>
        </Item>
        <Item key="val5">
          <Heading>Tab Body 5</Heading>
          <Text>
            Dolore ex esse laboris elit magna esse sunt. Pariatur in veniam Lorem est occaecat do
            magna nisi mollit ipsum sit adipisicing fugiat ex. Pariatur ullamco exercitation ea qui
            adipisicing. Id cupidatat aute id ut excepteur exercitation magna pariatur. Mollit irure
            irure reprehenderit pariatur eiusmod proident Lorem deserunt duis cillum mollit. Do
            reprehenderit sit cupidatat quis laborum in do culpa nisi ipsum. Velit aliquip commodo
            ea ipsum incididunt culpa nostrud deserunt incididunt exercitation. In quis proident sit
            ad dolore tempor. Eiusmod pariatur quis commodo labore cupidatat cillum enim eiusmod
            voluptate laborum culpa. Laborum cupidatat incididunt velit voluptate incididunt
            occaecat quis do. Consequat adipisicing irure Lorem commodo officia sint id. Velit sit
            magna aliquip eiusmod non id deserunt. Magna veniam ad consequat dolor cupidatat esse
            enim Lorem ullamco. Anim excepteur consectetur id in. Mollit laboris duis labore enim
            duis esse reprehenderit.
          </Text>
        </Item>
      </TabPanels>
    </Tabs>
  );
}

interface DynamicTabItem {
  name: string;
  children: ReactNode;
  icon?: ReactNode;
}

let items = [
  {name: 'Tab 1', children: 'Tab Body 1', icon: <Dashboard />},
  {name: 'Tab 2', children: 'Tab Body 2', icon: <Calendar />},
  {name: 'Tab 3', children: 'Tab Body 3', icon: <Bookmark />},
  {name: 'Tab 4', children: 'Tab Body 4', icon: <Dashboard />},
  {name: 'Tab 5', children: 'Tab Body 5', icon: <Calendar />},
  {name: 'Tab 6', children: 'Tab Body 6', icon: <Bookmark />}
] as DynamicTabItem[];

let DynamicTabs = (props: Omit<SpectrumTabsProps<DynamicTabItem>, 'children'>) => {
  let [tabs, setTabs] = React.useState(items);
  let addTab = () => {
    let newTabs = [...tabs];
    newTabs.push({
      name: `Tab ${tabs.length + 1}`,
      children: `Tab Body ${tabs.length + 1}`
    });

    setTabs(newTabs);
  };

  let removeTab = () => {
    if (tabs.length > 1) {
      let newTabs = [...tabs];
      newTabs.pop();
      setTabs(newTabs);
    }
  };

  return (
    <div style={{width: '80%'}}>
      <Tabs
        {...props}
        aria-label="Tab example"
        items={tabs}
        onSelectionChange={action('onSelectionChange')}>
        <TabList>
          {(item: DynamicTabItem) => (
            <Item key={item.name}>
              {item.icon}
              <Text>{item.name}</Text>
            </Item>
          )}
        </TabList>
        <TabPanels>
          {(item: DynamicTabItem) => (
            <Item key={item.name}>
              <Heading>{item.children}</Heading>
              <Text>
                Dolore ex esse laboris elit magna esse sunt. Pariatur in veniam Lorem est occaecat
                do magna nisi mollit ipsum sit adipisicing fugiat ex. Pariatur ullamco exercitation
                ea qui adipisicing. Id cupidatat aute id ut excepteur exercitation magna pariatur.
                Mollit irure irure reprehenderit pariatur eiusmod proident Lorem deserunt duis
                cillum mollit. Do reprehenderit sit cupidatat quis laborum in do culpa nisi ipsum.
                Velit aliquip commodo ea ipsum incididunt culpa nostrud deserunt incididunt
                exercitation. In quis proident sit ad dolore tempor. Eiusmod pariatur quis commodo
                labore cupidatat cillum enim eiusmod voluptate laborum culpa. Laborum cupidatat
                incididunt velit voluptate incididunt occaecat quis do. Consequat adipisicing irure
                Lorem commodo officia sint id. Velit sit magna aliquip eiusmod non id deserunt.
                Magna veniam ad consequat dolor cupidatat esse enim Lorem ullamco. Anim excepteur
                consectetur id in. Mollit laboris duis labore enim duis esse reprehenderit.
              </Text>
            </Item>
          )}
        </TabPanels>
      </Tabs>
      <ButtonGroup marginEnd="30px">
        <Button variant="secondary" onPress={() => addTab()}>
          <Text>Add Tab</Text>
        </Button>
        <Button variant="secondary" onPress={() => removeTab()}>
          <Text>Remove Tab</Text>
        </Button>
      </ButtonGroup>
    </div>
  );
};

let OrientationFlip = (props = {}) => {
  let [flipOrientation, setFlipOrientation] = React.useState(true);

  return (
    <div style={{width: '80%'}}>
      <Tabs
        {...props}
        aria-label="Tab example"
        items={items}
        onSelectionChange={action('onSelectionChange')}
        orientation={flipOrientation ? 'horizontal' : 'vertical'}>
        <TabList>
          {(item: DynamicTabItem) => (
            <Item key={item.name}>
              {item.icon}
              <Text>{item.name}</Text>
            </Item>
          )}
        </TabList>
        <TabPanels>
          {(item: DynamicTabItem) => (
            <Item key={item.name}>
              <Heading>{item.children}</Heading>
              <Text>
                Dolore ex esse laboris elit magna esse sunt. Pariatur in veniam Lorem est occaecat
                do magna nisi mollit ipsum sit adipisicing fugiat ex. Pariatur ullamco exercitation
                ea qui adipisicing. Id cupidatat aute id ut excepteur exercitation magna pariatur.
                Mollit irure irure reprehenderit pariatur eiusmod proident Lorem deserunt duis
                cillum mollit. Do reprehenderit sit cupidatat quis laborum in do culpa nisi ipsum.
                Velit aliquip commodo ea ipsum incididunt culpa nostrud deserunt incididunt
                exercitation. In quis proident sit ad dolore tempor. Eiusmod pariatur quis commodo
                labore cupidatat cillum enim eiusmod voluptate laborum culpa. Laborum cupidatat
                incididunt velit voluptate incididunt occaecat quis do. Consequat adipisicing irure
                Lorem commodo officia sint id. Velit sit magna aliquip eiusmod non id deserunt.
                Magna veniam ad consequat dolor cupidatat esse enim Lorem ullamco. Anim excepteur
                consectetur id in. Mollit laboris duis labore enim duis esse reprehenderit.
              </Text>
            </Item>
          )}
        </TabPanels>
      </Tabs>
      <Button variant="secondary" onPress={() => setFlipOrientation(state => !state)}>
        <Text>Flip Orientation</Text>
      </Button>
    </div>
  );
};

let DynamicTabsWithDecoration = (props = {}) => {
  let [tabs, setTabs] = React.useState(items);
  let addTab = () => {
    let newTabs = [...tabs];
    newTabs.push({
      name: `Tab ${tabs.length + 1}`,
      children: `Tab Body ${tabs.length + 1}`
    });

    setTabs(newTabs);
  };

  let removeTab = () => {
    if (tabs.length > 1) {
      let newTabs = [...tabs];
      newTabs.pop();
      setTabs(newTabs);
    }
  };

  return (
    <div style={{width: '80%'}}>
      <Tabs
        {...props}
        aria-label="Tab example"
        items={tabs}
        onSelectionChange={action('onSelectionChange')}>
        <Flex direction="row" alignItems="center">
          <TabList flex="1 1 auto" UNSAFE_style={{overflow: 'hidden'}}>
            {(item: DynamicTabItem) => (
              <Item key={item.name}>
                {item.icon}
                <Text>{item.name}</Text>
              </Item>
            )}
          </TabList>
          <Flex
            alignItems="center"
            justifyContent="end"
            flex="0 0 auto"
            alignSelf="stretch"
            UNSAFE_style={{
              borderBottom:
                'var(--spectrum-alias-border-size-thick) solid var(--spectrum-global-color-gray-300)'
            }}>
            <ActionGroup
              marginEnd="30px"
              disabledKeys={tabs.length === 1 ? ['remove'] : undefined}
              onAction={val => (val === 'add' ? addTab() : removeTab())}>
              <Item key="add">
                <Text>Add Tab</Text>
              </Item>
              <Item key="remove">
                <Text>Remove Tab</Text>
              </Item>
            </ActionGroup>
          </Flex>
        </Flex>
        <TabPanels>
          {(item: DynamicTabItem) => (
            <Item key={item.name}>
              <Heading>{item.children}</Heading>
              <Text>
                Dolore ex esse laboris elit magna esse sunt. Pariatur in veniam Lorem est occaecat
                do magna nisi mollit ipsum sit adipisicing fugiat ex. Pariatur ullamco exercitation
                ea qui adipisicing. Id cupidatat aute id ut excepteur exercitation magna pariatur.
                Mollit irure irure reprehenderit pariatur eiusmod proident Lorem deserunt duis
                cillum mollit. Do reprehenderit sit cupidatat quis laborum in do culpa nisi ipsum.
                Velit aliquip commodo ea ipsum incididunt culpa nostrud deserunt incididunt
                exercitation. In quis proident sit ad dolore tempor. Eiusmod pariatur quis commodo
                labore cupidatat cillum enim eiusmod voluptate laborum culpa. Laborum cupidatat
                incididunt velit voluptate incididunt occaecat quis do. Consequat adipisicing irure
                Lorem commodo officia sint id. Velit sit magna aliquip eiusmod non id deserunt.
                Magna veniam ad consequat dolor cupidatat esse enim Lorem ullamco. Anim excepteur
                consectetur id in. Mollit laboris duis labore enim duis esse reprehenderit.
              </Text>
            </Item>
          )}
        </TabPanels>
      </Tabs>
    </div>
  );
};

let ControlledSelection = () => {
  let [selectedKey, _setSelectedKey] = useState<Key>('Tab 1');
  let setSelectedKey = useCallback(
    (key: Key | null) => {
      if (key != null) {
        _setSelectedKey(key);
      }
    },
    [_setSelectedKey]
  );

  return (
    <div style={{width: '80%'}}>
      <Picker
        label="Set selected tab"
        selectedKey={selectedKey}
        onSelectionChange={setSelectedKey}
        items={items}>
        {item => <Item key={item.name}>{item.name}</Item>}
      </Picker>
      <Tabs
        aria-label="Tab example"
        items={items}
        selectedKey={selectedKey}
        onSelectionChange={setSelectedKey}>
        <TabList>
          {(item: DynamicTabItem) => (
            <Item key={item.name}>
              {item.icon}
              <Text>{item.name}</Text>
            </Item>
          )}
        </TabList>
        <TabPanels>
          {(item: DynamicTabItem) => (
            <Item key={item.name}>
              <Heading>{item.children}</Heading>
              <Text>
                Dolore ex esse laboris elit magna esse sunt. Pariatur in veniam Lorem est occaecat
                do magna nisi mollit ipsum sit adipisicing fugiat ex. Pariatur ullamco exercitation
                ea qui adipisicing. Id cupidatat aute id ut excepteur exercitation magna pariatur.
                Mollit irure irure reprehenderit pariatur eiusmod proident Lorem deserunt duis
                cillum mollit. Do reprehenderit sit cupidatat quis laborum in do culpa nisi ipsum.
                Velit aliquip commodo ea ipsum incididunt culpa nostrud deserunt incididunt
                exercitation. In quis proident sit ad dolore tempor. Eiusmod pariatur quis commodo
                labore cupidatat cillum enim eiusmod voluptate laborum culpa. Laborum cupidatat
                incididunt velit voluptate incididunt occaecat quis do. Consequat adipisicing irure
                Lorem commodo officia sint id. Velit sit magna aliquip eiusmod non id deserunt.
                Magna veniam ad consequat dolor cupidatat esse enim Lorem ullamco. Anim excepteur
                consectetur id in. Mollit laboris duis labore enim duis esse reprehenderit.
              </Text>
            </Item>
          )}
        </TabPanels>
      </Tabs>
    </div>
  );
};
