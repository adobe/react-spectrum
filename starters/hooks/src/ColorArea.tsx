'use client';
import {useColorArea, type AriaColorAreaProps} from 'react-aria/useColorArea';
import {useColorAreaState} from 'react-stately/useColorAreaState';
import {useFocusRing} from 'react-aria/useFocusRing';
import {useRef} from 'react';
import './ColorArea.css';
import './ColorThumb.css';

export function ColorArea(props: AriaColorAreaProps) {
  let inputXRef = useRef<HTMLInputElement>(null);
  let inputYRef = useRef<HTMLInputElement>(null);
  let containerRef = useRef<HTMLDivElement>(null);
  // useColorAreaState manages the two channel values behind the 2D gradient.
  let state = useColorAreaState(props);
  /*- begin highlight -*/
  let {colorAreaProps, xInputProps, yInputProps, thumbProps} = useColorArea(
    {...props, inputXRef, inputYRef, containerRef},
    state
  );
  /*- end highlight -*/
  let {focusProps, isFocusVisible} = useFocusRing();

  return (
    <div
      {...colorAreaProps}
      ref={containerRef}
      className="react-aria-ColorArea"
      data-disabled={props.isDisabled || undefined}
      style={colorAreaProps.style}>
      <div
        {...thumbProps}
        className="react-aria-ColorThumb"
        data-focus-visible={isFocusVisible || undefined}
        data-disabled={props.isDisabled || undefined}
        style={{
          ...thumbProps.style,
          background: state.getDisplayColor().toString('css')
        }}>
        {/* Two hidden range inputs drive the X and Y color channels. */}
        <input ref={inputXRef} {...xInputProps} {...focusProps} />
        <input ref={inputYRef} {...yInputProps} {...focusProps} />
      </div>
    </div>
  );
}
