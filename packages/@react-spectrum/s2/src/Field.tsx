import {Group, GroupProps, Input as RACInput, InputProps as RACInputProps, Label, LabelProps, FieldErrorProps, FieldError, composeRenderProps, Text} from 'react-aria-components';
import {baseColor, fontRelative, style} from '../style-macro/spectrum-theme' with {type: 'macro'};
import {StyleProps, UnsafeStyles, focusRing} from './style-utils' with {type: 'macro'};
import AsteriskIcon from '../ui-icons/Asterisk';
import AlertIcon from './wf-icons/AlertTriangle';
import {Icon} from './Icon';
import {mergeStyles} from '../style-macro/runtime';
import {CenterBaseline, centerBaselineBefore} from './CenterBaseline';
import {NecessityIndicator, Alignment, DOMRef} from '@react-types/shared';
import {forwardRef, ForwardedRef, ReactNode} from 'react';
import {useDOMRef} from '@react-spectrum/utils';
import {StyleString} from '../style-macro/types';

interface FieldLabelProps extends Omit<LabelProps, 'className' | 'style' | 'children'>, StyleProps {
  isDisabled?: boolean,
  isRequired?: boolean,
  size?: 'S' | 'M' | 'L' | 'XL',
  necessityIndicator?: NecessityIndicator,
  labelAlign?: Alignment,
  labelPosition?: 'top' | 'side',
  includeNecessityIndicatorInAccessibilityName?: boolean,
  staticColor?: 'white' | 'black',
  children?: ReactNode
}

function FieldLabel(props: FieldLabelProps, ref: DOMRef<HTMLLabelElement>) {
  let {
    isDisabled,
    isRequired,
    size = 'M',
    necessityIndicator = 'icon',
    includeNecessityIndicatorInAccessibilityName = false,
    labelAlign,
    labelPosition,
    staticColor,
    UNSAFE_style,
    UNSAFE_className = '',
    ...labelProps
  } = props;

  let domRef = useDOMRef(ref);

  return (
    <Label
      {...labelProps}
      ref={domRef}
      style={UNSAFE_style}
      className={UNSAFE_className + mergeStyles(
        style({
          gridArea: 'label',
          fontFamily: 'sans',
          fontSize: 'control',
          lineHeight: 'ui',
          cursor: 'default',
          color: {
            default: 'neutral-subdued',
            isDisabled: 'disabled',
            staticColor: {
              white: {
                default: 'transparent-white-700'
              },
              black: {
                default: 'transparent-black-900'
              }
            },
            forcedColors: 'ButtonText'
          },
          textAlign: {
            labelAlign: {
              start: 'start',
              end: 'end'
            }
          },
          contain: {
            labelPosition: {
              top: 'inline-size'
            }
          },
          paddingBottom: {
            labelPosition: {
              top: '--field-gap'
            }
          }
        })({labelAlign, labelPosition, isDisabled, size, staticColor}), props.css)}>
      {props.children}
      {(isRequired || necessityIndicator === 'label') && (
        <span className={style({whiteSpace: 'nowrap'})}>
          &nbsp;
          {necessityIndicator === 'icon' &&
            <AsteriskIcon
              size={size}
              className={style({
                '--iconPrimary': {
                  type: 'fill',
                  value: 'currentColor'
                }
              })}
              aria-label={includeNecessityIndicatorInAccessibilityName ? '(required)' : undefined} />
          }
          {necessityIndicator === 'label' &&
            /* The necessity label is hidden to screen readers if the field is required because
             * aria-required is set on the field in that case. That will already be announced,
             * so no need to duplicate it here. If optional, we do want it to be announced here. */
            <span aria-hidden={!includeNecessityIndicatorInAccessibilityName ? isRequired : undefined}>
              {isRequired ? '(required)' : '(optional)' /* TODO translate */}
            </span>
          }
        </span>
      )}
    </Label>
  );
}

let _FieldLabel = forwardRef(FieldLabel);
export {_FieldLabel as FieldLabel};

interface FieldGroupProps extends Omit<GroupProps, 'className' | 'style' | 'children'>, UnsafeStyles {
  size?: 'S' | 'M' | 'L' | 'XL',
  children?: ReactNode,
  css?: StyleString
}

