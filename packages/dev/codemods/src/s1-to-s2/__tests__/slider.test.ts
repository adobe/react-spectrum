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

// @ts-ignore
import {defineSnapshotTest} from 'jscodeshift/dist/testUtils';
import transform from '../src/codemods/codemod';

const test = (name: string, input: string) => {
  defineSnapshotTest(transform, {}, input, name);
};

test('Removes isFilled', `
import {Slider} from '@adobe/react-spectrum';

<Slider label="Cookies to buy" defaultValue={12} isFilled />
`);

test('Removes trackGradient', `
import {Slider} from '@adobe/react-spectrum';

<Slider label="Cookies to buy" defaultValue={12} trackGradient={['white', 'rgba(177,141,32,1)']} />
`);

test('Removes showValueLabel', `
import {Slider} from '@adobe/react-spectrum';

<Slider label="Cookies to buy" defaultValue={12} showValueLabel={false} />
`);

test('Comments out getValueLabel', `
import {Slider} from '@adobe/react-spectrum';

<Slider label="Cookies to buy" defaultValue={12} getValueLabel={cookies => "60 total cookies"}  />
`);

test('Comments out orientation', `
import {Slider} from '@adobe/react-spectrum';

<Slider label="Cookies to buy" defaultValue={12} orientation="vertical" />
`);
