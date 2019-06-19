import assert from 'assert';
import React from 'react';
import {renderHook} from 'react-hooks-testing-library';
import {useButton} from '../';

describe('useButton tests', function () {
  test('handles defaults', function () {
    let props = {};
    let {result} = renderHook(() => useButton(props));
    assert.equal(typeof result.current.onClick, 'function');
    assert.equal(result.current.ElementType, 'button');
    assert.equal(result.current.buttonRef.current, undefined);
  });
  test('handles extra dom props', function () {
    let props = {href: 'url'};
    let {result} = renderHook(() => useButton(props));
    assert.equal(result.current.href, 'url');
  });
  test('handles elements other than button', function () {
    let props = {elementType: 'a'};
    let {result} = renderHook(() => useButton(props));
    assert.equal(result.current.ElementType, 'a');
    assert.equal(result.current.role, 'button');
    assert.equal(result.current.tabIndex, 0);
    assert.equal(result.current['aria-disabled'], undefined);
    assert.equal(result.current.href, undefined);
    assert.equal(typeof result.current.onKeyDown, 'function');
  });
});
