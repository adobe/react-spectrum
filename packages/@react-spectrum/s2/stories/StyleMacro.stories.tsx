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

import {Link} from '../src';
import React from 'react';
import {style} from '../style' with {type: 'macro'};

export default {
  title: 'Style Macro',
  parameters: {
    docs: {disable: true}
  }
};

export function Example() {
  return (
    <div className={style({backgroundColor: 'orange-500', color: 'black', font: 'body', paddingX: 8, paddingY: 4, borderRadius: 'lg'})}>
      Test
    </div>
  );
}

export function Well() {
  return (
    <div
      className={style({
        display: 'block',
        textAlign: 'start',
        minWidth: 160,
        padding: 16,
        marginTop: 4,
        borderWidth: 1,
        borderRadius: 'sm',
        backgroundColor: 'layer-1',
        borderStyle: 'solid',
        borderColor: 'transparent-black-75',
        font: 'body-sm'
      })}>
      S2 style macro equivalent to v3 <Link href="https://react-spectrum.adobe.com/react-spectrum/Well.html" target="_blank">Well</Link>.
    </div>
  );
}
