import {classNames, filterDOMProps} from '@react-spectrum/utils';
/*
import {TooltipContext} from './context';
import {DOMProps} from '@react-types/shared';
import {FocusScope} from '@react-aria/focus';
import {mergeProps} from '@react-aria/utils';
*/
// import {HTMLElement} from 'react-dom';
import React, {ReactNode, RefObject, useContext, useRef} from 'react';
import styles from '@adobe/spectrum-css-temp/components/tooltip/vars.css';
// import {useTooltipState} from '@react-stately/tooltip';
// import {useProviderProps} from '@react-spectrum/provider';
import {useTooltip} from '@react-aria/tooltip';


export interface TooltipProps {
  children: ReactNode,
  variant?: 'neutral' | 'positive' | 'negative' | 'info',
  showIcon?: boolean
}

export const Tooltip = React.forwardRef((props: TooltipProps, ref: RefObject<HTMLDivElement>) => { //HTMLDivElement instead of HTMLElement
  // let defaults = {};
  // let completeProps = Object.assign({}, defaults, useProviderProps(props));
  // let state = useTooltipState(completeProps);
  // let ariaProps = useTooltip(completeProps, state);
  let {
    type = 'top',
    ...contextProps
  } = useContext(TooltipContext) || {};
  if (type === 'top') {
    return <BaseDialog {...mergeProps(contextProps, props)} ref={ref} />;
  } else {
    return <p> future iterations coming soon </p>
  }

});

const BaseTooltip = React.forwardRef(({children, className, ...otherProps}: TooltipProps, ref: RefObject<HTMLDivElement>) => {
  ref = ref || useRef();
  let {tooltipProps} = useTooltip({ref});

  return (
      <div
        className={classNames(
          styles,
          'spectrum-Tooltip',
          className
        )}
        ref={ref}
        {...mergeProps(filterDOMProps(otherProps), tooltipProps)}>
        {children}
      </div>
  );
});
