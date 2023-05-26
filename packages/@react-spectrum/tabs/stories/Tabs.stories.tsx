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

import {action} from '@storybook/addon-actions';
import {ActionGroup, Flex, Heading, Text} from '@adobe/react-spectrum';
import Bookmark from '@spectrum-icons/workflow/Bookmark';
import {Button} from '@react-spectrum/button';
import {ButtonGroup} from '@react-spectrum/buttongroup';
import Calendar from '@spectrum-icons/workflow/Calendar';
import Dashboard from '@spectrum-icons/workflow/Dashboard';
import {Item, TabList, TabPanels, Tabs} from '..';
import {Picker} from '@react-spectrum/picker';
import React, {ReactNode, useState} from 'react';
import {SpectrumTabsProps} from '@react-types/tabs';
import {TextField} from '@react-spectrum/textfield';

export default {
  title: 'Tabs'
};

export const Default = () => render();
export const WithFalsyItemKey = () => renderWithFalsyKey();

WithFalsyItemKey.story = {
  name: 'with falsy item key'
};

export const DefaultSelectedKeyVal2 = () => render({defaultSelectedKey: 'val2'});

DefaultSelectedKeyVal2.story = {
  name: 'defaultSelectedKey: val2'
};

export const ControlledSelectedKeyVal3 = () => render({selectedKey: 'val3'});

ControlledSelectedKeyVal3.story = {
  name: 'controlled: selectedKey: val3'
};

export const OrientationVertical = () => render({orientation: 'vertical'});

OrientationVertical.story = {
  name: 'orientation: vertical'
};

export const DensityCompact = () => render({density: 'compact'});

DensityCompact.story = {
  name: 'density: compact'
};

export const IsQuiet = () => render({isQuiet: true});

IsQuiet.story = {
  name: 'isQuiet'
};

export const IsQuietDensityCompact = () => render({isQuiet: true, density: 'compact'});

IsQuietDensityCompact.story = {
  name: 'isQuiet, density: compact'
};

export const DensityCompactOrientationVertical = () =>
  render({density: 'compact', orientation: 'vertical'});

DensityCompactOrientationVertical.story = {
  name: 'density: compact, orientation: vertical'
};

export const Icons = () => renderWithIcons();

Icons.story = {
  name: 'icons'
};

export const IconsDensityCompact = () => renderWithIcons({density: 'compact'});

IconsDensityCompact.story = {
  name: 'icons, density: compact'
};

export const IconsOrientationVertical = () => renderWithIcons({orientation: 'vertical'});

IconsOrientationVertical.story = {
  name: 'icons, orientation: vertical'
};

export const IconsDensityCompactOrientationVertical = () =>
  renderWithIcons({orientation: 'vertical', density: 'compact'});

IconsDensityCompactOrientationVertical.story = {
  name: 'icons, density: compact, orientation: vertical'
};

export const IsEmphasizedTrue = () => render({isEmphasized: true});

IsEmphasizedTrue.story = {
  name: 'isEmphasized: true'
};

export const IsEmphasizedTrueIconsIsQuietTrue = () =>
  renderWithIcons({isEmphasized: true, isQuiet: true});

IsEmphasizedTrueIconsIsQuietTrue.story = {
  name: 'isEmphasized: true, icons, isQuiet: true'
};

export const IsEmphasizedTrueOrientationVertical = () =>
  render({isEmphasized: true, orientation: 'vertical'});

IsEmphasizedTrueOrientationVertical.story = {
  name: 'isEmphasized: true, orientation: vertical'
};

export const DisableAllTabs = () => render({isDisabled: true});

DisableAllTabs.story = {
  name: 'disable all tabs'
};

export const KeyboardActivationManual = () => render({keyboardActivation: 'manual'});

KeyboardActivationManual.story = {
  name: 'keyboardActivation: manual'
};

export const MiddleDisabled = () => render({disabledKeys: ['val2']});

MiddleDisabled.story = {
  name: 'middle disabled'
};

export const AllDisabled = () => render({disabledKeys: ['val1', 'val2', 'val3', 'val4', 'val5']});

AllDisabled.story = {
  name: 'all disabled'
};

export const Resizeable = () => (
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
);

Resizeable.story = {
  name: 'resizeable'
};

export const CollapseBehavior = () => <DynamicTabs />;

CollapseBehavior.story = {
  name: 'collapse behavior'
};

export const CollapseBehaviorIsQuiet = () => <DynamicTabs isQuiet />;

CollapseBehaviorIsQuiet.story = {
  name: 'collapse behavior, isQuiet'
};

export const CollapseBehaviorDensityCompact = () => <DynamicTabs density="compact" />;

