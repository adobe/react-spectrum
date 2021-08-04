/*
 * Copyright 2021 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import React, {ReactElement} from 'react';
import {PartialNode} from '@react-stately/collections';

function Card<T>(props): ReactElement { // eslint-disable-line @typescript-eslint/no-unused-vars
  return null;
}

Card.getCollectionNode = function* getCollectionNode<T>(props, context: any): Generator<PartialNode<T>> {
  let {children} = props;

  yield {
    // TODO readd this? Or actually we might just want type to be 'item' here
    // type: 'card',
    type: 'item',
    props: props,
    rendered: children,
    'aria-label': props['aria-label'],
    hasChildNodes: false
  };
};

// We don't want getCollectionNode to show up in the type definition
let _Card = Card as <T>(props) => JSX.Element;
export {_Card as Card};
