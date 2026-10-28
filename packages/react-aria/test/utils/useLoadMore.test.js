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

import React, {useRef} from 'react';
import {render} from '@react-spectrum/test-utils-internal';
import {useLoadMore} from '../../src/utils/useLoadMore';

function Example({options}) {
  let ref = useRef(null);
  useLoadMore(options, ref);
  return <div ref={ref} />;
}

describe('useLoadMore', () => {
  it('waits for new items before requesting more for an empty viewport', () => {
    let onLoadMore = jest.fn();
    let options = {items: [], onLoadMore, isLoading: true};
    let {rerender} = render(<Example options={options} />);
    expect(onLoadMore).not.toHaveBeenCalled();

    options = {...options, isLoading: false};
    rerender(<Example options={options} />);
    expect(onLoadMore).not.toHaveBeenCalled();

    options = {...options, items: [{id: 1}]};
    rerender(<Example options={options} />);
    expect(onLoadMore).toHaveBeenCalledTimes(1);

    rerender(<Example options={options} />);
    rerender(<Example options={{...options}} />);
    expect(onLoadMore).toHaveBeenCalledTimes(1);

    rerender(<Example options={{...options, items: [...options.items, {id: 2}]}} />);
    expect(onLoadMore).toHaveBeenCalledTimes(2);
  });

  it('keeps a pending request guarded during local renders when items are omitted', () => {
    let onLoadMore = jest.fn();
    let options = {onLoadMore};
    let {rerender} = render(<Example options={options} />);
    expect(onLoadMore).toHaveBeenCalledTimes(1);

    rerender(<Example options={options} />);
    expect(onLoadMore).toHaveBeenCalledTimes(1);

    rerender(<Example options={{...options, isLoading: true}} />);
    expect(onLoadMore).toHaveBeenCalledTimes(1);

    rerender(<Example options={{...options, isLoading: false}} />);
    expect(onLoadMore).toHaveBeenCalledTimes(2);
  });
});
