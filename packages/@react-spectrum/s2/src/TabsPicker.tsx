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
  PopoverProps as AriaPopoverProps,
  Select as AriaSelect,
  SelectProps as AriaSelectProps,
  Button,
  ContextValue,
  DEFAULT_SLOT,
  ListBox,
  ListBoxItem,
  ListBoxItemProps,
  ListBoxProps,
  Provider,
  SelectValue
} from 'react-aria-components';
import {baseColor, focusRing, size, style} from '../style' with {type: 'macro'};
import {centerBaseline} from './CenterBaseline';
import {
  checkmark,
  description,
  icon,
  label,
  menuitem,
  sectionHeader,
  sectionHeading
} from './Menu';
import CheckmarkIcon from '../ui-icons/Checkmark';
import ChevronIcon from '../ui-icons/Chevron';
import {controlFont, fieldInput, StyleProps} from './style-utils' with {type: 'macro'};
import {edgeToText} from '../style/spectrum-theme' with {type: 'macro'};
import {
  FieldLabel
} from './Field';
import {FocusableRef, FocusableRefValue, PressEvent, SpectrumLabelableProps} from '@react-types/shared';
import {forwardRefType} from './types';
import {HeaderContext, HeadingContext, Text, TextContext} from './Content';
import {IconContext} from './Icon';
import {Placement, useLocale} from 'react-aria';
import {Popover} from './Popover';
import {PressResponder} from '@react-aria/interactions';
import {pressScale} from './pressScale';
import {raw} from '../style/style-macro' with {type: 'macro'};
import React, {createContext, forwardRef, ReactNode, useContext, useRef, useState} from 'react';
import {useFocusableRef} from '@react-spectrum/utils';
import {useFormProps} from './Form';
import {useGlobalListeners} from '@react-aria/utils';
import {useSpectrumContextProps} from './useSpectrumContextProps';
export interface PickerStyleProps {
}
export interface PickerProps<T extends object> extends
  Omit<AriaSelectProps<T>, 'children' | 'style' | 'className' | 'placeholder' | 'isTriggerUpWhenOpen'>,
  PickerStyleProps,
  StyleProps,
  SpectrumLabelableProps,
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
    menuWidth?: number,
    /** Density of the tabs, affects the height of the picker. */
    density: 'compact' | 'regular',
    /**
     * If the tab picker should only display icon and no text for the button label.
     * @default 'show
     */
    labelBehavior?: 'show' | 'hide',
    /** Id for the SelectedValue so we can label using it. */
    valueId?: string
}
export const PickerContext = createContext<ContextValue<Partial<PickerProps<any>>, FocusableRefValue<HTMLButtonElement>>>(null);
const inputButton = style({
  ...focusRing(),
  ...fieldInput(),
  outlineStyle: {
    default: 'none',
    isFocusVisible: 'solid'
  },
  position: 'relative',
  font: 'ui',
  display: 'flex',
  textAlign: 'start',
  borderStyle: 'none',
  borderRadius: 'sm',
  alignItems: 'center',
  transition: 'default',
  columnGap: 'text-to-visual',
  paddingX: 0,
  backgroundColor: 'transparent',
  color: {
    default: baseColor('neutral'),
    isDisabled: 'disabled'
  },
  maxWidth: {
    isQuiet: 'max'
  },
  disableTapHighlight: true,
  height: {
    default: 48,
    density: {
      compact: 32
    }
  },
  boxSizing: 'border-box'
});
export let menu = style({
  outlineStyle: 'none',
  display: 'grid',
  gridTemplateColumns: [edgeToText(32), 'auto', 'auto', 'minmax(0, 1fr)', 'auto', 'auto', 'auto', edgeToText(32)],
  boxSizing: 'border-box',
  width: 'full',
  maxHeight: 'inherit',
  overflow: 'auto',
  padding: 8,
  fontFamily: 'sans',
  fontSize: controlFont()
});
const valueStyles = style({
  flexGrow: 0,
  truncate: true,
  display: 'flex',
  alignItems: 'center',
  height: 'full'
});
const iconStyles = style({
  flexShrink: 0,
  rotate: 90,
  '--iconPrimary': {
    type: 'fill',
    value: 'currentColor'
  }
});
const iconCenterWrapper = style({
  display: 'flex',
  gridArea: 'icon',
  paddingStart: {
    labelBehavior: {
      hide: size(6)
    }
  }
});
let InsideSelectValueContext = createContext(false);
function Picker<T extends object>(props: PickerProps<T>, ref: FocusableRef<HTMLButtonElement>) {
  [props, ref] = useSpectrumContextProps(props, ref, PickerContext);
  let domRef = useFocusableRef(ref);
  props = useFormProps(props);
  let {
    direction = 'bottom',
    align = 'start',
    shouldFlip = true,
    children,
    items,
    density,
    labelBehavior = 'show',
    valueId,
    ...pickerProps
  } = props;
  let isQuiet = true;
  const menuOffset: number = 6;
  const size = 'M';
  let ariaLabelledby = props['aria-labelledby'] ?? '';
  let {direction: dir} = useLocale();
  let RTLFlipOffset = dir === 'rtl' ? -1 : 1;

  // For mouse interactions, pickers open on press start. When the popover underlay appears
  // it covers the trigger button, causing onPressEnd to fire immediately and no press scaling
  // to occur. We override this by listening for pointerup on the document ourselves.
  let [isPressed, setPressed] = useState(false);
  let {addGlobalListener} = useGlobalListeners();
  let onPressStart = (e: PressEvent) => {
    if (e.pointerType !== 'mouse') {
      return;
    }
    setPressed(true);
    addGlobalListener(document, 'pointerup', () => {
      setPressed(false);
    }, {once: true, capture: true});
  };

  return (
    <div>
      <AriaSelect
        {...pickerProps}
        isTriggerUpWhenOpen
        className=""
        aria-labelledby={`${labelBehavior === 'hide' ? valueId : ''} ${ariaLabelledby}`}>
        {({isOpen}) => (
          <>
            <FieldLabel isQuiet={isQuiet} />
            <PressResponder onPressStart={onPressStart} isPressed={isPressed}>
              <Button
                ref={domRef}
                style={renderProps => pressScale(domRef)(renderProps)}
                className={renderProps => inputButton({
                  ...renderProps,
                  size: 'M',
                  isOpen,
                  isQuiet,
                  density
                })}>
                <SelectValue className={valueStyles + ' ' + raw('&> * {display: none;}')}>
                  {({defaultChildren}) => {
                    return (
                      <Provider
                        values={[
                          [IconContext, {
                            slots: {
                              icon: {
                                render: centerBaseline({slot: 'icon', styles: iconCenterWrapper({labelBehavior})}),
                                styles: icon
                              }
                            }
                          }],
                          [TextContext, {
                            slots: {
                              // Default slot is useful when converting other collections to PickerItems.
                              [DEFAULT_SLOT]: {
                                id: valueId,
                                styles: style({
                                  display: {
                                    default: 'block',
                                    labelBehavior: {
                                      hide: 'none'
                                    }
                                  },
                                  flexGrow: 1,
                                  truncate: true
                                })({labelBehavior})
                              }
                            }
                          }],
                          [InsideSelectValueContext, true]
                        ]}>
                        {defaultChildren}
                      </Provider>
                    );
                  }}
                </SelectValue>
                <ChevronIcon
                  size={size}
                  className={iconStyles} />
              </Button>
            </PressResponder>
            <Popover
              hideArrow
              offset={menuOffset}
              crossOffset={RTLFlipOffset * -12}
              placement={`${direction} ${align}` as Placement}
              shouldFlip={shouldFlip}
              styles={style({
                minWidth: 192,
                width: 'calc(var(--trigger-width) - 24)'
              })}>
              <div
                className={style({
                  display: 'flex',
                  size: 'full'
                })}>
                <Provider
                  values={[
                    [HeaderContext, {styles: sectionHeader({size})}],
                    [HeadingContext, {
                      // @ts-ignore
                      role: 'presentation',
                      styles: sectionHeading
                    }],
                    [TextContext, {
                      slots: {
                        description: {styles: description({size})}
                      }
                    }]
                  ]}>
                  <ListBox
                    items={items}
                    className={menu}>
                    {children}
                  </ListBox>
                </Provider>
              </div>
            </Popover>
          </>
        )}
      </AriaSelect>
      <TabLine isDisabled={props.isDisabled} />
    </div>
  );
}
/**
 * Pickers allow users to choose a single option from a collapsible list of options when space is limited.
 */
