/*
 * Copyright 2025 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {styles as codeStyles} from './Code';
import {Indent, JoinList, setLinks, Type, TypeParameters} from './types';
import {mergeStyles} from '../../../@react-spectrum/s2/style/runtime';
import React from 'react';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};

const block = style({display: 'block', marginBottom: 8});

export function FunctionAPI({function: func, links}) {
  let {name, parameters, return: returnType, typeParameters} = func;
  if (links) {
    setLinks(links);
  }
  return (
    <code className={mergeStyles(codeStyles.function, block)}>
      <span className={codeStyles.attribute}>{name}</span>
      <TypeParameters typeParameters={typeParameters} />
      <Indent params={parameters} open="(" close=")">
        <JoinList elements={parameters} joiner=", " />
      </Indent>
      <span className={codeStyles.string}>{': '}</span>
      <Type type={returnType} />
    </code>
  );
}
