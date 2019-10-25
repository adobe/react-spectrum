import {classNames, filterDOMProps} from '@react-spectrum/utils';
import {mergeProps} from '@react-aria/utils';
import {DOMProps} from '@react-types/shared';
import React, {ReactNode, RefObject, useRef} from 'react';
import styles from '@adobe/spectrum-css-temp/components/tooltip/vars.css';
import {useTooltip} from '@react-aria/tooltip';

interface TooltipProps {
  children: ReactNode,
  variant?: 'neutral' | 'positive' | 'negative' | 'info',
  placement?: 'right' | 'left' | 'top' | 'bottom',
  showIcon?: boolean
}

export const Tooltip = React.forwardRef((props: TooltipProps, ref: RefObject<HTMLDivElement>) => {
  ref = ref || useRef();
  let {tooltipProps} = useTooltip({ref});
  let {
    variant = 'neutral',
    placement = 'right',
    showIcon = true,
    arrowStyle,
  } = props;

  return (
    <div
      className={classNames(
        styles,
        'spectrum-Tooltip',
        `spectrum-Tooltip--${variant}`,
        `spectrum-Tooltip--${placement.split(' ')[0]}`,
        {
          'is-open': showIcon
        }
      )}
      ref={ref}
      {...mergeProps(filterDOMProps(props), tooltipProps)}>
      {props.children && (
        <span className={classNames(styles, 'spectrum-Tooltip-label')}>
          {props.children}
        </span>
      )}
      <span className={classNames(styles, 'spectrum-Tooltip-tip')} />
    </div>
  );
});