let _Picker = /*#__PURE__*/ (forwardRef as forwardRefType)(Picker);
export {_Picker as Picker};


const selectedIndicator = style<{isDisabled?: boolean}>({
  backgroundColor: {
    default: 'neutral',
    isDisabled: 'disabled',
    forcedColors: {
      default: 'Highlight',
      isDisabled: 'GrayText'
    }
  },
  height: '[2px]',
  borderStyle: 'none',
  borderRadius: 'full',
  marginTop: '[-2px]',
  transitionDuration: 130,
  transitionTimingFunction: 'in-out'
});
function TabLine(props: {isDisabled?: boolean}) {
  return <div className={selectedIndicator(props)} />;
}


export interface PickerItemProps extends Omit<ListBoxItemProps, 'children' | 'style' | 'className'>, StyleProps {
  children: ReactNode
}
export function PickerItem(props: PickerItemProps): ReactNode {
  let ref = useRef(null);
  let isLink = props.href != null;
  const size = 'M';
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
          <DefaultProvider
            context={IconContext}
            value={{slots: {
              icon: {render: centerBaseline({slot: 'icon', styles: iconCenterWrapper({})}), styles: icon}
            }}}>
            <DefaultProvider
              context={TextContext}
              value={{
                slots: {
                  [DEFAULT_SLOT]: {styles: label({size})}
                }
              }}>
              {!isLink && <CheckmarkIcon size={size} className={checkmark({...renderProps, size})} />}
              {typeof children === 'string' ? <Text>{children}</Text> : children}
            </DefaultProvider>
          </DefaultProvider>
        );
      }}
    </ListBoxItem>
  );
}
// A Context.Provider that only sets a value if not inside SelectValue.
function DefaultProvider({context, value, children}: {context: React.Context<any>, value: any, children: any}) {
  let inSelectValue = useContext(InsideSelectValueContext);
  if (inSelectValue) {
    return children;
  }
  return <context.Provider value={value}>{children}</context.Provider>;
}
