import {baseColor, edgeToText, style} from '../style/spectrum-theme' with {type: 'macro'};
import {
  Button,
  ButtonRenderProps,
  ListBox,
  ListBoxProps,
  ListBoxItem,
  Section as AriaSection,
  ListBoxItemProps,
  Select as AriaSelect,
  SelectProps as AriaSelectProps,
  SelectRenderProps as AriaSelectRenderProps,
  SelectValue,
  PopoverProps as AriaPopoverProps,
  Provider,
  SectionProps
} from 'react-aria-components';
import ChevronIcon from '../ui-icons/Chevron';
import {StyleProps, field, focusRing, getAllowedOverrides} from './style-utils' with {type: 'macro'};
import {
  FieldErrorIcon,
  FieldLabel,
  HelpText
} from './Field';
import {SpectrumLabelableProps, HelpTextProps, FocusableRef} from '@react-types/shared';
import {FormContext, useFormProps} from './Form';
import {pressScale} from './pressScale';
import React, {ReactNode, createContext, forwardRef, useContext, useRef} from 'react';
import {Popover} from './Popover';
import {HeaderContext, HeadingContext, Text, TextContext} from './Content';
import CheckmarkIcon from '../ui-icons/Checkmark';
import {
  checkmark,
  menuitem,
  description,
  icon,
  label as labelStyles,
  section,
  sectionHeader,
  sectionHeading,
  Divider,
  iconCenterWrapper
} from './Menu';
import {IconContext} from './Icon';
import {centerBaseline} from './CenterBaseline';
import {forwardRefType} from './types';
import {useFocusableRef} from '@react-spectrum/utils';
import {Placement} from 'react-aria';
import {raw} from '../style/style-macro' with {type: 'macro'};


export interface PickerStyleProps {
  /**
   * The size of the Picker.
   *
   * @default 'M'
   */
  size?: 'S' | 'M' | 'L' | 'XL'
}

export interface PickerProps<T extends object> extends
  Omit<AriaSelectProps<T>, 'children' | 'style' | 'className'>,
  PickerStyleProps,
  StyleProps,
  Omit<SpectrumLabelableProps, 'contextualHelp'>,
  HelpTextProps,
  Pick<ListBoxProps<T>, 'items'>,
  Pick<AriaPopoverProps, 'shouldFlip'> {
    /** The contents of the collection. */
    children: ReactNode | ((item: T) => ReactNode),
    /**
     * Direction the menu will render relative to the Picker.
     *
     * @default "bottom"
     */
    direction?: 'bottom' | 'top',
    /**
     * Alignment of the menu relative to the input target.
     *
     * @default "start"
     */
    align?: 'start' | 'end',
    /** Width of the menu. By default, matches width of the trigger. Note that the minimum width of the dropdown is always equal to the trigger's width. */
    menuWidth?: number
}

interface PickerButtonProps extends PickerStyleProps, ButtonRenderProps {}

const inputButton = style<PickerButtonProps | AriaSelectRenderProps>({
  ...focusRing(),
  outlineStyle: {/* The focus ring shows up after menu close if default and isFocusVisible from focusRing() aren't added to this definition. */
    default: 'none',
    isFocusVisible: 'solid'
  },
  position: 'relative',
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
    default: 'text-to-control'
  },
  paddingX: {
    default: 'edge-to-text'
  },
  backgroundColor: {
    default: baseColor('gray-100'),
    isOpen: 'gray-200',
    isDisabled: 'disabled'
  },
  color: {
    default: 'neutral',
    isDisabled: 'disabled'
  },
  width: {
    default: 208,
    size: {
      S: 176,
      L: 224,
      XL: 240
    }
  }
});

export let menu = style({
  outlineStyle: 'none',
  display: 'grid',
  gridTemplateColumns: {
    size: {
      S: [edgeToText(24), 'auto', 'auto', 'minmax(0, 1fr)', 'auto', 'auto', 'auto', edgeToText(24)],
      M: [edgeToText(32), 'auto', 'auto', 'minmax(0, 1fr)', 'auto', 'auto', 'auto', edgeToText(32)],
      L: [edgeToText(40), 'auto', 'auto', 'minmax(0, 1fr)', 'auto', 'auto', 'auto', edgeToText(40)],
      XL: [edgeToText(48), 'auto', 'auto', 'minmax(0, 1fr)', 'auto', 'auto', 'auto', edgeToText(48)]
    }
  },
  boxSizing: 'border-box',
  maxHeight: '[inherit]',
  overflow: 'auto',
  padding: 8,
  fontFamily: 'sans',
  fontSize: 'control'
});

const invalidBorder = style({
  position: 'absolute',
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
  pointerEvents: 'none',
  borderRadius: 'control',
  borderStyle: 'solid',
  borderWidth: 2,
  borderColor: 'negative',
  transition: 'default'
});

const valueStyles = style({
  flexGrow: 1,
  truncate: true,
  display: 'flex',
  alignItems: 'center'
});

const iconStyles = style({
  flexShrink: 0,
  rotate: 90,
  '--iconPrimary': {
    type: 'fill',
    value: 'currentColor'
  }
});

let InternalPickerContext = createContext<{size: 'S' | 'M' | 'L' | 'XL'}>({size: 'M'});

