import {Group, GroupProps, Input as RACInput, InputProps, Label, LabelProps, FieldErrorProps, FieldError, composeRenderProps, Text, InputRenderProps} from 'react-aria-components';
import {baseColor, style} from '../style-macro/spectrum-theme' with {type: 'macro'};
import {focusRing} from './style-utils' with {type: 'macro'};
import AsteriskIcon from '../ui-icons/S2_AsteriskSize100.svg';
import AlertIcon from '../s2wf-icons/assets/react/s2IconAlertTriangle20N.js';
import {Icon} from './Icon';
import {mergeStyles} from '../style-macro/runtime';
import {CenterBaseline, centerBaselineBefore} from './CenterBaseline';
import {NecessityIndicator, Alignment} from '@react-types/shared';

interface FieldLabelProps extends LabelProps {
  isDisabled?: boolean,
  isRequired?: boolean,
  size?: 'S' | 'M' | 'L' | 'XL',
  necessityIndicator?: NecessityIndicator,
  labelAlign?: Alignment,
  labelPosition?: 'top' | 'side',
  includeNecessityIndicatorInAccessibilityName?: boolean
}

export function FieldLabel(props: FieldLabelProps) {
  let {
    isDisabled,
    isRequired,
    size = 'M',
    necessityIndicator = 'icon',
    includeNecessityIndicatorInAccessibilityName = false,
    labelAlign,
    labelPosition,
    ...labelProps
  } = props;

  return (
    <Label
      {...labelProps}
      className={style({
        gridArea: 'label',
        fontFamily: 'sans',
        fontSize: 'control',
        lineHeight: 100,
        cursor: 'default',
        color: {
          default: 'neutral-subdued',
          isDisabled: 'disabled'
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
      })({labelAlign, labelPosition, isDisabled, size})}>
      {props.children}
      {(isRequired || necessityIndicator === 'label') && (
        <span className={style({whiteSpace: 'nowrap'})()}>
          &nbsp;
          {necessityIndicator === 'icon' &&
            <AsteriskIcon 
              className={style({
                '--iconPrimary': {
                  type: 'fill',
                  value: 'currentColor'
                },
                size: {
                  size: {
                    S: 2,
                    M: 2,
                    L: 2.5,
                    XL: 2.5
                  }
                }
              })({size, isDisabled, isRequired})}
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

interface FieldGroupProps extends GroupProps {
  size?: 'S' | 'M' | 'L' | 'XL'
}

const fieldGroupStyles = style({
  ...focusRing(),
  gridArea: 'input',
  display: 'flex',
  alignItems: 'center',
  height: 'control',
  width: 44,
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
      className={composeRenderProps(
        props.className, 
        (className, renderProps) => centerBaselineBefore + mergeStyles(
          fieldGroupStyles({...renderProps, size: props.size || 'M'}),
          className
        )
      )} />
  );
}

export function Input(props: InputProps) {
  return (
    <RACInput
      {...props}
      className={composeRenderProps(props.className, (className, renderProps) => mergeStyles(style<InputRenderProps>({
        padding: 0,
        backgroundColor: 'transparent',
        color: '[inherit]',
        fontFamily: '[inherit]',
        fontSize: '[inherit]',
        flex: 1,
        minWidth: 0,
        outlineStyle: 'none',
        borderStyle: 'none'
      })(renderProps), className))} />
  );
}

interface HelpTextProps extends FieldErrorProps {
  size?: 'S' | 'M' | 'L' | 'XL',
  isDisabled?: boolean,
  isInvalid?: boolean, // TODO: export FieldErrorContext from RAC to get this.
  description?: string,
  showErrorIcon?: boolean
}

const helpTextStyles = style({
  gridArea: 'helptext',
  display: 'flex',
  alignItems: 'baseline',
  lineHeight: 100,
  gap: 'text-to-visual',
  fontFamily: 'sans',
  fontSize: 'control',
  color: {
    default: 'neutral-subdued',
    isInvalid: 'negative',
    isDisabled: 'disabled'
  },
  contain: 'inline-size',
  paddingTop: '--field-gap'
});

export function HelpText(props: HelpTextProps) {
  if (!props.isInvalid && props.description) {
    return (
      <Text
        slot="description"
        className={helpTextStyles({size: props.size || 'M', isDisabled: props.isDisabled})}>
        {props.description}
      </Text>
    );
  }

  return (
    <FieldError
      {...props}
      className={renderProps => helpTextStyles({...renderProps, size: props.size || 'M', isDisabled: props.isDisabled})}>
      {composeRenderProps(props.children, (children, {validationErrors}) => (<>
        {props.showErrorIcon &&
          <Icon>
            <AlertIcon style={{fill: 'currentColor'}} />
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
        className={style({
          'fill': 'negative',
          size: '[calc(20 / 14 * 1em)]',
          marginStart: 'text-to-visual',
          marginEnd: '[calc(-2 / 14 * 1em)]' // ??
        })()} />
    </CenterBaseline>
  );
}
