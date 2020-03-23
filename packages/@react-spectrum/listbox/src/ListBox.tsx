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

import {ListBoxBase, useListBoxLayout} from './ListBoxBase';
import React from 'react';
import {SpectrumMenuProps} from '@react-types/menu';
import {useListState} from '@react-stately/list';

export function ListBox<T>(props: SpectrumMenuProps<T>) {
  let state = useListState({
    ...props,
    selectionMode: props.selectionMode || 'single'
  });
  let layout = useListBoxLayout(state);

  return (
    <ListBoxBase
      {...props}
      state={state}
      layout={layout} />
  );
}
