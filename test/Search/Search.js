import assert from 'assert';
import React from 'react';
import Search from '../../src/Search';
import {shallow} from 'enzyme';
import sinon from 'sinon';

describe('Search', () => {
  it('default', () => {
    const tree = shallow(<Search />);
    assert.equal(tree.hasClass('spectrum-DecoratedTextfield'), true);
    assert.equal(tree.hasClass('spectrum-Search'), true);

    const icon = tree.find('.spectrum-DecoratedTextfield-icon');
    assert.equal(icon.prop('className'), 'spectrum-DecoratedTextfield-icon spectrum-Search-icon');

    const input = findInput(tree);
    assert.equal(input.hasClass('spectrum-DecoratedTextfield-input'), true);
    assert.equal(input.hasClass('spectrum-Search-input'), true);

    const button = findButton(tree);
    assert(!button.node);
  });

  it('should support custom icons', () => {
    const tree = shallow(<Search icon="refresh" />);
    const icon = tree.find('.spectrum-DecoratedTextfield-icon');
    assert.equal(icon.prop('icon'), 'refresh');
  });

  it('should support no icon', () => {
    const tree = shallow(<Search icon="" />);
    const icon = tree.find('.spectrum-DecoratedTextfield-icon');
    assert(!icon.node);
  });

  it('shows clear button if text exists', () => {
    const tree = shallow(<Search defaultValue="foo" />);
    const button = findButton(tree);
    assert.equal(button.prop('variant'), 'icon');
    assert.equal(button.prop('className'), 'spectrum-Search-clear');
  });

  describe('onSubmit', () => {
    let spy;
    let preventDefaultSpy;

    beforeEach(() => {
      spy = sinon.spy();
      preventDefaultSpy = sinon.spy();
    });

    it('is called when enter is pressed', () => {
      const tree = shallow(<Search onSubmit={spy} />);
      findInput(tree).simulate('keyDown', {which: 13, preventDefault: preventDefaultSpy});
      assert(spy.called);
      assert(preventDefaultSpy.called);
    });

    it('is not called when enter is pressed if it is disabled', () => {
      const tree = shallow(<Search onSubmit={spy} disabled />);
      findInput(tree).simulate('keyDown', {which: 13, preventDefault: preventDefaultSpy});
      assert(!spy.called);
      assert(preventDefaultSpy.called);
    });
  });

  describe('onChange', () => {
    let spy;
    let preventDefaultSpy;

    beforeEach(() => {
      spy = sinon.spy();
      preventDefaultSpy = sinon.spy();
    });

    it('is called when escape is pressed', () => {
      const tree = shallow(<Search onChange={spy} defaultValue="foo" />);
      findInput(tree).simulate('keyDown', {which: 27, preventDefault: preventDefaultSpy});
      assert(spy.calledWith('', sinon.match.any, {from: 'escapeKey'}));
      assert(preventDefaultSpy.called);
    });

    it('is called when the clear button is pressed', () => {
      const tree = shallow(<Search onChange={spy} defaultValue="foo" />);
      findButton(tree).simulate('click');
      assert(spy.calledWith('', sinon.match.any, {from: 'clearButton'}));
    });

    it('is not called when escape is pressed if it is disabled', () => {
      const tree = shallow(<Search onClear={spy} defaultValue="foo" disabled />);
      findInput(tree).simulate('keyDown', {which: 27, preventDefault: preventDefaultSpy});
      assert(!spy.called);
      assert(preventDefaultSpy.called);
    });

    it('is not called when escape is pressed if value is empty', () => {
      const tree = shallow(<Search onClear={spy} />);
      findInput(tree).simulate('keyDown', {which: 27, preventDefault: preventDefaultSpy});
      assert(!spy.called);
      assert(preventDefaultSpy.called);
    });

    it('is not called when the clear button is pressed if it is disabled', () => {
      const tree = shallow(<Search onClear={spy} defaultValue="foo" disabled />);
      findButton(tree).simulate('click');
      assert(!spy.called);
    });

    it('is called when text is entered', () => {
      const spy = sinon.spy();
      const tree = shallow(<Search onChange={spy} />);
      assert.equal(tree.state('value'), '');

      findInput(tree).simulate('change', 'a');
      assert(spy.calledWith('a', sinon.match.any, {from: 'input'}));
      assert.equal(tree.state('value'), 'a');
    });
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

const findInput = tree => tree.find('.spectrum-DecoratedTextfield-input');
const findButton = tree => tree.find('.spectrum-Search-clear');