function Picker<T extends object>(props: PickerProps<T>, ref: FocusableRef<HTMLButtonElement>) {
  let domRef = useFocusableRef(ref);
  let formContext = useContext(FormContext);
  props = useFormProps(props);
  let {
    direction = 'bottom',
    align = 'start',
    shouldFlip = true,
    menuWidth,
    label,
    description: descriptionMessage,
    errorMessage,
    children,
    items,
    size = 'M',
    labelPosition = 'top',
    labelAlign = 'start',
    necessityIndicator,
    UNSAFE_className = '',
    UNSAFE_style,
    placeholder = 'Select an option...',
    ...pickerProps
  } = props;

  // Better way to encode this into a style? need to account for flipping
  let menuOffset: number;
  if (size === 'S') {
    menuOffset = 6;
  } else if (size === 'M') {
    menuOffset = 6;
  } else if (size === 'L') {
    menuOffset = 7;
  } else {
    menuOffset = 8;
  }

  return (
    <AriaSelect
      {...pickerProps}
      placeholder={placeholder}
      style={UNSAFE_style}
      className={UNSAFE_className + style(field(), getAllowedOverrides())({
        isInForm: !!formContext,
        labelPosition,
        size
      }, props.styles)}>
      {({isDisabled, isOpen, isInvalid, isRequired}) => (
        <>
          <InternalPickerContext.Provider value={{size}}>
            <FieldLabel
              isDisabled={isDisabled}
              isRequired={isRequired}
              size={size}
              labelPosition={labelPosition}
              labelAlign={labelAlign}
              necessityIndicator={necessityIndicator}>
              {label}
            </FieldLabel>
            <Button
              ref={domRef}
              style={renderProps => pressScale(domRef)(renderProps)}
              className={renderProps => inputButton({
                ...renderProps,
                size: size,
                isOpen
              })}>
              {(renderProps) => (
                <>
                  <SelectValue className={valueStyles + ' ' + raw('&> * {display: none;}')}>
                    {({defaultChildren}) => {
                      return (
                        <Provider
                          values={[
                            [IconContext, {
                              slots: {
                                icon: {
                                  render: centerBaseline({slot: 'icon', className: iconCenterWrapper}),
                                  styles: icon
                                }
                              }
                            }],
                            [TextContext, {
                              slots: {
                                description: {},
                                label: {className: style({
                                  display: 'block',
                                  flexGrow: 1,
                                  truncate: true
                                })}
                              }
                            }]
                          ]}>
                          {defaultChildren}
                        </Provider>
                      );
                    }}
                  </SelectValue>
                  {isInvalid && (
                    <FieldErrorIcon isDisabled={isDisabled} />
                  )}
                  <ChevronIcon
                    size={size}
                    className={iconStyles} />
                  {isInvalid && !isDisabled &&
                    // @ts-ignore known limitation detecting functions from the theme
                    <div className={invalidBorder({...renderProps, size})} />
                  }
                </>
              )}
            </Button>
            <HelpText
              size={size}
              isDisabled={isDisabled}
              isInvalid={isInvalid}
              description={descriptionMessage}>
              {errorMessage}
            </HelpText>
            <Popover
              hideArrow
              offset={menuOffset}
              placement={`${direction} ${align}` as Placement}
              shouldFlip={shouldFlip}
              UNSAFE_style={{
                width: menuWidth ? `${menuWidth}px` : undefined
              }}
              styles={style({
                minWidth: {
                  default: '[var(--trigger-width)]'
                },
                width: '[var(--trigger-width)]'
              })}>
              <Provider
                values={[
                  [HeaderContext, {className: sectionHeader({size})}],
                  [HeadingContext, {className: sectionHeading}],
                  [IconContext, {
                    slots: {
                      icon: {render: centerBaseline({slot: 'icon', className: iconCenterWrapper}), styles: icon}
                    }
                  }],
                  [TextContext, {
                    slots: {
                      label: {className: labelStyles},
                      'description': {className: description({size})}
                    }
                  }]
                ]}>
                <ListBox
                  items={items}
                  className={menu({size})}>
                  {children}
                </ListBox>
              </Provider>
            </Popover>
          </InternalPickerContext.Provider>
        </>
      )}
    </AriaSelect>
  );
}

/**
 * Pickers allow users to choose a single option from a collapsible list of options when space is limited.
 */
let _Picker = /*#__PURE__*/ (forwardRef as forwardRefType)(Picker);
export {_Picker as Picker};

export interface PickerItemProps extends Omit<ListBoxItemProps, 'children' | 'style' | 'className'>, StyleProps {
  children: ReactNode
}

export function PickerItem(props: PickerItemProps) {
  let ref = useRef(null);
  let isLink = props.href != null;
  let {size} = useContext(InternalPickerContext);
  return (
    <ListBoxItem
      {...props}
      ref={ref}
      textValue={props.textValue || (typeof props.children === 'string' ? props.children as string : undefined)}
      style={pressScale(ref, props.UNSAFE_style)}
      className={renderProps => (props.UNSAFE_className || '') + menuitem({...renderProps, size, isLink}, props.styles)}>
      {(renderProps) => {
        let {children} = props;
        return (
          <>
            {!isLink && <CheckmarkIcon size={({S: 'S', M: 'L', L: 'XL', XL: 'XXL'} as const)[size]} className={checkmark({...renderProps, size})} />}
            {typeof children === 'string' ? <Text slot="label">{children}</Text> : children}
          </>
        );
      }}
    </ListBoxItem>
  );
}

export interface PickerSectionProps<T extends object> extends SectionProps<T> {}
export function PickerSection<T extends object>(props: PickerSectionProps<T>) {
  return (
    <>
      <AriaSection
        {...props}
        className={section}>
        {props.children}
      </AriaSection>
      <Divider />
    </>
  );
}
