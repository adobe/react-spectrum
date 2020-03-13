import {PartialNode} from './types';
import React, {ReactElement} from 'react';
import {SectionProps} from '@react-types/shared';

export function Section<T>(props: SectionProps<T>): ReactElement { // eslint-disable-line @typescript-eslint/no-unused-vars
  return null;
}

Section.getCollectionNode = function<T> (props: SectionProps<T>): PartialNode<T> {
  let {children, title, items} = props;
  return {
    type: 'section',
    hasChildNodes: true,
    rendered: title,
    *childNodes() {
      if (typeof children === 'function') {
        if (!items) {
          throw new Error('props.children was a function but props.items is missing');
        }
    
        for (let item of items) {
          yield {
            type: 'item',
            value: item,
            renderer: children
          };
        }
      } else {
        let items = React.Children.toArray(children);
        for (let item of items) {
          yield {
            type: 'item',
            element: item
          };
        }
      }
    }
  };
};
