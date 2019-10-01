import {classNames, filterDOMProps} from '@react-spectrum/utils';
import {HTMLElement} from 'react-dom';
import {ProgressBarProps} from '@react-types/progress';
import React, {RefObject} from 'react';
import styles from '@adobe/spectrum-css-temp/components/barloader/vars.css';
import {useLocale} from '@react-aria/i18n';
import {useProgressBar} from '@react-aria/progress';

export const ProgressBar = React.forwardRef((props: ProgressBarProps, ref: RefObject<HTMLElement>) => {
  let {
    size = 'L',
    children,
    valueLabel,
    showValueLabel = !!valueLabel, // Whether the label should be shown or not
    variant,
    labelPosition = 'side',
    isIndeterminate = false,
    className,
    ...otherProps
  } = props;

  const {
    ariaProps,
    labelAriaProps,
    formattedValueLabel,
    fillStyle
  } = useProgressBar(props);

  const {direction} = useLocale();

  return (
    <div
      className={
        classNames(
          styles,
          'spectrum-BarLoader',
          {
            'spectrum-BarLoader--small': size === 'S',
            'spectrum-BarLoader--large': size === 'L',
            'spectrum-BarLoader--indeterminate': isIndeterminate,
            'spectrum-BarLoader--sideLabel': labelPosition === 'side',
            'spectrum-BarLoader--overBackground': variant === 'overBackground',
            'is-positive': variant === 'positive',
            'is-warning': variant === 'warning',
            'is-critical': variant === 'critical'
          },
          className
        )
      }
      ref={ref}
      dir={direction} 
      {...ariaProps}
      {...filterDOMProps(otherProps)}>
      {children &&
        <div
          className={classNames(styles, 'spectrum-BarLoader-label')}
          id={labelAriaProps.id} >
            {children}
        </div>
      }
      {showValueLabel &&
        <div className={classNames(styles, 'spectrum-BarLoader-percentage')} >
          {valueLabel || formattedValueLabel}
        </div>
      }
      <div className={classNames(styles, 'spectrum-BarLoader-track')} >
        <div
          className={classNames(styles, 'spectrum-BarLoader-fill')}
          style={fillStyle} />
      </div>
    </div>
  );
});
