import {classNames, filterDOMProps} from '@react-spectrum/utils';
import {HTMLElement} from 'react-dom';
import React, {RefObject} from 'react';
import styles from '@adobe/spectrum-css-temp/components/tooltip/vars.css';
// import {useTooltip} from '@react-aria/tooltip';
// import {useTooltipState} from '@react-stately/tooltip';
import {useProviderProps} from '@react-spectrum/provider';

export interface TooltipProps {
  children: ReactNode,
  variant?: 'neutral' | 'positive' | 'negative' | 'info',
  showIcon?: boolean
}

export const Tooltip = React.forwardRef((props: TooltipProps, ref: RefObject<HTMLElement>) => {
  let defaults = {};
  let completeProps = Object.assign({}, defaults, useProviderProps(props));
  // let state = useTooltipState(completeProps);
  // let ariaProps = useTooltip(completeProps, state);

  // {...ariaProps}
  return (
    <div {...filterDOMProps(completeProps)} ref={ref} className={classNames(styles, '')}>
      <p> hi </p>
    </div>
  );
});
