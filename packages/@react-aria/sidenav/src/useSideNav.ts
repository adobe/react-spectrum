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

import {AriaSideNavProps} from '@react-types/sidenav';
import {filterDOMProps, mergeProps, useId} from '@react-aria/utils';
import {HTMLAttributes, RefObject} from 'react';
import {ListLayout} from '@react-stately/collections';
import {TreeState} from '@react-stately/tree';
import {useSelectableCollection} from '@react-aria/selection';

interface SideNavAriaOptions<T> extends AriaSideNavProps<T> {
  layout?: ListLayout<T>
}

interface SideNavAria {
  navProps: HTMLAttributes<HTMLDivElement>,
  listProps: HTMLAttributes<HTMLUListElement>
}

export function useSideNav<T>(props: SideNavAriaOptions<T>, state: TreeState<T>, ref: RefObject<HTMLElement>): SideNavAria {
  let {
    id,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabeldBy,
    shouldFocusWrap,
    layout
  } = props;

  id = useId(id);

  let {collectionProps} = useSelectableCollection({
    ref,
    selectionManager: state.selectionManager,
    keyboardDelegate: layout,
    shouldFocusWrap
  });

  let domProps = filterDOMProps(props, {labelable: true});

  return {
    navProps: mergeProps(domProps, {
      role: 'navigation',
      id
    }),
    listProps: {
      'aria-labelledby': ariaLabeldBy || (ariaLabel ? id : null),
      role: 'list',
      ...collectionProps
    }
  };
}
