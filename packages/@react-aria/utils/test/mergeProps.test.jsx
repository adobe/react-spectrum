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

import clsx from 'clsx';
import { mergeIds, useId } from '../src/useId';
import { mergeProps } from '../src/mergeProps';
import { render } from '@react-spectrum/test-utils-internal';

describe('mergeProps', function () {
  it('handles one argument', function () {
    let onClick = () => { };
    let className = 'primary';
    let id = 'test_id';
    let mergedProps = mergeProps({ onClick, className, id });
    expect(mergedProps.onClick).toBe(onClick);
    expect(mergedProps.className).toBe(className);
    expect(mergedProps.id).toBe(id);
  });

  it('combines callbacks', function () {
    let mockFn = jest.fn();
    let message1 = 'click1';
    let message2 = 'click2';
    let message3 = 'click3';
    let mergedProps = mergeProps(
      { onClick: () => mockFn(message1) },
      { onClick: () => mockFn(message2) },
      { onClick: () => mockFn(message3) }
    );
    mergedProps.onClick();
    expect(mockFn).toHaveBeenNthCalledWith(1, message1);
    expect(mockFn).toHaveBeenNthCalledWith(2, message2);
    expect(mockFn).toHaveBeenNthCalledWith(3, message3);
    expect(mockFn).toHaveBeenCalledTimes(3);
  });

  it('merges props with different keys', function () {
    let mockFn = jest.fn();
    let click1 = 'click1';
    let click2 = 'click2';
    let hover = 'hover';
    let focus = 'focus';
    let margin = 2;
    const mergedProps = mergeProps(
      { onClick: () => mockFn(click1) },
      { onHover: () => mockFn(hover), styles: { margin } },
      { onClick: () => mockFn(click2), onFocus: () => mockFn(focus) }
    );
    mergedProps.onClick();
    let callOrder = mockFn.mock.invocationCallOrder;
    expect(mockFn).toHaveBeenNthCalledWith(1, click1);
    expect(mockFn).toHaveBeenNthCalledWith(2, click2);
    expect(callOrder[0]).toBeLessThan(callOrder[1]);
    mergedProps.onFocus();
    expect(mockFn).toHaveBeenNthCalledWith(3, focus);
    mergedProps.onHover();
    expect(mockFn).toHaveBeenNthCalledWith(4, hover);
    expect(mockFn).toHaveBeenCalledTimes(4);
    expect(mergedProps.styles.margin).toBe(margin);
  });

  it('combines classNames', function () {
    let className1 = 'primary';
    let className2 = 'hover';
    let className3 = 'focus';
    let mergedProps = mergeProps({ className: className1 }, { className: className2 }, { className: className3 });
    let mergedClassNames = clsx(className1, className2, className3);
    expect(mergedProps.className).toBe(mergedClassNames);
  });

  it('combines ids', function () {
    let id1 = 'id1';
    let id2 = 'id2';
    let id3 = 'id3';
    let mergedProps = mergeProps({ id: id1 }, { id: id2 }, { id: id3 });
    let mergedIds = mergeIds(mergeIds(id1, id2), id3);
    expect(mergedProps.id).toBe(mergedIds);
  });

  it('combines ids with aria ids', function () {
    let Spy = jest.fn((props) => <div {...props} />);

    const Component = () => {
      let id1 = 'id1';
      let id2 = useId('id2');

      mergeProps({ id: id1 }, { id: id2 });

      return <Spy id={id2} />
    };

    render(<Component />);

    // We use stringMatching to support optional refs in React 19.
    expect(Spy).toHaveBeenCalledWith({ id: 'id2' }, expect.not.stringMatching(/\A(?!x)x/));
    expect(Spy).toHaveBeenLastCalledWith({ id: 'id1' }, expect.not.stringMatching(/\A(?!x)x/));
  });

  it('combines reoccuring ids', function () {
    const Component = () => {
      let id1 = useId('id1');
      let id2 = useId('id2');

      return <div {...mergeProps({ id: id1 }, { id: id2 }, { id: id1 })} />;
    };

    expect(() => render(<Component />)).not.toThrow();
  });

  it('overrides other props', function () {
    let id1 = 'id1';
    let id2 = 'id2';
    let mergedProps = mergeProps({ data: id1 }, { data: id2 });
    expect(mergedProps.data).toBe(id2);
  });
});
