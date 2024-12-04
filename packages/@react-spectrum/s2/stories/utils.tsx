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


import {ReactNode, useState} from 'react';
import {style} from '../style' with {type: 'macro'};

type StaticColor = 'black' | 'white' | 'auto' | undefined;

function getBackgroundColor(staticColor: StaticColor) {
  if (staticColor === 'black') {
    return 'linear-gradient(to right,#ddd6fe,#fbcfe8)';
  } else if (staticColor === 'white') {
    return 'linear-gradient(to right,#0f172a,#334155)';
  }
  return undefined;
}

export function StaticColorProvider(props: {children: ReactNode, staticColor?: StaticColor}) {
  let [autoBg, setAutoBg] = useState('#5131c4');
  return (
    <>
      <div
        style={{
          padding: 8,
          // @ts-ignore
          '--s2-container-bg': props.staticColor === 'auto' ? autoBg : undefined,
          background: props.staticColor === 'auto' ? autoBg : getBackgroundColor(props.staticColor)
        }}>
        {props.children}
      </div>
      {props.staticColor === 'auto' && (
        <label 
          className={style({
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginTop: 16,
            font: 'ui'
          })}>
          Background:
          <input
            type="color"
            value={autoBg}
            onChange={e => setAutoBg(e.target.value)} />
        </label>
      )}
    </>
  );
}

export const StaticColorDecorator = (Story: any, {args}: any) => (
  <StaticColorProvider staticColor={args.staticColor}>
    <Story />
  </StaticColorProvider>
);

export function categorizeArgTypes(category: string, args: string[]): any {
  return args.reduce((acc: {[key: string]: any}, key) => {
    acc[key] = {table: {category}};
    return acc;
  }, {});
}
