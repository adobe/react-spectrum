import {classNames, filterDOMProps} from '@react-spectrum/utils';
import {FocusRing} from '@react-aria/focus';
import {RadioProps} from '@react-types/radio';
import React, {forwardRef, RefObject} from 'react';
import styles from '@adobe/spectrum-css-temp/components/radio/vars.css';
import {useRadio} from '@react-aria/radio';
import {useRadioProvider} from './RadioGroup';


export const Radio = forwardRef((props: RadioProps, ref: RefObject<HTMLLabelElement>) => {

  if (!props.children && !props['aria-label']) {
    console.warn('If no children are provided, an aria-label must be specified');
  }

  let {
    isDisabled,
    children,
    className,
    value,
    ...otherProps
  } = props;

  let radioGroupProps = useRadioProvider();
  let {
    isEmphasized,
    isRequired,
    isReadOnly,
    isDisabled: isGroupDisabled,
    validationState,
    name,
    labelPosition,
    selectedRadio,
    setSelectedRadio
  } = radioGroupProps;

  let {inputProps} = useRadio({
    value,
    isEmphasized,
    isRequired,
    isReadOnly,
    isDisabled: isDisabled || isGroupDisabled,
    name
  }, {selectedRadio, setSelectedRadio});

  return (
    <label
      {...filterDOMProps(
        otherProps,
        {
          'aria-label': false,
          onChange: false
        }
      )}
      ref={ref}
      className={
        classNames(
          styles,
          'spectrum-Radio',
          {
            'spectrum-Radio--labelBelow': labelPosition === 'bottom',
            'spectrum-Radio--quiet': !isEmphasized,
            'is-disabled': isDisabled,
            'is-invalid': validationState === 'invalid'
          },
          className
        )
      }>
      <FocusRing focusRingClass={classNames(styles, 'focus-ring')}>
        <input
          {...inputProps}
          className={classNames(styles, 'spectrum-Radio-input')} />
      </FocusRing>
      <span className={classNames(styles, 'spectrum-Radio-button')} />
      {children && (
        <span className={classNames(styles, 'spectrum-Radio-label')}>
          {children}
        </span>
      )}
    </label>
  );
});
