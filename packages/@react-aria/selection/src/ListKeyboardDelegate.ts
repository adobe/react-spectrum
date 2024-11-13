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

import {Collection, Direction, DisabledBehavior, Key, KeyboardDelegate, LayoutDelegate, Node, Orientation, Rect, RefObject} from '@react-types/shared';
import {DOMLayoutDelegate} from './DOMLayoutDelegate';
import {isScrollable} from '@react-aria/utils';

interface ListKeyboardDelegateOptions<T> {
  collection: Collection<Node<T>>,
  ref: RefObject<HTMLElement | null>,
  collator?: Intl.Collator,
  layout?: 'stack' | 'grid',
  orientation?: Orientation,
  direction?: Direction,
  disabledKeys?: Set<Key>,
  disabledBehavior?: DisabledBehavior,
  layoutDelegate?: LayoutDelegate
}

export class ListKeyboardDelegate<T> implements KeyboardDelegate {
  private collection: Collection<Node<T>>;
  private disabledKeys: Set<Key>;
  private disabledBehavior: DisabledBehavior;
  private ref: RefObject<HTMLElement | null>;
  private collator: Intl.Collator | undefined;
  private layout: 'stack' | 'grid';
  private orientation?: Orientation;
  private direction?: Direction;
  private layoutDelegate: LayoutDelegate;

  constructor(collection: Collection<Node<T>>, disabledKeys: Set<Key>, ref: RefObject<HTMLElement | null>, collator?: Intl.Collator);
  constructor(options: ListKeyboardDelegateOptions<T>);
  constructor(...args: any[]) {
    if (args.length === 1) {
      let opts = args[0] as ListKeyboardDelegateOptions<T>;
      this.collection = opts.collection;
      this.ref = opts.ref;
      this.collator = opts.collator;
      this.disabledKeys = opts.disabledKeys || new Set();
      this.disabledBehavior = opts.disabledBehavior || 'all';
      this.orientation = opts.orientation || 'vertical';
      this.direction = opts.direction;
      this.layout = opts.layout || 'stack';
      this.layoutDelegate = opts.layoutDelegate || new DOMLayoutDelegate(opts.ref);
    } else {
      this.collection = args[0];
      this.disabledKeys = args[1];
      this.ref = args[2];
      this.collator = args[3];
      this.layout = 'stack';
      this.orientation = 'vertical';
      this.disabledBehavior = 'all';
      this.layoutDelegate = new DOMLayoutDelegate(this.ref);
    }

    // If this is a vertical stack, remove the left/right methods completely
    // so they aren't called by useDroppableCollection.
    if (this.layout === 'stack' && this.orientation === 'vertical') {
      this.getKeyLeftOf = undefined;
      this.getKeyRightOf = undefined;
    }
  }

  private isDisabled(item: Node<unknown>) {
    return this.disabledBehavior === 'all' && (item.props?.isDisabled || this.disabledKeys.has(item.key));
  }

  private findNextNonDisabled(key: Key, getNext: (key: Key) => Key | null): Key | null {
    while (key != null) {
      let item = this.collection.getItem(key);
      if (item?.type === 'item' && !this.isDisabled(item)) {
        return key;
      }

      key = getNext(key);
    }

    return null;
  }

  getNextKey(key: Key) {
    key = this.collection.getKeyAfter(key);
    return this.findNextNonDisabled(key, key => this.collection.getKeyAfter(key));
  }

  getPreviousKey(key: Key) {
    key = this.collection.getKeyBefore(key);
    return this.findNextNonDisabled(key, key => this.collection.getKeyBefore(key));
  }

  private findKey(
    key: Key,
    nextKey: (key: Key) => Key,
    shouldSkip: (prevRect: Rect, itemRect: Rect) => boolean
  ) {
    let itemRect = this.layoutDelegate.getItemRect(key);
    if (!itemRect) {
      return null;
    }

    // Find the item above or below in the same column.
    let prevRect = itemRect;
    do {
      key = nextKey(key);
      itemRect = this.layoutDelegate.getItemRect(key);
    } while (itemRect && shouldSkip(prevRect, itemRect));

    return key;
  }

  private isSameRow(prevRect: Rect, itemRect: Rect) {
    return prevRect.y === itemRect.y || prevRect.x !== itemRect.x;
  }

  private isSameColumn(prevRect: Rect, itemRect: Rect) {
    return prevRect.x === itemRect.x || prevRect.y !== itemRect.y;
  }

  getKeyBelow(key: Key) {
    if (this.layout === 'grid' && this.orientation === 'vertical') {
      return this.findKey(key, (key) => this.getNextKey(key), this.isSameRow);
    } else {
      return this.getNextKey(key);
    }
  }

  getKeyAbove(key: Key) {
    if (this.layout === 'grid' && this.orientation === 'vertical') {
      return this.findKey(key, (key) => this.getPreviousKey(key), this.isSameRow);
    } else {
      return this.getPreviousKey(key);
    }
  }

