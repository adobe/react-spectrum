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

import {classNames, useDOMRef, useStyleProps} from '@react-spectrum/utils';
import {DOMRef} from '@react-types/shared';
import {mergeProps} from '@react-aria/utils';
import React, {ReactElement} from 'react';
import {SpectrumTagGroupProps} from '@react-types/tag';
import styles from '@adobe/spectrum-css-temp/components/tags/vars.css';
import {Tag} from './Tag';
import {useProviderProps} from '@react-spectrum/provider';
import {useTagGroup} from '@react-aria/tag';
import {useTagGroupState} from '@react-stately/tag';

function TagGroup<T extends object>(props: SpectrumTagGroupProps<T>, ref: DOMRef<HTMLDivElement>) {
  props = useProviderProps(props);
  let {
    allowsRemoving,
    onRemove,
    ...otherProps
  } = props;
  let domRef = useDOMRef(ref);
  let {styleProps} = useStyleProps(otherProps);
  let state = useTagGroupState(props);
  let {tagGroupProps} = useTagGroup(props, state, domRef);
  return (
    <div
      {...mergeProps(styleProps, tagGroupProps)}
      className={
        classNames(
          styles,
          'spectrum-Tags',
          styleProps.className
        )
      }
      role={state.collection.size ? 'grid' : null}
      ref={domRef}>
      {[...state.collection].map(item => (
        <Tag
          {...item.props}
          key={item.key}
          item={item}
          state={state}
          allowsRemoving={allowsRemoving}
          onRemove={onRemove}>
          {item.rendered}
        </Tag>
      ))}
    </div>
  );
}

/** Tags allow users to categorize content. They can represent keywords or people, and are grouped to describe an item or a search request. */
const _TagGroup = React.forwardRef(TagGroup) as <T>(props: SpectrumTagGroupProps<T> & {ref?: DOMRef<HTMLDivElement>}) => ReactElement;
export {_TagGroup as TagGroup};
