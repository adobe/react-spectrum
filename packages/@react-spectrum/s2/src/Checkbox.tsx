import {Checkbox as AriaCheckbox, CheckboxProps as AriaCheckboxProps, CheckboxRenderProps} from 'react-aria-components';
import {style, baseColor} from '../style-macro/spectrum-theme.ts' with {type: 'macro'};
import {focusRing} from './style-utils.ts' with {type: 'macro'};
import {CenterBaseline} from './CenterBaseline.tsx';
import CheckmarkIcon from '../ui-icons/S2_CheckmarkSize100.svg';
import DashIcon from '../ui-icons/S2_DashSize100.svg';
import {useContext, useRef} from 'react';
import {pressScale} from './pressScale';
import {mergeStyles} from '../style-macro/runtime.ts';
import {FormContext, useFormProps} from './Form.tsx';

interface CheckboxStyleProps {
  size?: 'S' | 'M' | 'L' | 'XL',
  isEmphasized?: boolean
}

interface RenderProps extends CheckboxRenderProps, CheckboxStyleProps {}

interface CheckboxProps extends Omit<AriaCheckboxProps, 'className'>, CheckboxStyleProps {
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

const box = style<RenderProps>({
  ...focusRing(),
  size: 'control-sm',
  borderRadius: 'control-sm',
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderWidth: 2,
  boxSizing: 'border-box',
  borderStyle: 'solid',
  transition: 'default',
  forcedColorAdjust: 'none',
  backgroundColor: {
    default: 'gray-25',
    isSelected: {
      default: 'neutral',
      isEmphasized: baseColor('accent-900'),
      forcedColors: 'Highlight',
      isInvalid: {
        default: baseColor('negative-900'),
        forcedColors: 'Mark'
      },
      isDisabled: {
        default: 'gray-400',
        forcedColors: 'GrayText'
      }
    }
  },
  borderColor: {
    default: baseColor('gray-800'),
    forcedColors: 'ButtonBorder',
    isInvalid: {
      default: 'negative',
      forcedColors: 'Mark'
    },
    isDisabled: {
      default: 'gray-400',
      forcedColors: 'GrayText'
    },
    isSelected: 'transparent'
  }
});

const iconStyles = style<RenderProps>({
  size: {
    default: 2.5,
    size: {
      XL: 3
    }
  },
  '--iconPrimary': {
    type: 'color',
    value: {
      default: 'gray-25',
      forcedColors: 'HighlightText'
    }
  }
});

export function Checkbox({children, ...props}: CheckboxProps & CheckboxStyleProps) {
  let boxRef = useRef(null);
  let isInForm = !!useContext(FormContext);
  props = useFormProps(props);
  return (
    <AriaCheckbox
      {...props}
      className={renderProps => mergeStyles(props.className, wrapper({...renderProps, isInForm, size: props.size || 'M'}))}>
      {renderProps => (
        <>
          <CenterBaseline>
            <div 
              ref={boxRef}
              style={pressScale(boxRef)(renderProps)}
              className={box({
                ...renderProps,
                isSelected: renderProps.isSelected || renderProps.isIndeterminate,
                size: props.size || 'M',
                isEmphasized: props.isEmphasized
              })}>
              {renderProps.isIndeterminate && 
                <DashIcon className={iconStyles({...renderProps, size: props.size})} />
              }
              {renderProps.isSelected && !renderProps.isIndeterminate && 
                <CheckmarkIcon className={iconStyles({...renderProps, size: props.size})} />
              }
            </div>
          </CenterBaseline>
          {children}
        </>
      )}
    </AriaCheckbox>
  );
}
