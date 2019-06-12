import {act, renderHook} from 'react-hooks-testing-library';
import assert from 'assert';
import React from 'react';
import sinon from 'sinon';
import {useTabListState} from '../';

test.skip('test with react-hooks-testing, controled index', function () {
  let props = {
    selectedIndex: 1,
    onChange: sinon.spy()
  };
  let {result} = renderHook(() => useTabListState(props));
  assert.equal(1, result.current.selectedIndex);

  act(() => result.current.setSelectedIndex(3));
  assert.equal(1, result.current.selectedIndex);
  assert.equal(props.onChange.getCall(0).args[0],3);
});

test.skip('test with react-hooks-testing, uncontrolled index', function () {
  let props = {
    defaultSelectedIndex: 1,
    onChange: sinon.spy()
  };
  let {result} = renderHook(() => useTabListState(props));
  assert.equal(1, result.current.selectedIndex);

  act(() => result.current.setSelectedIndex(3));
  assert.equal(3, result.current.selectedIndex);
  assert.equal(props.onChange.getCall(0).args[0],3);
});
