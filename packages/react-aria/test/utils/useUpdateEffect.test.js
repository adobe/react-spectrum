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

import React from 'react';
import {render} from '@react-spectrum/test-utils-internal';
import {useUpdateEffect} from '../../src/utils/useUpdateEffect';

function Example({value, onUpdate}) {
  useUpdateEffect(() => onUpdate(value), [value]);
  return null;
}

describe('useUpdateEffect', () => {
  it('skips mounting and unchanged dependencies, and calls the latest callback on updates', () => {
    let onUpdate = jest.fn();
    let nextOnUpdate = jest.fn();
    let {rerender} = render(<Example value={NaN} onUpdate={onUpdate} />);
    expect(onUpdate).not.toHaveBeenCalled();

    rerender(<Example value={NaN} onUpdate={nextOnUpdate} />);
    expect(nextOnUpdate).not.toHaveBeenCalled();

    rerender(<Example value={0} onUpdate={nextOnUpdate} />);
    expect(nextOnUpdate).toHaveBeenCalledTimes(1);
    expect(nextOnUpdate).toHaveBeenLastCalledWith(0);

    rerender(<Example value={-0} onUpdate={nextOnUpdate} />);
    expect(nextOnUpdate).toHaveBeenCalledTimes(2);
    expect(nextOnUpdate).toHaveBeenLastCalledWith(-0);
    expect(onUpdate).not.toHaveBeenCalled();
  });

  let Activity = React.Activity;
  (Activity ? it : it.skip)('skips updates while hidden and when effects reconnect', () => {
    let onUpdate = jest.fn();
    function Test({mode, value}) {
      return (
        <Activity mode={mode}>
          <Example value={value} onUpdate={onUpdate} />
        </Activity>
      );
    }

    let {rerender} = render(<Test mode="visible" value={1} />);
    rerender(<Test mode="visible" value={2} />);
    expect(onUpdate).toHaveBeenCalledTimes(1);
    expect(onUpdate).toHaveBeenLastCalledWith(2);

    rerender(<Test mode="hidden" value={3} />);
    rerender(<Test mode="visible" value={3} />);
    expect(onUpdate).toHaveBeenCalledTimes(1);

    rerender(<Test mode="visible" value={4} />);
    expect(onUpdate).toHaveBeenCalledTimes(2);
    expect(onUpdate).toHaveBeenLastCalledWith(4);
  });
});
