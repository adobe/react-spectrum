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
import {Button, FileTrigger, Link} from '../';
import {pointerMap, render} from '@react-spectrum/test-utils-internal';
import React from 'react';
import userEvent from '@testing-library/user-event';

describe('FileTrigger', () => {
  let user;
  beforeAll(() => {
    user = userEvent.setup({delay: null, pointerMap});
  });
  it('should render a FileTrigger with Link', () => {
    let {getByRole} = render(
      <FileTrigger>
        <Link>Upload</Link>
      </FileTrigger>
    );

    let link = getByRole('link');
    expect(link).toHaveAttribute('class', 'react-aria-Link');
  });

  it('should render a FileTrigger with Button', () => {
    let {getByRole} = render(
      <FileTrigger data-testid="foo">
        <Button>Upload</Button>
      </FileTrigger>
    );

    let button = getByRole('button');
    expect(button).toHaveAttribute('class', 'react-aria-Button');
  });

  it('should upload a file with Button', async () => {
    let file = new File(['hello'], 'hello.png', {type: 'image/png'});
    let {getByRole} = render(
      <FileTrigger data-testid="testid">
        <Button>Upload</Button>
      </FileTrigger>
    );

    let button = getByRole('button');
    // cannot use RTL to target the input because it doesn't have a label or id or anything and it's hidden
    let input = document.querySelector('input[type="file"]');
    expect(button).toHaveAttribute('class', 'react-aria-Button');

    await userEvent.upload(input, file);
    expect(input.files[0]).toStrictEqual(file);
    expect(input.files.item(0)).toStrictEqual(file);
    expect(input.files).toHaveLength(1);
  });

  it('should upload a file with Link', async () => {
    let file = new File(['hello'], 'hello.png', {type: 'image/png'});
    let {getByRole} = render(
      <FileTrigger>
        <Link>Upload</Link>
      </FileTrigger>
    );
    let link = getByRole('link');
    let input = document.querySelector('input[type="file"]');
    expect(link).toHaveAttribute('class', 'react-aria-Link');

    await user.upload(input, file);
    expect(input.files[0]).toStrictEqual(file);
    expect(input.files.item(0)).toStrictEqual(file);
    expect(input.files).toHaveLength(1);
  });

  it('should attach a ref to the input', () => {
    let ref = React.createRef();
    let {getByTestId} = render(
      <FileTrigger ref={ref} data-testid="foo">
        <Button>Upload</Button>
      </FileTrigger>
    );

    let input = getByTestId('foo');
    expect(ref.current).toBe(input);
  });

  it('should allow directory uploads when directory is true', () => {
    render(
      <FileTrigger acceptDirectory>
        <Button>Upload Directory</Button>
      </FileTrigger>
    );

    let input = document.querySelector('input[type="file"]');
    expect(input).toHaveAttribute('webkitdirectory');
  });

});
