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

import {DOMRef} from '@react-types/shared';
import {ListBoxBase, useListBoxLayout} from './ListBoxBase';
import React, {ReactElement} from 'react';
import {SpectrumMenuProps} from '@react-types/menu';
import {useDOMRef} from '@react-spectrum/utils';
import {useListState} from '@react-stately/list';

function ListBox<T>(props: SpectrumMenuProps<T>, ref: DOMRef<HTMLDivElement>) {
  let state = useListState({
    ...props,
    selectionMode: props.selectionMode || 'single'
  });
  let layout = useListBoxLayout(state);
  let domRef = useDOMRef(ref);

  return (
    <ListBoxBase
      {...props}
      ref={domRef}
      state={state}
      layout={layout} />
  );
}

// forwardRef doesn't support generic parameters, so cast the result to the correct type
// https://stackoverflow.com/questions/58469229/react-with-typescript-generics-while-using-react-forwardref
const _ListBox = React.forwardRef(ListBox) as <T>(props: SpectrumMenuProps<T> & {ref?: DOMRef<HTMLDivElement>}) => ReactElement;
export {_ListBox as ListBox};
