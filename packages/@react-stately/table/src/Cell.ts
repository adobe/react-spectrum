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

import {CellProps} from '@react-types/table';
import {JSX, ReactElement} from 'react';
import {PartialNode} from '@react-stately/collections';

function Cell(props: CellProps): ReactElement { // eslint-disable-line @typescript-eslint/no-unused-vars
  return null;
}

Cell.getCollectionNode = function* getCollectionNode<T>(props: CellProps): Generator<PartialNode<T>> {
  let {children} = props;

  let textValue = props.textValue || (typeof children === 'string' ? children : '') || props['aria-label'] || '';
  yield {
    type: 'cell',
    props: props,
    rendered: children,
    textValue,
    'aria-label': props['aria-label'],
    hasChildNodes: false
  };
};

/**
 * A Cell represents the value of a single Column within a Table Row.
 */
// We don't want getCollectionNode to show up in the type definition
let _Cell = Cell as (props: CellProps) => JSX.Element;
export {_Cell as Cell};
