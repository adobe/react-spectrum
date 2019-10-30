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
import Autocomplete from '../../src/Autocomplete';
import {mount, shallow} from 'enzyme';
import React from 'react';
import Refresh from '../../src/Icon/Refresh';
import Search from '../../src/Search';
import sinon from 'sinon';

describe('Search', () => {
  it('default', () => {
    const tree = shallow(<Search />);
    assert.equal(tree.hasClass('spectrum-Search'), true);
    assert.equal(tree.prop('role'), undefined);

    const icon = tree.find('.spectrum-Search-icon');
    assert.equal(icon.prop('className'), 'spectrum-Search-icon');

    const input = findInput(tree);
    assert.equal(input.hasClass('spectrum-Search-input'), true);
    assert.equal(input.prop('type'), 'search');

    const button = findButton(tree);
    assert(!button.length);
  });

  it('should support custom icons', () => {
    const tree = shallow(<Search icon={<Refresh />} />);
    const icon = tree.find('.spectrum-Search-icon');
    assert.equal(icon.type(), Refresh);
  });

  it('should support no icon', () => {
    const tree = shallow(<Search icon="" />);
    const icon = tree.find('.spectrum-Search-icon');
    assert(!icon.length);
  });

  it('shows clear button if text exists', () => {
    const tree = shallow(<Search defaultValue="foo" />);
    const button = findButton(tree);
    assert.equal(button.prop('aria-label'), 'Clear search');
    assert.equal(button.prop('variant'), 'clear');
  });

  describe('onSubmit', () => {
    let spy;
    let preventDefaultSpy;
    let keyDownSpy;

    beforeEach(() => {
      spy = sinon.spy();
      preventDefaultSpy = sinon.spy();
      keyDownSpy = sinon.spy();
    });

    it('is called when enter is pressed', () => {
      const tree = shallow(<Search onSubmit={spy} onKeyDown={keyDownSpy} />);
      findInput(tree).simulate('keyDown', {which: 13, preventDefault: preventDefaultSpy});
      assert(spy.called);
      assert(preventDefaultSpy.called);
      assert(keyDownSpy.called);
    });

    it('is not called when enter is pressed if it is disabled', () => {
      const tree = shallow(<Search onSubmit={spy} onKeyDown={keyDownSpy} disabled />);
      findInput(tree).simulate('keyDown', {which: 13, preventDefault: preventDefaultSpy});
      assert(!spy.called);
      assert(preventDefaultSpy.called);
      assert(!keyDownSpy.called);
    });
  });

  describe('onChange', () => {
    let spy;
    let preventDefaultSpy;
    let keyDownSpy;

    beforeEach(() => {
      spy = sinon.spy();
      preventDefaultSpy = sinon.spy();
      keyDownSpy = sinon.spy();
    });

    it('is called when escape is pressed', () => {
      const tree = shallow(<Search onChange={spy} onKeyDown={keyDownSpy} defaultValue="foo" />);
      assert.equal(tree.find('Textfield').prop('value'), 'foo');
      findInput(tree).simulate('keyDown', {which: 27, preventDefault: preventDefaultSpy});
      assert(spy.calledWith('', sinon.match.any, {from: 'escapeKey'}));
      assert(preventDefaultSpy.called);
      assert(keyDownSpy.called);
      assert.equal(tree.find('Textfield').prop('value'), '');
    });

    it('does not change value when escape is pressed (controlled)', () => {
      const tree = shallow(<Search onChange={spy} onKeyDown={keyDownSpy} value="foo" />);
      assert.equal(tree.find('Textfield').prop('value'), 'foo');
      findInput(tree).simulate('keyDown', {which: 27, preventDefault: preventDefaultSpy});
      assert(spy.calledWith('', sinon.match.any, {from: 'escapeKey'}));
      assert(preventDefaultSpy.called);
      assert(keyDownSpy.called);
      assert.equal(tree.find('Textfield').prop('value'), 'foo');
    });

    it('is called when the clear button is pressed', () => {
      const tree = shallow(<Search onChange={spy} defaultValue="foo" />);
      assert.equal(tree.find('Textfield').prop('value'), 'foo');
      findButton(tree).simulate('click');
      assert(spy.calledWith('', sinon.match.any, {from: 'clearButton'}));
      assert.equal(tree.find('Textfield').prop('value'), '');
    });

    it('does not change value when the clear button is pressed (controlled)', () => {
      const tree = shallow(<Search onChange={spy} value="foo" />);
      assert.equal(tree.find('Textfield').prop('value'), 'foo');
      findButton(tree).simulate('click');
      assert(spy.calledWith('', sinon.match.any, {from: 'clearButton'}));
      assert.equal(tree.find('Textfield').prop('value'), 'foo');
    });

    it('is not called when escape is pressed if it is disabled', () => {
      const tree = shallow(<Search onClear={spy} onKeyDown={keyDownSpy} defaultValue="foo" disabled />);
      assert.equal(tree.find('Textfield').prop('value'), 'foo');
      findInput(tree).simulate('keyDown', {which: 27, preventDefault: preventDefaultSpy});
      assert(!spy.called);
      assert(preventDefaultSpy.called);
      assert(!keyDownSpy.called);
      assert.equal(tree.find('Textfield').prop('value'), 'foo');
    });

    it('is not called when escape is pressed if value is empty', () => {
      const tree = shallow(<Search onClear={spy} onKeyDown={keyDownSpy} />);
      findInput(tree).simulate('keyDown', {which: 27, preventDefault: preventDefaultSpy});
      assert(!spy.called);
      assert(preventDefaultSpy.called);
      assert(keyDownSpy.called);
    });

    it('is not called when the clear button is pressed if it is disabled', () => {
      const tree = shallow(<Search onClear={spy} defaultValue="foo" disabled />);
      assert.equal(tree.find('Textfield').prop('value'), 'foo');
      findButton(tree).simulate('click');
      assert(!spy.called);
      assert.equal(tree.find('Textfield').prop('value'), 'foo');
    });

    it('is called when text is entered', () => {
      const spy = sinon.spy();
      const tree = shallow(<Search onChange={spy} />);
      assert.equal(tree.find('Textfield').prop('value'), '');

      findInput(tree).simulate('change', 'a');
      assert(spy.calledWith('a', sinon.match.any, {from: 'input'}));
      assert.equal(tree.find('Textfield').prop('value'), 'a');
    });

    it('does not change value when text is entered (controlled)', () => {
      const spy = sinon.spy();
      const tree = shallow(<Search onChange={spy} value="foo" />);
      assert.equal(tree.find('Textfield').prop('value'), 'foo');

      findInput(tree).simulate('change', 'a');
      assert(spy.calledWith('a', sinon.match.any, {from: 'input'}));
      assert.equal(tree.find('Textfield').prop('value'), 'foo');
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
    const tree = shallow(<Search aria-hidden="true" />);
    assert.equal(findInput(tree).prop('aria-hidden'), 'true');
  });

  it('restores focus to input when clear button is clicked', () => {
    const tree = shallow(<Search defaultValue="foo" />);
    tree.instance().searchbox = {
      focus: sinon.spy()
    };
    const button = findButton(tree);
    button.simulate('click');
    assert(tree.instance().searchbox.focus.called);
  });

  it('has searchbox ref', () => {
    const tree = mount(<Search />);
    assert(tree.instance().searchbox);
    tree.unmount();
  });

  it('supports setting value with prop', () => {
    const tree = shallow(<Search />);
    tree.setProps({value: 'hello world'});
    assert.equal(tree.state('value'), 'hello world');
  });

  describe('within Autocomplete', () => {
    it('supports prop overrides to implement WAI-ARIA combobox', () => {
      const tree = shallow(<Autocomplete getCompletions={() => []}><Search type="text" /></Autocomplete>);
      const search = tree.find(Search).dive();
      assert.equal(tree.prop('role'), 'combobox');
      assert.equal(tree.prop('aria-expanded'), false);
      assert.equal(tree.prop('aria-haspopup'), 'listbox');
      assert.equal(search.prop('role'), undefined);
      assert.equal(findInput(search).prop('aria-autocomplete'), 'list');
      assert.equal(findInput(search).prop('type'), 'text', 'input element can receive type=text, to keep automated accessibility testing tools happy');
    });
  });

  describe('with custom combobox implementation', () => {
    it('supports prop overrides to implement WAI-ARIA 1.0 combobox', () => {
      const tree = shallow(
        <Search
          type="text"
          role="combobox"
          aria-expanded="true"
          aria-haspopup="listbox"
          aria-owns="listbox-id"
          aria-autocomplete="list"
          aria-controls="listbox-id"
          aria-activedescendant="listbox-id-item-0" />
      );
      assert.equal(findInput(tree).prop('type'), 'text', 'input element should receive type=text');
      assert.equal(findInput(tree).prop('role'), 'combobox', 'input element should receive combobox role');
      assert.equal(findInput(tree).prop('aria-expanded'), 'true', 'input element should receive aria-expanded prop');
      assert.equal(findInput(tree).prop('aria-haspopup'), 'listbox', 'input element should receive aria-haspopup prop');
      assert.equal(findInput(tree).prop('aria-owns'), 'listbox-id', 'input element should receive aria-owns prop');
      assert.equal(findInput(tree).prop('aria-controls'), 'listbox-id', 'input element should receive aria-controls prop');
      assert.equal(findInput(tree).prop('aria-autocomplete'), 'list', 'input element should receive aria-autocomplete prop');
      assert.equal(findInput(tree).prop('aria-controls'), 'listbox-id', 'input element should receive aria-controls prop');
      assert.equal(findInput(tree).prop('aria-activedescendant'), 'listbox-id-item-0', 'input element should receive aria-activedescendant prop');
    });
  });
});

const findInput = tree => tree.find('.spectrum-Search-input');
const findButton = tree => tree.find('Button');
