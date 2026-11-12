/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {I18nProvider, useLocale} from '../../src/i18n/I18nProvider';
import React from 'react';
import {render, screen} from '@react-spectrum/test-utils-internal';

function TestComponent() {
  let {locale, direction} = useLocale();
  return (
    <div>
      <div data-testid="locale">{locale}</div>
      <div data-testid="direction">{direction}</div>
    </div>
  );
}

function renderProvider(props) {
  render(
    <I18nProvider {...props}>
      <TestComponent />
    </I18nProvider>
  );
  return {
    locale: screen.getByTestId('locale').textContent,
    direction: screen.getByTestId('direction').textContent
  };
}

describe('I18nProvider direction', () => {
  it('takes rtl from an RTL locale when no direction is given', () => {
    expect(renderProvider({locale: 'ar-AE'})).toEqual({locale: 'ar-AE', direction: 'rtl'});
  });

  it('takes ltr from an LTR locale when no direction is given', () => {
    expect(renderProvider({locale: 'en-US'})).toEqual({locale: 'en-US', direction: 'ltr'});
  });

  it('overrides an RTL locale with ltr', () => {
    expect(renderProvider({locale: 'ar-AE', direction: 'ltr'})).toEqual({
      locale: 'ar-AE',
      direction: 'ltr'
    });
  });

  it('overrides an LTR locale with rtl', () => {
    expect(renderProvider({locale: 'en-US', direction: 'rtl'})).toEqual({
      locale: 'en-US',
      direction: 'rtl'
    });
  });

  it('leaves the locale itself alone', () => {
    // The override is about layout only. Formatters and translated strings still follow
    // the locale, so a date inside an ltr-pinned Arabic subtree is still formatted in Arabic.
    expect(renderProvider({locale: 'ar-AE', direction: 'ltr'}).locale).toBe('ar-AE');
  });

  it('overrides the default locale without being given one', () => {
    let {direction} = renderProvider({direction: 'rtl'});
    expect(direction).toBe('rtl');
  });

  it('restores the locale direction in a nested provider', () => {
    render(
      <I18nProvider locale="ar-AE" direction="ltr">
        <I18nProvider locale="ar-AE">
          <TestComponent />
        </I18nProvider>
      </I18nProvider>
    );
    expect(screen.getByTestId('direction')).toHaveTextContent('rtl');
  });
});
