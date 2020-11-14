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

import {Collection, Node} from '@react-types/shared';
import {DropTarget} from './types';
import {HTMLAttributes, Key, RefObject, useEffect} from 'react';
import {useDroppableItem} from './useDroppableItem';
import {useVisuallyHidden} from '@react-aria/visually-hidden';

interface InsertionIndicatorProps {
  collection: Collection<Node<unknown>>,
  target: DropTarget,
  isActive: boolean
}

interface InsertionIndicatorAria {
  insertionIndicatorProps: HTMLAttributes<HTMLElement>
}

export function useInsertionIndicator(props: InsertionIndicatorProps, ref: RefObject<HTMLElement>): InsertionIndicatorAria {
  let {collection, target, isActive} = props;

  useEffect(() => {
    if (isActive) {
      ref.current.focus();
    }
  }, [isActive, ref]);

  let {dropProps} = useDroppableItem();

  let before = target.dropPosition === 'before'
    ? collection.getKeyBefore(target.key)
    : target.key;
  let after = target.dropPosition === 'after'
    ? collection.getKeyAfter(target.key)
    : target.key;

  let getText = (key: Key) => collection.getItem(key)?.textValue;
  let label = '';
  if (before && after) {
    label = `Insert between ${getText(before)} and ${getText(after)}`;
  } else if (before) {
    label = `Insert after ${getText(before)}`;
  } else if (after) {
    label = `Insert before ${getText(after)}`;
  }

  let {visuallyHiddenProps} = useVisuallyHidden();
  if (isActive) {
    visuallyHiddenProps = {};
  }

  return {
    insertionIndicatorProps: {
      ...dropProps,
      ...visuallyHiddenProps,
      'aria-roledescription': 'insertion indicator',
      'aria-label': label,
      tabIndex: -1
    }
  };
}
