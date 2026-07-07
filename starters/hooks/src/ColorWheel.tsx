'use client';
import {useColorWheel, type AriaColorWheelProps} from 'react-aria/useColorWheel';
import {useColorWheelState} from 'react-stately/useColorWheelState';
import {useFocusRing} from 'react-aria/useFocusRing';
import {useRef} from 'react';
import './ColorWheel.css';
import './ColorThumb.css';

const RADIUS = 100;
const TRACK_THICKNESS = 28;

export function ColorWheel(props: Omit<AriaColorWheelProps, 'outerRadius' | 'innerRadius'>) {
  // useColorWheelState manages the hue value behind the circular gradient track.
  let state = useColorWheelState(props);
  let inputRef = useRef<HTMLInputElement>(null);
  /*- begin highlight -*/
  let {trackProps, thumbProps, inputProps} = useColorWheel(
    {...props, outerRadius: RADIUS, innerRadius: RADIUS - TRACK_THICKNESS},
    state,
    inputRef
  );
  /*- end highlight -*/
  let {focusProps, isFocusVisible} = useFocusRing();

  return (
    <div
      className="react-aria-ColorWheel"
      data-disabled={state.isDisabled || undefined}
      style={{position: 'relative', display: 'inline-block'}}>
      <div {...trackProps} className="react-aria-ColorWheelTrack" style={trackProps.style} />
      <div
        {...thumbProps}
        className="react-aria-ColorThumb"
        data-focus-visible={isFocusVisible || undefined}
        data-disabled={state.isDisabled || undefined}
        style={{
          ...thumbProps.style,
          background: state.getDisplayColor().toString('css')
        }}>
        <input ref={inputRef} {...inputProps} {...focusProps} />
      </div>
    </div>
  );
}
