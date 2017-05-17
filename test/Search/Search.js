import React from 'react';
import assert from 'assert';
import Search from '../../src/Search';
import {shallow} from 'enzyme';
import sinon from 'sinon';

describe('Search', () => {
  it('default', () => {
    const tree = shallow(<Search />);
    assert.equal(tree.hasClass('coral-DecoratedTextfield'), true);
    assert.equal(tree.hasClass('coral-Search'), true);

    const icon = tree.find('.coral-DecoratedTextfield-icon');
    assert.equal(icon.prop('className'), 'coral-DecoratedTextfield-icon');
    assert.equal(icon.prop('icon'), 'search');
    assert.equal(icon.prop('size'), 'S');

    const input = findInput(tree);
    assert.equal(input.hasClass('coral-DecoratedTextfield-input'), true);
    assert.equal(input.hasClass('coral-Search-input'), true);

    const button = findButton(tree);
    assert(!button.node);
  });

  it('should support custom icons', () => {
    const tree = shallow(<Search icon="refresh" />);
    const icon = tree.find('.coral-DecoratedTextfield-icon');
    assert.equal(icon.prop('icon'), 'refresh');
  });

  it('should support no icon', () => {
    const tree = shallow(<Search icon="" />);
    const icon = tree.find('.coral-DecoratedTextfield-icon');
    assert(!icon.node);
  });

  it('shows clear button if text exists', () => {
    const tree = shallow(<Search defaultValue="foo" />);
    const button = findButton(tree);
    assert.equal(button.prop('variant'), 'minimal');
    assert.equal(button.prop('icon'), 'close');
    assert.equal(button.prop('iconSize'), 'XS');
    assert.equal(button.prop('square'), true);
    assert.equal(button.prop('className'), 'coral-DecoratedTextfield-button');
  });

  describe('onSubmit', () => {
    let spy;
    let preventDefaultSpy;

    beforeEach(() => {
      spy = sinon.spy();
      preventDefaultSpy = sinon.spy();
    });

    it('is called when enter is pressed', () => {
      const tree = shallow(<Search onSubmit={ spy } />);
      findInput(tree).simulate('keyDown', {which: 13, preventDefault: preventDefaultSpy});
      assert(spy.called);
      assert(preventDefaultSpy.called);
    });

    it('is not called when enter is pressed if it is disabled', () => {
      const tree = shallow(<Search onSubmit={ spy } disabled />);
      findInput(tree).simulate('keyDown', {which: 13, preventDefault: preventDefaultSpy});
      assert(!spy.called);
      assert(preventDefaultSpy.called);
    });
  });

  describe('onClear', () => {
    let spy;
    let preventDefaultSpy;

    beforeEach(() => {
      spy = sinon.spy();
      preventDefaultSpy = sinon.spy();
    });

    it('is called when escape is pressed', () => {
      const tree = shallow(<Search onClear={ spy } />);
      findInput(tree).simulate('keyDown', {which: 27, preventDefault: preventDefaultSpy});
      assert(spy.called);
      assert(preventDefaultSpy.called);
    });

    it('is called when the clear button is pressed', () => {
      const tree = shallow(<Search onClear={ spy } defaultValue="foo" />);
      findButton(tree).simulate('click');
      assert(spy.called);
    });

    it('is not called when escape is pressed if it is disabled', () => {
      const tree = shallow(<Search onClear={ spy } defaultValue="foo" disabled />);
      findInput(tree).simulate('keyDown', {which: 27, preventDefault: preventDefaultSpy});
      assert(!spy.called);
      assert(preventDefaultSpy.called);
    });

    it('is not called when the clear button is preseed if it is disabled', () => {
      const tree = shallow(<Search onClear={ spy } defaultValue="foo" disabled />);
      findButton(tree).simulate('click');
      assert(!spy.called);
    });
  });

  it('calls onChange when text is entered', () => {
    const spy = sinon.spy();
    const tree = shallow(<Search onChange={ spy } />);
    assert.equal(tree.state('value'), '');
    assert.equal(tree.state('emptyText'), true);

    findInput(tree).simulate('change', 'a');
    assert(spy.called);
    assert.equal(tree.state('value'), 'a');
    assert.equal(tree.state('emptyText'), false);
  });

  it('supports clearable', () => {
    const tree = shallow(<Search defaultValue="foo" clearable={ false } />);
    assert(!findButton(tree).node);
  });

  it('supports disabled', () => {
    const tree = shallow(<Search defaultValue="foo" disabled />);
    assert.equal(findInput(tree).prop('disabled'), true);
    assert.equal(findButton(tree).prop('disabled'), true);
  });

  it('supports additional classNames', () => {
    const tree = shallow(<Search className="myClass" />);
    assert.equal(tree.hasClass('myClass'), true);
  });

  it('supports additional properties', () => {
    const tree = shallow(<Search foo />);
    assert.equal(findInput(tree).prop('foo'), true);
  });
});

const findInput = tree => tree.find('.coral-DecoratedTextfield-input');
const findButton = tree => tree.find('.coral-DecoratedTextfield-button');
