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

import {ColorSwatch, ColorSwatchContext} from '../';
import React from 'react';
import {render} from '@react-spectrum/test-utils-internal';

describe('ColorSwatch', () => {
  it('should render a swatch with default class', () => {
    let {getByRole} = render(<ColorSwatch color="#f00" />);
    let img = getByRole('img');
    expect(img).toHaveAttribute('class', 'react-aria-ColorSwatch');
    expect(img).toHaveAttribute('aria-label', 'vibrant red');
    expect(img).toHaveAttribute('aria-roledescription', 'color swatch');
    expect(img).toHaveStyle({backgroundColor: '#f00'});
  });

  it('should render a swatch with custom class', () => {
    let {getByRole} = render(<ColorSwatch className="test" />);
    let img = getByRole('img');
    expect(img).toHaveAttribute('class', 'test');
  });

  it('should support DOM props', () => {
    let {getByRole} = render(<ColorSwatch data-foo="bar" />);
    let img = getByRole('img');
    expect(img).toHaveAttribute('data-foo', 'bar');
  });

  it('should support render props', () => {
    let {getByTestId} = render(
      <ColorSwatch color="#f00">
        {({color}) => (
          <div style={{background: color.toString()}} data-testid="wrapper" />
        )}
      </ColorSwatch>
    );
    expect(getByTestId('wrapper')).toHaveStyle({background: '#f00'});
  });

  it('should support slot', () => {
    let {getByRole} = render(
      <ColorSwatchContext.Provider value={{slots: {test: {color: '#ff0'}}}}>
        <ColorSwatch slot="test" />
      </ColorSwatchContext.Provider>
    );

    let img = getByRole('img');
    expect(img).toHaveAttribute('aria-label', 'very light vibrant yellow');
  });

  it('should support custom aria-label', () => {
    let {getByRole} = render(<ColorSwatch color="#f00" aria-label="Background" />);
    let img = getByRole('img');
    expect(img).toHaveAttribute('aria-label', 'vibrant red, Background');
  });

  it('should support custom aria-labelledby', () => {
    let {getByRole} = render(<ColorSwatch color="#f00" aria-labelledby="label-id" />);
    let img = getByRole('img');
    expect(img).toHaveAttribute('aria-label', 'vibrant red');
    expect(img).toHaveAttribute('id');
    expect(img).toHaveAttribute('aria-labelledby', `${img.id} label-id`);
  });

  it('should support custom colorName', () => {
    let {getByRole} = render(<ColorSwatch color="#f00" colorName="Fire truck red" />);
    let img = getByRole('img');
    expect(img).toHaveAttribute('aria-label', 'Fire truck red');
  });
});
