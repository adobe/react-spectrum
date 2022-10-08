import {AriaProgressBarProps, useProgressBar} from 'react-aria';
import {LabelContext} from './Label';
import React, {ForwardedRef, forwardRef} from 'react';
import {RenderProps, useRenderProps, useSlot} from './utils';

interface ProgressBarProps extends Omit<AriaProgressBarProps, 'label'>, RenderProps<ProgressBarRenderProps> {}

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

function ProgressBar(props: ProgressBarProps, ref: ForwardedRef<HTMLDivElement>) {
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

const _ProgressBar = forwardRef(ProgressBar);
export {_ProgressBar as ProgressBar};
