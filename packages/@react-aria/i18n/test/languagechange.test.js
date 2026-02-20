/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {act, render} from '@react-spectrum/test-utils-internal';
import {I18nProvider, useLocale} from '../src/context';
import React from 'react';

function TestComponent() {
  let locale = useLocale();
  return (
    <div>
      <div data-testid="locale">{locale.locale}</div>
      <div data-testid="direction">{locale.direction}</div>
    </div>
  );
}

function languageProps(language) {
  return {
    value: language,
    writable: true,
    configurable: true
  };
}

describe('useLocale languagechange', () => {
  let originalNavigator;
  let originalLanguage;
  
  beforeEach(() => {
    originalNavigator = window.navigator;
    originalLanguage = window.navigator.language;
    
    Object.defineProperty(window.navigator, 'language', languageProps('en-US'));
    
    act(() => {
      window.dispatchEvent(new Event('languagechange'));
    });
  });
  
  afterEach(() => {
    Object.defineProperty(window.navigator, 'language', languageProps(originalLanguage));
    
    act(() => {
      window.dispatchEvent(new Event('languagechange'));
    });
    
    Object.defineProperty(window, 'navigator', languageProps(originalNavigator));
  });

  it('should update locale when languagechange event is triggered', () => {        
    let {getByTestId} = render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>
    );
    
    // Initial render should show en-US
    expect(getByTestId('locale')).toHaveTextContent('en-US');
    expect(getByTestId('direction')).toHaveTextContent('ltr');

    // Change navigator.language and trigger languagechange event
    act(() => {
      Object.defineProperty(window.navigator, 'language', languageProps('pt-PT'));      
      window.dispatchEvent(new Event('languagechange'));
    });
    
    // Should re-render with new locale
    expect(getByTestId('locale')).toHaveTextContent('pt-PT');
    expect(getByTestId('direction')).toHaveTextContent('ltr');
  });
  
  it('should update locale direction when changing from LTR to RTL language', () => {    
    let {getByTestId} = render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>
    );
    
    // Change to Hebrew (RTL language)
    act(() => {
      Object.defineProperty(window.navigator, 'language', languageProps('he-IL'));      
      window.dispatchEvent(new Event('languagechange'));
    });
    
    // Should update to Hebrew with RTL direction
    expect(getByTestId('locale')).toHaveTextContent('he-IL');
    expect(getByTestId('direction')).toHaveTextContent('rtl');
    
    // Change back to Portuguese
    act(() => {
      Object.defineProperty(window.navigator, 'language', languageProps('pt-PT'));      
      window.dispatchEvent(new Event('languagechange'));
    });
    
    // Should update to Portuguese
    expect(getByTestId('locale')).toHaveTextContent('pt-PT');
    expect(getByTestId('direction')).toHaveTextContent('ltr');
  });
  
  it('should not change displayed locale when explicit locale is provided via I18nProvider', () => {    
    let {getByTestId} = render(
      <I18nProvider locale="fr-FR">
        <TestComponent />
      </I18nProvider>
    );
    
    // Initial render should show fr-FR
    expect(getByTestId('locale')).toHaveTextContent('fr-FR');
    expect(getByTestId('direction')).toHaveTextContent('ltr');
    
    // Change navigator.language and trigger languagechange event
    act(() => {
      Object.defineProperty(window.navigator, 'language', languageProps('ja-JP'));    
      window.dispatchEvent(new Event('languagechange'));
    });
    
    // Should still show fr-FR (explicit locale takes precedence)
    expect(getByTestId('locale')).toHaveTextContent('fr-FR');
    expect(getByTestId('direction')).toHaveTextContent('ltr');
  });  
});
