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

import {Example} from './ThemeSwitcher';
import {Flex} from '@react-spectrum/layout';
import {Item, Picker} from '@react-spectrum/picker';
import {Provider} from '@react-spectrum/provider';
import React, {useState} from 'react';

export function ExampleThemeSwitcher({children}) {
  let [colorScheme, setColorScheme] = useState();
  let [scale, setScale] = useState();

  return (
    <Example colorScheme={colorScheme}>
      <Flex direction="column">
        <Flex marginBottom="size-250" wrap columnGap="size-250" rowGap="size-100">
          <Picker label="Color Scheme" selectedKey={colorScheme} onSelectionChange={setColorScheme}>
            <Item key="light">Light</Item>
            <Item key="dark">Dark</Item>
          </Picker>
          <Picker label="Scale" selectedKey={scale} onSelectionChange={setScale}>
            <Item key="medium">Medium (desktop)</Item>
            <Item key="large">Large (mobile)</Item>
          </Picker>
        </Flex>
        <Provider scale={scale}>
          <Flex>
            {children}
          </Flex>
        </Provider>
      </Flex>
    </Example>
  );
}
