import {
  SearchField as AriaSearchField,
  SearchFieldProps as AriaSearchFieldProps,
  ValidationResult
} from 'react-aria-components';
import {ClearButton} from './ClearButton';
import {FieldGroup, FieldLabel, HelpText, Input} from './Field';
import {field} from './style-utils' with {type: 'macro'};
import {style} from '../style-macro/spectrum-theme' with {type: 'macro'};
import SearchIcon from '../s2wf-icons/assets/react/s2IconSearch20N.js';
import {Icon} from './Icon';
import {raw} from '../style-macro/style-macro' with {type: 'macro'};
import {useContext} from 'react';
import {FormContext, useFormProps} from './Form';
import {SpectrumLabelableProps} from '@react-types/shared';
import {CSSProp} from '../style-macro/types';
import {mergeStyles} from '../style-macro/runtime';

export interface SearchFieldProps extends Omit<AriaSearchFieldProps, 'className' | 'style'>, SpectrumLabelableProps {
  label?: string,
  description?: string,
  errorMessage?: string | ((validation: ValidationResult) => string),
  size?: 'S' | 'M' | 'L' | 'XL',
  // TODO
  css?: CSSProp<typeof style, 'marginY'>
}

export function SearchField(props: SearchFieldProps) {
  let formContext = useContext(FormContext);
  props = useFormProps(props);
  let {
    label,
    description,
    errorMessage,
    necessityIndicator,
    labelPosition = 'top',
    labelAlign = 'start',
    ...searchFieldProps
  } = props;

  return (
    <AriaSearchField
      {...searchFieldProps}
      className={mergeStyles(props.css, style({
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
      })({
        size: props.size,
        labelPosition,
        isInForm: !!formContext
      }))}>
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
          className={style({
            borderRadius: 'full',
            paddingStart: 'pill',
            paddingEnd: 0
          })}>
          <Icon className={style({marginEnd: 'text-to-visual'})()}>
            <SearchIcon />
          </Icon>
          <Input className={raw('&::-webkit-search-cancel-button { display: none }')} />
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

