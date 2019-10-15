import {classNames, filterDOMProps} from '@react-spectrum/utils';
import {TooltipContext} from './context';
import {mergeProps} from '@react-aria/utils';
import React, {ReactNode, RefObject, useContext, useRef} from 'react';
import styles from '@adobe/spectrum-css-temp/components/tooltip/vars.css';
import {useTooltip} from '@react-aria/tooltip';

interface TooltipProps {
  children: ReactNode,
  variant?: 'neutral' | 'positive' | 'negative' | 'info',
  showIcon?: boolean
}

export const Tooltip = React.forwardRef((props: TooltipProps, ref: RefObject<HTMLDivElement>) => {
  // let {
  //   type = 'top',
  //   ...contextProps
  // } = useContext(TooltipContext) || {};
  // if (type === 'top') {
  //   return <BaseTooltip {...mergeProps(contextProps, props)} ref={ref} />;
  // } else {
  //   return <p> future positions coming soon </p>
  // }

  return (
      <div
        className={classNames(
          styles,
          'spectrum-Tooltip', 'is-open'
        )}
        ref={ref}
        >
        {props.children && (
          <span className={classNames(styles, 'spectrum-Tooltip-label')}>
            {props.children}
          </span>
        )}
      </div>
  );

});

const BaseTooltip = React.forwardRef(({children, className, ...otherProps}: TooltipProps, ref: RefObject<HTMLDivElement>) => {
  ref = ref || useRef();
  let {tooltipProps} = useTooltip({ref});

  // this works
  /*
  return (
    <div> hello!!! </div>
  );
  */

  // this does not work
  // return (
  //     <div
  //       ref={ref}
  //       {...mergeProps(filterDOMProps(otherProps), tooltipProps)}>
  //       {children && (
  //         <span className={classNames(styles, 'spectrum-Tooltip-label')}>
  //           {children}
  //         </span>
  //       )}
  //     </div>
  // );
  // return (
  //     <div
  //       className={classNames(
  //         styles,
  //         'spectrum-Tooltip',
  //         className
  //       )}
  //       ref={ref}
  //       {...mergeProps(filterDOMProps(otherProps), tooltipProps)}>
  //       {children && (
  //         <span className={classNames(styles, 'spectrum-Tooltip-label')}>
  //           {children}
  //         </span>
  //       )}
  //     </div>
  // );
});

// how to make proper id as in v2 without a constructor? ... or ref instead id?
// <span className="spectrum-Tooltip-tip" style={arrowStyle} /> ... where is arrowStyle comign from?
// is it ok to have placement in context?
