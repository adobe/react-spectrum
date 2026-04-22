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

import React, {useRef} from 'react';
import {render} from '@react-spectrum/test-utils-internal';
import {useDialog} from '../../src/dialog/useDialog';

function Example(props) {
  let ref = useRef();
  let {dialogProps, titleProps} = useDialog(props, ref);
  return (
    <div ref={ref} {...dialogProps} data-testid="test">
      {props.showTitle && <h2 {...titleProps}>Title</h2>}
      {props.children}
    </div>
  );
}

describe('useDialog', function () {
  it('should have role="dialog" by default', function () {
    let res = render(<Example aria-label="Test dialog" />);
    let el = res.getByTestId('test');
    expect(el).toHaveAttribute('role', 'dialog');
  });

  it('should accept role="alertdialog"', function () {
    let res = render(<Example role="alertdialog" aria-label="Test dialog" />);
    let el = res.getByTestId('test');
    expect(el).toHaveAttribute('role', 'alertdialog');
  });

  it('should focus the overlay on mount', function () {
    let res = render(<Example aria-label="Test dialog" />);
    let el = res.getByTestId('test');
    expect(el).toHaveAttribute('tabIndex', '-1');
    expect(document.activeElement).toBe(el);
  });

  it('should not focus the overlay if something inside is auto focused', function () {
    let res = render(
      <Example aria-label="Test dialog">
        <input data-testid="input" autoFocus />
      </Example>
    );
    let input = res.getByTestId('input');
    expect(document.activeElement).toBe(input);
  });

  describe('aria-describedby for alertdialog', function () {
    function AlertDialogExample(props) {
      let ref = useRef();
      let {dialogProps, titleProps, contentProps} = useDialog({role: 'alertdialog', ...props}, ref);
      return (
        <div ref={ref} {...dialogProps} data-testid="test">
          <h2 {...titleProps}>Alert Title</h2>
          {props.showContent && <p {...contentProps}>Alert message content</p>}
          {props.children}
        </div>
      );
    }

    it('should set aria-describedby on alertdialog when content is rendered', function () {
      let res = render(<AlertDialogExample aria-label="Test" showContent />);
      let el = res.getByTestId('test');
      let contentEl = el.querySelector('p');
      expect(el).toHaveAttribute('aria-describedby', contentEl.id);
    });

    it('should not auto-wire aria-describedby on regular dialog, but contentProps.id is still provided', function () {
      function RegularDialogExample(props) {
        let ref = useRef();
        let {dialogProps, titleProps, contentProps} = useDialog(props, ref);
        return (
          <div ref={ref} {...dialogProps} data-testid="test">
            <h2 {...titleProps}>Title</h2>
            <p {...contentProps}>Content</p>
          </div>
        );
      }

      let res = render(<RegularDialogExample aria-label="Test" />);
      let el = res.getByTestId('test');
      expect(el).not.toHaveAttribute('aria-describedby');
    });

    it('should allow aria-describedby override on alertdialog', function () {
      let res = render(<AlertDialogExample aria-label="Test" aria-describedby="custom-id" showContent />);
      let el = res.getByTestId('test');
      expect(el).toHaveAttribute('aria-describedby', 'custom-id');
    });
  });

  describe('dev warnings', function () {
    let originalWarn;

    beforeEach(function () {
      originalWarn = console.warn;
      console.warn = jest.fn();
    });

    afterEach(function () {
      console.warn = originalWarn;
    });

    it('should warn when dialog has no accessible title', function () {
      render(<Example />);
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('A dialog must have a title for accessibility')
      );
    });

    it('should not warn when aria-label is provided', function () {
      render(<Example aria-label="My dialog" />);
      expect(console.warn).not.toHaveBeenCalled();
    });

    it('should not warn when aria-labelledby is provided', function () {
      render(<Example aria-labelledby="some-id" />);
      expect(console.warn).not.toHaveBeenCalled();
    });

    it('should not warn when a title element is rendered', function () {
      render(<Example showTitle />);
      expect(console.warn).not.toHaveBeenCalled();
    });
  });
});
