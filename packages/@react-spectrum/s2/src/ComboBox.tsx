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
  ButtonRenderProps,
  Collection,
  ComboBoxStateContext,
  ContextValue,
  InputContext,
  ListBox,
  ListBoxItem,
  ListBoxItemProps,
  ListBoxProps,
  ListLayout,
  ListStateContext,
  Provider,
  SectionProps,
  UNSTABLE_ListBoxLoadingSentinel,
  Virtualizer
} from 'react-aria-components';
import {AsyncLoadable, HelpTextProps, LoadingState, SpectrumLabelableProps} from '@react-types/shared';
import {baseColor, edgeToText, focusRing, space, style} from '../style' with {type: 'macro'};
import {centerBaseline} from './CenterBaseline';
import {centerPadding, control, controlBorderRadius, controlFont, controlSize, field, fieldInput, getAllowedOverrides, StyleProps} from './style-utils' with {type: 'macro'};
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
import {createContext, CSSProperties, ForwardedRef, forwardRef, ReactNode, Ref, useCallback, useContext, useEffect, useImperativeHandle, useMemo, useRef, useState} from 'react';
import {createFocusableRef} from '@react-spectrum/utils';
import {createLeafComponent} from '@react-aria/collections';
import {FieldErrorIcon, FieldGroup, FieldLabel, HelpText, Input} from './Field';
import {FormContext, useFormProps} from './Form';
import {forwardRefType} from './types';
import {HeaderContext, HeadingContext, Text, TextContext} from './Content';
import {IconContext} from './Icon';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {mergeRefs, useResizeObserver, useSlotId} from '@react-aria/utils';
import {Node} from 'react-stately';
import {Placement} from 'react-aria';
import {PopoverBase} from './Popover';
import {pressScale} from './pressScale';
import {ProgressCircle} from './ProgressCircle';
import {TextFieldRef} from '@react-types/textfield';
import {useLocalizedStringFormatter} from '@react-aria/i18n';
import {useScale} from './utils';
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
  Pick<AriaPopoverProps, 'shouldFlip'>,
  Pick<AsyncLoadable, 'onLoadMore'>  {
    /** The contents of the collection. */
    children: ReactNode | ((item: T) => ReactNode),
    /**
     * Direction the menu will render relative to the ComboBox.
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
    /** The current loading state of the ComboBox. Determines whether or not the progress circle should be shown. */
    loadingState?: LoadingState
}

export const ComboBoxContext = createContext<ContextValue<Partial<ComboBoxProps<any>>, TextFieldRef>>(null);

const inputButton = style<ButtonRenderProps & {isOpen: boolean, size: 'S' | 'M' | 'L' | 'XL'}>({
  ...controlBorderRadius('sm'),
  display: 'flex',
  outlineStyle: 'none',
  textAlign: 'center',
  borderStyle: 'none',
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
    default: baseColor('neutral'),
    isDisabled: 'disabled',
    forcedColors: 'ButtonFace'
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
  },
  marginStart: {
    isInput: 'text-to-visual'
  }
});

const emptyStateText = style({
  height: {
    size: {
      S: 24,
      M: 32,
      L: 40,
      XL: 48
    }
  },
  font: {
    size: {
      S: 'ui-sm',
      M: 'ui',
      L: 'ui-lg',
      XL: 'ui-xl'
    }
  },
  display: 'flex',
  alignItems: 'center',
  paddingStart: 'edge-to-text'
});

export let listbox = style<{size: 'S' | 'M' | 'L' | 'XL'}>({
  width: 'full',
  boxSizing: 'border-box',
  maxHeight: '[inherit]',
  // TODO: Might help with horizontal scrolling happening on Windows, will need to check somehow. Otherwise, revert back to overflow: auto
  overflowY: 'auto',
  overflowX: 'hidden',
  fontFamily: 'sans',
  fontSize: controlFont()
});

