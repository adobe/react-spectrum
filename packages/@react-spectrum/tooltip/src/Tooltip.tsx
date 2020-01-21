import {classNames, filterDOMProps, useStyleProps} from '@react-spectrum/utils';
import React, {RefObject, useRef} from 'react';
import {SpectrumTooltipProps} from '@react-types/tooltip';
import styles from '@adobe/spectrum-css-temp/components/tooltip/vars.css';
import {useTooltip} from '@react-aria/tooltip';

export const Tooltip = React.forwardRef((props: SpectrumTooltipProps, ref: RefObject<HTMLDivElement>) => {
  ref = ref || useRef();
  let {
    variant = 'neutral',
    placement = 'right',
    isOpen,
    ...otherProps
  } = props;
  let {styleProps} = useStyleProps(otherProps);
  let {tooltipProps} = useTooltip(props);

  return (
    <div
      {...filterDOMProps(otherProps)}
      {...styleProps}
      {...tooltipProps}
      className={classNames(
        styles,
        'spectrum-Tooltip',
        `spectrum-Tooltip--${variant}`,
        `spectrum-Tooltip--${placement}`,
        {
          'is-open': isOpen
        },
        styleProps.className
      )}
      ref={ref}>
      {props.children && (
        <span className={classNames(styles, 'spectrum-Tooltip-label')}>
          {props.children}
        </span>
      )}
      <span className={classNames(styles, 'spectrum-Tooltip-tip')} />
    </div>
  );
});
