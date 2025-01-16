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

import {CSSProperties, ReactNode} from 'react';
import {mergeStyles} from '../style/runtime';
import {raw} from '../style/style-macro' with {type: 'macro'};
import {style} from '../style' with {type: 'macro'};
import {StyleString} from '../style/types';

interface CenterBaselineProps {
  style?: CSSProperties,
  styles?: StyleString,
  children: ReactNode,
  slot?: string
}

const styles = style({
  display: 'flex',
  alignItems: 'center'
});

export function CenterBaseline(props: CenterBaselineProps) {
  return (
    <div
      slot={props.slot}
      style={props.style}
      className={mergeStyles(styles, props.styles) + ' ' + centerBaselineBefore}>
      {props.children}
    </div>
  );
}

export const centerBaselineBefore = raw('&::before { content: "\u00a0"; width: 0; visibility: hidden }');

export function centerBaseline(props: Omit<CenterBaselineProps, 'children'> = {}): (icon: ReactNode) => ReactNode {
  return (icon: ReactNode) => <CenterBaseline {...props}>{icon}</CenterBaseline>;
}
