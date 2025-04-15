/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {
  ComboBox as AriaComboBox,
  ComboBoxProps as AriaComboBoxProps,
  ListBoxSection as AriaListBoxSection,
  PopoverProps as AriaPopoverProps,
  Button,
  ContextValue,
  InputContext,
  ListBox,
  ListBoxItem,
  ListBoxItemProps,
  ListBoxProps,
  ListLayout,
  Provider,
  SectionProps,
  Separator,
  SeparatorProps,
  Virtualizer
} from 'react-aria-components';
import {baseColor, edgeToText, focusRing, size, space, style} from '../style' with {type: 'macro'};
import {centerBaseline} from './CenterBaseline';
import {centerPadding, field, fieldInput, getAllowedOverrides, StyleProps} from './style-utils' with {type: 'macro'};
import {
  checkmark,
  description,
  icon,
  iconCenterWrapper,
  label
} from './Menu';
import CheckmarkIcon from '../ui-icons/Checkmark';
import ChevronIcon from '../ui-icons/Chevron';
import {createContext, CSSProperties, forwardRef, ReactNode, Ref, useCallback, useContext, useImperativeHandle, useRef, useState} from 'react';
import {createFocusableRef} from '@react-spectrum/utils';
import {divider} from './Divider';
import {FieldErrorIcon, FieldGroup, FieldLabel, HelpText, Input} from './Field';
import {FormContext, useFormProps} from './Form';
import {forwardRefType} from './types';
import {HeaderContext, HeadingContext, Text, TextContext} from './Content';
import {HelpTextProps, SpectrumLabelableProps} from '@react-types/shared';
import {IconContext} from './Icon';
import {mergeRefs, useResizeObserver} from '@react-aria/utils';
import {mergeStyles} from '../style/runtime';
import {Placement} from 'react-aria';
import {PopoverBase} from './Popover';
import {pressScale} from './pressScale';
import {TextFieldRef} from '@react-types/textfield';
import {useSpectrumContextProps} from './useSpectrumContextProps';

export interface ComboboxStyleProps {
  /**
   * The size of the Combobox.
   *
   * @default 'M'
   */
  size?: 'S' | 'M' | 'L' | 'XL'
}
export interface ComboBoxProps<T extends object> extends
  Omit<AriaComboBoxProps<T>, 'children' | 'style' | 'className' | 'defaultFilter' | 'allowsEmptyCollection'>,
  ComboboxStyleProps,
  StyleProps,
  SpectrumLabelableProps,
  HelpTextProps,
  Pick<ListBoxProps<T>, 'items'>,
  Pick<AriaPopoverProps, 'shouldFlip'> {
    /** The contents of the collection. */
    children: ReactNode | ((item: T) => ReactNode),
    /**
     * Direction the menu will render relative to the Picker.
     *
     * @default 'bottom'
     */
    direction?: 'bottom' | 'top',
    /**
     * Alignment of the menu relative to the input target.
     *
     * @default 'start'
     */
    align?: 'start' | 'end',
    /** Width of the menu. By default, matches width of the trigger. Note that the minimum width of the dropdown is always equal to the trigger's width. */
    menuWidth?: number
}

