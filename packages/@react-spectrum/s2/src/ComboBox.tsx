import {baseColor, style} from '../style/spectrum-theme' with {type: 'macro'};
import {
  Button,
  ComboBox as AriaComboBox,
  ComboBoxProps as AriaComboBoxProps,
  ListBox,
  ListBoxItem,
  ListBoxItemProps,
  Section as AriaSection,
  PopoverProps as AriaPopoverProps,
  ListBoxProps,
  Provider,
  SectionProps,
  InputContext
} from 'react-aria-components';
import {FieldErrorIcon, FieldGroup, FieldLabel, HelpText, Input} from './Field';
import {FocusableRef, HelpTextProps, SpectrumLabelableProps} from '@react-types/shared';
import {CSSProperties, ReactNode, createContext, forwardRef, useCallback, useContext, useImperativeHandle, useRef, useState} from 'react';
import {StyleProps, field, getAllowedOverrides} from './style-utils' with {type: 'macro'};
import {pressScale} from './pressScale';
import {
  checkmark,
  menuitem,
  description,
  icon,
  label,
  section,
  sectionHeader,
  sectionHeading,
  Divider,
  iconCenterWrapper
} from './Menu';
import {menu} from './Picker';
import CheckmarkIcon from '../ui-icons/Checkmark';
import ChevronIcon from '../ui-icons/Chevron';
import {centerBaseline} from './CenterBaseline';
import {IconContext} from './Icon';
import {HeaderContext, HeadingContext, Text, TextContext} from './Content';
import {Popover} from './Popover';
import {Placement} from 'react-aria';
import {createFocusableRef, useFocusableRef} from '@react-spectrum/utils';
import {FormContext, useFormProps} from './Form';
import {forwardRefType} from './types';
import {mergeRefs, useResizeObserver} from '@react-aria/utils';


export interface ComboboxStyleProps {
  /**
   * The size of the Combobox.
   *
   * @default "M"
   */
  size?: 'S' | 'M' | 'L' | 'XL'
}
export interface ComboBoxProps<T extends object> extends
  Omit<AriaComboBoxProps<T>, 'children' | 'style' | 'className' | 'defaultFilter' | 'allowsEmptyCollection'>,
  ComboboxStyleProps,
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

const inputButton = style({
  display: 'flex',
  outlineStyle: 'none',
  textAlign: 'center',
  borderStyle: 'none',
  borderRadius: 'control-sm',
  alignItems: 'center',
  justifyContent: 'center',
  size: {
    size: {
      S: 16,
      M: 20,
      L: 24,
      XL: 32
    }
  },
  marginStart: 'text-to-control',
  aspectRatio: 'square',
  flexShrink: 0,
  transition: 'default',
  backgroundColor: {
    default: baseColor('gray-100'),
    isOpen: 'gray-200',
    isDisabled: 'disabled'
  },
  color: {
    default: 'neutral',
    isDisabled: 'disabled'
  }
});

const iconStyles = style({
  flexShrink: 0,
  rotate: 90,
  '--iconPrimary': {
    type: 'fill',
    value: 'currentColor'
  }
});

let InternalComboboxContext = createContext<{size: 'S' | 'M' | 'L' | 'XL'}>({size: 'M'});

