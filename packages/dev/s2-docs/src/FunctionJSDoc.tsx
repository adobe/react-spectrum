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

import {Code} from './Code';
import React from 'react';
import {renderHTMLfromMarkdown} from './types';
import {standaloneCode} from './CodeBlock';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};

interface FunctionJSDocProps {
  function: {
    description?: string | null;
    examples?: string[];
  };
}

export function FunctionJSDoc({function: func}: FunctionJSDocProps) {
  let examples = Array.isArray(func.examples) ? func.examples.filter(Boolean) : [];

  return (
    <div className={style({marginBottom: 16})}>
      <span className={style({font: 'body-lg'})}>
        {renderHTMLfromMarkdown(func.description, {forceInline: false, forceBlock: true})}
      </span>
      {examples.map((example, index) => {
        return (
          <div key={index} className={style({marginTop: 12})}>
            {examples.length > 1 && (
              <strong className={style({font: 'title-sm'})}>Example {index + 1}:</strong>
            )}
            <pre className={standaloneCode}>
              <Code lang="tsx">{example.trim()}</Code>
            </pre>
          </div>
        );
      })}
    </div>
  );
}
