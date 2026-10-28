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
import {Key} from '@react-types/shared';
import {LayoutInfo, Size} from 'react-stately/useVirtualizerState';
import React, {useRef} from 'react';
import {useVirtualizerItem} from '../../src/virtualizer/useVirtualizerItem';

interface ItemProps {
  id: string;
  shouldMeasure: boolean;
  virtualizer: {
    updateItemSize(key: Key, size: Size): void;
  };
}

function Item({id, shouldMeasure, virtualizer}: ItemProps) {
  let ref = useRef<HTMLDivElement | null>(null);
  useVirtualizerItem({
    layoutInfo: shouldMeasure ? ({key: id, estimatedSize: true} as LayoutInfo) : null,
    virtualizer,
    ref
  });

  return <div ref={ref} data-testid={id} />;
}

function Example({shouldMeasure, virtualizer}: Omit<ItemProps, 'id'>) {
  return (
    <>
      <Item id="one" shouldMeasure={shouldMeasure} virtualizer={virtualizer} />
      <Item id="two" shouldMeasure={shouldMeasure} virtualizer={virtualizer} />
      <Item id="three" shouldMeasure={shouldMeasure} virtualizer={virtualizer} />
    </>
  );
}

type MeasurementEvent = {
  type: 'clear' | 'read' | 'restore' | 'update';
  key: string;
};

describe('useVirtualizerItem', () => {
  it('batches virtualized item measurements', async () => {
    let events: MeasurementEvent[] = [];
    let updateItemSize = jest.fn((key: Key) => events.push({type: 'update', key: String(key)}));
    let virtualizer = {updateItemSize};
    let {getByTestId, rerender} = render(
      <Example shouldMeasure={false} virtualizer={virtualizer} />
    );
    let items = ['one', 'two', 'three'].map((key, index) => {
      let element = getByTestId(key);
      element.style.height = `${20 + index}px`;
      return {element, key};
    });
    let styleKeys = new Map(items.map(({element, key}) => [element.style, key]));
    let elementKeys = new Map(items.map(({element, key}) => [element, key]));
    let heightSetter = Object.getOwnPropertyDescriptor(
      CSSStyleDeclaration.prototype,
      'height'
    )?.set;

    if (!heightSetter) {
      throw new Error('CSSStyleDeclaration.height must have a setter');
    }

    let heightSpy = jest
      .spyOn(CSSStyleDeclaration.prototype, 'height', 'set')
      .mockImplementation(function (this: CSSStyleDeclaration, value: string) {
        let key = styleKeys.get(this);
        if (key) {
          events.push({type: value ? 'restore' : 'clear', key});
        }
        heightSetter.call(this, value);
      });
    let scrollWidthSpy = jest
      .spyOn(HTMLElement.prototype, 'scrollWidth', 'get')
      .mockImplementation(function (this: HTMLElement) {
        let key = elementKeys.get(this);
        if (key) {
          events.push({type: 'read', key});
        }
        return 100;
      });
    let scrollHeightSpy = jest
      .spyOn(HTMLElement.prototype, 'scrollHeight', 'get')
      .mockImplementation(function (this: HTMLElement) {
        let key = elementKeys.get(this);
        if (key) {
          events.push({type: 'read', key});
        }
        return 50;
      });

    try {
      rerender(<Example shouldMeasure virtualizer={virtualizer} />);
      await act(async () => {
        await new Promise<void>(resolve => queueMicrotask(resolve));
      });

      expect(events.map(event => event.type)).toEqual([
        'clear',
        'clear',
        'clear',
        'read',
        'read',
        'read',
        'read',
        'read',
        'read',
        'restore',
        'restore',
        'restore',
        'update',
        'update',
        'update'
      ]);
      expect(items.map(({element}) => element.style.height)).toEqual(['20px', '21px', '22px']);
      expect(updateItemSize).toHaveBeenCalledTimes(items.length);
    } finally {
      heightSpy.mockRestore();
      scrollWidthSpy.mockRestore();
      scrollHeightSpy.mockRestore();
    }
  });
});
