/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import AlertMedium from '@spectrum-icons/ui/AlertMedium';
import ChevronDownMedium from '@spectrum-icons/ui/ChevronDownMedium';
import {classNames, dimensionValue, SlotProvider, unwrapDOMRef, useDOMRef, useMediaQuery, useStyleProps} from '@react-spectrum/utils';
import {DismissButton, useOverlayPosition} from '@react-aria/overlays';
import {DOMRef, DOMRefValue, FocusableRefValue, LabelPosition} from '@react-types/shared';
import {FieldButton} from '@react-spectrum/button';
import {FocusScope} from '@react-aria/focus';
import {HiddenSelect, useSelect} from '@react-aria/select';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {Label} from '@react-spectrum/label';
import labelStyles from '@adobe/spectrum-css-temp/components/fieldlabel/vars.css';
import {ListBoxBase, useListBoxLayout} from '@react-spectrum/listbox';
import {mergeProps, useLayoutEffect} from '@react-aria/utils';
import {Placement} from '@react-types/overlays';
import {Popover, Tray} from '@react-spectrum/overlays';
import {PressResponder, useHover} from '@react-aria/interactions';
import {ProgressCircle} from '@react-spectrum/progress';
import React, {ReactElement, useRef, useState} from 'react';
import {SpectrumPickerProps} from '@react-types/select';
import styles from '@adobe/spectrum-css-temp/components/dropdown/vars.css';
import {Text} from '@react-spectrum/text';
import {useFormProps} from '@react-spectrum/form';
import {useMessageFormatter} from '@react-aria/i18n';
import {useProvider, useProviderProps} from '@react-spectrum/provider';
import {useSelectState} from '@react-stately/select';

