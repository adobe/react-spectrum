import {AriaMeterProps, useMeter} from 'react-aria';
import {LabelContext} from './Label';
import React, {ForwardedRef, forwardRef} from 'react';
import {RenderProps, useRenderProps, useSlot} from './utils';

export interface MeterProps extends Omit<AriaMeterProps, 'label'>, RenderProps<MeterRenderProps> {}

export interface MeterRenderProps {
  /**
   * The value as a percentage between the minimum and maximum.
   */
  percentage: number,
  /**
   * A formatted version of the value.
   * @selector [aria-valuetext]
   */
  valueText: string
}

function Meter(props: MeterProps, ref: ForwardedRef<HTMLDivElement>) {
  let {
    value = 0,
    minValue = 0,
    maxValue = 100
  } = props;

  let [labelRef, label] = useSlot();
  let {
    meterProps,
    labelProps
  } = useMeter({...props, label});

  // Calculate the width of the progress bar as a percentage
  let percentage = (value - minValue) / (maxValue - minValue) * 100;

  let renderProps = useRenderProps({
    ...props,
    defaultClassName: 'react-aria-Meter',
    values: {
      percentage,
      valueText: meterProps['aria-valuetext']
    }
  });

  return (
    <div {...meterProps} {...renderProps} ref={ref}>
      <LabelContext.Provider value={{...labelProps, ref: labelRef, elementType: 'span'}}>
        {renderProps.children}
      </LabelContext.Provider>
    </div>
  );
}

/**
 * A meter represents a quantity within a known range, or a fractional value.
 */
const _Meter = forwardRef(Meter);
export {_Meter as Meter};
