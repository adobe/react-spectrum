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

import {act, render} from '@react-spectrum/test-utils-internal';
import React, {useRef} from 'react';
import {Size} from 'react-stately/useVirtualizerState';
import {useScrollView} from '../../src/virtualizer/ScrollView';

function RootScrollView(
  props: Partial<Parameters<typeof useScrollView>[0]> & {target: HTMLElement}
) {
  let {target, ...otherProps} = props;
  let ref = useRef(target);
  let {contentProps} = useScrollView(
    {
      contentSize: new Size(1200, 2000),
      onVisibleRectChange: jest.fn(),
      allowsWindowScrolling: true,
      ...otherProps
    },
    ref
  );
  return <div {...contentProps} />;
}

describe('ScrollView', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      jest.runAllTimers();
    });
  });

  it('preserves viewport client dimensions when attached to documentElement', () => {
    let origNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    try {
      Object.defineProperty(document.documentElement, 'clientWidth', {
        configurable: true,
        value: 1200
      });
      Object.defineProperty(document.documentElement, 'clientHeight', {
        configurable: true,
        value: 800
      });
      Object.defineProperty(document.documentElement, 'offsetHeight', {
        configurable: true,
        value: 50
      });
      let rectSpy = jest.spyOn(document.documentElement, 'getBoundingClientRect').mockReturnValue({
        width: 1200,
        height: 50,
        top: 0,
        left: 0,
        bottom: 50,
        right: 1200,
        x: 0,
        y: 0,
        toJSON: () => {}
      });

      let onSizeChange = jest.fn();
      render(<RootScrollView target={document.documentElement} onSizeChange={onSizeChange} />);

      expect(onSizeChange).toHaveBeenCalledWith(new Size(1200, 800));

      delete (document.documentElement as any).clientWidth;
      delete (document.documentElement as any).clientHeight;
      delete (document.documentElement as any).offsetHeight;
      rectSpy.mockRestore();
    } finally {
      process.env.NODE_ENV = origNodeEnv;
    }
  });
});
