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

import React from 'react';
import typographyStyles from '@adobe/spectrum-css-temp/components/typography/vars.css';
import {TypeContext, TypeParameters, JoinList, Type} from './types';
import {getUsedLinks} from './utils';

export function FunctionAPI({function: func, links}) {
  let {name, parameters, return: returnType, typeParameters} = func;

  let usedLinks = getUsedLinks(func, links);

  return (
    <TypeContext.Provider value={links}>
      <code className={`${typographyStyles['spectrum-Code4']}`}>
        <span className="token hljs-function">{name}</span>
        <TypeParameters typeParameters={typeParameters} />
        <span className="token punctuation">{parameters.length > 2 ? '(\n  ' : '('}</span>
        <JoinList elements={parameters} joiner={parameters.length > 2 ? ',\n  ' : ', '} />
        <span className="token punctuation">{parameters.length > 2 ? '\n)' : ')'}</span>
        <span className="token punctuation">{': '}</span>
        <Type type={returnType} />
      </code>
      {Object.values(usedLinks).map(link => (
        <section id={link.id} data-title={link.name} hidden>
          <Type type={link} />
        </section>
      ))}
    </TypeContext.Provider>
  );
}