export const ComboBoxContext = createContext<ContextValue<Partial<ComboBoxProps<any>>, TextFieldRef>>(null);

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
  transition: {
    default: 'default',
    forcedColors: 'none'
  },
  backgroundColor: {
    default: baseColor('gray-100'),
    isOpen: 'gray-200',
    isDisabled: 'disabled',
    forcedColors: {
      default: 'ButtonText',
      isHovered: 'Highlight',
      isOpen: 'Highlight',
      isDisabled: 'GrayText'
    }
  },
  color: {
    default: 'neutral',
    isDisabled: 'disabled',
    forcedColors: {
      default: 'ButtonFace'
    }
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

export let listbox = style({
  width: 'full',
  boxSizing: 'border-box',
  maxHeight: '[inherit]',
  overflow: 'auto',
  fontFamily: 'sans',
  fontSize: 'control'
});

export let listboxItem = style({
  ...focusRing(),
  boxSizing: 'border-box',
  borderRadius: 'control',
  font: 'control',
  '--labelPadding': {
    type: 'paddingTop',
    value: centerPadding()
  },
  paddingBottom: '--labelPadding',
  backgroundColor: { // TODO: revisit color when I have access to dev mode again
    default: {
      default: 'transparent',
      isFocused: baseColor('gray-100').isFocusVisible
    }
  },
  color: {
    default: 'neutral',
    isDisabled: {
      default: 'disabled',
      forcedColors: 'GrayText'
    }
  },
  position: 'relative',
  // each menu item should take up the entire width, the subgrid will handle within the item
  gridColumnStart: 1,
  gridColumnEnd: -1,
  display: 'grid',
  gridTemplateAreas: [
    '. checkmark icon label       value keyboard descriptor .',
    '. .         .    description .     .        .          .'
  ],
  gridTemplateColumns: {
    size: {
      S: [edgeToText(24), 'auto', 'auto', 'minmax(0, 1fr)', 'auto', 'auto', 'auto', edgeToText(24)],
      M: [edgeToText(32), 'auto', 'auto', 'minmax(0, 1fr)', 'auto', 'auto', 'auto', edgeToText(32)],
      L: [edgeToText(40), 'auto', 'auto', 'minmax(0, 1fr)', 'auto', 'auto', 'auto', edgeToText(40)],
      XL: [edgeToText(48), 'auto', 'auto', 'minmax(0, 1fr)', 'auto', 'auto', 'auto', edgeToText(48)]
    }
  },
  gridTemplateRows: {
    // min-content prevents second row from 'auto'ing to a size larger then 0 when empty
    default: 'auto minmax(0, min-content)',
    ':has([slot=description])': 'auto auto'
  },
  rowGap: {
    ':has([slot=description])': space(1)
  },
  alignItems: 'baseline',
  minHeight: 'control',
  height: 'min',
  textDecoration: 'none',
  cursor: {
    default: 'default',
    isLink: 'pointer'
  },
  transition: 'default'
}, getAllowedOverrides());

export let listboxHeader = style<{size?: 'S' | 'M' | 'L' | 'XL'}>({
  color: 'neutral',
  boxSizing: 'border-box',
  minHeight: 'control',
  paddingY: centerPadding(),
  display: 'grid',
  gridTemplateAreas: [
    '. checkmark icon label       value keyboard descriptor .',
    '. .         .    description .     .        .          .'
  ],
  gridTemplateColumns: {
    size: {
      S: [edgeToText(24), 'auto', 'auto', 'minmax(0, 1fr)', 'auto', 'auto', 'auto', edgeToText(24)],
      M: [edgeToText(32), 'auto', 'auto', 'minmax(0, 1fr)', 'auto', 'auto', 'auto', edgeToText(32)],
      L: [edgeToText(40), 'auto', 'auto', 'minmax(0, 1fr)', 'auto', 'auto', 'auto', edgeToText(40)],
      XL: [edgeToText(48), 'auto', 'auto', 'minmax(0, 1fr)', 'auto', 'auto', 'auto', edgeToText(48)]
    }
  },
  rowGap: {
    ':has([slot=description])': space(1)
  }
});

export let listboxHeading = style({
  font: 'ui',
  fontWeight: 'bold',
  margin: 0,
  gridColumnStart: 2,
  gridColumnEnd: -2
});

// not sure why edgeToText won't work...
const separator = style({
  display: {
    ':is(:last-child > &)': 'none',
    default: 'grid'
  },
  // marginX: {
  //   size: {
  //     S: edgeToText(24),
  //     M: edgeToText(32),
  //     L: edgeToText(40),
  //     XL: edgeToText(48)
  //   }
  // },
  marginX: {
    size: {
      S: '[calc(24 * 3 / 8)]',
      M: '[calc(32 * 3 / 8)]',
      L: '[calc(40 * 3 / 8)]',
      XL: '[calc(48 * 3 / 8)]'
    }
  },
  marginY: size(5) // height of the menu separator is 12px, and the divider is 2px
});

let InternalComboboxContext = createContext<{size: 'S' | 'M' | 'L' | 'XL'}>({size: 'M'});

/**
 * ComboBox allow users to choose a single option from a collapsible list of options when space is limited.
 */
export const ComboBox = /*#__PURE__*/ (forwardRef as forwardRefType)(function ComboBox<T extends object>(props: ComboBoxProps<T>, ref: Ref<TextFieldRef>) {
  [props, ref] = useSpectrumContextProps(props, ref, ComboBoxContext);
  let inputRef = useRef<HTMLInputElement>(null);
  let domRef = useRef<HTMLDivElement>(null);
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
              necessityIndicator={necessityIndicator}
              contextualHelp={props.contextualHelp}>
              {label}
            </FieldLabel>
            <FieldGroup
              ref={triggerRef}
              role="presentation"
              isDisabled={isDisabled}
              isInvalid={isInvalid}
              size={size}
              styles={style({
                ...fieldInput(),
                paddingStart: 'edge-to-text',
                // better way to do this one? it's not actually half, they are
                // [9, 4], [12, 6], [15, 8], [18, 8]
                // also noticed that our measurement is including the border, making the padding too much
                paddingEnd: '[calc(self(height, self(minHeight)) * 3 / 16)]'
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
                // Prevent press scale from sticking while ComboBox is open.
                // @ts-ignore
                isPressed={false}
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
            <PopoverBase
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
                  [HeaderContext, {styles: listboxHeader({size})}],
                  [HeadingContext, {styles: listboxHeading}],
                  [TextContext, {
                    slots: {
                      'description': {styles: description({size})}
                    }
                  }]
                ]}>
                <Virtualizer
                  layout={ListLayout}
                  layoutOptions={{
                    estimatedRowHeight: 32,
                    padding: 8,
                    estimatedHeadingHeight: 50,
                    separatorHeight: 12
                  }}>
                  <ListBox
                    items={items}
                    className={listbox}>
                    {children}
                  </ListBox>
                </Virtualizer>
              </Provider>
            </PopoverBase>
          </InternalComboboxContext.Provider>
        </>
      )}
    </AriaComboBox>
  );
});

