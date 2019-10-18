import Alert from '@spectrum-icons/workflow/Alert';
import {classNames, filterDOMProps} from '@react-spectrum/utils';
import {ClearButton} from '@react-spectrum/button';
import {FocusRing} from '@react-aria/focus';
import React from 'react';
import styles from '@adobe/spectrum-css-temp/components/tags/vars.css';
import {TagProps} from '@react-types/tag';
import {useTag} from '@react-aria/tag';
import {useTagGroupProvider} from './TagGroup';

export const Tag = ((props: TagProps) => {
  const {
    className,
    isDisabled,
    isRemovable,
    validationState,
    ...otherProps
  } = props;
  const {
    isDisabled: isGroupDisabled,
    isRemovable: isGroupRemovable,
    validationState: groupValidationState,
    onRemove,
    role
  } =  useTagGroupProvider();

  let removable = isRemovable || isGroupRemovable;
  let disabled = isDisabled || isGroupDisabled;
  let isInvalid = (validationState || groupValidationState) === 'invalid';
  let {clearButtonProps, tagProps} = useTag({
    ...props,
    isRemovable: removable,
    isDisabled: disabled,
    onRemove: props.onRemove || onRemove,
    role
  });
  let icon = props.icon || (isInvalid && <Alert />);

  // TODO: add avatar component
  return (
    <FocusRing focusRingClass={classNames(styles, 'focus-ring')}>
      <div
        {...filterDOMProps(otherProps)}
        {...tagProps}
        className={classNames(
          styles,
          'spectrum-Tags-item',
          {
            'is-disabled': disabled,
            'spectrum-Tags-item--deletable': removable,
            'is-invalid': isInvalid
          },
          className
        )}>
        {icon && React.cloneElement(icon, {size: 'S', className: classNames(styles, 'spectrum-Tags-itemIcon')})}
        <span
          role={tagProps.role}
          className={classNames(
            styles,
            'spectrum-Tags-itemLabel'
          )}>
          {props.children}
        </span>
        {removable &&
          <ClearButton
            tabIndex={tagProps.tabIndex}
            focusClassName={classNames(styles, 'is-focused')}
            className={classNames(styles, 'spectrum-Tags-itemClearButton')}
            {...clearButtonProps} />
        }
      </div>
    </FocusRing>
  );
});
