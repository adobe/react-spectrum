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

import {ClipboardEvent, DataTransfer, DataTransferItem} from './mocks';
import {fireEvent, pointerMap, render} from '@react-spectrum/test-utils-internal';
import React from 'react';
import {useClipboard} from '../';
import userEvent from '@testing-library/user-event';

function Copyable(props) {
  let {clipboardProps} = useClipboard({
    getItems: () => [
      {
        'text/plain': 'hello world'
      }
    ],
    ...props
  });

  return (
    <div tabIndex="0" role="button" {...clipboardProps}>Copy</div>
  );
}

describe('useClipboard', () => {
  let user;
  beforeAll(() => {
    user = userEvent.setup({delay: null, pointerMap});
  });
  it('should copy items to the clipboard', async () => {
    let onCopy = jest.fn();
    let tree = render(<Copyable onCopy={onCopy} />);
    let button = tree.getByRole('button');

    await user.tab();
    expect(document.activeElement).toBe(button);

    let clipboardData = new DataTransfer();
    let allowDefault = fireEvent(button, new ClipboardEvent('beforecopy', {clipboardData}));
    expect(allowDefault).toBe(false);

    fireEvent(button, new ClipboardEvent('copy', {clipboardData}));
    expect([...clipboardData.items]).toEqual([new DataTransferItem('text/plain', 'hello world')]);

    expect(onCopy).toHaveBeenCalledTimes(1);
  });

  it('should only enable copying when focused', () => {
    let onCopy = jest.fn();
    let tree = render(<Copyable onCopy={onCopy} />);
    let button = tree.getByRole('button');

    let clipboardData = new DataTransfer();
    let allowDefault = fireEvent(button, new ClipboardEvent('beforecopy', {clipboardData}));
    expect(allowDefault).toBe(true);

    fireEvent(button, new ClipboardEvent('copy', {clipboardData}));
    expect([...clipboardData.items].length).toBe(0);
    expect(onCopy).not.toHaveBeenCalled();
  });

  it('should not enable copying when there is no getItems option', async () => {
    let onCopy = jest.fn();
    let tree = render(<Copyable getItems={null} onCopy={onCopy} />);
    let button = tree.getByRole('button');

    await user.tab();
    expect(document.activeElement).toBe(button);

    let clipboardData = new DataTransfer();
    let allowDefault = fireEvent(button, new ClipboardEvent('beforecopy', {clipboardData}));
    expect(allowDefault).toBe(true);

    fireEvent(button, new ClipboardEvent('copy', {clipboardData}));
    expect([...clipboardData.items].length).toBe(0);
    expect(onCopy).not.toHaveBeenCalled();
  });

  it('should cut items to the clipboard', async () => {
    let onCut = jest.fn();
    let tree = render(<Copyable onCut={onCut} />);
    let button = tree.getByRole('button');

    await user.tab();
    expect(document.activeElement).toBe(button);

    let clipboardData = new DataTransfer();
    let allowDefault = fireEvent(button, new ClipboardEvent('beforecut', {clipboardData}));
    expect(allowDefault).toBe(false);

    fireEvent(button, new ClipboardEvent('cut', {clipboardData}));
    expect([...clipboardData.items]).toEqual([new DataTransferItem('text/plain', 'hello world')]);

    expect(onCut).toHaveBeenCalledTimes(1);
  });

  it('should only enable cutting when focused', () => {
    let onCut = jest.fn();
    let tree = render(<Copyable onCut={onCut} />);
    let button = tree.getByRole('button');

    let clipboardData = new DataTransfer();
    let allowDefault = fireEvent(button, new ClipboardEvent('beforecut', {clipboardData}));
    expect(allowDefault).toBe(true);

    fireEvent(button, new ClipboardEvent('cut', {clipboardData}));
    expect([...clipboardData.items].length).toBe(0);
    expect(onCut).not.toHaveBeenCalled();
  });

  it('should not enable cutting when there is no getItems option', async () => {
    let onCut = jest.fn();
    let tree = render(<Copyable getItems={null} onCut={onCut} />);
    let button = tree.getByRole('button');

    await user.tab();
    expect(document.activeElement).toBe(button);

    let clipboardData = new DataTransfer();
    let allowDefault = fireEvent(button, new ClipboardEvent('beforecut', {clipboardData}));
    expect(allowDefault).toBe(true);

    fireEvent(button, new ClipboardEvent('cut', {clipboardData}));
    expect([...clipboardData.items].length).toBe(0);
    expect(onCut).not.toHaveBeenCalled();
  });

  it('should not enable cutting when there is no onCut option', async () => {
    let tree = render(<Copyable />);
    let button = tree.getByRole('button');

    await user.tab();
    expect(document.activeElement).toBe(button);

    let clipboardData = new DataTransfer();
    let allowDefault = fireEvent(button, new ClipboardEvent('beforecut', {clipboardData}));
    expect(allowDefault).toBe(true);

    fireEvent(button, new ClipboardEvent('cut', {clipboardData}));
    expect([...clipboardData.items].length).toBe(0);
  });

  it('should paste items from the clipboard', async () => {
    let onPaste = jest.fn();
    let tree = render(<Copyable onPaste={onPaste} />);
    let button = tree.getByRole('button');

    await user.tab();
    expect(document.activeElement).toBe(button);

    let clipboardData = new DataTransfer();
    clipboardData.items.add('hello world', 'text/plain');

    let allowDefault = fireEvent(button, new ClipboardEvent('beforepaste', {clipboardData}));
    expect(allowDefault).toBe(false);

    fireEvent(button, new ClipboardEvent('paste', {clipboardData}));

    expect(onPaste).toHaveBeenCalledTimes(1);
    expect(onPaste).toHaveBeenCalledWith([
      {
        kind: 'text',
        types: new Set(['text/plain']),
        getText: expect.any(Function)
      }
    ]);

    expect(await onPaste.mock.calls[0][0][0].getText('text/plain')).toBe('hello world');
  });

  it('should only enable pasting when focused', () => {
    let onPaste = jest.fn();
    let tree = render(<Copyable onPaste={onPaste} />);
    let button = tree.getByRole('button');

    let clipboardData = new DataTransfer();
    let allowDefault = fireEvent(button, new ClipboardEvent('beforepaste', {clipboardData}));
    expect(allowDefault).toBe(true);

    fireEvent(button, new ClipboardEvent('paste', {clipboardData}));
    expect(onPaste).not.toHaveBeenCalled();
  });

  it('should not enable pasting when there is no onPaste option', async () => {
    let tree = render(<Copyable />);
    let button = tree.getByRole('button');

    await user.tab();
    expect(document.activeElement).toBe(button);

    let clipboardData = new DataTransfer();
    let allowDefault = fireEvent(button, new ClipboardEvent('beforepaste', {clipboardData}));
    expect(allowDefault).toBe(true);
  });

  describe('data', () => {
    it('should work with custom data types', async () => {
      let getItems = () => [{
        test: 'test data'
      }];

      let onPaste = jest.fn();
      let tree = render(<Copyable getItems={getItems} onPaste={onPaste} />);
      let button = tree.getByRole('button');

      await user.tab();
      expect(document.activeElement).toBe(button);

      let clipboardData = new DataTransfer();
      fireEvent(button, new ClipboardEvent('copy', {clipboardData}));
      expect([...clipboardData.items]).toEqual([new DataTransferItem('test', 'test data')]);

      fireEvent(button, new ClipboardEvent('paste', {clipboardData}));
      expect(onPaste).toHaveBeenCalledTimes(1);
      expect(onPaste).toHaveBeenCalledWith([
        {
          kind: 'text',
          types: new Set(['test']),
          getText: expect.any(Function)
        }
      ]);

      expect(await onPaste.mock.calls[0][0][0].getText('test')).toBe('test data');
    });

    it('should work with multiple items of the same custom type', async () => {
      let getItems = () => [{
        test: 'item 1'
      }, {
        test: 'item 2'
      }];

      let onPaste = jest.fn();
      let tree = render(<Copyable getItems={getItems} onPaste={onPaste} />);
      let button = tree.getByRole('button');

      await user.tab();
      expect(document.activeElement).toBe(button);

      let clipboardData = new DataTransfer();
      fireEvent(button, new ClipboardEvent('copy', {clipboardData}));
      expect([...clipboardData.items]).toEqual([
        new DataTransferItem('test', 'item 1'),
        new DataTransferItem(
          'application/vnd.react-aria.items+json',
          JSON.stringify([{test: 'item 1'}, {test: 'item 2'}]
        ))
      ]);

      fireEvent(button, new ClipboardEvent('paste', {clipboardData}));
      expect(onPaste).toHaveBeenCalledTimes(1);
      expect(onPaste).toHaveBeenCalledWith([
        {
          kind: 'text',
          types: new Set(['test']),
          getText: expect.any(Function)
        },
        {
          kind: 'text',
          types: new Set(['test']),
          getText: expect.any(Function)
        }
      ]);

      expect(await onPaste.mock.calls[0][0][0].getText('test')).toBe('item 1');
      expect(await onPaste.mock.calls[0][0][1].getText('test')).toBe('item 2');
    });

    it('should work with items of multiple types', async () => {
      let getItems = () => [{
        test: 'test data',
        'text/plain': 'test data'
      }];

      let onPaste = jest.fn();
      let tree = render(<Copyable getItems={getItems} onPaste={onPaste} />);
      let button = tree.getByRole('button');

      await user.tab();
      expect(document.activeElement).toBe(button);

      let clipboardData = new DataTransfer();
      fireEvent(button, new ClipboardEvent('copy', {clipboardData}));
      expect([...clipboardData.items]).toEqual([
        new DataTransferItem('test', 'test data'),
        new DataTransferItem('text/plain', 'test data'),
        new DataTransferItem(
          'application/vnd.react-aria.items+json',
          JSON.stringify([{test: 'test data', 'text/plain': 'test data'}]
        ))
      ]);

      fireEvent(button, new ClipboardEvent('paste', {clipboardData}));
      expect(onPaste).toHaveBeenCalledTimes(1);
      expect(onPaste).toHaveBeenCalledWith([
        {
          kind: 'text',
          types: new Set(['test', 'text/plain']),
          getText: expect.any(Function)
        }
      ]);

      expect(await onPaste.mock.calls[0][0][0].getText('test')).toBe('test data');
      expect(await onPaste.mock.calls[0][0][0].getText('text/plain')).toBe('test data');
    });

    it('should work with multiple items of multiple types', async () => {
      let getItems = () => [{
        test: 'item 1',
        'text/plain': 'item 1'
      }, {
        test: 'item 2',
        'text/plain': 'item 2'
      }];

      let onPaste = jest.fn();
      let tree = render(<Copyable getItems={getItems} onPaste={onPaste} />);
      let button = tree.getByRole('button');

      await user.tab();
      expect(document.activeElement).toBe(button);

      let clipboardData = new DataTransfer();
      fireEvent(button, new ClipboardEvent('copy', {clipboardData}));
      expect([...clipboardData.items]).toEqual([
        new DataTransferItem('test', 'item 1'),
        new DataTransferItem('text/plain', 'item 1\nitem 2'),
        new DataTransferItem(
          'application/vnd.react-aria.items+json',
          JSON.stringify([
            {test: 'item 1', 'text/plain': 'item 1'},
            {test: 'item 2', 'text/plain': 'item 2'}
          ]
        ))
      ]);

      fireEvent(button, new ClipboardEvent('paste', {clipboardData}));
      expect(onPaste).toHaveBeenCalledTimes(1);
      expect(onPaste).toHaveBeenCalledWith([
        {
          kind: 'text',
          types: new Set(['test', 'text/plain']),
          getText: expect.any(Function)
        },
        {
          kind: 'text',
          types: new Set(['test', 'text/plain']),
          getText: expect.any(Function)
        }
      ]);

      expect(await onPaste.mock.calls[0][0][0].getText('test')).toBe('item 1');
      expect(await onPaste.mock.calls[0][0][0].getText('text/plain')).toBe('item 1');
      expect(await onPaste.mock.calls[0][0][1].getText('test')).toBe('item 2');
      expect(await onPaste.mock.calls[0][0][1].getText('text/plain')).toBe('item 2');
    });
  });
});
