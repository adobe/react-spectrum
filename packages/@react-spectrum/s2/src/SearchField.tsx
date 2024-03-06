import {
  SearchField as AriaSearchField,
  SearchFieldProps as AriaSearchFieldProps,
  ValidationResult
} from 'react-aria-components';
import {ClearButton} from './ClearButton';
import {FieldGroup, FieldLabel, HelpText, Input} from './Field';
import {StyleProps, field, getAllowedOverrides} from './style-utils' with {type: 'macro'};
import {style} from '../style-macro/spectrum-theme' with {type: 'macro'};
import SearchIcon from '../src/wf-icons/Search';
import {Icon} from './Icon';
import {raw} from '../style-macro/style-macro' with {type: 'macro'};
import {useContext, forwardRef, Ref, useRef, useImperativeHandle} from 'react';
import {FormContext, useFormProps} from './Form';
import {SpectrumLabelableProps} from '@react-types/shared';
import {TextFieldRef} from '@react-types/textfield';
import {createFocusableRef} from '@react-spectrum/utils';

export interface SearchFieldProps extends Omit<AriaSearchFieldProps, 'className' | 'style'>, StyleProps, SpectrumLabelableProps {
  label?: string,
  description?: string,
  errorMessage?: string | ((validation: ValidationResult) => string),
  size?: 'S' | 'M' | 'L' | 'XL'
}

function SearchField(props: SearchFieldProps, ref: Ref<TextFieldRef>) {
  let formContext = useContext(FormContext);
  props = useFormProps(props);
  let {
    label,
    description,
    errorMessage,
    necessityIndicator,
    labelPosition = 'top',
    labelAlign = 'start',
    UNSAFE_className = '',
    UNSAFE_style,
    ...searchFieldProps
  } = props;

  let domRef = useRef<HTMLDivElement>(null);
  let inputRef = useRef<HTMLInputElement>(null);

  // Expose imperative interface for ref
  useImperativeHandle(ref, () => ({
    ...createFocusableRef(domRef, inputRef),
    select() {
      if (inputRef.current) {
        inputRef.current.select();
      }
    },
    getInputElement() {
      return inputRef.current;
    }
  }));


  return (
    <AriaSearchField
      {...searchFieldProps}
      ref={domRef}
      style={UNSAFE_style}
      className={UNSAFE_className + style({
        ...field(),
        '--iconMargin': {
          type: 'marginTop',
          value: '[calc(-2 / 14 * 1em)]'
        },
        color: {
          default: 'neutral',
          isDisabled: {
            default: 'disabled',
            forcedColors: 'GrayText'
          }
        }
      }, getAllowedOverrides())({
        size: props.size,
        labelPosition,
        isInForm: !!formContext
      }, props.css)}>
      {({isDisabled, isInvalid, isEmpty}) => (<>
        {label && <FieldLabel
          isDisabled={isDisabled}
          isRequired={props.isRequired}
          size={props.size}
          labelPosition={labelPosition}
          labelAlign={labelAlign}
          necessityIndicator={necessityIndicator}>
          {label}
        </FieldLabel>}
        <FieldGroup
          isDisabled={isDisabled}
          size={props.size}
          css={style({
            borderRadius: 'full',
            paddingStart: 'pill',
            paddingEnd: 0
          })}>
          <Icon css={style({marginEnd: 'text-to-visual'})}>
            <SearchIcon />
          </Icon>
          <Input ref={inputRef} UNSAFE_className={raw('&::-webkit-search-cancel-button { display: none }')} />
          {!isEmpty && <ClearButton size={props.size} isDisabled={isDisabled} />}
        </FieldGroup>
        <HelpText
          size={props.size}
          isDisabled={isDisabled}
          isInvalid={isInvalid}
          description={description}>
          {errorMessage}
        </HelpText>
      </>)}
    </AriaSearchField>
  );
}

let _SearchField = forwardRef(SearchField);
export {_SearchField as SearchField};
