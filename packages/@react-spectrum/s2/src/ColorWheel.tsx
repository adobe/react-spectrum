import {
  ColorWheel as AriaColorWheel,
  ColorWheelProps as AriaColorWheelProps,
  ColorWheelTrack
} from 'react-aria-components';
import {ColorHandle} from './ColorHandle';
import {forwardRef} from 'react';
import {style} from '../style/spectrum-theme' with {type: 'macro'};
import {DOMRef} from '@react-types/shared';
import {useDOMRef} from '@react-spectrum/utils';
import {StyleProps} from './style-utils';

export interface ColorWheelProps extends Omit<AriaColorWheelProps, 'children' | 'className' | 'style' | 'outerRadius' | 'innerRadius'>, StyleProps {
  /**
   * @default 192
   */
  size?: number
}

function ColorWheel(props: ColorWheelProps, ref: DOMRef<HTMLDivElement>) {
  let {UNSAFE_className = '', UNSAFE_style, styles = ''} = props;
  let containerRef = useDOMRef(ref);
  // TODO: how to do mobile scaling?
  let {size = 192} = props;
  let outerRadius = Math.max(size, 175) / 2;
  let thickness = 24;
  let innerRadius = outerRadius - 24;
  return (
    <AriaColorWheel 
      {...props}
      outerRadius={outerRadius}
      innerRadius={innerRadius}
      ref={containerRef}
      style={UNSAFE_style}
      className={UNSAFE_className + styles}>
      {({isDisabled, state}) => (<>
        <ColorWheelTrack
          style={({defaultStyle, isDisabled}) => ({
            background: isDisabled ? undefined : defaultStyle.background
          })}
          className={style({
            // Outer border
            borderRadius: 'full',
            outlineColor: {
              default: 'gray-1000/10',
              forcedColors: 'ButtonBorder'
            },
            outlineWidth: 1,
            outlineOffset: -1,
            outlineStyle: {
              default: 'solid',
              isDisabled: 'none'
            },
            backgroundColor: {
              isDisabled: 'disabled'
            }
          })} />
        <div
          className={style({
            // Inner border
            position: 'absolute',
            inset: 24,
            pointerEvents: 'none',
            borderRadius: 'full',
            outlineColor: {
              default: 'gray-1000/10',
              forcedColors: 'ButtonBorder'
            },
            outlineWidth: 1,
            outlineStyle: {
              default: 'solid',
              isDisabled: 'none'
            }
          })({isDisabled})} />
        <ColorHandle
          containerRef={containerRef}
          getPosition={() => {
            let {x, y} = state.getThumbPosition(outerRadius - thickness / 2);
            return {
              x: (outerRadius + x) / (outerRadius * 2),
              y: (outerRadius + y) / (outerRadius * 2)
            };
          }} />
      </>)}
    </AriaColorWheel>
  );
}

/**
 * A ColorWheel allows users to adjust the hue of an HSL or HSB color value on a circular track.
 */
let _ColorWheel = forwardRef(ColorWheel);
export {_ColorWheel as ColorWheel};
