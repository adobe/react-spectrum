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


import {CardBase} from './CardBase';
import {DOMRef} from '@react-types/shared';
import {PartialNode} from '@react-stately/collections';
import React from 'react';
import {SpectrumCardProps} from '@react-types/cards';
import {useCardViewContext} from './CardViewContext';

// TODO confirm that this is the approach we wanna take
// Problems with attaching a ref
function Card(props: SpectrumCardProps, ref: DOMRef<HTMLDivElement>) {
  let context = useCardViewContext();
  if (context !== null) {
    console.log('returning null')
    return null;
  } else {
    console.log('returning base')
    return (
      <CardBase {...props} />
    );
  }
}


// function Card<T>(props): ReactElement { // eslint-disable-line @typescript-eslint/no-unused-vars
//   return null;
// }

Card.getCollectionNode = function* getCollectionNode<T>(props, context: any): Generator<PartialNode<T>> {
  let {children} = props;

  yield {
    type: 'item',
    props: props,
    rendered: children,
    'aria-label': props['aria-label'],
    hasChildNodes: false
  };
};


// TODO: Ask about the below, if we export as forwardRef it breaks CollectionBuilder and if we export as is it breaks Rob's stories
// We don't want getCollectionNode to show up in the type definition
let _Card = Card as <T>(props, ref) => JSX.Element;
export {_Card as Card};

// /**
//  * TODO: Add description of component here.
//  */
//  const _Card = React.forwardRef(Card);
//  export {_Card as Card};
