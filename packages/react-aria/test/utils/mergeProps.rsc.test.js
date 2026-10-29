/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {version} from 'react/package.json';

let describeRSC = parseInt(version, 10) >= 19 ? describe : describe.skip;

describeRSC('mergeProps in React Server Components', function () {
  it('imports and merges props with the React server entry point', function () {
    let React = require('react');
    expect(React.createContext).toBeUndefined();
    expect(typeof window).toBe('undefined');
    expect(typeof document).toBe('undefined');

    let {mergeProps} = require('react-aria/mergeProps');
    expect(
      mergeProps({id: 'first', className: 'first'}, {id: 'second', className: 'second'})
    ).toEqual({id: 'second', className: 'first second'});
    expect(mergeProps({id: 'same', title: 'kept'}, {id: 'same', title: undefined})).toEqual({
      id: 'same',
      title: 'kept'
    });
  });
});
