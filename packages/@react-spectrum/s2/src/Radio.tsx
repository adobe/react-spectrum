import {baseColor, style} from '../style/spectrum-theme' with {type: 'macro'};
import {CenterBaseline} from './CenterBaseline';
import {forwardRef, ReactNode, useContext, useRef} from 'react';
import {FocusableRef} from '@react-types/shared';
import {focusRing, getAllowedOverrides, StyleProps} from './style-utils' with {type: 'macro'};
import {FormContext, useFormProps} from './Form';
import {pressScale} from './pressScale';
import {
  Radio as AriaRadio,
  RadioProps as AriaRadioProps,
  RadioRenderProps
} from 'react-aria-components';
import {useFocusableRef} from '@react-spectrum/utils';

export interface RadioProps extends Omit<AriaRadioProps, 'className' | 'style' | 'children'>, StyleProps {
  /**
   * The label for the element.
   */
  children?: ReactNode
}

interface ContextProps {
  /**
   * The size of the Radio.
   *
   * @default "M"
   */
  size?: 'S' | 'M' | 'L' | 'XL',
  /**
   * Whether the Radio within a RadioGroup should be displayed with an emphasized style.
   */
  isEmphasized?: boolean
}

interface RadioContextProps extends RadioProps, ContextProps {}

interface RenderProps extends RadioRenderProps, ContextProps {}

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
  },
  disableTapHighlight: true
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

function Radio(props: RadioProps, ref: FocusableRef<HTMLLabelElement>) {
  let {children, UNSAFE_className = '', UNSAFE_style} = props;
  let circleRef = useRef(null);
  let domRef = useFocusableRef(ref);
  let isInForm = !!useContext(FormContext);
  let {
    size = 'M',
    ...allProps
  } = useFormProps<RadioContextProps>(props);

  return (
    <AriaRadio
      {...allProps}
      ref={domRef}
      style={UNSAFE_style}
      className={renderProps => UNSAFE_className + wrapper({...renderProps, isInForm, size}, allProps.styles)}>
      {renderProps => (
        <>
          <CenterBaseline>
            <div
              ref={circleRef}
              style={pressScale(circleRef)(renderProps)}
              className={circle({
                ...renderProps,
                isEmphasized: allProps.isEmphasized,
                isSelected: renderProps.isSelected,
                size
              })} />
          </CenterBaseline>
          {children}
        </>
      )}
    </AriaRadio>
  );
}

/**
 * Radio buttons allow users to select a single option from a list of mutually exclusive options.
 * All possible options are exposed up front for users to compare.
 */
let _Radio = /*#__PURE__*/ forwardRef(Radio);
export {_Radio as Radio};
