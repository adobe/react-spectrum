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

test('Removes showValueLabel', `
import {RangeSlider} from '@adobe/react-spectrum';

<RangeSlider label="Range" defaultValue={{ start: 12, end: 36 }} showValueLabel={false}  />
`);

test('Comments out getValueLabel', `
import {RangeSlider} from '@adobe/react-spectrum';

<RangeSlider label="Range" defaultValue={{ start: 12, end: 36 }} getValueLabel={cookies => "60 total cookies"}   />
`);

test('Comments out orientation', `
import {RangeSlider} from '@adobe/react-spectrum';

<RangeSlider label="Range" defaultValue={{ start: 12, end: 36 }} orientation="vertical"  />
`);
