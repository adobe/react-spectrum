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
  ListBoxSection as AriaListBoxSection,
  PopoverProps as AriaPopoverProps,
  Select as AriaSelect,
  SelectProps as AriaSelectProps,
  SelectRenderProps as AriaSelectRenderProps,
  Button,
  ButtonRenderProps,
  Collection,
  ContextValue,
  ListBox,
  ListBoxItem,
  ListBoxItemProps,
  ListBoxProps,
  ListLayout,
  Provider,
  SectionProps,
  SelectValue,
  UNSTABLE_ListBoxLoadingSentinel,
  Virtualizer
} from 'react-aria-components';
import {AsyncLoadable, FocusableRef, FocusableRefValue, HelpTextProps, LoadingState, PressEvent, RefObject, SpectrumLabelableProps} from '@react-types/shared';
import {baseColor, edgeToText, focusRing, style} from '../style' with {type: 'macro'};
import {centerBaseline} from './CenterBaseline';
import {
  checkmark,
  description,
  icon,
  iconCenterWrapper,
  label,
  sectionHeading
} from './Menu';
import CheckmarkIcon from '../ui-icons/Checkmark';
import ChevronIcon from '../ui-icons/Chevron';
import {control, controlBorderRadius, controlFont, field, fieldInput, getAllowedOverrides, StyleProps} from './style-utils' with {type: 'macro'};
import {createHideableComponent} from '@react-aria/collections';
import {
  Divider,
  listbox,
  listboxHeader,
  listboxItem,
  LOADER_ROW_HEIGHTS
} from './ComboBox';
import {
  FieldErrorIcon,
  FieldLabel,
  HelpText
} from './Field';
import {FormContext, useFormProps} from './Form';
import {forwardRefType} from './types';
import {HeaderContext, HeadingContext, Text, TextContext} from './Content';
import {IconContext} from './Icon';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {Placement} from 'react-aria';
import {PopoverBase} from './Popover';
import {PressResponder} from '@react-aria/interactions';
import {pressScale} from './pressScale';
import {ProgressCircle} from './ProgressCircle';
import {raw} from '../style/style-macro' with {type: 'macro'};
import React, {createContext, forwardRef, ReactNode, useContext, useMemo, useRef, useState} from 'react';
import {useFocusableRef} from '@react-spectrum/utils';
import {useGlobalListeners, useSlotId} from '@react-aria/utils';
import {useLocalizedStringFormatter} from '@react-aria/i18n';
import {useScale} from './utils';
import {useSpectrumContextProps} from './useSpectrumContextProps';

export interface PickerStyleProps {
  /**
   * The size of the Picker.
   *
   * @default 'M'
   */
  size?: 'S' | 'M' | 'L' | 'XL',
  /**
   * Whether the picker should be displayed with a quiet style.
   * @private
   */
  isQuiet?: boolean
}

export interface PickerProps<T extends object> extends
  Omit<AriaSelectProps<T>, 'children' | 'style' | 'className'>,
  PickerStyleProps,
  StyleProps,
  SpectrumLabelableProps,
  HelpTextProps,
  Pick<ListBoxProps<T>, 'items'>,
  Pick<AriaPopoverProps, 'shouldFlip'>,
  Pick<AsyncLoadable, 'onLoadMore'> {
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
    /** The current loading state of the Picker. */
    loadingState?: LoadingState
}

interface PickerButtonProps extends PickerStyleProps, ButtonRenderProps {}

export const PickerContext = createContext<ContextValue<Partial<PickerProps<any>>, FocusableRefValue<HTMLButtonElement>>>(null);

