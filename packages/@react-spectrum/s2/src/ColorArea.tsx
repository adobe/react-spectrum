import {
  ColorArea as AriaColorArea,
  ColorAreaProps as AriaColorAreaProps
} from 'react-aria-components';
import {style} from '../style/spectrum-theme' with {type: 'macro'};
import {forwardRef} from 'react';
import {ColorHandle} from './ColorHandle';
import {StyleProps, getAllowedOverrides} from './style-utils' with {type: 'macro'};
import {useDOMRef} from '@react-spectrum/utils';
import {DOMRef} from '@react-types/shared';

export interface ColorAreaProps extends Omit<AriaColorAreaProps, 'children' | 'className' | 'style'>, StyleProps {}

function ColorArea(props: ColorAreaProps, ref: DOMRef<HTMLDivElement>) {
  let {UNSAFE_className = '', UNSAFE_style, styles} = props;
  let containerRef = useDOMRef(ref);
  return (
    <AriaColorArea
      {...props}
      ref={containerRef}
      style={({defaultStyle, isDisabled}) => ({
        ...defaultStyle,
        background: isDisabled ? undefined : defaultStyle.background,
        // Move position: relative to style macro so it can be overridden.
        position: undefined,
        ...UNSAFE_style
      })}
      className={renderProps => UNSAFE_className + style({
        position: 'relative',
        size: 192,
        minSize: 64,
        borderRadius: 'default',
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
      }, getAllowedOverrides({height: true}))(renderProps, styles)}>
      {({state}) =>
        (<ColorHandle
          containerRef={containerRef}
          getPosition={() => state.getThumbPosition()} />)
      }
    </AriaColorArea>
  );
}

/**
 * A ColorArea allows users to adjust two channels of an RGB, HSL or HSB color value against a two-dimensional gradient background.
 */
let _ColorArea = forwardRef(ColorArea);
export {_ColorArea as ColorArea};
