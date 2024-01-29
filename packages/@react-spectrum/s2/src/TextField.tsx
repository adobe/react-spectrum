import {
  TextField as AriaTextField,
  TextFieldProps as AriaTextFieldProps,
  TextArea as AriaTextArea,
  ValidationResult,
  composeRenderProps,
  TextAreaContext,
  useSlottedContext
} from 'react-aria-components';
import {FieldErrorIcon, FieldGroup, FieldLabel, HelpText, Input} from './Field';
import {field} from './style-utils' with {type: 'macro'};
import {style} from '../style-macro/spectrum-theme' with {type: 'macro'};
import {SpectrumLabelableProps} from '@react-types/shared';
import {useContext} from 'react';
import {FormContext, useFormProps} from './Form';

export interface TextFieldProps extends AriaTextFieldProps, SpectrumLabelableProps {
  label?: string,
  description?: string,
  errorMessage?: string | ((validation: ValidationResult) => string),
  size?: 'S' | 'M' | 'L' | 'XL'
}

export function TextField(props: TextFieldProps) {
  return (
    <TextFieldBase {...props}>
      <Input />
    </TextFieldBase>
  );
}

export function TextArea(props: TextFieldProps) {
  return (
    <TextFieldBase 
      {...props}
      fieldGroupClassName={style({
        alignItems: 'baseline',
        height: 'auto'
      })()}>
      <TextAreaInput />
    </TextFieldBase>
  );
}

function TextFieldBase(props: TextFieldProps & {fieldGroupClassName?: string}) {
  let formContext = useContext(FormContext);
  props = useFormProps(props);
  let {
    label,
    description,
    errorMessage,
    necessityIndicator,
    labelPosition = 'top',
    labelAlign = 'start',
    fieldGroupClassName,
    ...textFieldProps
  } = props;

  return (
    <AriaTextField 
      {...textFieldProps}
      className={style(field())({
        size: props.size,
        labelPosition,
        isInForm: !!formContext
      })}>
      {composeRenderProps(props.children, (children, {isDisabled, isInvalid}) => (<>
        <FieldLabel
          isDisabled={isDisabled}
          isRequired={props.isRequired}
          size={props.size}
          labelPosition={labelPosition}
          labelAlign={labelAlign}
          necessityIndicator={necessityIndicator}>
          {label}
        </FieldLabel>
        {/* TODO: set GroupContext in RAC TextField */}
        <FieldGroup role="presentation" isDisabled={isDisabled} isInvalid={isInvalid} size={props.size} className={fieldGroupClassName}>
          {children}
          {isInvalid && <FieldErrorIcon />}
        </FieldGroup>
        <HelpText 
          size={props.size}
          isDisabled={isDisabled}
          isInvalid={isInvalid}
          description={description}>
          {errorMessage}
        </HelpText>
      </>))}
    </AriaTextField>
  );
}

function TextAreaInput() {
  // Force re-render when value changes so we update the height.
  useSlottedContext(TextAreaContext) ?? {};
  let onHeightChange = (input: HTMLTextAreaElement) => {
    // TODO: only do this if an explicit height is not given?
    if (input) {
      let prevAlignment = input.style.alignSelf;
      let prevOverflow = input.style.overflow;
      // Firefox scroll position is lost when overflow: 'hidden' is applied so we skip applying it.
      // The measure/applied height is also incorrect/reset if we turn on and off
      // overflow: hidden in Firefox https://bugzilla.mozilla.org/show_bug.cgi?id=1787062
      let isFirefox = 'MozAppearance' in input.style;
      if (!isFirefox) {
        input.style.overflow = 'hidden';
      }
      input.style.alignSelf = 'start';
      input.style.height = 'auto';
      // offsetHeight - clientHeight accounts for the border/padding.
      input.style.height = `${input.scrollHeight + (input.offsetHeight - input.clientHeight)}px`;
      input.style.overflow = prevOverflow;
      input.style.alignSelf = prevAlignment;
    }
  };

  return (
    <AriaTextArea
      ref={onHeightChange}
      // Workaround for baseline alignment bug in Safari.
      // https://bugs.webkit.org/show_bug.cgi?id=142968
      placeholder=" "
      className={style({
        paddingX: 0,
        paddingY: '[calc((var(--field-height) - 1lh) / 2)]',
        boxSizing: 'border-box',
        backgroundColor: 'transparent',
        color: '[inherit]',
        fontFamily: '[inherit]',
        fontSize: '[inherit]',
        lineHeight: 100,
        flex: 1,
        minWidth: 0,
        outlineStyle: 'none',
        borderStyle: 'none',
        resize: 'none',
        overflowX: 'hidden'
      })} />
  );
}
