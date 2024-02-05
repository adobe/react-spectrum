import {CenterBaseline} from './CenterBaseline';
import {focusRing} from './style-utils' with {type: 'macro'};
import {FormContext, useFormProps} from './Form';
import {mergeStyles} from '../style-macro/runtime';
import {pressScale} from './pressScale';
import {
  Radio as AriaRadio,
  RadioProps as AriaRadioProps,
  RadioRenderProps
} from 'react-aria-components';
import {useContext, useRef} from 'react';
import {style, baseColor} from '../style-macro/spectrum-theme' with {type: 'macro'};

export interface RadioStyleProps {
  size?: 'S' | 'M' | 'L' | 'XL',
  isEmphasized?: boolean
}

interface RenderProps extends RadioRenderProps, RadioStyleProps {}

interface RadioProps extends Omit<AriaRadioProps, 'className'>, RadioStyleProps {
  className?: string
}

const wrapper = style({
  display: 'flex',
  columnGap: 'text-to-control',
  alignItems: 'baseline',
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

const circle = style<RenderProps>({
  ...focusRing(),
  size: 'control-sm',
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'default', /* RSP v3 was 'all 200ms' */
  borderRadius: 'full',
  borderStyle: 'solid',
  boxSizing: 'border-box',
  borderWidth: {
    default: 2,
    isSelected: '[calc((self(height) - 4px) / 2)]'
  },
  forcedColorAdjust: 'none',
  backgroundColor: 'gray-25',
  borderColor: {
    default: baseColor('gray-800'),
    forcedColors: 'ButtonBorder',
    isSelected: {
      isEmphasized: baseColor('accent-900'),
      forcedColors: 'Highlight'
    },
    isInvalid: {
      default: 'negative',
      forcedColors: 'Mark'
    },
    isDisabled: {
      default: 'gray-400',
      forcedColors: 'GrayText'
    }
  }
});

export function Radio({children, ...props}: RadioProps) {
  let circleRef = useRef(null);
  let isInForm = !!useContext(FormContext);
  props = useFormProps(props);
  return (
    <AriaRadio
      {...props}
      className={renderProps => mergeStyles(props.className, wrapper({...renderProps, isInForm, size: props.size || 'M'}))}>
      {renderProps => (
        <>
          <CenterBaseline>
            <div
              ref={circleRef}
              style={pressScale(circleRef)(renderProps)}
              className={circle({
                ...renderProps,
                isEmphasized: props.isEmphasized,
                isSelected: renderProps.isSelected,
                size: props.size || 'M'
              })} />
          </CenterBaseline>
          {children}
        </>
      )}
    </AriaRadio>
  );
}
