import Alert from '@spectrum-icons/workflow/Alert';
import {classNames, filterDOMProps} from '@react-spectrum/utils';
import {ClearButton} from '@react-spectrum/button';
import {DOMProps} from '@react-types/shared';
import {FocusRing} from '@react-aria/focus';
import React from 'react';
import {StyleProps, useStyleProps} from '@react-spectrum/view';
import styles from '@adobe/spectrum-css-temp/components/tags/vars.css';
import {TagProps} from '@react-types/tag';
import {useTag} from '@react-aria/tag';
import {useTagGroupProvider} from './TagGroup';

interface SpectrumTagProps extends TagProps, DOMProps, StyleProps {}

export const Tag = ((props: SpectrumTagProps) => {
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
        {icon && React.cloneElement(icon, {size: 'S', className: classNames(styles, 'spectrum-Tags-itemIcon')})}
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
