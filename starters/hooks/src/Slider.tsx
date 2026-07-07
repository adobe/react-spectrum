'use client';
import {mergeProps} from 'react-aria/mergeProps';
import {useFocusRing} from 'react-aria/useFocusRing';
import {useNumberFormatter} from 'react-aria/useNumberFormatter';
import {
  useSlider,
  useSliderThumb,
  type AriaSliderProps,
  type AriaSliderThumbOptions
} from 'react-aria/useSlider';
import {useSliderState} from 'react-stately/useSliderState';
import {VisuallyHidden} from 'react-aria/VisuallyHidden';
import {useRef} from 'react';
import './Slider.css';
import './Form.css';

interface SliderProps extends AriaSliderProps {
  /** Label for the slider. */
  label?: string;
  /** Aria labels for each thumb. */
  thumbLabels?: string[];
  /**
   * The offset from which to start the fill.
   *
   * @default 0
   */
  fillOffset?: number;
  /** Formatting options for the value label. */
  formatOptions?: Intl.NumberFormatOptions;
}

export function Slider({label, thumbLabels, fillOffset, formatOptions, ...props}: SliderProps) {
  let trackRef = useRef<HTMLDivElement>(null);
  let numberFormatter = useNumberFormatter(formatOptions);
  let state = useSliderState({...props, numberFormatter});
  /*- begin highlight -*/
  let {groupProps, trackProps, labelProps, outputProps} = useSlider(props, state, trackRef);
  /*- end highlight -*/

  // The fill spans from fillOffset (or the min) to the last thumb.
  let start =
    state.values.length > 1
      ? state.getThumbPercent(0) * 100
      : state.getValuePercent(fillOffset ?? state.getThumbMinValue(0)) * 100;
  let end = state.getThumbPercent(state.values.length - 1) * 100;
  let startPercent = Math.min(start, end);
  let sizePercent = Math.max(0, Math.max(start, end) - startPercent);

  return (
    <div {...groupProps} className="react-aria-Slider" data-orientation={state.orientation}>
      {label && (
        <label className="react-aria-Label" {...labelProps}>
          {label}
        </label>
      )}
      <output {...outputProps} className="react-aria-SliderOutput">
        {state.getFormattedValue()}
      </output>
      <div {...trackProps} ref={trackRef} className="react-aria-SliderTrack">
        <div className="track inset" data-disabled={state.isDisabled || undefined}>
          <div
            className="react-aria-SliderFill"
            style={{
              position: 'absolute',
              insetInlineStart: `${startPercent}%`,
              width: `${sizePercent}%`,
              height: '100%'
            }}
          />
        </div>
        {state.values.map((_, i) => (
          <Thumb
            key={i}
            index={i}
            state={state}
            trackRef={trackRef}
            aria-label={thumbLabels?.[i]}
          />
        ))}
      </div>
    </div>
  );
}

function Thumb({
  state,
  trackRef,
  index,
  ...props
}: Omit<AriaSliderThumbOptions, 'inputRef'> & {state: ReturnType<typeof useSliderState>}) {
  let inputRef = useRef<HTMLInputElement>(null);
  let {thumbProps, inputProps, isDragging} = useSliderThumb(
    {...props, index, trackRef, inputRef},
    state
  );
  let {focusProps, isFocusVisible} = useFocusRing();

  return (
    <div
      {...thumbProps}
      className="react-aria-SliderThumb indicator"
      data-dragging={isDragging || undefined}
      data-focus-visible={isFocusVisible || undefined}>
      <VisuallyHidden>
        <input ref={inputRef} {...mergeProps(inputProps, focusProps)} />
      </VisuallyHidden>
    </div>
  );
}
