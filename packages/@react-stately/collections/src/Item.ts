import {ItemElement, ItemProps} from '@react-types/shared';
import {PartialNode} from './types';
import React, {ReactElement} from 'react';

export function Item<T>(props: ItemProps<T>): ReactElement { // eslint-disable-line @typescript-eslint/no-unused-vars
  return null;
}

Item.getCollectionNode = function<T> (props: ItemProps<T>): PartialNode<T> {
  let {childItems, title, children} = props;

  let rendered = props.title || props.children;
  let textValue = props.textValue || (typeof rendered === 'string' ? rendered : '');
  if (!textValue) {
    console.warn('<Item> with non-plain text contents is unsupported by type to select for accessibility. Please add a `textValue` prop.');
  }

  return {
    type: 'item',
    rendered,
    textValue,
    hasChildNodes: hasChildItems(props),
    *childNodes() {
      if (childItems) {
        for (let child of childItems) {
          yield {
            type: 'item',
            value: child
          };
        }
      } else if (title) {
        let items = React.Children.toArray(children) as ItemElement<T>[];
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

function hasChildItems<T>(props: ItemProps<T>) {
  if (props.hasChildItems != null) {
    return props.hasChildItems;
  }

  if (props.childItems) {
    return true;
  }

  if (props.title && React.Children.count(props.children) > 0) {
    return true;
  }

  return false;
}