function Picker<T extends object>(props: SpectrumPickerProps<T>, ref: DOMRef<HTMLDivElement>) {
  props = useProviderProps(props);
  props = useFormProps(props);
  let formatMessage = useMessageFormatter(intlMessages);
  let {
    isDisabled,
    direction = 'bottom',
    align = 'start',
    shouldFlip = true,
    placeholder = formatMessage('placeholder'),
    validationState,
    isQuiet,
    label,
    labelPosition = 'top' as LabelPosition,
    labelAlign,
    isRequired,
    necessityIndicator,
    menuWidth,
    name
  } = props;

  let {styleProps} = useStyleProps(props);
  let state = useSelectState(props);
  let domRef = useDOMRef(ref);

  let popoverRef = useRef<DOMRefValue<HTMLDivElement>>();
  let triggerRef = useRef<FocusableRefValue<HTMLElement>>();
  let listboxRef = useRef();

  // We create the listbox layout in Picker and pass it to ListBoxBase below
  // so that the layout information can be cached even while the listbox is not mounted.
  // We also use the layout as the keyboard delegate for type to select.
  let layout = useListBoxLayout(state);
  let {labelProps, triggerProps, valueProps, menuProps} = useSelect({
    ...props,
    keyboardDelegate: layout
  }, state, unwrapDOMRef(triggerRef));

  let {overlayProps, placement, updatePosition} = useOverlayPosition({
    targetRef: unwrapDOMRef(triggerRef),
    overlayRef: unwrapDOMRef(popoverRef),
    scrollRef: listboxRef,
    placement: `${direction} ${align}` as Placement,
    shouldFlip: shouldFlip,
    isOpen: state.isOpen
  });

  let {hoverProps, isHovered} = useHover({isDisabled});

  // Update position once the ListBox has rendered. This ensures that
  // it flips properly when it doesn't fit in the available space.
  // TODO: add ResizeObserver to useOverlayPosition so we don't need this.
  useLayoutEffect(() => {
    if (state.isOpen) {
      requestAnimationFrame(() => {
        updatePosition();
      });
    }
  }, [state.isOpen, updatePosition]);

  let isLoadingInitial = props.isLoading && state.collection.size === 0;
  let isLoadingMore = props.isLoading && state.collection.size > 0;

  // On small screen devices, the listbox is rendered in a tray, otherwise a popover.
  let isMobile = useMediaQuery('(max-width: 700px)');
  let listbox = (
    <FocusScope restoreFocus>
      <DismissButton onDismiss={() => state.close()} />
      <ListBoxBase
        ref={listboxRef}
        domProps={menuProps}
        disallowEmptySelection
        autoFocus={state.focusStrategy || true}
        shouldSelectOnPressUp
        focusOnPointerEnter
        layout={layout}
        state={state}
        width={isMobile ? '100%' : undefined}
        // Set max height: inherit so Tray scrolling works
        UNSAFE_style={{maxHeight: 'inherit'}}
        isLoading={isLoadingMore}
        onLoadMore={props.onLoadMore} />
      <DismissButton onDismiss={() => state.close()} />
    </FocusScope>
  );

  // Measure the width of the button to inform the width of the menu (below).
  let [buttonWidth, setButtonWidth] = useState(null);
  let {scale} = useProvider();
  useLayoutEffect(() => {
    if (!isMobile) {
      let width = triggerRef.current.UNSAFE_getDOMNode().offsetWidth;
      setButtonWidth(width);
    }
  }, [scale, isMobile, triggerRef, state.selectedKey]);

  let overlay;
  if (isMobile) {
    overlay = (
      <Tray isOpen={state.isOpen} onClose={state.close} shouldCloseOnBlur>
        {listbox}
      </Tray>
    );
  } else {
    // If quiet, use the default width, otherwise match the width of the button. This can be overridden by the menuWidth prop.
    // Always have a minimum width of the button width. When quiet, there is an extra offset to add.
    // Not using style props for this because they don't support `calc`.
    let width = isQuiet ? null : buttonWidth;
    let style = {
      ...overlayProps.style,
      width: menuWidth ? dimensionValue(menuWidth) : width,
      minWidth: isQuiet ? `calc(${buttonWidth}px + calc(2 * var(--spectrum-dropdown-quiet-offset)))` : buttonWidth
    };

    overlay = (
      <Popover
        isOpen={state.isOpen}
        UNSAFE_style={style}
        UNSAFE_className={classNames(styles, 'spectrum-Dropdown-popover', {'spectrum-Dropdown-popover--quiet': isQuiet})}
        ref={popoverRef}
        placement={placement}
        hideArrow
        shouldCloseOnBlur
        onClose={state.close}>
        {listbox}
      </Popover>
    );
  }

  let contents = state.selectedItem ? state.selectedItem.rendered : placeholder;
  if (typeof contents === 'string') {
    contents = <Text>{contents}</Text>;
  }

  let picker = (
    <div
      className={
        classNames(
          styles,
          'spectrum-Dropdown',
          {
            'is-invalid': validationState === 'invalid',
            'is-disabled': isDisabled,
            'spectrum-Dropdown--quiet': isQuiet
          }
        )
      }>
      <HiddenSelect
        isDisabled={isDisabled}
        state={state}
        triggerRef={unwrapDOMRef(triggerRef)}
        label={label}
        name={name} />
      <PressResponder {...mergeProps(hoverProps, triggerProps)}>
        <FieldButton
          ref={triggerRef}
          isActive={state.isOpen}
          isQuiet={isQuiet}
          isDisabled={isDisabled}
          validationState={validationState}
          UNSAFE_className={classNames(styles, 'spectrum-Dropdown-trigger', {'is-hovered': isHovered})}>
          <SlotProvider
            slots={{
              icon: {UNSAFE_className: classNames(styles, 'spectrum-Icon'), size: 'S'},
              text: {
                ...valueProps,
                UNSAFE_className: classNames(
                  styles,
                  'spectrum-Dropdown-label',
                  {'is-placeholder': !state.selectedItem}
                )
              },
              description: {
                isHidden: true
              }
            }}>
            {contents}
          </SlotProvider>
          {isLoadingInitial &&
            <ProgressCircle
              isIndeterminate
              size="S"
              aria-label={formatMessage('loading')}
              UNSAFE_className={classNames(styles, 'spectrum-Dropdown-progressCircle')} />
          }
          {validationState === 'invalid' && !isLoadingInitial &&
            <AlertMedium UNSAFE_className={classNames(styles, 'spectrum-Dropdown-invalidIcon')} />
          }
          <ChevronDownMedium UNSAFE_className={classNames(styles, 'spectrum-Dropdown-chevron')} />
        </FieldButton>
      </PressResponder>
      {state.collection.size === 0 ? null : overlay}
    </div>
  );

  if (label) {
    let labelWrapperClass = classNames(
      labelStyles,
      'spectrum-Field',
      {
        'spectrum-Field--positionTop': labelPosition === 'top',
        'spectrum-Field--positionSide': labelPosition === 'side'
      },
      classNames(
        styles,
        'spectrum-Field',
        {
          'spectrum-Dropdown-fieldWrapper--quiet': isQuiet,
          'spectrum-Dropdown-fieldWrapper--positionSide': labelPosition === 'side'
        }
      ),
      styleProps.className
    );

    picker = React.cloneElement(picker, mergeProps(picker.props, {
      className: classNames(labelStyles, 'spectrum-Field-field')
    }));

    return (
      <div
        {...styleProps}
        ref={domRef}
        className={labelWrapperClass}>
        <Label
          {...labelProps}
          labelPosition={labelPosition}
          labelAlign={labelAlign}
          isRequired={isRequired}
          necessityIndicator={necessityIndicator}
          includeNecessityIndicatorInAccessibilityName
          elementType="span">
          {label}
        </Label>
        {picker}
      </div>
    );
  }

  return React.cloneElement(picker, mergeProps(picker.props, {
    ...styleProps,
    ref: domRef
  }));
}

/**
 * Pickers allow users to choose a single option from a collapsible list of options when space is limited.
 */
// forwardRef doesn't support generic parameters, so cast the result to the correct type
// https://stackoverflow.com/questions/58469229/react-with-typescript-generics-while-using-react-forwardref
const _Picker = React.forwardRef(Picker) as <T>(props: SpectrumPickerProps<T> & {ref?: DOMRef<HTMLDivElement>}) => ReactElement;
export {_Picker as Picker};