CollapseBehaviorDensityCompact.story = {
  name: 'collapse behavior, density: compact'
};

export const CollapseBehaviorDensityCompactIsQuiet = () => (
  <DynamicTabs isQuiet density="compact" />
);

CollapseBehaviorDensityCompactIsQuiet.story = {
  name: 'collapse behavior, density: compact, isQuiet'
};

export const CollapseBehaviorIsEmphasizedTrue = () => <DynamicTabs isEmphasized />;

CollapseBehaviorIsEmphasizedTrue.story = {
  name: 'collapse behavior, isEmphasized: true'
};

export const _OrientationFlip = () => <OrientationFlip />;

_OrientationFlip.story = {
  name: 'orientation flip'
};

export const TestingTabsInFlex = () => (
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
);

TestingTabsInFlex.story = {
  name: 'testing: tabs in flex'
};

export const TransitionBetweenTabSizes = () => (
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
);

TransitionBetweenTabSizes.story = {
  name: 'transition between tab sizes'
};

export const TabWithFlexContainerInBetween = () => <DynamicTabsWithDecoration />;

TabWithFlexContainerInBetween.story = {
  name: 'Tab with flex container in between'
};

export const TabsAtTheBottom = () => (
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
);

TabsAtTheBottom.story = {
  name: 'tabs at the bottom'
};

export const TabsOnTheRight = () => (
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
);

TabsOnTheRight.story = {
  name: 'tabs on the right'
};

export const FocusableElementInTabPanel = () => (
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
);

FocusableElementInTabPanel.story = {
  name: 'focusable element in tab panel'
};

export const Tab1ControlledChild = () => {
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
};

Tab1ControlledChild.story = {
  name: 'Tab 1 controlled child'
};

export const ChangingTabTitles = () => {
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
};

ChangingTabTitles.story = {
  name: 'changing tab titles'
};

export const ChangingSelectionProgramatically = () => <ControlledSelection />;

