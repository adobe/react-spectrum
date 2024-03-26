import {
  SearchField as AriaSearchField,
  SearchFieldProps as AriaSearchFieldProps,
  Provider
} from 'react-aria-components';
import {ClearButton} from './ClearButton';
import {FieldGroup, FieldLabel, HelpText, Input} from './Field';
import {StyleProps, field, getAllowedOverrides} from './style-utils' with {type: 'macro'};
import {fontRelative, style} from '../style/spectrum-theme' with {type: 'macro'};
import SearchIcon from '../s2wf-icons/assets/svg/S2_Icon_Search_20_N.svg';
import {raw} from '../style/style-macro' with {type: 'macro'};
import {useContext, forwardRef, Ref, useRef, useImperativeHandle} from 'react';
import {FormContext, useFormProps} from './Form';
import {SpectrumLabelableProps, HelpTextProps} from '@react-types/shared';
import {TextFieldRef} from '@react-types/textfield';
import {createFocusableRef} from '@react-spectrum/utils';
import {IconContext} from './Icon';
import {centerBaseline} from './CenterBaseline';

export interface SearchFieldProps extends Omit<AriaSearchFieldProps, 'className' | 'style' | 'children'>, StyleProps, SpectrumLabelableProps, HelpTextProps {
  /**
   * The size of the SearchField.
   *
   * @default 'M'
   */
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
          value: fontRelative(-2)
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
      }, props.styles)}>
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
          styles={style({
            borderRadius: 'full',
            paddingStart: 'pill',
            paddingEnd: 0
          })}>
          <Provider
            values={[
              [IconContext, {
                render: centerBaseline({
                  slot: 'icon',
                  className: style({
                    flexShrink: 0,
                    marginEnd: 'text-to-visual',
                    '--iconPrimary': {
                      type: 'fill',
                      value: 'currentColor'
                    }
                  })
                }),
                styles: style({
                  size: fontRelative(20),
                  marginStart: '--iconMargin'
                })
              }]
            ]}>
            <SearchIcon />
          </Provider>
          <Input ref={inputRef} UNSAFE_className={raw('&::-webkit-search-cancel-button { display: none }')} />
          {!isEmpty && !searchFieldProps.isReadOnly && <ClearButton size={props.size} />}
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

/**
 * A SearchField is a text field designed for searches.
 */
let _SearchField = /*#__PURE__*/ forwardRef(SearchField);
export {_SearchField as SearchField};
