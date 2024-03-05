import {Checkbox as AriaCheckbox, CheckboxProps as AriaCheckboxProps, CheckboxRenderProps} from 'react-aria-components';
import {style, baseColor} from '../style-macro/spectrum-theme' with {type: 'macro'};
import {focusRing} from './style-utils' with {type: 'macro'};
import {CenterBaseline} from './CenterBaseline';
import CheckmarkIcon from '../ui-icons/S2_CheckmarkSize100.svg';
import DashIcon from '../ui-icons/S2_DashSize100.svg';
import {useContext, useRef, forwardRef} from 'react';
import {pressScale} from './pressScale';
import {mergeStyles} from '../style-macro/runtime';
import {FormContext, useFormProps} from './Form';
import {FocusableRef} from '@react-types/shared';
import {useFocusableRef} from '@react-spectrum/utils';

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

export const box = style<RenderProps>({
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

export const iconStyles = style<RenderProps>({
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

function Checkbox({children, ...props}: CheckboxProps & CheckboxStyleProps, ref: FocusableRef<HTMLLabelElement>) {
  let boxRef = useRef(null);
  let domRef = useFocusableRef(ref);
  let isInForm = !!useContext(FormContext);
  props = useFormProps(props);

  return (
    <AriaCheckbox
      {...props}
      ref={domRef}
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

let _Checkbox = forwardRef(Checkbox);
export {_Checkbox as Checkbox};
