/*
 * Copyright 2025 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {fireEvent, render} from '@react-spectrum/test-utils-internal';
import React, {useRef} from 'react';
import {useFormReset} from '../';

describe('useFormReset', () => {
  it('should call onReset on reset', () => {
    const onReset = jest.fn();
    const Form = () => {
      const ref = useRef<HTMLInputElement>(null);
      useFormReset(ref, '', onReset);
      return (
        <form>
          <input ref={ref} type="text" />
          <button type="reset">Reset</button>
        </form>
      );
    };
    const {getByRole} = render(<Form />);
    const button = getByRole('button');
    fireEvent.click(button);
    expect(onReset).toHaveBeenCalled();
  });

  it('should call onReset on reset even if event is stopped', () => {
    const onReset = jest.fn();
    const Form = () => {
      const ref = useRef<HTMLInputElement>(null);
      useFormReset(ref, '', onReset);
      return (
        <form onReset={(e) => e.stopPropagation()}>
          <input ref={ref} type="text" />
          <button type="reset">Reset</button>
        </form>
      );
    };
    const {getByRole} = render(<Form />);
    const button = getByRole('button');
    fireEvent.click(button);
    expect(onReset).toHaveBeenCalled();
  });

  it('should call every onReset on reset', () => {
    const onReset1 = jest.fn();
    const onReset2 = jest.fn();
    const Form = () => {
      const ref1 = useRef<HTMLInputElement>(null);
      useFormReset(ref1, '', onReset1);
      const ref2 = useRef<HTMLInputElement>(null);
      useFormReset(ref2, '', onReset2);
      return (
        <form>
          <input ref={ref1} type="text" />
          <input ref={ref2} type="text" />
          <button type="reset">Reset</button>
        </form>
      );
    };
    const {getByRole} = render(<Form />);
    const button = getByRole('button');
    fireEvent.click(button);
    expect(onReset1).toHaveBeenCalled();
    expect(onReset2).toHaveBeenCalled();
  });

  it('should not call onReset if reset is cancelled', async () => {
    const onReset = jest.fn();
    const Form = () => {
      const ref = useRef<HTMLInputElement>(null);
      useFormReset(ref, '', onReset);
      return (
        <form onReset={(e) => e.preventDefault()}>
          <input ref={ref} type="text" />
          <button type="reset">Reset</button>
        </form>
      );
    };
    const {getByRole} = render(<Form />);
    const button = getByRole('button');
    fireEvent.click(button);
    expect(onReset).not.toHaveBeenCalled();
  });

  it('should not call onReset if reset is cancelled in capture phase', async () => {
    const onReset = jest.fn();
    const Form = () => {
      const ref = useRef<HTMLInputElement>(null);
      useFormReset(ref, '', onReset);
      return (
        <form onResetCapture={(e) => e.preventDefault()}>
          <input ref={ref} type="text" />
          <button type="reset">Reset</button>
        </form>
      );
    };
    const {getByRole} = render(<Form />);
    const button = getByRole('button');
    fireEvent.click(button);
    expect(onReset).not.toHaveBeenCalled();
  });

  it('should not call any onReset if reset is cancelled', () => {
    const onReset1 = jest.fn();
    const onReset2 = jest.fn();
    const Form = () => {
      const ref1 = useRef<HTMLInputElement>(null);
      useFormReset(ref1, '', onReset1);
      const ref2 = useRef<HTMLInputElement>(null);
      useFormReset(ref2, '', onReset2);
      return (
        <form onReset={(e) => e.preventDefault()}>
          <input ref={ref1} type="text" />
          <input ref={ref2} type="text" />
          <button type="reset">Reset</button>
        </form>
      );
    };
    const {getByRole} = render(<Form />);
    const button = getByRole('button');
    fireEvent.click(button);
    expect(onReset1).not.toHaveBeenCalled();
    expect(onReset2).not.toHaveBeenCalled();
  });
});
