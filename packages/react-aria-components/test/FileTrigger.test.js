/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
import {Button, FileTrigger, FileTriggerContext, Link} from '../';
import React from 'react';
import {render} from '@react-spectrum/test-utils';
import userEvent from '@testing-library/user-event';

describe('FileTrigger', () => {
  it('should render a FileTrigger with Link', () => {
    let {getByTestId, getByRole} = render(
      <FileTrigger data-testid="foo">
        <Link>Upload</Link>
      </FileTrigger>
    );
    let fileTrigger = getByTestId('foo');
    expect(fileTrigger).toHaveAttribute('class', 'react-aria-FileTrigger');

    let link = getByRole('link');
    expect(link).toHaveAttribute('class', 'react-aria-Link');
  });

  it('should render a FileTrigger with Button', () => {
    let {getByTestId, getByRole} = render(
      <FileTrigger data-testid="foo">
        <Button>Upload</Button>
      </FileTrigger>
    );
    let fileTrigger = getByTestId('foo');
    expect(fileTrigger).toHaveAttribute('class', 'react-aria-FileTrigger');
    
    let button = getByRole('button');
    expect(button).toHaveAttribute('class', 'react-aria-Button');
  });

  it('should render a FileTrigger with a custom class', () => {
    let {getByTestId} = render(
      <FileTrigger data-testid="foo" className="test" >
        <Button>Upload</Button>
      </FileTrigger>
    );
    let fileTrigger = getByTestId('foo');
    expect(fileTrigger).toHaveClass('test');
  });

  it('should support DOM props', () => {
    let {getByTestId} = render(
      <FileTrigger data-testid="foo" data-foo="bar" >
        <Link>Upload</Link>
      </FileTrigger>

    );
    let fileTrigger = getByTestId('foo');
    expect(fileTrigger).toHaveAttribute('data-foo', 'bar');
  });

  it('should support slot', () => {
    let {getByTestId} = render(
      <FileTriggerContext.Provider value={{slots: {test: {'aria-label': 'test'}}}}>
        <FileTrigger data-testid="foo" slot="test" >
          <Button>Upload</Button>
        </FileTrigger>
      </FileTriggerContext.Provider>
    );

    let fileTrigger = getByTestId('foo');
    expect(fileTrigger).toHaveAttribute('class', 'react-aria-FileTrigger');
    expect(fileTrigger).toHaveAttribute('slot', 'test');
  });

  it('should upload a file with Button', () => {
    let file = new File(['hello'], 'hello.png', {type: 'image/png'});
    let {getByRole} = render(
      <FileTrigger>
        <Button>Upload</Button>
      </FileTrigger>
    );
    let button = getByRole('button');
    expect(button).toHaveAttribute('class', 'react-aria-Button');

    userEvent.upload(button, file);
    expect(button.files[0]).toStrictEqual(file);
    expect(button.files.item(0)).toStrictEqual(file);
    expect(button.files).toHaveLength(1);
  });

  it('should upload a file with Link', () => {
    let file = new File(['hello'], 'hello.png', {type: 'image/png'});
    let {getByRole} = render(
      <FileTrigger>
        <Link>Upload</Link>
      </FileTrigger>
    );
    let link = getByRole('link');
    expect(link).toHaveAttribute('class', 'react-aria-Link');

    userEvent.upload(link, file);
    expect(link.files[0]).toStrictEqual(file);
    expect(link.files.item(0)).toStrictEqual(file);
    expect(link.files).toHaveLength(1);
  });
});