export let listboxItem = style({
  ...focusRing(),
  ...control({shape: 'default', wrap: true, icon: true}),
  columnGap: 0,
  paddingX: 0,
  paddingBottom: '--labelPadding',
  backgroundColor: {
    default: 'transparent',
    isFocused: baseColor('gray-100').isFocusVisible
  },
  color: {
    default: baseColor('neutral'),
    isDisabled: {
      default: 'disabled',
      forcedColors: 'GrayText'
    }
  },
  position: 'relative',
  gridColumnStart: 1,
  gridColumnEnd: -1,
  display: 'grid',
  gridTemplateAreas: [
    '. checkmark icon label       .',
    '. .         .    description .'
  ],
  gridTemplateColumns: {
    size: {
      S: [edgeToText(24), 'auto', 'auto', 'minmax(0, 1fr)', edgeToText(24)],
      M: [edgeToText(32), 'auto', 'auto', 'minmax(0, 1fr)', edgeToText(32)],
      L: [edgeToText(40), 'auto', 'auto', 'minmax(0, 1fr)', edgeToText(40)],
      XL: [edgeToText(48), 'auto', 'auto', 'minmax(0, 1fr)', edgeToText(48)]
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
  minHeight: controlSize(),
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
  minHeight: controlSize(),
  paddingY: centerPadding(),
  marginX: {
    size: {
      S: `[${edgeToText(24)}]`,
      M: `[${edgeToText(32)}]`,
      L: `[${edgeToText(40)}]`,
      XL: `[${edgeToText(48)}]`
    }
  }
});

const separatorWrapper = style({
  display: 'flex',
  marginX: {
    size: {
      S: `[${edgeToText(24)}]`,
      M: `[${edgeToText(32)}]`,
      L: `[${edgeToText(40)}]`,
      XL: `[${edgeToText(48)}]`
    }
  },
  height: 12,
  alignItems: 'center'
});

const dividerStyle = style({
  backgroundColor: {
    default: 'gray-200',
    forcedColors: 'ButtonBorder'
  },
  borderRadius: 'full',
  height: '[2px]',
  width: 'full'
});

// Not from any design, just following the sizing of the existing rows
export const LOADER_ROW_HEIGHTS = {
  S: {
    medium: 24,
    large: 30
  },
  M: {
    medium: 32,
    large: 40
  },
  L: {
    medium: 40,
    large: 50
  },
  XL: {
    medium: 48,
    large: 60
  }
};

let InternalComboboxContext = createContext<{size: 'S' | 'M' | 'L' | 'XL'}>({size: 'M'});

/**
 * ComboBox allow users to choose a single option from a collapsible list of options when space is limited.
 */
export const ComboBox = /*#__PURE__*/ (forwardRef as forwardRefType)(function ComboBox<T extends object>(props: ComboBoxProps<T>, ref: Ref<TextFieldRef>) {
  [props, ref] = useSpectrumContextProps(props, ref, ComboBoxContext);

  let formContext = useContext(FormContext);
  props = useFormProps(props);
  let {
    size = 'M',
    labelPosition = 'top',
    UNSAFE_className = '',
    UNSAFE_style,
    loadingState,
    ...comboBoxProps
  } = props;

  return (
    <AriaComboBox
      {...comboBoxProps}
      allowsEmptyCollection={loadingState != null}
      style={UNSAFE_style}
      className={UNSAFE_className + style(field(), getAllowedOverrides())({
        isInForm: !!formContext,
        labelPosition,
        size
      }, props.styles)}>
      {({isDisabled, isOpen, isRequired, isInvalid}) => (
        <ComboboxInner {...props} isDisabled={isDisabled} isOpen={isOpen} isRequired={isRequired} isInvalid={isInvalid} ref={ref} />
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

const ComboboxInner = forwardRef(function ComboboxInner(props: ComboBoxProps<any> & {isOpen: boolean}, ref: ForwardedRef<TextFieldRef | null>) {
  let {
    direction = 'bottom',
    align = 'start',
    shouldFlip = true,
    menuWidth,
    label,
    description: descriptionMessage,
    errorMessage,
    children,
    defaultItems,
    items,
    size = 'M',
    labelPosition = 'top',
    labelAlign = 'start',
    necessityIndicator,
    loadingState,
    isDisabled,
    isOpen,
    isRequired,
    isInvalid,
    menuTrigger,
    onLoadMore
  } = props;

  let stringFormatter = useLocalizedStringFormatter(intlMessages, '@react-spectrum/s2');
  let inputRef = useRef<HTMLInputElement>(null);
  let domRef = useRef<HTMLDivElement>(null);
  let buttonRef = useRef<HTMLButtonElement>(null);
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

  let state = useContext(ComboBoxStateContext);
  let timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  let [showLoading, setShowLoading] = useState(false);
  let isLoadingOrFiltering = loadingState === 'loading' || loadingState === 'filtering';
  {/* Logic copied from S1 */}
  let showFieldSpinner = useMemo(() => showLoading && (isOpen || menuTrigger === 'manual' || loadingState === 'loading'), [showLoading, isOpen, menuTrigger, loadingState]);
  let spinnerId = useSlotId([showFieldSpinner]);

  let inputValue = state?.inputValue;
  let lastInputValue = useRef(inputValue);
  useEffect(() => {
    if (isLoadingOrFiltering && !showLoading) {
      if (timeout.current === null) {
        timeout.current = setTimeout(() => {
          setShowLoading(true);
        }, 500);
      }

      // If user is typing, clear the timer and restart since it is a new request
      if (inputValue !== lastInputValue.current) {
        clearTimeout(timeout.current);
        timeout.current = setTimeout(() => {
          setShowLoading(true);
        }, 500);
      }
    } else if (!isLoadingOrFiltering) {
      // If loading is no longer happening, clear any timers and hide the loading circle
      setShowLoading(false);
      if (timeout.current) {
        clearTimeout(timeout.current);
      }
      timeout.current = null;
    }

    lastInputValue.current = inputValue;
  }, [isLoadingOrFiltering, showLoading, inputValue]);

  useEffect(() => {
    return () => {
      if (timeout.current) {
        clearTimeout(timeout.current);
      }
      timeout.current = null;
    };
  }, []);

  let renderer;
  let listBoxLoadingCircle = (
    <UNSTABLE_ListBoxLoadingSentinel
      // Only show the spinner in the list when loading more
      isLoading={loadingState === 'loadingMore'}
      onLoadMore={onLoadMore}
      className={loadingWrapperStyles}>
      <ProgressCircle
        isIndeterminate
        size="S"
        styles={progressCircleStyles({size})}
        // Same loading string as table
        aria-label={stringFormatter.format('table.loadingMore')} />
    </UNSTABLE_ListBoxLoadingSentinel>
  );

  if (typeof children === 'function') {
    renderer = (
      <>
        <Collection items={items ?? defaultItems}>
          {children}
        </Collection>
        {listBoxLoadingCircle}
      </>
    );
  } else {
    // TODO: is there a case where the user might provide items to the Combobox but doesn't provide a function renderer?
    // Same case for other components that have this logic (TableView/CardView/Picker)
    renderer = (
      <>
        {children}
        {listBoxLoadingCircle}
      </>
    );
  }
  let scale = useScale();

  return (
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
            paddingEnd: 'calc(self(height, self(minHeight)) * 3 / 16)'
          })({size})}>
          <InputContext.Consumer>
            {ctx => (
              <InputContext.Provider value={{...ctx, ref: mergeRefs((ctx as any)?.ref, inputRef)}}>
                <Input aria-describedby={spinnerId} />
              </InputContext.Provider>
            )}
          </InputContext.Consumer>
          {isInvalid && <FieldErrorIcon isDisabled={isDisabled} />}
          {showFieldSpinner && (
            <ProgressCircle
              id={spinnerId}
              isIndeterminate
              size="S"
              styles={progressCircleStyles({size, isInput: true})}
              aria-label={stringFormatter.format('table.loading')} />
          )}
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
            minWidth: '--trigger-width',
            width: '--trigger-width'
          })}>
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
                loaderHeight: LOADER_ROW_HEIGHTS[size][scale]
              }}>
              <ListBox
                renderEmptyState={() => (
                  <span className={emptyStateText({size})}>
                    {loadingState === 'loading' ? stringFormatter.format('table.loading') : stringFormatter.format('combobox.noResults')}
                  </span>
                )}
                items={items}
                className={listbox({size})}>
                {renderer}
              </ListBox>
            </Virtualizer>
          </Provider>
        </PopoverBase>
      </InternalComboboxContext.Provider>
    </>
  );
});

export const Divider = /*#__PURE__*/ createLeafComponent('separator', function Divider({size}: {size?: 'S' | 'M' | 'L' | 'XL'}, ref: ForwardedRef<HTMLDivElement>, node: Node<unknown>) {
  let listState = useContext(ListStateContext)!;

  let nextNode = node.nextKey != null && listState.collection.getItem(node.nextKey);
  if (node.prevKey == null || !nextNode || nextNode.type === 'separator' || (nextNode.type === 'loader' && nextNode.nextKey == null)) {
    return null;
  }

  return (
    <div className={separatorWrapper({size})}>
      <div ref={ref} className={dividerStyle} />
    </div>
  );
});
