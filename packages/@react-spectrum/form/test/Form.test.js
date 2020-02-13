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
import {cleanup, render} from '@testing-library/react';
import {Form} from '../';
import {Provider} from '@react-spectrum/provider';
import React from 'react';
import scaleMedium from '@adobe/spectrum-css-temp/vars/spectrum-medium-unique.css';
import themeLight from '@adobe/spectrum-css-temp/vars/spectrum-light-unique.css';

let theme = {
  light: themeLight,
  medium: scaleMedium
};

describe('Form', function () {
  afterEach(() => {
    cleanup();
  });

  it('should render a form', () => {
    let {getByRole} = render(
      <Provider theme={theme}>
        <Form />
      </Provider>
    );
    
    let form = getByRole('form');
    expect(form).toBeTruthy();
  });

  it('should render children inside the form', () => {
    let {getByRole} = render(
      <Provider theme={theme}>
        <Form>
          <button>Test</button>
        </Form>
      </Provider>
    );

    let button = getByRole('button');
    expect(button).toBeTruthy();
  });

  it('should attach a optional user provided ref to the form', () => {
    let ref = React.createRef();
    let {getByRole} = render(
      <Provider theme={theme}>
        <Form ref={ref} />
      </Provider>
    );
    
    let form = getByRole('form');
    expect(form).toBe(ref.current.UNSAFE_getDOMNode());
  });
});
