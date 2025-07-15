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

import {mergeRefs} from '../';
import React, {useCallback, useRef} from 'react';
import {render} from '@react-spectrum/test-utils-internal';

describe('mergeRefs', () => {
  it('merge Refs', () => {
    let ref1;
    let ref2;

    const TextField = (props) => {
      ref1 = useRef(null);
      ref2 = useRef(null);

      const ref = mergeRefs(ref1, ref2);
      return <input {...props} ref={ref} />;
    };

    render(<TextField foo="foo" />);

    expect(ref1.current).toBe(ref2.current);
  });

  it('should support additional properties on the refs', () => {
    // We mock refs here because they are only mutable in React18+
    let ref1 = {current: null};
    let ref2 = {current: null, foo: 'bar'};
    let ref3 = (() => {}) as any;
    ref3.baz = 'foo';
    
    let ref = mergeRefs(ref1, ref2, ref3) as any;
    expect(ref.foo).toBe('bar');
    expect(ref.baz).toBe('foo');
  });

  if (parseInt(React.version.split('.')[0], 10) >= 19) {
    it('merge Ref Cleanup', () => {
      const cleanUp = jest.fn();
      let ref1;
      let ref2;
      let target = null;

      const TextField = (props) => {
        ref1 = useRef(null);
        ref2 = useRef(null);
        let ref3 = useCallback((node) => {
          target = node;
          return cleanUp;
        }, []);

        const ref = mergeRefs(ref1, ref2, ref3);
        return <input {...props} ref={ref} />;
      };

      const {unmount} = render(<TextField foo="foo" />);

      expect(cleanUp).toHaveBeenCalledTimes(0);
      expect(ref1.current).toBe(target);
      expect(ref2.current).toBe(target);
      unmount();

      // Now cleanup has been called
      expect(cleanUp).toHaveBeenCalledTimes(1);
    });
  }
});