ChangingSelectionProgramatically.story = {
  name: 'changing selection programatically'
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

interface DynamicTabItem {
  name: string,
  children: ReactNode,
  icon?: ReactNode
}

let items = [
  {name: 'Tab 1', children: 'Tab Body 1', icon: <Dashboard size="S" />},
  {name: 'Tab 2', children: 'Tab Body 2', icon: <Calendar size="S" />},
  {name: 'Tab 3', children: 'Tab Body 3', icon: <Bookmark size="S" />},
  {name: 'Tab 4', children: 'Tab Body 4', icon: <Dashboard size="S" />},
  {name: 'Tab 5', children: 'Tab Body 5', icon: <Calendar size="S" />},
  {name: 'Tab 6', children: 'Tab Body 6', icon: <Bookmark size="S" />}
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
      <Tabs {...props} aria-label="Tab example" items={tabs} onSelectionChange={action('onSelectionChange')}>
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
                Dolore ex esse laboris elit magna esse sunt. Pariatur in veniam Lorem est occaecat do magna nisi mollit ipsum sit adipisicing fugiat ex. Pariatur ullamco exercitation ea qui adipisicing.
                Id cupidatat aute id ut excepteur exercitation magna pariatur. Mollit irure irure reprehenderit pariatur eiusmod proident Lorem deserunt duis cillum mollit. Do reprehenderit sit cupidatat quis laborum in do culpa nisi ipsum. Velit aliquip commodo ea ipsum incididunt culpa nostrud deserunt incididunt exercitation. In quis proident sit ad dolore tempor. Eiusmod pariatur quis commodo labore cupidatat cillum enim eiusmod voluptate laborum culpa. Laborum cupidatat incididunt velit voluptate incididunt occaecat quis do.
                Consequat adipisicing irure Lorem commodo officia sint id. Velit sit magna aliquip eiusmod non id deserunt. Magna veniam ad consequat dolor cupidatat esse enim Lorem ullamco. Anim excepteur consectetur id in. Mollit laboris duis labore enim duis esse reprehenderit.
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
      <Tabs {...props} aria-label="Tab example" items={items} onSelectionChange={action('onSelectionChange')} orientation={flipOrientation ? 'horizontal' : 'vertical'}>
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
                Dolore ex esse laboris elit magna esse sunt. Pariatur in veniam Lorem est occaecat do magna nisi mollit ipsum sit adipisicing fugiat ex. Pariatur ullamco exercitation ea qui adipisicing.
                Id cupidatat aute id ut excepteur exercitation magna pariatur. Mollit irure irure reprehenderit pariatur eiusmod proident Lorem deserunt duis cillum mollit. Do reprehenderit sit cupidatat quis laborum in do culpa nisi ipsum. Velit aliquip commodo ea ipsum incididunt culpa nostrud deserunt incididunt exercitation. In quis proident sit ad dolore tempor. Eiusmod pariatur quis commodo labore cupidatat cillum enim eiusmod voluptate laborum culpa. Laborum cupidatat incididunt velit voluptate incididunt occaecat quis do.
                Consequat adipisicing irure Lorem commodo officia sint id. Velit sit magna aliquip eiusmod non id deserunt. Magna veniam ad consequat dolor cupidatat esse enim Lorem ullamco. Anim excepteur consectetur id in. Mollit laboris duis labore enim duis esse reprehenderit.
              </Text>
            </Item>
          )}
        </TabPanels>
      </Tabs>
      <Button variant="secondary" onPress={() => setFlipOrientation((state) => !state)}>
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
      <Tabs {...props} aria-label="Tab example" items={tabs} onSelectionChange={action('onSelectionChange')}>
        <Flex direction="row" alignItems="center">
          <TabList flex="1 1 auto" UNSAFE_style={{overflow: 'hidden'}}>
            {(item: DynamicTabItem) => (
              <Item key={item.name}>
                {item.icon}
                <Text>{item.name}</Text>
              </Item>
            )}
          </TabList>
          <Flex alignItems="center" justifyContent="end" flex="0 0 auto" alignSelf="stretch" UNSAFE_style={{borderBottom: 'var(--spectrum-alias-border-size-thick) solid var(--spectrum-global-color-gray-300)'}}>
            <ActionGroup marginEnd="30px" disabledKeys={tabs.length === 1 ? ['remove'] : undefined} onAction={val => val === 'add' ? addTab() : removeTab()}>
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
                Dolore ex esse laboris elit magna esse sunt. Pariatur in veniam Lorem est occaecat do magna nisi mollit ipsum sit adipisicing fugiat ex. Pariatur ullamco exercitation ea qui adipisicing.
                Id cupidatat aute id ut excepteur exercitation magna pariatur. Mollit irure irure reprehenderit pariatur eiusmod proident Lorem deserunt duis cillum mollit. Do reprehenderit sit cupidatat quis laborum in do culpa nisi ipsum. Velit aliquip commodo ea ipsum incididunt culpa nostrud deserunt incididunt exercitation. In quis proident sit ad dolore tempor. Eiusmod pariatur quis commodo labore cupidatat cillum enim eiusmod voluptate laborum culpa. Laborum cupidatat incididunt velit voluptate incididunt occaecat quis do.
                Consequat adipisicing irure Lorem commodo officia sint id. Velit sit magna aliquip eiusmod non id deserunt. Magna veniam ad consequat dolor cupidatat esse enim Lorem ullamco. Anim excepteur consectetur id in. Mollit laboris duis labore enim duis esse reprehenderit.
              </Text>
            </Item>
          )}
        </TabPanels>
      </Tabs>
    </div>
  );
};

let ControlledSelection = () => {
  let [selectedKey, setSelectedKey] = useState<React.Key>('Tab 1');

  return (
    <div style={{width: '80%'}}>
      <Picker label="Set selected tab" selectedKey={selectedKey} onSelectionChange={setSelectedKey} items={items}>
        {item => <Item key={item.name}>{item.name}</Item>}
      </Picker>
      <Tabs aria-label="Tab example" items={items} selectedKey={selectedKey} onSelectionChange={setSelectedKey}>
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
                Dolore ex esse laboris elit magna esse sunt. Pariatur in veniam Lorem est occaecat do magna nisi mollit ipsum sit adipisicing fugiat ex. Pariatur ullamco exercitation ea qui adipisicing.
                Id cupidatat aute id ut excepteur exercitation magna pariatur. Mollit irure irure reprehenderit pariatur eiusmod proident Lorem deserunt duis cillum mollit. Do reprehenderit sit cupidatat quis laborum in do culpa nisi ipsum. Velit aliquip commodo ea ipsum incididunt culpa nostrud deserunt incididunt exercitation. In quis proident sit ad dolore tempor. Eiusmod pariatur quis commodo labore cupidatat cillum enim eiusmod voluptate laborum culpa. Laborum cupidatat incididunt velit voluptate incididunt occaecat quis do.
                Consequat adipisicing irure Lorem commodo officia sint id. Velit sit magna aliquip eiusmod non id deserunt. Magna veniam ad consequat dolor cupidatat esse enim Lorem ullamco. Anim excepteur consectetur id in. Mollit laboris duis labore enim duis esse reprehenderit.
              </Text>
            </Item>
          )}
        </TabPanels>
      </Tabs>
    </div>
  );
};
