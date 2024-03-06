import {CenterBaseline} from './CenterBaseline';
import {StyleProps, focusRing, getAllowedOverrides} from './style-utils' with {type: 'macro'};
import {FormContext, useFormProps} from './Form';
import {pressScale} from './pressScale';
import {
  Radio as AriaRadio,
  RadioProps as AriaRadioProps,
  RadioRenderProps
} from 'react-aria-components';
import {ReactNode, useContext, useRef} from 'react';
import {style, baseColor} from '../style-macro/spectrum-theme' with {type: 'macro'};

export interface RadioStyleProps {
  size?: 'S' | 'M' | 'L' | 'XL',
  isEmphasized?: boolean
}

interface RenderProps extends RadioRenderProps, RadioStyleProps {}

interface RadioProps extends Omit<AriaRadioProps, 'className' | 'style' | 'children'>, StyleProps, RadioStyleProps {
  children?: ReactNode
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
}, getAllowedOverrides());

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

export function Radio(props: RadioProps) {
  let {children, UNSAFE_className = '', UNSAFE_style} = props;
  let circleRef = useRef(null);
  let isInForm = !!useContext(FormContext);
  props = useFormProps(props);
  return (
    <AriaRadio
      {...props}
      style={UNSAFE_style}
      className={renderProps => UNSAFE_className + wrapper({...renderProps, isInForm, size: props.size || 'M'}, props.css)}>
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