  private getNextColumn(key: Key, right: boolean) {
    return right ? this.getPreviousKey(key) : this.getNextKey(key);
  }

  getKeyRightOf(key: Key) {
    // This is a temporary solution for CardView until we refactor useSelectableCollection.
    // https://github.com/orgs/adobe/projects/19/views/32?pane=issue&itemId=77825042
    let layoutDelegateMethod = this.direction === 'ltr' ? 'getKeyRightOf' : 'getKeyLeftOf';
    if (this.layoutDelegate[layoutDelegateMethod]) {
      key = this.layoutDelegate[layoutDelegateMethod](key);
      return this.findNextNonDisabled(key, key => this.layoutDelegate[layoutDelegateMethod](key));
    }

    if (this.layout === 'grid') {
      if (this.orientation === 'vertical') {
        return this.getNextColumn(key, this.direction === 'rtl');
      } else {
        return this.findKey(key, (key) => this.getNextColumn(key, this.direction === 'rtl'), this.isSameColumn);
      }
    } else if (this.orientation === 'horizontal') {
      return this.getNextColumn(key, this.direction === 'rtl');
    }

    return null;
  }

  getKeyLeftOf(key: Key) {
    let layoutDelegateMethod = this.direction === 'ltr' ? 'getKeyLeftOf' : 'getKeyRightOf';
    if (this.layoutDelegate[layoutDelegateMethod]) {
      key = this.layoutDelegate[layoutDelegateMethod](key);
      return this.findNextNonDisabled(key, key => this.layoutDelegate[layoutDelegateMethod](key));
    }

    if (this.layout === 'grid') {
      if (this.orientation === 'vertical') {
        return this.getNextColumn(key, this.direction === 'ltr');
      } else {
        return this.findKey(key, (key) => this.getNextColumn(key, this.direction === 'ltr'), this.isSameColumn);
      }
    } else if (this.orientation === 'horizontal') {
      return this.getNextColumn(key, this.direction === 'ltr');
    }

    return null;
  }

  getFirstKey() {
    let key = this.collection.getFirstKey();
    return this.findNextNonDisabled(key, key => this.collection.getKeyAfter(key));
  }

  getLastKey() {
    let key = this.collection.getLastKey();
    return this.findNextNonDisabled(key, key => this.collection.getKeyBefore(key));
  }

  getKeyPageAbove(key: Key) {
    let menu = this.ref.current;
    let itemRect = this.layoutDelegate.getItemRect(key);
    if (!itemRect) {
      return null;
    }

    if (!isScrollable(menu)) {
      return this.getFirstKey();
    }

    if (this.orientation === 'horizontal') {
      let pageX = Math.max(0, itemRect.x + itemRect.width - this.layoutDelegate.getVisibleRect().width);

      while (itemRect && itemRect.x > pageX) {
        key = this.getKeyAbove(key);
        itemRect = key == null ? null : this.layoutDelegate.getItemRect(key);
      }
    } else {
      let pageY = Math.max(0, itemRect.y + itemRect.height - this.layoutDelegate.getVisibleRect().height);

      while (itemRect && itemRect.y > pageY) {
        key = this.getKeyAbove(key);
        itemRect = key == null ? null : this.layoutDelegate.getItemRect(key);
      }
    }

    return key ?? this.getFirstKey();
  }

  getKeyPageBelow(key: Key) {
    let menu = this.ref.current;
    let itemRect = this.layoutDelegate.getItemRect(key);
    if (!itemRect) {
      return null;
    }

    if (!isScrollable(menu)) {
      return this.getLastKey();
    }

    if (this.orientation === 'horizontal') {
      let pageX = Math.min(this.layoutDelegate.getContentSize().width, itemRect.y - itemRect.width + this.layoutDelegate.getVisibleRect().width);

      while (itemRect && itemRect.x < pageX) {
        key = this.getKeyBelow(key);
        itemRect = key == null ? null : this.layoutDelegate.getItemRect(key);
      }
    } else {
      let pageY = Math.min(this.layoutDelegate.getContentSize().height, itemRect.y - itemRect.height + this.layoutDelegate.getVisibleRect().height);

      while (itemRect && itemRect.y < pageY) {
        key = this.getKeyBelow(key);
        itemRect = key == null ? null : this.layoutDelegate.getItemRect(key);
      }
    }

    return key ?? this.getLastKey();
  }

  getKeyForSearch(search: string, fromKey?: Key) {
    if (!this.collator) {
      return null;
    }

    let collection = this.collection;
    let key = fromKey || this.getFirstKey();
    while (key != null) {
      let item = collection.getItem(key);
      let substring = item.textValue.slice(0, search.length);
      if (item.textValue && this.collator.compare(substring, search) === 0) {
        return key;
      }

      key = this.getNextKey(key);
    }

    return null;
  }
}
