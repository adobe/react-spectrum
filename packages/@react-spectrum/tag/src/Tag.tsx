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
import {SpectrumTagProps} from '@react-types/tag';
import styles from '@adobe/spectrum-css-temp/components/tags/vars.css';
import {Text} from '@react-spectrum/text';
import {useFocusRing} from '@react-aria/focus';
import {useHover} from '@react-aria/interactions';
import {useTag} from '@react-aria/tag';

export function Tag<T>(props: SpectrumTagProps<T>) {
  const {
    isDisabled,
    isRemovable,
    item,
    state,
    onRemove,
    ...otherProps
  } = props;
  let {hoverProps, isHovered} = useHover({isDisabled});
  let {isFocusVisible, focusProps} = useFocusRing({within: true});
  let tagRef = useRef();
  let labelRef = useRef();
  let {clearButtonProps, labelProps, tagProps} = useTag({
    ...props,
    isRemovable,
    isDisabled,
    item,
    onRemove,
    tagRef,
    labelRef
  }, state);

  return (
    <div
      {...mergeProps(tagProps, hoverProps, focusProps, otherProps)}
      role={tagProps.role}
      className={classNames(
        styles,
        'spectrum-Tags-item',
        {
          'is-disabled': isDisabled,
          'focus-ring': isFocusVisible,
          'is-focused': isFocusVisible,
          'not-removable': !isRemovable,
          'is-hovered': isHovered
        }
      )}>
      <SlotProvider
        slots={{
          tagLabel: {UNSAFE_className: classNames(styles, 'spectrum-Tag-label')}
        }}>
        <TagLabel {...mergeProps(props, labelProps)} isRemovable={isRemovable} />
        {isRemovable && <TagRemoveButton item={item} {...clearButtonProps} UNSAFE_className={classNames(styles, 'spectrum-Tag-action')} />}
      </SlotProvider>
    </div>
  );
}

function TagLabel(props) {
  let {role, children, isRemovable} = props;
  props = useSlotProps(props, 'tagLabel');
  let {styleProps} = useStyleProps(props);
  let labelRef = useRef();

  return (
    <span
      {...styleProps}
      role="rowheader"
      ref={labelRef}
      className={classNames(styles, 'spectrum-Tags-labelItem')}>
      <SlotProvider
        slots={{
          icon: {UNSAFE_className: classNames(styles, 'spectrum-Tag-icon'), size: 'XS'},
          text: {UNSAFE_className: classNames(styles, 'spectrum-Tag-content', {'tags-removable': isRemovable})}
        }}>
        {typeof children === 'string' ? <span role={role}><Text>{children}</Text></span> : children}
      </SlotProvider>
    </span>
  );
}

function TagRemoveButton(props) {
  let {role} = props;
  props = useSlotProps(props, 'tagRemoveButton');
  let {styleProps} = useStyleProps(props);
  let clearBtnRef = useRef();

  return (
    <span
      {...styleProps}
      role={role}
      ref={clearBtnRef}>
      <ClearButton
        preventFocus
        {...props} />
    </span>
  );
}
