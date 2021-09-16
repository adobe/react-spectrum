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

import {classNames, SlotProvider, useSlotProps, useStyleProps} from '@react-spectrum/utils';
import {ClearButton} from '@react-spectrum/button';
import {mergeProps} from '@react-aria/utils';
import React, {useRef} from 'react';
import styles from '@adobe/spectrum-css-temp/components/tags/vars.css';
import {Text} from '@react-spectrum/text';
import {useFocusRing} from '@react-aria/focus';
import {useGridCell} from '@react-aria/grid';
import {useHover} from '@react-aria/interactions';
import {useTag} from '@react-aria/tag';

export function Tag(props) {
  const {
    isDisabled,
    isRemovable,
    item,
    state,
    onRemove,
    ...otherProps
  } = props;
  let {styleProps} = useStyleProps(otherProps);
  let {hoverProps, isHovered} = useHover({isDisabled});
  let {isFocusVisible, focusProps} = useFocusRing({within: true});
  let {clearButtonProps, labelProps, tagProps} = useTag({
    ...props,
    isRemovable,
    isDisabled,
    item,
    onRemove
  }, state);

  return (
    <div
      {...styleProps}
      {...mergeProps(tagProps, hoverProps, focusProps, labelProps)}
      className={classNames(
        styles,
        'spectrum-Tags-item',
        {
          'is-disabled': isDisabled,
          'focus-ring': isFocusVisible,
          'is-focused': isFocusVisible,
          'spectrum-Tags-item--removable': isRemovable,
          'is-hovered': isHovered
        },
        styleProps.className
      )}>
      <SlotProvider
        slots={{
          icon: {UNSAFE_className: classNames(styles, 'react-spectrum-Tag-icon'), size: 'XS'},
          text: {UNSAFE_className: classNames(styles, 'react-spectrum-Tag-content')},
          tagRemoveButton: {UNSAFE_className: classNames(styles, 'react-spectrum-Tag-action')}
        }}>
        {typeof props.children === 'string' ? <Text>{props.children}</Text> : props.children}
        {isRemovable && <TagRemoveButton item={item} state={state} {...clearButtonProps} />}
      </SlotProvider>
    </div>
  );
}

function TagRemoveButton(props) {
  props = useSlotProps(props, 'tagRemoveButton');
  let {item, state, ...otherProps} = props;
  let {styleProps} = useStyleProps(otherProps);

  let clearBtnRef = useRef();
  let {gridCellProps} = useGridCell({
    node: item.childNodes[1],
    ref: clearBtnRef
  }, state);

  return (
    <span
      {...mergeProps(props, gridCellProps, styleProps)}
      ref={clearBtnRef}>
      <ClearButton
        focusClassName={classNames(styles, 'focus-ring')}
        UNSAFE_className={classNames(styles, 'spectrum-Tags-itemClearButton')}
        {...otherProps} />
    </span>
  );
}
