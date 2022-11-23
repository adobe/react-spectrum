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

import {
  classNames,
  useIsMobileDevice,
  useUnwrapDOMRef
} from '@react-spectrum/utils';
import commandpaletteStyles from './commandpalette.css';
import {DOMRef, DOMRefValue, FocusableRefValue} from '@react-types/shared';
import {FocusRing} from '@react-aria/focus';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {ListBoxBase, useListBoxLayout} from '@react-spectrum/listbox';
import {MobileCommandPalette} from './MobileCommandPalette';
import {Modal} from '@react-spectrum/overlays';
import {ProgressCircle} from '@react-spectrum/progress';
import React, {
  InputHTMLAttributes,
  ReactElement,
  RefObject,
  useEffect,
  useRef,
  useState
} from 'react';
import {SpectrumCommandPaletteProps} from '@react-types/commandpalette';
import styles from '@adobe/spectrum-css-temp/components/inputgroup/vars.css';
import {TextFieldBase} from '@react-spectrum/textfield';
import textfieldStyles from '@adobe/spectrum-css-temp/components/textfield/vars.css';
import {useCommandPalette} from '@react-aria/commandpalette';
import {useCommandPaletteState} from '@react-stately/commandpalette';
import {useFilter} from '@react-aria/i18n';
import {useLocalizedStringFormatter} from '@react-aria/i18n';
import {useProviderProps} from '@react-spectrum/provider';
import {View} from '@adobe/react-spectrum';

function CommandPalette<T extends object>(props: SpectrumCommandPaletteProps<T>, ref: DOMRef<HTMLDivElement>) {
  props = useProviderProps(props);

  let isMobile = useIsMobileDevice();
  if (isMobile) {
    return <MobileCommandPalette {...props} ref={ref} />;
  } else {
    return <CommandPaletteBase {...props} ref={ref} />;
  }
}

const CommandPaletteBase = React.forwardRef(function CommandPaletteBase<T extends object>(props: SpectrumCommandPaletteProps<T>, ref: DOMRef<HTMLDivElement>) {
  let {
    loadingState,
    onLoadMore
  } = props;

  let stringFormatter = useLocalizedStringFormatter(intlMessages);
  let isAsync = loadingState != null;
  let popoverRef = useRef<DOMRefValue<HTMLDivElement>>();
  let unwrappedPopoverRef = useUnwrapDOMRef(popoverRef);
  let buttonRef = useRef<FocusableRefValue<HTMLElement>>();
  let unwrappedButtonRef = useUnwrapDOMRef(buttonRef);
  let listBoxRef = useRef();
  let inputRef = useRef<HTMLInputElement>();

  let {contains} = useFilter({sensitivity: 'base'});
  let state = useCommandPaletteState(
    {
      ...props,
      defaultFilter: contains
    }
  );
  let layout = useListBoxLayout(state);

  let {inputProps, listBoxProps} = useCommandPalette(
    {
      ...props,
      keyboardDelegate: layout,
      buttonRef: unwrappedButtonRef,
      popoverRef: unwrappedPopoverRef,
      listBoxRef,
      inputRef: inputRef
    },
    state
  );

  // Max height for the listbox
  let maxHeight = (window.innerHeight * .6) - inputRef.current?.parentElement?.parentElement?.clientHeight;

  return (
    <>
      <Modal ref={ref} state={state} isDismissable isKeyboardDismissDisabled UNSAFE_style={{position: 'absolute', top: '20%', maxHeight: '60%'}}>
        <CommandPaletteInput
          {...props}
          isOpen={state.isOpen}
          loadingState={loadingState}
          inputProps={inputProps}
          inputRef={inputRef} />
        <ListBoxBase
          {...listBoxProps}
          maxHeight={maxHeight ? maxHeight : undefined}
          ref={listBoxRef}
          disallowEmptySelection
          autoFocus={state.focusStrategy}
          shouldSelectOnPressUp
          focusOnPointerEnter
          layout={layout}
          state={state}
          shouldUseVirtualFocus
          isLoading={loadingState === 'loadingMore'}
          onLoadMore={onLoadMore}
          renderEmptyState={() => isAsync && (
            <span className={classNames(commandpaletteStyles, 'no-results')}>
              {loadingState === 'loading' ? stringFormatter.format('loading') :  stringFormatter.format('noResults')}
            </span>
          )} />
      </Modal>
    </>
  );
});

interface CommandPaletteInputProps extends SpectrumCommandPaletteProps<unknown> {
  inputProps: InputHTMLAttributes<HTMLInputElement>,
  inputRef: RefObject<HTMLInputElement | HTMLTextAreaElement>,
  style?: React.CSSProperties,
  className?: string,
  isOpen?: boolean
}

const CommandPaletteInput = React.forwardRef(function CommandPaletteInput(props: CommandPaletteInputProps) {
  let {
    isDisabled,
    validationState,
    inputProps,
    inputRef,
    loadingState,
    isOpen
  } = props;
  let stringFormatter = useLocalizedStringFormatter(intlMessages);
  let timeout = useRef(null);
  let [showLoading, setShowLoading] = useState(false);

  let loadingCircle = (
    <ProgressCircle
      aria-label={stringFormatter.format('loading')}
      size="S"
      isIndeterminate
      UNSAFE_className={classNames(
        textfieldStyles,
        'spectrum-Textfield-circleLoader',
        classNames(
          styles,
          'spectrum-InputGroup-input-circleLoader'
        )
      )} />
  );

  let isLoading = loadingState === 'loading' || loadingState === 'filtering';
  let inputValue = inputProps.value;
  let lastInputValue = useRef(inputValue);
  useEffect(() => {
    if (isLoading && !showLoading) {
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
    } else if (!isLoading) {
      // If loading is no longer happening, clear any timers and hide the loading circle
      setShowLoading(false);
      clearTimeout(timeout.current);
      timeout.current = null;
    }

    lastInputValue.current = inputValue;
  }, [isLoading, showLoading, inputValue]);

  useEffect(() => {
    inputRef.current.focus();
  }, [inputRef]);

  return (
    <View UNSAFE_style={{position: 'sticky', top: 0, zIndex: 1, padding: 10, background: 'var(--spectrum-alias-background-color-default)'}}>
      <FocusRing
        within
        isTextInput
        focusClass={classNames(styles, 'is-focused')}
        focusRingClass={classNames(styles, 'focus-ring')}>
        <TextFieldBase
          autoFocus
          inputProps={inputProps}
          inputRef={inputRef}
          isDisabled={isDisabled}
          validationState={validationState}
          width="100%"
          isLoading={showLoading && (isOpen || loadingState === 'loading')}
          loadingIndicator={loadingState != null && loadingCircle} />
      </FocusRing>
    </View>
  );
});

/**
 * CommandPalettes combine a text entry with a picker menu, allowing users to filter longer lists to only the selections matching a query.
 */
const _CommandPalette = React.forwardRef(CommandPalette) as <T>(props: SpectrumCommandPaletteProps<T>) => ReactElement;
export {_CommandPalette as CommandPalette};
