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

import {AllHTMLAttributes} from 'react';
import {CollectionBase, DOMProps, Expandable, MultipleSelection} from '@react-types/shared';
import {ListLayout} from '@react-stately/collections';
import {SideNavProps} from '@react-types/sidenav';
import {TreeState} from '@react-stately/tree';
import {useId} from '@react-aria/utils';
import {useSelectableCollection} from '@react-aria/selection';

interface SideNavAria {
  navProps: AllHTMLAttributes<HTMLDivElement>,
  listProps: AllHTMLAttributes<HTMLUListElement>
}

export function useSideNav<T>(props: SideNavProps<T>, state: TreeState<T>, layout: ListLayout<T>): SideNavAria {
  let {
    id,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabeldBy,
    wrapAround
  } = props;

  id = useId(id);

  let {collectionProps} = useSelectableCollection({
    selectionManager: state.selectionManager,
    keyboardDelegate: layout,
    wrapAround
  });

  return {
    navProps: {
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabeldBy,
      role: 'navigation',
      id
    },
    listProps: {
      'aria-labelledby': ariaLabeldBy || (ariaLabel ? id : null),
      role: 'list',
      ...collectionProps
    }
  };
}
