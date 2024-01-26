import {
  Button,
  SearchField as AriaSearchField,
  SearchFieldProps as AriaSearchFieldProps,
  ValidationResult,
  ButtonProps,
  ButtonRenderProps
} from 'react-aria-components';
import {FieldGroup, FieldLabel, HelpText, Input} from './Field';
import {field} from './style-utils.ts' with {type: 'macro'};
import {style} from '../style-macro/spectrum-theme.ts' with {type: 'macro'};
import SearchIcon from '../s2wf-icons/assets/react/s2IconSearch20N.js';
import CrossIcon from '../ui-icons/S2_CrossSize100.svg';
import {Icon} from './Icon.tsx';
import {raw} from '../style-macro/style-macro.ts' with {type: 'macro'};
import {useContext} from 'react';
import {FormContext, useFormProps} from './Form.tsx';
import {SpectrumLabelableProps} from '@react-types/shared';

export interface SearchFieldProps extends AriaSearchFieldProps, SpectrumLabelableProps {
  label?: string,
  description?: string,
  errorMessage?: string | ((validation: ValidationResult) => string),
  size?: 'S' | 'M' | 'L' | 'XL'
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
      className={style({
        ...field(),
        '--iconMargin': {
          type: 'marginTop',
          value: '[calc(-2 / 14 * 1em)]'
        }
      })({
        size: props.size,
        labelPosition,
        isInForm: !!formContext
      })}>
      {({isDisabled, isInvalid, isEmpty}) => (<>
        <FieldLabel
          isDisabled={isDisabled}
          isRequired={props.isRequired}
          size={props.size}
          labelPosition={labelPosition}
          labelAlign={labelAlign}
          necessityIndicator={necessityIndicator}>
          {label}
        </FieldLabel>
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

interface ClearButtonStyleProps {
  size?: 'S' | 'M' | 'L' | 'XL'
}

interface ClearButtonRenderProps extends ButtonRenderProps, ClearButtonStyleProps {}
interface ClearButtonProps extends ButtonProps, ClearButtonStyleProps {}

function ClearButton(props: ClearButtonProps) {
  return (
    <Button 
      {...props}
      className={renderProps => style<ClearButtonRenderProps>({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: 'full',
        width: 'control',
        borderStyle: 'none',
        backgroundColor: 'transparent',
        transition: 'default',
        padding: 0,
        color: {
          default: 'neutral',
          isDisabled: {
            default: 'disabled',
            forcedColors: 'GrayText'
          }
        },
        '--iconPrimary': {
          type: 'fill',
          value: 'currentColor'
        }
      })({...renderProps, size: props.size || 'M'})}>
      <CrossIcon 
        className={style({
          size: {
            size: {
              S: 2,
              M: 2,
              L: 2.5,
              XL: 2.5 // ???
            }
          }
        })({size: props.size})} />
    </Button>
  );
}
