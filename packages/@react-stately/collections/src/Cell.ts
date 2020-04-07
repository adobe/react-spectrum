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

import {CellProps} from '@react-types/shared';
import {PartialNode} from './types';
import {ReactElement} from 'react';

function Cell(props: CellProps): ReactElement { // eslint-disable-line @typescript-eslint/no-unused-vars
  return null;
}

Cell.getCollectionNode = function<T> (props: CellProps): PartialNode<T> {
  let {children} = props;

  let textValue = props.textValue || (typeof children === 'string' ? children : '') || props['aria-label'] || '';
  if (!textValue) {
    console.warn('<Cell> with non-plain text contents is unsupported by type to select for accessibility. Please add a `textValue` prop.');
  }

  return {
    type: 'cell',
    props: props,
    rendered: children,
    textValue,
    'aria-label': props['aria-label'],
    hasChildNodes: false
  };
};

// We don't want getCollectionNode to show up in the type definition
let _Cell = Cell as <T>(props: CellProps) => JSX.Element;
export {_Cell as Cell};