export interface ComboBoxItemProps extends Omit<ListBoxItemProps, 'children' | 'style' | 'className'>, StyleProps {
  children: ReactNode
}

const checkmarkIconSize = {
  S: 'XS',
  M: 'M',
  L: 'L',
  XL: 'XL'
} as const;

export function ComboBoxItem(props: ComboBoxItemProps): ReactNode {
  let ref = useRef(null);
  let isLink = props.href != null;
  let {size} = useContext(InternalComboboxContext);
  return (
    <ListBoxItem
      {...props}
      ref={ref}
      textValue={props.textValue || (typeof props.children === 'string' ? props.children as string : undefined)}
      style={pressScale(ref, props.UNSAFE_style)}
      className={renderProps => (props.UNSAFE_className || '') + listboxItem({...renderProps, size, isLink}, props.styles)}>
      {(renderProps) => {
        let {children} = props;
        return (
          <>
            <Provider
              values={[
                [IconContext, {
                  slots: {
                    icon: {render: centerBaseline({slot: 'icon', styles: iconCenterWrapper}), styles: icon}
                  }
                }],
                [TextContext, {
                  slots: {
                    label: {styles: label({size})},
                    description: {styles: description({...renderProps, size})}
                  }
                }]
              ]}>
              {!isLink && <CheckmarkIcon size={checkmarkIconSize[size]} className={checkmark({...renderProps, size})} />}
              {typeof children === 'string' ? <Text slot="label">{children}</Text> : children}
            </Provider>
          </>
        );
      }}
    </ListBoxItem>
  );
}

export interface ComboBoxSectionProps<T extends object> extends SectionProps<T> {}
export function ComboBoxSection<T extends object>(props: ComboBoxSectionProps<T>): ReactNode {
  let {size} = useContext(InternalComboboxContext);
  return (
    <>
      <AriaListBoxSection
        {...props}>
        {props.children}
      </AriaListBoxSection>
      <Divider size={size} />
    </>
  );
}

export function Divider(props: SeparatorProps & {size?: 'S' | 'M' | 'L' | 'XL' | undefined}): ReactNode {
  let {
    size,
    ...otherProps
  } = props;
  
  return (
    <Separator
      {...otherProps}
      className={mergeStyles(
        divider({
          size: 'M',
          orientation: 'horizontal',
          isStaticColor: false
        }), separator({size}))} />
  );
}