const inputButton = style<PickerButtonProps | AriaSelectRenderProps>({
  ...focusRing(),
  ...control({shape: 'default', icon: true}),
  ...fieldInput(),
  outlineStyle: {
    default: 'none',
    isFocusVisible: 'solid',
    isQuiet: 'none'
  },
  position: 'relative',
  textAlign: 'start',
  borderStyle: {
    default: 'none',
    forcedColors: 'solid'
  },
  borderColor: {
    forcedColors: {
      default: 'ButtonText',
      isDisabled: 'GrayText'
    }
  },
  transition: 'default',
  paddingX: {
    default: 'edge-to-text',
    isQuiet: 0
  },
  backgroundColor: {
    default: baseColor('gray-100'),
    isOpen: 'gray-200',
    isDisabled: 'disabled',
    isQuiet: 'transparent'
  },
  color: {
    default: baseColor('neutral'),
    isDisabled: 'disabled'
  },
  maxWidth: {
    isQuiet: 'max'
  },
  disableTapHighlight: true
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

export let menu = style({
  outlineStyle: 'none',
  display: 'grid',
  width: 'full',
  gridTemplateColumns: {
    size: {
      S: [edgeToText(24), 'auto', 'auto', 'minmax(0, 1fr)', 'auto', 'auto', 'auto', edgeToText(24)],
      M: [edgeToText(32), 'auto', 'auto', 'minmax(0, 1fr)', 'auto', 'auto', 'auto', edgeToText(32)],
      L: [edgeToText(40), 'auto', 'auto', 'minmax(0, 1fr)', 'auto', 'auto', 'auto', edgeToText(40)],
      XL: [edgeToText(48), 'auto', 'auto', 'minmax(0, 1fr)', 'auto', 'auto', 'auto', edgeToText(48)]
    }
  },
  boxSizing: 'border-box',
  maxHeight: 'inherit',
  overflow: 'auto',
  padding: 8,
  fontFamily: 'sans',
  fontSize: controlFont(),
  gridAutoRows: 'min-content'
});

const invalidBorder = style({
  ...controlBorderRadius(),
  position: 'absolute',
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
  pointerEvents: 'none',
  borderStyle: 'solid',
  borderWidth: 2,
  borderColor: baseColor('negative'),
  transition: 'default'
});

const valueStyles = style({
  flexGrow: {
    default: 1,
    isQuiet: 0
  },
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
  },
  color: {
    isLoading: 'disabled'
  }
});

const loadingWrapperStyles = style({
  gridColumnStart: '1',
  gridColumnEnd: '-1',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginY: 8
});

const progressCircleStyles = style({
  size: {
    size: {
      S: 16,
      M: 20,
      L: 22,
      XL: 26
    }
  }
});

let InternalPickerContext = createContext<{size: 'S' | 'M' | 'L' | 'XL'}>({size: 'M'});
let InsideSelectValueContext = createContext(false);

/**
 * Pickers allow users to choose a single option from a collapsible list of options when space is limited.
 */
export const Picker = /*#__PURE__*/ (forwardRef as forwardRefType)(function Picker<T extends object>(props: PickerProps<T>, ref: FocusableRef<HTMLButtonElement>) {
  let stringFormatter = useLocalizedStringFormatter(intlMessages, '@react-spectrum/s2');
  [props, ref] = useSpectrumContextProps(props, ref, PickerContext);
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
    placeholder = stringFormatter.format('picker.placeholder'),
    isQuiet,
    loadingState,
    onLoadMore,
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

  let renderer;
  let showButtonSpinner = useMemo(() => loadingState === 'loading', [loadingState]);
  let spinnerId = useSlotId([showButtonSpinner]);

  let listBoxLoadingCircle = (
    <UNSTABLE_ListBoxLoadingSentinel
      className={loadingWrapperStyles}
      isLoading={loadingState === 'loadingMore'}
      onLoadMore={onLoadMore}>
      <PickerProgressCircle size={size} aria-label={stringFormatter.format('table.loadingMore')} />
    </UNSTABLE_ListBoxLoadingSentinel>
  );

  if (typeof children === 'function' && items) {
    renderer = (
      <>
        <Collection items={items}>
          {children}
        </Collection>
        {listBoxLoadingCircle}
      </>
    );
  } else {
    renderer = (
      <>
        {children}
        {listBoxLoadingCircle}
      </>
    );
  }
  let scale = useScale();

  return (
    <AriaSelect
      {...pickerProps}
      aria-describedby={spinnerId}
      placeholder={placeholder}
      style={UNSAFE_style}
      className={UNSAFE_className + style(field(), getAllowedOverrides())({
        isInForm: !!formContext,
        labelPosition,
        size
      }, props.styles)}>
      {({isDisabled, isOpen, isFocusVisible, isInvalid, isRequired}) => (
        <>
          <InternalPickerContext.Provider value={{size}}>
            <FieldLabel
              isDisabled={isDisabled}
              isRequired={isRequired}
              size={size}
              labelPosition={labelPosition}
              labelAlign={labelAlign}
              isQuiet={isQuiet}
              necessityIndicator={necessityIndicator}
              contextualHelp={props.contextualHelp}>
              {label}
            </FieldLabel>
            <PickerButton
              loadingState={loadingState}
              isOpen={isOpen}
              isQuiet={isQuiet}
              isFocusVisible={isFocusVisible}
              size={size}
              isInvalid={isInvalid}
              isDisabled={isDisabled}
              buttonRef={domRef}
              loadingCircle={
                <PickerProgressCircle
                  id={spinnerId}
                  size={size}
                  aria-label={stringFormatter.format('table.loading')} />
              } />
            <HelpText
              size={size}
              isDisabled={isDisabled}
              isInvalid={isInvalid}
              description={descriptionMessage}>
              {errorMessage}
            </HelpText>
            <Virtualizer
              layout={ListLayout}
              layoutOptions={{
                estimatedRowHeight: 32,
                estimatedHeadingHeight: 50,
                padding: 8,
                loaderHeight: LOADER_ROW_HEIGHTS[size][scale]}}>
              <PopoverBase
                hideArrow
                offset={menuOffset}
                placement={`${direction} ${align}` as Placement}
                shouldFlip={shouldFlip}
                UNSAFE_style={{
                  width: menuWidth && !isQuiet ? `${menuWidth}px` : undefined
                }}
                styles={style({
                  marginStart: {
                    isQuiet: -12
                  },
                  minWidth: {
                    default: '[var(--trigger-width)]',
                    isQuiet: 192
                  },
                  width: {
                    default: '[var(--trigger-width)]',
                    isQuiet: '[calc(var(--trigger-width) + (-2 * self(marginStart)))]'
                  }
                })(props)}>
                <Provider
                  values={[
                    [HeaderContext, {styles: listboxHeader({size})}],
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
                    className={listbox({size})}>
                    {renderer}
                  </ListBox>
                </Provider>
              </PopoverBase>
            </Virtualizer>
          </InternalPickerContext.Provider>
        </>
      )}
    </AriaSelect>
  );
});

function PickerProgressCircle(props) {
  let {
    id,
    size,
    'aria-label': ariaLabel
  } = props;
  return (
    <ProgressCircle
      id={id}
      isIndeterminate
      size="S"
      aria-label={ariaLabel}
      styles={progressCircleStyles({size})} />
  );
}

interface PickerButtonInnerProps<T extends object> extends PickerStyleProps, Omit<AriaSelectRenderProps, 'isRequired' | 'isFocused'>, Pick<PickerProps<T>, 'loadingState'> {
  loadingCircle: ReactNode,
  buttonRef: RefObject<HTMLButtonElement | null>
}

// Needs to be hidable component or otherwise the PressResponder throws a warning when rendered in the fake DOM and tries to register
const PickerButton = createHideableComponent(function PickerButton<T extends object>(props: PickerButtonInnerProps<T>) {
  let {
    isOpen,
    isQuiet,
    isFocusVisible,
    size,
    isInvalid,
    isDisabled,
    loadingState,
    loadingCircle,
    buttonRef
  } = props;

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
    <PressResponder onPressStart={onPressStart} isPressed={isPressed}>
      <Button
        ref={buttonRef}
        style={renderProps => pressScale(buttonRef)(renderProps)}
        // Prevent press scale from sticking while Picker is open.
        // @ts-ignore
        isPressed={false}
        className={renderProps => inputButton({
          ...renderProps,
          size: size,
          isOpen,
          isQuiet
        })}>
        {(renderProps) => (
          <>
            <SelectValue className={valueStyles({isQuiet}) + ' ' + raw('&> * {display: none;}')}>
              {({defaultChildren}) => {
                return (
                  <Provider
                    values={[
                      [IconContext, {
                        slots: {
                          icon: {
                            render: centerBaseline({slot: 'icon', styles: iconCenterWrapper}),
                            styles: icon
                          }
                        }
                      }],
                      [TextContext, {
                        slots: {
                          description: {},
                          label: {styles: style({
                            display: 'block',
                            flexGrow: 1,
                            truncate: true
                          })}
                        }
                      }],
                      [InsideSelectValueContext, true]
                    ]}>
                    {defaultChildren}
                  </Provider>
                );
              }}
            </SelectValue>
            {isInvalid && <FieldErrorIcon isDisabled={isDisabled} />}
            {loadingState === 'loading' && !isOpen && loadingCircle}
            <ChevronIcon
              size={size}
              className={iconStyles({isLoading: loadingState === 'loading'})} />
            {isFocusVisible && isQuiet && <span className={quietFocusLine} /> }
            {isInvalid && !isDisabled && !isQuiet &&
              // @ts-ignore known limitation detecting functions from the theme
              <div className={invalidBorder({...renderProps, size})} />
            }
          </>
        )}
      </Button>
    </PressResponder>
  );
});

export interface PickerItemProps extends Omit<ListBoxItemProps, 'children' | 'style' | 'className'>, StyleProps {
  children: ReactNode
}

const checkmarkIconSize = {
  S: 'XS',
  M: 'M',
  L: 'L',
  XL: 'XL'
} as const;

export function PickerItem(props: PickerItemProps): ReactNode {
  let ref = useRef(null);
  let isLink = props.href != null;
  let {size} = useContext(InternalPickerContext);
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
          <DefaultProvider
            context={IconContext}
            value={{slots: {
              icon: {render: centerBaseline({slot: 'icon', styles: iconCenterWrapper}), styles: icon}
            }}}>
            <DefaultProvider
              context={TextContext}
              value={{
                slots: {
                  label: {styles: label({size})},
                  description: {styles: description({...renderProps, size})}
                }
              }}>
              {!isLink && <CheckmarkIcon size={checkmarkIconSize[size]} className={checkmark({...renderProps, size})} />}
              {typeof children === 'string' ? <Text slot="label">{children}</Text> : children}
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

export interface PickerSectionProps<T extends object> extends SectionProps<T> {}
export function PickerSection<T extends object>(props: PickerSectionProps<T>): ReactNode {
  let {size} = useContext(InternalPickerContext);
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