function ComboBox<T extends object>(props: ComboBoxProps<T>, ref: FocusableRef<HTMLDivElement>) {
  let domRef = useFocusableRef(ref);
  let inputRef = useRef<HTMLInputElement>(null);
  let buttonRef = useRef<HTMLButtonElement>(null);
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
    ...pickerProps
  } = props;

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

  let triggerRef = useRef<HTMLDivElement>(null);
   // Make menu width match input + button
  let [triggerWidth, setTriggerWidth] = useState<string | null>(null);
  let onResize = useCallback(() => {
    if (triggerRef.current) {
      let inputRect = triggerRef.current.getBoundingClientRect();
      let minX = inputRect.left;
      let maxX = inputRect.right;
      setTriggerWidth((maxX - minX) + 'px');
    }
  }, [triggerRef, setTriggerWidth]);

  useResizeObserver({
    ref: triggerRef,
    onResize: onResize
  });

  return (
    <AriaComboBox
      {...pickerProps}
      style={UNSAFE_style}
      className={UNSAFE_className + style(field(), getAllowedOverrides())({
        isInForm: !!formContext,
        labelPosition,
        size
      }, props.styles)}>
      {({isDisabled, isOpen, isRequired, isInvalid}) => (
        <>
          <InternalComboboxContext.Provider value={{size}}>
            <FieldLabel
              isDisabled={isDisabled}
              isRequired={isRequired}
              size={size}
              labelPosition={labelPosition}
              labelAlign={labelAlign}
              necessityIndicator={necessityIndicator}>
              {label}
            </FieldLabel>
            <FieldGroup
              ref={triggerRef}
              role="presentation"
              isDisabled={isDisabled}
              isInvalid={isInvalid}
              size={size}
              styles={style({
                paddingStart: 'edge-to-text',
                // better way to do this one? it's not actually half, they are
                // [9, 4], [12, 6], [15, 8], [18, 8]
                // also noticed that our measurement is including the border, making the padding too much
                paddingEnd: '[calc(self(height, self(minHeight)) * 3 / 16)]',
                width: {
                  default: 208,
                  size: {
                    S: 192,
                    L: 224,
                    XL: 240
                  }
                }
              })({size})}>
              <InputContext.Consumer>
                {ctx => (
                  <InputContext.Provider value={{...ctx, ref: mergeRefs((ctx as any)?.ref, inputRef)}}>
                    <Input />
                  </InputContext.Provider>
                )}
              </InputContext.Consumer>
              {isInvalid && <FieldErrorIcon isDisabled={isDisabled} />}
              <Button
                ref={buttonRef}
                style={renderProps => pressScale(buttonRef)(renderProps)}
                className={renderProps => inputButton({
                  ...renderProps,
                  size,
                  isOpen
                })}>
                <ChevronIcon
                  size={size}
                  className={iconStyles} />
              </Button>
            </FieldGroup>
            <HelpText
              size={size}
              isDisabled={isDisabled}
              isInvalid={isInvalid}
              description={descriptionMessage}>
              {errorMessage}
            </HelpText>
            <Popover
              hideArrow
              triggerRef={triggerRef}
              offset={menuOffset}
              placement={`${direction} ${align}` as Placement}
              shouldFlip={shouldFlip}
              UNSAFE_style={{
                width: menuWidth ? `${menuWidth}px` : undefined,
                // manually subtract border as we can't set Popover to border-box, it causes the contents to spill out
                '--trigger-width': `calc(${triggerWidth} - 2px)`
              } as CSSProperties}
              styles={style({
                minWidth: '[var(--trigger-width)]',
                width: '[var(--trigger-width)]'
              })}>
              <Provider
                values={[
                  [HeaderContext, {className: sectionHeader({size})}],
                  [HeadingContext, {className: sectionHeading}],
                  [TextContext, {
                    slots: {
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
          </InternalComboboxContext.Provider>
        </>
      )}
    </AriaComboBox>
  );
}

/**
 * ComboBox allow users to choose a single option from a collapsible list of options when space is limited.
 */
let _ComboBox = /*#__PURE__*/ (forwardRef as forwardRefType)(ComboBox);
export {_ComboBox as ComboBox};


export interface ComboBoxItemProps extends Omit<ListBoxItemProps, 'children' | 'style' | 'className'>, StyleProps {
  children: ReactNode
}

export function ComboBoxItem(props: ComboBoxItemProps) {
  let ref = useRef(null);
  let isLink = props.href != null;
  let {size} = useContext(InternalComboboxContext);
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
            <Provider
              values={[
                [IconContext, {
                  slots: {
                    icon: {render: centerBaseline({slot: 'icon', className: iconCenterWrapper}), styles: icon}
                  }
                }],
                [TextContext, {
                  slots: {
                    label: {className: label},
                    description: {className: description({size})}
                  }
                }]
              ]}>
              {!isLink && <CheckmarkIcon size={({S: 'S', M: 'L', L: 'XL', XL: 'XXL'} as const)[size]} className={checkmark({...renderProps, size})} />}
              {typeof children === 'string' ? <Text slot="label">{children}</Text> : children}
            </Provider>
          </>
        );
      }}
    </ListBoxItem>
  );
}

export interface ComboBoxSectionProps<T extends object> extends SectionProps<T> {}
export function ComboBoxSection<T extends object>(props: ComboBoxSectionProps<T>) {
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
