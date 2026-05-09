/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {Meta, StoryFn} from '@storybook/react';
import React from 'react';
import './styles.css';
import {TokenField, type TokenFieldSegment} from '../src/TokenField';

export default {
  title: 'React Aria Components/TokenField',
  component: TokenField
} as Meta<typeof TokenField>;

export type TokenFieldStory = StoryFn<typeof TokenField>;

const sample: TokenFieldSegment[] = [
  {type: 'token', text: 'Hello'},
  {type: 'token', text: 'World'},
  {type: 'text', text: ' tokens testing'}
];

const mentionTokenRegex = /(?<=\s|^)@\S+(?=\s)/g;

export const TokenFieldExample: TokenFieldStory = () => {
  return <TokenField defaultValue={sample} aria-label="Message" tokenRegex={mentionTokenRegex} />;
};
