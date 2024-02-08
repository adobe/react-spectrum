import {
  Switch as AriaSwitch,
  SwitchProps as AriaSwitchProps,
  SwitchRenderProps
} from 'react-aria-components';
import React, {useContext, useRef} from 'react';
import {baseColor, style} from '../style-macro/spectrum-theme' with {type: 'macro'};
import {FormContext, useFormProps} from './Form';
import {CenterBaseline} from './CenterBaseline';
import {pressScale} from './pressScale';
import {focusRing} from './style-utils' with {type: 'macro'};
import {mergeStyles} from '../style-macro/runtime';

interface SwitchStyleProps {
  size?: 'S' | 'M' | 'L' | 'XL',
  isEmphasized?: boolean
}

interface RenderProps extends SwitchRenderProps, SwitchStyleProps {}

export interface SwitchProps extends Omit<AriaSwitchProps, 'children' | 'className'>, SwitchStyleProps {
  children: React.ReactNode,
  className?: string
}

const wrapper = style({
  display: 'flex',
  columnGap: 'text-to-control',
  alignItems: 'baseline',
  width: 'fit',
  fontFamily: 'sans',
  fontSize: 'control',
  transition: 'colors',
  color: {
    default: 'neutral',
    isDisabled: {
      default: 'disabled',
      forcedColors: 'GrayText'
    }
  },
  gridColumnStart: {
    isInForm: 'field'
  }
});

const track = style<RenderProps>({
  ...focusRing(),
  borderRadius: 'full',
  '--trackWidth': {
    type: 'width',
    value: '[calc(26 / 14 * 1em)]'
  },
  '--trackHeight': {
    type: 'height',
    value: 'control-sm'
  },
  width: '--trackWidth',
  height: '--trackHeight',
  boxSizing: 'border-box',
  borderWidth: 2,
  borderStyle: 'solid',
  transition: 'default',
  forcedColorAdjust: 'none',
  borderColor: {
    default: baseColor('gray-800'),
    forcedColors: 'ButtonBorder',
    isDisabled: {
      default: 'gray-400',
      forcedColors: 'GrayText'
    },
    isSelected: 'transparent'
  },
  backgroundColor: {
    default: 'gray-25',
    isSelected: {
      default: 'neutral',
      isEmphasized: baseColor('accent-900'),
      forcedColors: 'Highlight',
      isDisabled: {
        default: 'gray-400',
        forcedColors: 'GrayText'
      }
    }
  }
});

const handle = style<RenderProps>({
  height: 'full',
  aspectRatio: 'square',
  borderRadius: 'full',
  backgroundColor: {
    default: 'neutral',
    isDisabled: {
      default: 'gray-400',
      forcedColors: 'GrayText'
    },
    isSelected: 'gray-25'
  },
  transition: 'default'
});

// Use an inline style to calculate the transform so we can combine it with the press scale.
const transformStyle = ({isSelected}: SwitchRenderProps) => ({
  // In the default state, the handle is 8px smaller than the track. When selected it grows to 6px smaller than the track.
  // Normally this could be calculated as a scale transform with (trackHeight - 8px) / trackHeight, however,
  // CSS does not allow division with units. To solve this we use a 3d perspective transform. Perspective is the
  // distance from the Z=0 plane to the viewer. Since we want to scale the handle by a fixed amount and we cannot divide
  // by a value with units, we can set the Z translation to a fixed amount and change the perspective in order to achieve
  // the desired effect. Given the following formula:
  //
  //   scale = perspective / (perspective - translateZ)
  //
  // and desired scale factors (accounting for the 2px border on each side of the track):
  //
  //   defaultScale = (trackHeight - 8px) / (trackHeight - 4px)
  //   selectedScale = (trackHeight - 6px) / (trackHeight - 4px)
  //
  // we can solve for the perspective needed in each case where translateZ is hard coded to -4px:
  //
  //    defaultPerspective = trackHeight - 8px
  //    selectedPerspective = 2 * (trackHeight - 6px)
  transform: isSelected
    // The selected state also translates the X position to the end of the track (minus the borders).
    ? 'translateX(calc(var(--trackWidth) - 100% - 4px)) perspective(calc(2 * (var(--trackHeight) - 6px))) translateZ(-4px)'
    : 'perspective(calc(var(--trackHeight) - 8px)) translateZ(-4px)'
});

export function Switch({children, ...props}: SwitchProps) {
  let handleRef = useRef(null);
  let isInForm = !!useContext(FormContext);
  props = useFormProps(props);
  return (
    <AriaSwitch
      {...props}
      className={renderProps => mergeStyles(props.className, wrapper({...renderProps, isInForm, size: props.size || 'M'}))}>
      {renderProps => (
        <>
          <CenterBaseline>
            <div 
              className={track({
                ...renderProps,
                size: props.size || 'M',
                isEmphasized: props.isEmphasized
              })}>
              <div
                ref={handleRef}
                style={pressScale(handleRef, transformStyle)(renderProps)}
                className={handle(renderProps)} />
            </div>
          </CenterBaseline>
          {children}
        </>
      )}
    </AriaSwitch>
  );
}
