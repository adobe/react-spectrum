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
import { act, pointerMap, render } from '@react-spectrum/test-utils-internal';
import { Button } from '../src/Button';
import { FieldError } from '../src/FieldError';
import { FileField, FileTrigger } from '../src/FileTrigger';
import { Form } from '../src/Form';
import { Label } from '../src/Label';
import { Link } from '../src/Link';
import React from 'react';
import userEvent from '@testing-library/user-event';

describe('FileTrigger', () => {
  let user;
  beforeAll(() => {
    user = userEvent.setup({ delay: null, pointerMap });
  });
  it('should render a FileTrigger with Link', () => {
    let { getByRole } = render(
      <FileTrigger>
        <Link>Upload</Link>
      </FileTrigger>
    );

    let link = getByRole('link');
    expect(link).toHaveAttribute('class', 'react-aria-Link');
  });

  it('should render a FileTrigger with Button', () => {
    let { getByRole } = render(
      <FileTrigger data-testid="foo">
        <Button>Upload</Button>
      </FileTrigger>
    );

    let button = getByRole('button');
    expect(button).toHaveAttribute('class', 'react-aria-Button');
  });

  it('should upload a file with Button', async () => {
    let file = new File(['hello'], 'hello.png', { type: 'image/png' });
    let { getByRole } = render(
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
    let file = new File(['hello'], 'hello.png', { type: 'image/png' });
    let { getByRole } = render(
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
    let { getByTestId } = render(
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

  it('should pass the name prop through to the hidden input', () => {
    render(
      <FileTrigger name="avatar">
        <Button>Upload</Button>
      </FileTrigger>
    );

    let input = document.querySelector('input[type="file"]');
    expect(input).toHaveAttribute('name', 'avatar');
  });

  it('should disable the hidden input and prevent opening the file picker when isDisabled is set', async () => {
    let { getByRole } = render(
      <FileTrigger isDisabled>
        <Button>Upload</Button>
      </FileTrigger>
    );

    let button = getByRole('button');
    let input = document.querySelector('input[type="file"]');
    let clickSpy = jest.spyOn(input, 'click');
    expect(input).toBeDisabled();

    await user.click(button);
    expect(clickSpy).not.toHaveBeenCalled();
  });

  it('should mark the hidden input as required in native validation mode', () => {
    render(
      <FileTrigger isRequired>
        <Button>Upload</Button>
      </FileTrigger>
    );

    let input = document.querySelector('input[type="file"]');
    expect(input).toHaveAttribute('required');
    expect(input).not.toHaveAttribute('aria-required');
  });

  it('should mark the hidden input as aria-required in aria validation mode', () => {
    render(
      <FileTrigger isRequired validationBehavior="aria">
        <Button>Upload</Button>
      </FileTrigger>
    );

    let input = document.querySelector('input[type="file"]');
    expect(input).not.toHaveAttribute('required');
    expect(input).toHaveAttribute('aria-required', 'true');
  });

  it('should mark the hidden input as aria-invalid when isInvalid is set', () => {
    render(
      <FileTrigger isInvalid>
        <Button>Upload</Button>
      </FileTrigger>
    );

    let input = document.querySelector('input[type="file"]');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('should allow multiple files to be selected', async () => {
    let file1 = new File(['hello'], 'hello.png', { type: 'image/png' });
    let file2 = new File(['world'], 'world.png', { type: 'image/png' });
    render(
      <FileTrigger name="photos" allowsMultiple>
        <Button>Upload</Button>
      </FileTrigger>
    );

    let input = document.querySelector('input[type="file"]');
    expect(input).toHaveAttribute('multiple');
    expect(input).toHaveAttribute('name', 'photos');

    await userEvent.upload(input, [file1, file2]);
    expect(input.files).toHaveLength(2);
    expect(input.files[0].name).toBe('hello.png');
    expect(input.files[1].name).toBe('world.png');
  });

  it('should set the accept attribute when acceptedFileTypes is provided', () => {
    render(
      <FileTrigger acceptedFileTypes={['image/png', 'image/jpeg']}>
        <Button>Upload</Button>
      </FileTrigger>
    );

    let input = document.querySelector('input[type="file"]');
    expect(input).toHaveAttribute('accept', 'image/png,image/jpeg');
  });

  it('should set the capture attribute when defaultCamera is provided', () => {
    render(
      <FileTrigger defaultCamera="user">
        <Button>Upload</Button>
      </FileTrigger>
    );

    let input = document.querySelector('input[type="file"]');
    expect(input).toHaveAttribute('capture', 'user');
  });

  it('should call onSelect when files are selected', async () => {
    let onSelect = jest.fn();
    let file = new File(['hello'], 'hello.png', { type: 'image/png' });
    render(
      <FileTrigger onSelect={onSelect}>
        <Button>Upload</Button>
      </FileTrigger>
    );

    let input = document.querySelector('input[type="file"]');
    await userEvent.upload(input, file);
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(input.files);
  });
});

describe('FileField', () => {
  let user;
  beforeAll(() => {
    user = userEvent.setup({ delay: null, pointerMap });
  });

  it('should associate the Label with the hidden input', () => {
    let { getByText } = render(
      <FileField name="files">
        <Label>Files</Label>
        <Button>Upload</Button>
      </FileField>
    );

    let label = getByText('Files');
    let input = document.querySelector('input[type="file"]');
    expect(label).toHaveAttribute('for', input.id);
    expect(input).toHaveAttribute('id', label.getAttribute('for'));
  });

  it('should pass the name prop through to the hidden input', () => {
    render(
      <FileField name="files">
        <Label>Files</Label>
        <Button>Upload</Button>
      </FileField>
    );

    let input = document.querySelector('input[type="file"]');
    expect(input).toHaveAttribute('name', 'files');
  });

  it('should open the file picker when the trigger is pressed', async () => {
    let { getByRole } = render(
      <FileField name="files">
        <Label>Files</Label>
        <Button>Upload</Button>
      </FileField>
    );

    let button = getByRole('button');
    let input = document.querySelector('input[type="file"]');
    let clickSpy = jest.spyOn(input, 'click');
    await user.click(button);
    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it('should disable the hidden input and mark the wrapper as disabled when isDisabled is set', async () => {
    let { getByRole } = render(
      <FileField name="files" isDisabled>
        <Label>Files</Label>
        <Button>Upload</Button>
      </FileField>
    );

    let button = getByRole('button');
    let input = document.querySelector('input[type="file"]');
    let clickSpy = jest.spyOn(input, 'click');
    expect(input).toBeDisabled();
    expect(button.closest('.react-aria-FileField')).toHaveAttribute('data-disabled');

    await user.click(button);
    expect(clickSpy).not.toHaveBeenCalled();
  });

  it('supports required validation errors', () => {
    let { getByRole, getByTestId } = render(
      <form data-testid="form">
        <FileField name="files" isRequired>
          <Label>Files</Label>
          <Button>Upload</Button>
          <FieldError />
        </FileField>
      </form>
    );

    let button = getByRole('button');
    let input = document.querySelector('input[type="file"]');
    expect(input).toHaveAttribute('required');
    expect(input).not.toHaveAttribute('aria-describedby');
    expect(input.validity.valid).toBe(false);

    act(() => {
      getByTestId('form').checkValidity();
    });

    expect(input).toHaveAttribute('aria-describedby');
    expect(document.getElementById(input.getAttribute('aria-describedby'))).toHaveTextContent(
      'Constraints not satisfied'
    );
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(button.closest('.react-aria-FileField')).toHaveAttribute('data-invalid');
  });

  it('supports selecting multiple files', async () => {
    let file1 = new File(['hello'], 'hello.png', { type: 'image/png' });
    let file2 = new File(['world'], 'world.png', { type: 'image/png' });
    render(
      <FileField name="photos" allowsMultiple>
        <Label>Photos</Label>
        <Button>Upload</Button>
      </FileField>
    );

    let input = document.querySelector('input[type="file"]');
    expect(input).toHaveAttribute('multiple');
    expect(input).toHaveAttribute('name', 'photos');

    await user.upload(input, [file1, file2]);
    expect(input.files).toHaveLength(2);
    expect(input.files[0].name).toBe('hello.png');
    expect(input.files[1].name).toBe('world.png');
  });

  it('supports a custom validate function', async () => {
    render(
      <FileField
        name="files"
        validationBehavior="aria"
        validate={files => (files && files[0] && files[0].size > 5 ? 'File too large.' : null)}>
        <Label>Files</Label>
        <Button>Upload</Button>
        <FieldError />
      </FileField>
    );

    let input = document.querySelector('input[type="file"]');
    let file = new File(['hello world'], 'hello.png', { type: 'image/png' });
    await user.upload(input, file);

    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(document.getElementById(input.getAttribute('aria-describedby'))).toHaveTextContent(
      'File too large.'
    );
  });

  it('supports server validation errors via Form', () => {
    let { getByRole } = render(
      <Form validationErrors={{ files: 'Upload failed, try again.' }}>
        <FileField name="files">
          <Label>Files</Label>
          <Button>Upload</Button>
          <FieldError />
        </FileField>
      </Form>
    );

    let button = getByRole('button');
    let input = document.querySelector('input[type="file"]');
    expect(input).toHaveAttribute('aria-describedby');
    expect(document.getElementById(input.getAttribute('aria-describedby'))).toHaveTextContent(
      'Upload failed, try again.'
    );
    expect(button.closest('.react-aria-FileField')).toHaveAttribute('data-invalid');
  });
});
