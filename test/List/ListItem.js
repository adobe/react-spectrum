/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
* Copyright 2019 Adobe
* All Rights Reserved.
*
* NOTICE: All information contained herein is, and remains
* the property of Adobe and its suppliers, if any. The intellectual
* and technical concepts contained herein are proprietary to Adobe
* and its suppliers and are protected by all applicable intellectual
* property laws, including trade secret and copyright laws.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe.
**************************************************************************/

import assert from 'assert';
import {ListItem} from '../../src/List';
import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';

const render = (props) => {
  const defaultProps = {
    label: 'Foo'
  };
  return shallow(<ListItem {...defaultProps} {...props} />);
};

describe('ListItem', () => {
  it('li elements from ListItem shouldn\'t be passed a value prop', () => {
    const tree = render({value: 'test'});
    assert(!tree.props().value);
    assert(tree.instance().props.value === 'test');
  });

  describe('handleMouseEnter', () => {
    let focusSpy;

    beforeEach(() => {
      focusSpy = sinon.spy();
    });

    it('should focus the currentTarget on mouseEnter if onMouseEnter is undefined', () => {
      const tree = render();
      tree.simulate('mouseenter', {currentTarget: {focus: focusSpy}});
      assert(focusSpy.called);
    });

    it('shouldn\'t focus the currentTarget on mouseEnter if onMouseEnter is supplied', () => {
      const tree = render({onMouseEnter: () => {}});
      tree.simulate('mouseenter', {currentTarget: {focus: focusSpy}});
      assert(!focusSpy.called);
    });
  });

  describe('handleClick', () => {
    let clickSpy;
    let selectSpy;

    beforeEach(() => {
      clickSpy = sinon.spy();
      selectSpy = sinon.spy();
    });

    it('should trigger onClick if onClick is supplied', () => {
      const tree = render({onClick: clickSpy});
      tree.simulate('click', {preventDefault: () => {}});
      assert(clickSpy.called);
    });

    it('should trigger onSelect if onSelect is supplied and onClick is not supplied.', () => {
      const tree = render({onSelect: selectSpy});
      tree.simulate('click', {preventDefault: () => {}});
      assert(selectSpy.called);
    });

    it('should trigger onClick and onSelect if both are supplied.', () => {
      const tree = render({onClick: clickSpy, onSelect: selectSpy});
      tree.simulate('click', {preventDefault: () => {}});
      assert(clickSpy.called);
      assert(selectSpy.called);
    });
  });

  describe('handleFocus', () => {
    let focusSpy;

    beforeEach(() => {
      focusSpy = sinon.spy();
    });

    it('should trigger onFocus if onFocus is supplied', () => {
      const tree = render({onFocus: focusSpy});
      tree.simulate('focus', {preventDefault: () => {}});
      assert(focusSpy.called);
    });
  });

  describe('handleKeydown', () => {
    let keyDownSpy;

    beforeEach(() => {
      keyDownSpy = sinon.spy();
    });

    it('should trigger onKeyDown if onKeyDown is supplied', () => {
      const tree = render({onKeyDown: keyDownSpy});
      tree.simulate('keydown', {key: 'ArrowDown', preventDefault: () => {}});
      assert(keyDownSpy.called);
    });
  });

  describe('handleBlur', () => {
    let blurSpy;

    beforeEach(() => {
      blurSpy = sinon.spy();
    });

    it('should trigger onBlur if onBlur is supplied', () => {
      const tree = render({onBlur: blurSpy});
      tree.simulate('blur', {preventDefault: () => {}});
      assert(blurSpy.called);
    });
  });

  describe('when role=menuitemcheckbox or role=menuitemradio', () => {
    it('should include aria-checked', () => {
      const tree = render({role: 'menuitemcheckbox'});
      assert.equal(tree.find('.spectrum-Menu-item').prop('aria-checked'), false);
      assert.equal(tree.find('.spectrum-Menu-item').prop('aria-selected'), null);

      tree.setProps({selected: true});
      assert.equal(tree.find('.spectrum-Menu-item').prop('aria-checked'), true);
      assert.equal(tree.find('.spectrum-Menu-item').prop('aria-selected'), null);

      tree.setProps({role: 'menuitemradio'});
      assert.equal(tree.find('.spectrum-Menu-item').prop('aria-checked'), true);

      tree.setProps({role: 'option'});
      assert.equal(tree.find('.spectrum-Menu-item').prop('aria-checked'), null);
      assert.equal(tree.find('.spectrum-Menu-item').prop('aria-selected'), true);

      tree.setProps({role: 'menuitem'});
      assert.equal(tree.find('.spectrum-Menu-item').prop('aria-checked'), null);
      assert.equal(tree.find('.spectrum-Menu-item').prop('aria-selected'), null);
    });
  });
});
