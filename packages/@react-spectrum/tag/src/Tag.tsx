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

import Alert from '@spectrum-icons/workflow/Alert';
import {classNames, filterDOMProps, useSlotProps, useStyleProps} from '@react-spectrum/utils';
import {ClearButton} from '@react-spectrum/button';
import {FocusRing} from '@react-aria/focus';
import React from 'react';
import {SpectrumTagProps} from '@react-types/tag';
import styles from '@adobe/spectrum-css-temp/components/tags/vars.css';
import {useTag} from '@react-aria/tag';
import {useTagGroupProvider} from './TagGroup';

export const Tag = ((props: SpectrumTagProps) => {
  props = useSlotProps(props);
  const {
    isDisabled,
    isRemovable,
    validationState,
    ...otherProps
  } = props;
  let {styleProps} = useStyleProps(otherProps);
  const {
    isDisabled: isGroupDisabled,
    isRemovable: isGroupRemovable,
    validationState: groupValidationState,
    onRemove,
    role
  } =  useTagGroupProvider();

  let removable = isGroupRemovable !== undefined ? isGroupRemovable : isRemovable;
  let disabled = isGroupDisabled !== undefined ? isGroupDisabled : isDisabled;
  let isInvalid = (validationState !== undefined ? validationState : groupValidationState) === 'invalid';
  let {clearButtonProps, labelProps, tagProps} = useTag({
    ...props,
    isRemovable: removable,
    isDisabled: disabled,
    validationState: validationState !== undefined ? validationState : groupValidationState,
    onRemove: props.onRemove || onRemove,
    role
  });
  let {role: buttonRole, ...otherButtonProps} = clearButtonProps;
  let icon = props.icon || (isInvalid && <Alert />);

  return (
    <FocusRing focusRingClass={classNames(styles, 'focus-ring')}>
      <div
        {...filterDOMProps(otherProps)}
        {...styleProps}
        {...tagProps}
        className={classNames(
          styles,
          'spectrum-Tags-item',
          {
            'is-disabled': disabled,
            // 'is-selected': isSelected,
            'spectrum-Tags-item--removable': removable,
            'is-invalid': isInvalid
          },
          styleProps.className
        )}>
        {icon && React.cloneElement(icon, {size: 'S', UNSAFE_className: classNames(styles, 'spectrum-Tags-itemIcon')})}
        <span
          {...labelProps}
          className={classNames(styles, 'spectrum-Tags-itemLabel')}>
          {props.children}
        </span>
        {removable &&
          <span role={buttonRole}>
            <ClearButton
              tabIndex={tagProps.tabIndex}
              focusClassName={classNames(styles, 'is-focused')}
              UNSAFE_className={classNames(styles, 'spectrum-Tags-itemClearButton')}
              {...otherButtonProps} />
          </span>
        }
      </div>
    </FocusRing>
  );
});
