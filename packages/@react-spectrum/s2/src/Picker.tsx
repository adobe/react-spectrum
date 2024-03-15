import {baseColor, style} from '../style-macro/spectrum-theme' with {type: 'macro'};
import {
  Button,
  ButtonRenderProps,
  ListBox,
  ListBoxProps,
  ListBoxItem,
  ListBoxItemProps,
  Popover,
  Select as AriaSelect,
  SelectProps as AriaSelectProps,
  SelectRenderProps as AriaSelectRenderProps,
  SelectValue
} from 'react-aria-components';
import ChevronIcon from '../ui-icons/Chevron';
import {StyleProps, centerPadding, field, focusRing, getAllowedOverrides} from './style-utils' with {type: 'macro'};
import {
  FieldLabel,
  HelpText
} from './Field';
import {FormContext, useFormProps} from './Form';
import {pressScale} from './pressScale';
import React, {useContext, useRef} from 'react';
import {SpectrumLabelableProps, HelpTextProps} from '@react-types/shared';

export interface PickerStyleProps {
  /**
   * The size of the Picker.
   *
   * @default "M"
   */
  size?: 'S' | 'M' | 'L' | 'XL',
  /** Whether the picker should be displayed with a quiet style. */
  isQuiet?: boolean
}

export interface PickerProps<T extends object> extends Omit<AriaSelectProps<T>, 'children' | 'style' | 'className'>, PickerStyleProps, StyleProps, Omit<SpectrumLabelableProps, 'contextualHelp'>, HelpTextProps, Pick<ListBoxProps<T>, 'items'> {
  children: React.ReactNode | ((item: T) => React.ReactNode)
}

interface PickerSelectProps extends PickerStyleProps, AriaSelectRenderProps {}

interface PickerButtonProps extends PickerStyleProps, ButtonRenderProps {}

const selectWrapper = style<PickerSelectProps & SpectrumLabelableProps & {isInForm?: boolean}>({
  ...field(),
  width: {
    default: 208,
    size: {
      S: 176,
      L: 224,
      XL: 240
    },
    isQuiet: 'fit'
  }
}, getAllowedOverrides());

const inputButton = style<PickerButtonProps | AriaSelectRenderProps>({
  ...focusRing(),
  outlineStyle: {/* The focus ring shows up after menu close if default and isFocusVisible from focusRing() aren't added to this definition. */
    default: 'none',
    isFocusVisible: 'solid',
    isQuiet: 'none'
  },
  gridArea: 'input',
  fontFamily: 'sans',
  fontSize: 'control',
  display: 'flex',
  textAlign: 'start',
  borderStyle: 'none',
  borderRadius: 'control',
  alignItems: 'center',
  height: 'control',
  transition: 'default',
  columnGap: {
    default: 'text-to-control',
    isQuiet: 'text-to-visual'
  },
  paddingX: {
    default: 'edge-to-text',
    isQuiet: 0
  },
  paddingBottom: {
    isQuiet: centerPadding()
  },
  backgroundColor: {
    default: baseColor('gray-100'),
    isOpen: 'gray-200',
    isDisabled: 'disabled',
    isQuiet: 'transparent'
  },
  color: {
    default: 'neutral',
    isDisabled: 'disabled'
  }
});

const quietFocusLine = style({
  width: 'full',
  // Use pixels since we are emulating a border.
  height: '[2px]',
  position: 'absolute',
  bottom: 0,
  borderRadius: 'full',
  backgroundColor: {
    default: 'blue-800',
    forcedColors: 'Highlight'
  }
});

const valueStyles = style({
  flexGrow: 1,
  truncate: true
});

const iconStyles = style({
  rotate: 90,
  '--iconPrimary': {
    type: 'fill',
    value: 'currentColor'
  }
});

export function Picker<T extends object>(props: PickerProps<T>) {
  let ref = useRef(null);
  let formContext = useContext(FormContext);
  props = useFormProps(props);
  let {
    label,
    description,
    errorMessage,
    children,
    items,
    isInvalid,
    isQuiet,
    size = 'M',
    labelPosition = 'top',
    labelAlign = 'start',
    necessityIndicator,
    UNSAFE_className = '',
    UNSAFE_style,
    ...pickerProps
  } = props;

  return (
    <AriaSelect
      {...pickerProps}
      style={UNSAFE_style}
      className={renderProps => UNSAFE_className + selectWrapper({
        ...renderProps,
        isInForm: !!formContext,
        isQuiet: isQuiet,
        labelPosition,
        size: size
      }, props.css)}>
      {({isDisabled, isFocusVisible}) => (
        <>
          <FieldLabel
            isDisabled={isDisabled}
            isRequired={props.isRequired}
            size={size}
            labelPosition={labelPosition}
            labelAlign={labelAlign}
            necessityIndicator={necessityIndicator}>
            {label}
          </FieldLabel>
          <Button
            ref={ref}
            style={pressScale(ref)}
            className={renderProps => inputButton({
              ...renderProps,
              isQuiet: isQuiet,
              size: size
            })}>
            <SelectValue
              className={valueStyles} />
            <ChevronIcon
              size={size}
              className={iconStyles} />
            {isFocusVisible && isQuiet && <span className={quietFocusLine} /> }
          </Button>
          <HelpText
            size={size}
            isDisabled={isDisabled}
            isInvalid={isInvalid}
            description={description}>
            {errorMessage}
          </HelpText>
          <Popover>
            <ListBox items={items}>
              {children}
            </ListBox>
          </Popover>
        </>
      )}
    </AriaSelect>
  );
}

export function PickerItem(props: ListBoxItemProps) {
  return <ListBoxItem {...props} />;
}
