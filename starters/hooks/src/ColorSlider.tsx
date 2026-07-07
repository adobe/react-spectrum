'use client';
import {useColorSlider, type AriaColorSliderProps} from 'react-aria/useColorSlider';
import {useColorSliderState} from 'react-stately/useColorSliderState';
import {useLocale} from 'react-aria/I18nProvider';
import {useFocusRing} from 'react-aria/useFocusRing';
import {useRef} from 'react';
import './ColorSlider.css';
import './ColorThumb.css';

export function ColorSlider(props: AriaColorSliderProps & {label?: string}) {
  let {locale} = useLocale();
  // useColorSliderState manages the single channel value behind the gradient track.
  let state = useColorSliderState({...props, locale});
  let trackRef = useRef<HTMLDivElement>(null);
  let inputRef = useRef<HTMLInputElement>(null);

  // Default the label to the channel name in the current locale.
  let label = props.label || state.value.getChannelName(props.channel, locale);
  /*- begin highlight -*/
  let {trackProps, thumbProps, inputProps, labelProps, outputProps} = useColorSlider(
    {...props, label, trackRef, inputRef},
    state
  );
  /*- end highlight -*/
  let {focusProps, isFocusVisible} = useFocusRing();

  return (
    <div
      className="react-aria-ColorSlider"
      data-orientation={state.orientation}
      data-disabled={state.isDisabled || undefined}>
      <label {...labelProps} className="react-aria-Label">
        {label}
      </label>
      <output {...outputProps} className="react-aria-SliderOutput">
        {state.value.formatChannelValue(props.channel, locale)}
      </output>
      <div
        {...trackProps}
        ref={trackRef}
        className="react-aria-SliderTrack"
        style={{
          ...trackProps.style,
          // Layer a checkerboard behind the gradient to communicate transparency.
          background: `${trackProps.style?.background},
            repeating-conic-gradient(#CCC 0% 25%, white 0% 50%) 50% / 16px 16px`
        }}>
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
    </div>
  );
}
