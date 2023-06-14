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

import Add from '../Add';
import Alert from '@spectrum-icons/workflow/Alert';
import React from 'react';
import {Flex} from '@react-spectrum/layout';
import * as AllIcons from '../src';

let allIcons = Object.keys(AllIcons);
let alphabet = [...Array(26)].map((val, i) => String.fromCharCode(i + 65));
alphabet = ['_', ...alphabet];
let alphabetizedIcons = alphabet.reduce((acc, char) => {
  acc[char] = allIcons.filter((iconName) => iconName[0] === char).sort();
  return acc;
}, {});

export default {
  title: 'Icons/Workflow',
  parameters: {
    chromaticProvider: {express: false},
  }
};

export const IconAddWithSizes = () => renderIconSizes(Add, { 'aria-label': 'Add' });

IconAddWithSizes.story = {
  name: 'icon: Add with sizes',
};

export const Colors = () => (
  <Flex gap="size-200">
    <Alert aria-label="info default" />
    <Alert color="informative" aria-label="info alert" />
    <Alert color="negative" aria-label="negative alert" />
    <Alert color="positive" aria-label="positive alert" />
    <Alert color="notice" aria-label="notice alert" />
  </Flex>
);

export const AllWorkflow = () => (
  <Flex direction="column">
    {Object.keys(alphabetizedIcons).map((char) => (
      <div style={{ height: 'calc(12 * var(--spectrum-global-dimension-size-300))' }}>
        <div>{char}</div>
        <Flex direction="row" gap="size-50" wrap>
          {alphabetizedIcons[char].map((iconName) => {
            let Icon = AllIcons[iconName].default;
            return <Icon key={iconName} id={iconName} />;
          })}
        </Flex>
      </div>
    ))}
  </Flex>
);

AllWorkflow.story = {
  parameters: {
    chromaticProvider: {
      colorSchemes: ['light'],
      locales: ['en-US'],
      scales: ['medium', 'large'],
      disableAnimations: true,
    }
  }
};

function renderIconSizes(Component, props) {
  let sizes = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL'];
  return (
    <div>
      {sizes.map((size) => {
        return <Component margin="15px" size={size} {...props} />;
      })}
    </div>
  );
}
