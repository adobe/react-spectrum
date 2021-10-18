/*
 * Copyright 2021 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import React from 'react';
import {render} from '@testing-library/react';
import {renderHook} from '@testing-library/react-hooks';
import {useObjectRef} from '../';

describe('useObjectRef', () => {
  it('should return an object ref by default', () => {
    const {result} = renderHook(() => useObjectRef());

    expect(result.current.current).not.toBe(null);
  });

  it('should return an object ref for an object ref', () => {
    const ref = React.createRef();

    const {result} = renderHook(() => useObjectRef(ref));

    expect(result.current.current).toBe(ref.current);
  });

  it('should return an object ref for a function ref', () => {
    let inputElem;
    const ref = (el) => inputElem = el;

    const {result} = renderHook(() => useObjectRef(ref));

    expect(result.current.current).toBe(inputElem);
  });

  it('should support React.forwardRef for an object ref', () => {
    const TextField = React.forwardRef((props, forwardedRef) => {
      const ref = useObjectRef(forwardedRef);

      return <input {...props} ref={ref} />;
    });

    const textFieldRef = React.createRef();

    render(<TextField placeholder="Foo" ref={textFieldRef} />);

    expect(textFieldRef.current.placeholder).toBe('Foo');
  });

  it('should support React.forwardRef for a function ref', () => {
    const TextField = React.forwardRef((props, forwardedRef) => {
      const ref = useObjectRef(forwardedRef);

      return <input {...props} ref={ref} />;
    });

    let inputElem;

    render(<TextField placeholder="Foo" ref={el => inputElem = el} />);

    expect(inputElem.placeholder).toBe('Foo');
  });
});
