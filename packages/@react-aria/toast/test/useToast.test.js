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

import {cleanup} from '@testing-library/react';
import intlMessages from '../intl/*.json';
import {Provider} from '@react-spectrum/provider';
import React from 'react';
import {renderHook} from 'react-hooks-testing-library';
import scaleMedium from '@adobe/spectrum-css-temp/vars/spectrum-medium-unique.css';
import themeLight from '@adobe/spectrum-css-temp/vars/spectrum-light-unique.css';
import {useToast} from '../';

describe('useToast', () => {
  let onClose = jest.fn();
  let onAction = jest.fn();
  let onRemove = jest.fn();

  afterEach(() => {
    onClose.mockClear();
    onAction.mockClear();
    cleanup();
  });

  let renderToastHook = (props, wrapper) => {
    let {result} = renderHook(() => useToast(props), {wrapper});
    return result.current;
  };

  it('handles defaults', function () {
    let {actionButtonProps, closeButtonProps, iconProps, toastProps} = renderToastHook({onRemove});

    expect(toastProps.role).toBe('alert');
    expect(iconProps.alt).toBe(undefined);
    expect(typeof actionButtonProps.onPress).toBe('function');
    expect(closeButtonProps['aria-label']).toBe('Close');
    expect(typeof closeButtonProps.onPress).toBe('function');
  });

  it('variant sets icon alt property', function () {
    let {iconProps} = renderToastHook({variant: 'info'});

    expect(iconProps.alt).toBe('Info');
  });

  it('with a localized aria-label', () => {
    let locale = 'de-DE';
    let theme = {
      light: themeLight,
      medium: scaleMedium
    };

    let wrapper = ({children}) => <Provider locale={locale} theme={theme}>{children}</Provider>;
    let expectedIntl = intlMessages[locale]['info'];
    let {iconProps} = renderToastHook({variant: 'info'}, wrapper);
    expect(iconProps.alt).toBe(expectedIntl);
  });

  it('handles onClose', function () {
    let {closeButtonProps} = renderToastHook({onClose, onRemove});
    closeButtonProps.onPress();

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('handles shouldCloseOnAction', function () {
    let {actionButtonProps} = renderToastHook({onClose, onAction, shouldCloseOnAction: true});
    actionButtonProps.onPress();

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onAction).toHaveBeenCalledTimes(1);
  });
});
