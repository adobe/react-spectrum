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
import Bell from '../../src/Icon/Bell';
import Button from '../../src/Button';
import ChevronDownMedium from '../../src/Icon/core/ChevronDownMedium';
import ComboBox from '../../src/ComboBox';
import {mount, shallow} from 'enzyme';
import React from 'react';
import sinon from 'sinon';
import {sleep} from '../utils';
import Stop from '../../src/Icon/Stop';
import Textfield from '../../src/Textfield';
import Trap from '../../src/Icon/Trap';

const OPTION_ICONS = [
  {label: 'one', icon: <Bell />},
  {label: 'two', icon: <Stop />},
  {label: 'three', icon: <Trap />}
];

describe('ComboBox', () => {
  let tree;
  afterEach(() => {
    if (tree) {
      tree.unmount();
      tree = null;
    }
  });
  it('should render a textfield and button', () => {
    tree = shallow(<ComboBox />);
    assert.equal(tree.type(), Autocomplete);
    assert.equal(tree.prop('className'), 'spectrum-InputGroup');

    assert.equal(tree.find(Textfield).length, 1);
    assert.equal(tree.find(Textfield).prop('autocompleteInput'), true);
    assert.equal(tree.find(Button).length, 1);
    assert.equal(tree.find(Button).prop('aria-label'), 'Show suggestions');
    assert.equal(tree.find(Button).childAt(0).type(), ChevronDownMedium);
  });

  it('should render classnames for states', () => {
    tree = shallow(<ComboBox quiet disabled invalid />);
    assert.equal(tree.prop('className'), 'spectrum-InputGroup spectrum-InputGroup--quiet');
  });

  it('should get completions from options', () => {
    tree = shallow(<ComboBox options={['pineapple', 'Crabapple', 'banana', 'apple']} />);
    assert.deepEqual(tree.prop('getCompletions')('app'), ['apple', 'pineapple', 'Crabapple']);
    assert.deepEqual(tree.prop('getCompletions')('App'), ['apple', 'pineapple', 'Crabapple']);
    assert.deepEqual(tree.prop('getCompletions')('eapp'), ['pineapple']);
  });

  it('passes through the renderItem prop', () => {
    tree = shallow(<ComboBox options={['pineapple', 'Crabapple', 'banana', 'apple']} renderItem={item => <em>{item.label}</em>} />);
    assert.equal(typeof tree.prop('renderItem'), 'function');
  });

  it('should toggle menu on button click', async () => {
    tree = mount(<ComboBox options={['one', 'two', 'three']} />);
    const autoComplete = tree.find(Autocomplete).instance();
    const button = tree.find(Button);
    const buttonNode = button.getDOMNode();
    const textfield = tree.find(Textfield);
    const textfieldNode = textfield.getDOMNode();

    button.simulate('mousedown', {preventDefault: () => {}, isDefaultPrevented: () => true});
    button.simulate('mouseup', {preventDefault: () => {}, isDefaultPrevented: () => true});
    assert.notEqual(buttonNode, document.activeElement);

    // focus button
    buttonNode.focus();
    assert.equal(buttonNode, document.activeElement);

    assert.equal(autoComplete.state.showMenu, false);
    // click button to show menu
    button.simulate('click');
    await sleep(1);
    assert.equal(autoComplete.state.showMenu, true);
    assert.equal(button.instance().props.selected, true);
    assert.equal(textfieldNode, document.activeElement);

    tree.update();

    const getFocusedProp = () => document.querySelector('li.spectrum-Menu-item').classList[1] === 'is-focused';

    // navigate to "focus" first menu item (autocomplete uses aria-activedescendant)
    assert.equal(getFocusedProp(), false);
    textfield.simulate('keydown', {key: 'ArrowDown', preventDefault: () => {}});
    assert.equal(getFocusedProp(), true);

    // click button to hide menu
    button.simulate('click');
    await sleep(1);
    assert.equal(autoComplete.state.showMenu, false);
    assert.equal(button.instance().props.selected, false);
    assert.equal(textfieldNode, document.activeElement);
  });

  it('should not filter if we havent changed', () => {
    tree = shallow(<ComboBox options={['one', 'two', 'three']} />);
    assert.deepEqual(tree.prop('getCompletions')('two'), ['one', 'two', 'three']);
    tree.prop('onChange')();
    assert.deepEqual(tree.prop('getCompletions')('t'), ['two', 'three']);
  });

  it('should support icons', function () {
    tree = shallow(<ComboBox options={OPTION_ICONS} />);
    assert.equal(tree.prop('getCompletions')('t').length, 2);
    assert.equal(tree.prop('getCompletions')('tw').length, 1);
  });

  it('should support additional classNames', () => {
    tree = shallow(<ComboBox options={OPTION_ICONS} className="myClass" />);
    assert.equal(tree.prop('className'), 'spectrum-InputGroup myClass');
  });

  it('should update accessibility label for button on change', async () => {
    tree = shallow(<ComboBox />);
    assert.equal(tree.state.count, null);
    assert.equal(tree.find(Button).prop('aria-label'), 'Show suggestions');

    tree.setProps({options: ['one', 'two', 'three']});

    // Set properties
    tree.prop('onChange')('b');
    tree.update();
    await sleep(1);
    assert.equal(tree.state('count'), 0);
    assert.equal(tree.find(Button).prop('aria-label'), 'No matching results.');
    tree.prop('onChange')('');
    tree.update();
    await sleep(1);
    assert.equal(tree.state('count'), null);
    assert.equal(tree.find(Button).prop('aria-label'), 'Show 3 suggestions');
    tree.prop('onChange')('b');
    tree.update();
    await sleep(1);
    assert.equal(tree.state('count'), 0);
    assert.equal(tree.find(Button).prop('aria-label'), 'No matching results.');
    tree.prop('onChange')('t');
    tree.update();
    await sleep(1);
    assert.equal(tree.state('count'), 2);
    assert.equal(tree.find(Button).prop('aria-label'), 'Show 2 suggestions');
    tree.prop('onChange')('tw');
    tree.update();
    await sleep(1);
    assert.equal(tree.state('count'), 1);
    assert.equal(tree.find(Button).prop('aria-label'), 'Show suggestion');
  });

  it('supports a controlled state', async () => {
    const onChange = sinon.spy();

    tree = mount(<ComboBox onChange={onChange} value="on" options={['one', 'onetwo', 'onethree']} />);
    const autoComplete = tree.find(Autocomplete).instance();
    const button = tree.find(Button);
    const buttonNode = button.getDOMNode();
    const textfield = tree.find(Textfield);
    const textfieldNode = textfield.getDOMNode();
    const instance = tree.instance();

    button.simulate('mousedown', {preventDefault: () => {}, isDefaultPrevented: () => true});
    button.simulate('mouseup', {preventDefault: () => {}, isDefaultPrevented: () => true});
    assert.notEqual(buttonNode, document.activeElement);

    // focus button
    buttonNode.focus();
    assert.equal(buttonNode, document.activeElement);

    // click button to show menu
    button.simulate('click');
    await sleep(1);
    assert.equal(autoComplete.state.showMenu, true);
    assert.equal(button.instance().props.selected, true);
    assert.equal(textfieldNode, document.activeElement);

    tree.update();

    const getFocusedProp = () => document.querySelector('li.spectrum-Menu-item').classList[1] === 'is-focused';

    // navigate to "focus" first menu item (autocomplete uses aria-activedescendant)
    assert.equal(getFocusedProp(), false);
    textfield.simulate('keydown', {key: 'ArrowDown', preventDefault: () => {}});
    assert.equal(getFocusedProp(), true);
    textfield.simulate('keyDown', {key: 'ArrowDown', preventDefault: function () {}});
    textfield.simulate('keyDown', {key: 'Enter', preventDefault: function () {}});

    // click button to hide menu
    await sleep(1);

    assert.equal(onChange.callCount, 1);
    assert.deepEqual(onChange.getCall(0).args[0], 'onetwo');
    assert.equal(autoComplete.state.showMenu, false);
    assert.equal(button.instance().props.selected, false);
    assert.equal(textfieldNode, document.activeElement);

    assert.equal(instance.props.value, 'on');
  });

  it('supports a controlled state showing menu', async () => {
    const onChange = sinon.spy();
    const onMenuToggle = sinon.spy();

    tree = mount(<ComboBox onChange={onChange} onMenuToggle={onMenuToggle} showMenu value="one" options={['one', 'onetwo', 'onethree']} />);
    const autoComplete = tree.find(Autocomplete);
    const button = tree.find(Button);
    const buttonNode = button.getDOMNode();

    assert.equal(autoComplete.props().showMenu, true);
    assert.equal(button.instance().props.selected, true);

    // focus button
    buttonNode.focus();

    // click button to show menu
    button.simulate('click');
    await sleep(1);
    assert(onMenuToggle.calledOnce);
    assert.equal(onMenuToggle.getCall(0).args[0], false);
    assert.equal(autoComplete.props().showMenu, true);
    assert.equal(button.instance().props.selected, true);
    tree.prop('onChange')('one');
    await sleep(1);
    assert(onChange.called);
    assert.equal(onChange.getCall(0).args[0], 'one');
    assert.equal(autoComplete.props().showMenu, true);
    assert.equal(button.instance().props.selected, true);
  });

  it('supports a controlled state hiding menu', async () => {
    const onChange = sinon.spy();
    const onMenuToggle = sinon.spy();

    tree = mount(<ComboBox onChange={onChange} onMenuToggle={onMenuToggle} showMenu={false} value="on" options={['one', 'onetwo', 'onethree']} />);
    const autoComplete = tree.find(Autocomplete);
    const button = tree.find(Button);
    const buttonNode = button.getDOMNode();

    assert.equal(autoComplete.props().showMenu, false);
    assert.equal(button.instance().props.selected, false);

    // focus button
    buttonNode.focus();

    // click button to show menu
    button.simulate('click');
    await sleep(1);
    assert(onMenuToggle.calledOnce);
    assert.equal(onMenuToggle.getCall(0).args[0], true);
    assert.equal(autoComplete.props().showMenu, false);
    assert.equal(button.instance().props.selected, false);
    tree.prop('onChange')('one');
    await sleep(1);
    assert(onChange.called);
    assert.equal(onChange.getCall(0).args[0], 'one');
    assert.equal(autoComplete.props().showMenu, false);
    assert.equal(button.instance().props.selected, false);
  });
});
