import {classNames, filterDOMProps} from '@react-spectrum/utils';
import React, {ReactNode, RefObject, useRef} from 'react';
import styles from '@adobe/spectrum-css-temp/components/tooltip/vars.css';
import {useTooltip} from '@react-aria/tooltip';

import {mergeProps} from '@react-aria/utils';
import {DOMProps} from '@react-types/shared';

interface TooltipProps extends DOMProps {
  children: ReactNode,
  variant?: 'neutral' | 'positive' | 'negative' | 'info',
  placement?: 'right' | 'left' | 'top' | 'bottom',
  isOpen?: boolean,
  role?: 'tooltip'
}

export const Tooltip = React.forwardRef((props: TooltipProps, ref: RefObject<HTMLDivElement>) => {
  ref = ref || useRef();
  let {
    variant = 'neutral',
    placement = 'right',
    isOpen,
    className,
    ...otherProps
  } = props;

  // needed in case a user has their own trigger implementation
  let {tooltipProps} = useTooltip(props);

  // {...mergeProps(filterDOMProps(otherProps), tooltipProps)}        ... this still didn't get rid of the linting issue

  /* this is what it was before

  {...filterDOMProps(otherProps)}
  {...tooltipProps}
  */

  return (
    <div
      {...mergeProps(filterDOMProps(otherProps), tooltipProps)}
      className={classNames(
        styles,
        'spectrum-Tooltip',
        `spectrum-Tooltip--${variant}`,
        `spectrum-Tooltip--${placement}`,
        {
          'is-open': isOpen
        },
        className
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
