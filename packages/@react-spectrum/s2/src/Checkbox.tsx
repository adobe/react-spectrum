import {Checkbox as AriaCheckbox, CheckboxProps as AriaCheckboxProps, CheckboxRenderProps, ContextValue, useContextProps, CheckboxGroupStateContext} from 'react-aria-components';
import {style, baseColor} from '../style/spectrum-theme' with {type: 'macro'};
import {StyleProps, focusRing, getAllowedOverrides} from './style-utils' with {type: 'macro'};
import {CenterBaseline} from './CenterBaseline';
import CheckmarkIcon from '../ui-icons/Checkmark';
import DashIcon from '../ui-icons/Dash';
import {useContext, useRef, forwardRef, createContext, ReactNode} from 'react';
import {pressScale} from './pressScale';
import {FormContext, useFormProps} from './Form';
import {FocusableRef} from '@react-types/shared';
import {useFocusableRef} from '@react-spectrum/utils';

interface CheckboxStyleProps {
  /**
   * The size of the Checkbox.
   *
   * @default "M"
   */
  size?: 'S' | 'M' | 'L' | 'XL',
  /** Whether the Checkbox should be displayed with an emphasized style. */
  isEmphasized?: boolean
}

interface RenderProps extends CheckboxRenderProps, CheckboxStyleProps {}

export interface CheckboxProps extends Omit<AriaCheckboxProps, 'className' | 'style' | 'children'>, StyleProps, CheckboxStyleProps {
  /** The label for the element. */
  children?: ReactNode
}

interface CheckboxContextValue extends CheckboxProps, CheckboxStyleProps {}

export const CheckboxContext = createContext<ContextValue<CheckboxContextValue, HTMLLabelElement>>(null);

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
  },
  disableTapHighlight: true
}, getAllowedOverrides());

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

export const iconStyles = style({
  '--iconPrimary': {
    type: 'fill',
    value: {
      default: 'gray-25',
      forcedColors: 'HighlightText'
    }
  }
});

function Checkbox({children, ...props}: CheckboxProps, ref: FocusableRef<HTMLLabelElement>) {
  let boxRef = useRef(null);
  let domRef = useFocusableRef(ref);
  let isInForm = !!useContext(FormContext);
  [props, domRef] = useContextProps(props, domRef, CheckboxContext);
  props = useFormProps(props);
  let isInCheckboxGroup = !!useContext(CheckboxGroupStateContext);
  let ctx = useContext(CheckboxContext) as CheckboxContextValue;

  return (
    <AriaCheckbox
      {...props}
      ref={domRef}
      style={props.UNSAFE_style}
      className={renderProps => (props.UNSAFE_className || '') + wrapper({...renderProps, isInForm, size: props.size || 'M'}, props.css)}>
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
                isEmphasized: isInCheckboxGroup ? ctx.isEmphasized : props.isEmphasized
              })}>
              {renderProps.isIndeterminate &&
                <DashIcon size={props.size || 'M'} className={iconStyles} />
              }
              {renderProps.isSelected && !renderProps.isIndeterminate &&
                <CheckmarkIcon size={props.size || 'M'} className={iconStyles} />
              }
            </div>
          </CenterBaseline>
          {children}
        </>
      )}
    </AriaCheckbox>
  );
}

/**
 * Checkboxes allow users to select multiple items from a list of individual items,
 * or to mark one individual item as selected.
 */
let _Checkbox = forwardRef(Checkbox);
export {_Checkbox as Checkbox};