const fieldGroupStyles = style({
  ...focusRing(),
  gridArea: 'input',
  display: 'flex',
  alignItems: 'center',
  height: 'control',
  // TODO: this should actually stretch to fill the parent Field if that has a width defined.
  width: 176,
  boxSizing: 'border-box',
  paddingX: 'edge-to-text',
  fontFamily: 'sans',
  fontSize: 'control',
  borderRadius: 'control',
  borderWidth: 2,
  borderStyle: 'solid',
  transition: 'default',
  borderColor: {
    default: baseColor('gray-300'),
    isInvalid: 'negative',
    isFocusWithin: {
      default: 'gray-900',
      isInvalid: 'negative-1000',
      forcedColors: 'Highlight'
    },
    isDisabled: {
      default: 'disabled',
      forcedColors: 'GrayText'
    }
  },
  backgroundColor: 'gray-25',
  color: {
    default: 'neutral',
    isDisabled: 'disabled'
  },
  cursor: {
    default: 'text',
    isDisabled: 'default'
  }
});

export function FieldGroup(props: FieldGroupProps) {
  return (
    <Group
      {...props}
      onPointerDown={(e) => {
        // Forward focus to input element when clicking on a non-interactive child (e.g. icon or padding)
        if (e.pointerType === 'mouse' && !(e.target as Element).closest('button,input,textarea')) {
          e.preventDefault();
          e.currentTarget.querySelector('input')?.focus();
        }
      }}
      onPointerUp={e => {
        if (e.pointerType !== 'mouse' && !(e.target as Element).closest('button,input,textarea')) {
          e.preventDefault();
          e.currentTarget.querySelector('input')?.focus();
        }
      }}
      style={props.UNSAFE_style}
      className={renderProps => (props.UNSAFE_className || '') + ' ' + centerBaselineBefore + mergeStyles(
        fieldGroupStyles({...renderProps, size: props.size || 'M'}),
        props.css
      )} />
  );
}

export interface InputProps extends Omit<RACInputProps, 'className' | 'style'>, StyleProps {}

function Input(props: InputProps, ref: ForwardedRef<HTMLInputElement>) {
  let {UNSAFE_className = '', UNSAFE_style, css, ...otherProps} = props;
  return (
    <RACInput
      {...otherProps}
      ref={ref}
      style={UNSAFE_style}
      className={UNSAFE_className + mergeStyles(style({
        padding: 0,
        backgroundColor: 'transparent',
        color: '[inherit]',
        fontFamily: '[inherit]',
        fontSize: '[inherit]',
        flexGrow: 1,
        minWidth: 0,
        outlineStyle: 'none',
        borderStyle: 'none'
      }), css)} />
  );
}

let _Input = forwardRef(Input);
export {_Input as Input};

interface HelpTextProps extends FieldErrorProps {
  size?: 'S' | 'M' | 'L' | 'XL',
  isDisabled?: boolean,
  isInvalid?: boolean, // TODO: export FieldErrorContext from RAC to get this.
  description?: ReactNode,
  showErrorIcon?: boolean
}

const helpTextStyles = style({
  gridArea: 'helptext',
  display: 'flex',
  alignItems: 'baseline',
  lineHeight: 'ui',
  gap: 'text-to-visual',
  fontFamily: 'sans',
  fontSize: 'control',
  color: {
    default: 'neutral-subdued',
    isInvalid: 'negative',
    isDisabled: 'disabled'
  },
  contain: 'inline-size',
  paddingTop: '--field-gap',
  cursor: {
    default: 'text',
    isDisabled: 'default'
  }
});

export function HelpText(props: HelpTextProps & {descriptionRef?: DOMRef<HTMLDivElement>, errorRef?: DOMRef<HTMLDivElement>}) {
  let domDescriptionRef = useDOMRef(props.descriptionRef || null);
  let domErrorRef = useDOMRef(props.errorRef || null);
  if (!props.isInvalid && props.description) {
    return (
      <Text
        slot="description"
        ref={domDescriptionRef}
        className={helpTextStyles({size: props.size || 'M', isDisabled: props.isDisabled})}>
        {props.description}
      </Text>
    );
  }

  return (
    <FieldError
      {...props}
      ref={domErrorRef}
      className={renderProps => helpTextStyles({...renderProps, size: props.size || 'M', isDisabled: props.isDisabled})}>
      {composeRenderProps(props.children, (children, {validationErrors}) => (<>
        {props.showErrorIcon &&
          <Icon>
            <AlertIcon UNSAFE_style={{fill: 'currentColor'}} />
          </Icon>
        }
        <span>{children || validationErrors.join(' ')}</span>
      </>))}
    </FieldError>
  );
}

export function FieldErrorIcon() {
  return (
    <CenterBaseline>
      <AlertIcon
        // TODO: add back color
        css={style({
          marginStart: 'text-to-visual',
          marginEnd: fontRelative(-2) // ??
        })} />
    </CenterBaseline>
  );
}
