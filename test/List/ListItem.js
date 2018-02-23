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

    it('should trigger onClick if both onClick and onSelect are supplied.', () => {
      const tree = render({onClick: clickSpy, onSelect: selectSpy});
      tree.simulate('click', {preventDefault: () => {}});
      assert(clickSpy.called);
      assert(!selectSpy.called);
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
});
