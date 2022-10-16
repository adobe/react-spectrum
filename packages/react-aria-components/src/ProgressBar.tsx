import {AriaProgressBarProps, useProgressBar} from 'react-aria';
import {LabelContext} from './Label';
import React, {createContext, ForwardedRef, forwardRef} from 'react';
import {RenderProps, useContextProps, useRenderProps, useSlot, WithRef} from './utils';

export interface ProgressBarProps extends Omit<AriaProgressBarProps, 'label'>, RenderProps<ProgressBarRenderProps> {}

export interface ProgressBarRenderProps {
  /**
   * The value as a percentage between the minimum and maximum.
   */
  percentage: number,
  /**
   * A formatted version of the value.
   * @selector [aria-valuetext]
   */
  valueText: string,
  /**
   * Whether the progress bar is indeterminate.
   * @selector :not([aria-valuenow])
   */
  isIndeterminate: boolean
}

export const ProgressBarContext = createContext<WithRef<ProgressBarProps, HTMLDivElement>>(null);

function ProgressBar(props: ProgressBarProps, ref: ForwardedRef<HTMLDivElement>) {
  [props, ref] = useContextProps(props, ref, ProgressBarContext);
  let {
    value = 0,
    minValue = 0,
    maxValue = 100,
    isIndeterminate
  } = props;

  let [labelRef, label] = useSlot();
  let {
    progressBarProps,
    labelProps
  } = useProgressBar({...props, label});

  // Calculate the width of the progress bar as a percentage
  let percentage = isIndeterminate ? undefined : (value - minValue) / (maxValue - minValue) * 100;

  let renderProps = useRenderProps({
    ...props,
    defaultClassName: 'react-aria-ProgressBar',
    values: {
      percentage,
      valueText: progressBarProps['aria-valuetext'],
      isIndeterminate
    }
  });

  return (
    <div {...progressBarProps} {...renderProps} ref={ref}>
      <LabelContext.Provider value={{...labelProps, ref: labelRef, elementType: 'span'}}>
        {renderProps.children}
      </LabelContext.Provider>
    </div>
  );
}

/**
 * Progress bars show either determinate or indeterminate progress of an operation
 * over time.
 */
const _ProgressBar = forwardRef(ProgressBar);
export {_ProgressBar as ProgressBar};
