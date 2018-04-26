import assert from 'assert';
import Autocomplete from '../../src/Autocomplete';
import Bell from '../../src/Icon/Bell';
import Button from '../../src/Button';
import ComboBox from '../../src/ComboBox';
import {MenuItem} from '../../src/Menu';
import {mount, shallow} from 'enzyme';
import React from 'react';
import SelectDownChevron from '../../src/Icon/core/SelectDownChevron';
import {sleep} from '../utils';
import Stop from '../../src/Icon/Stop';
import Textfield from '../../src/Textfield';
import Trap from '../../src/Icon/Trap';

const OPTION_ICONS = [
  {label: 'one', icon: <Bell />},
  {label: 'two', icon: <Stop />},
  {label: 'three', icon: <Trap />},
];

describe('ComboBox', () => {
  it('should render a textfield and button', () => {
    const tree = shallow(<ComboBox />);
    assert.equal(tree.type(), Autocomplete);
    assert.equal(tree.prop('className'), 'spectrum-InputGroup');

    assert.equal(tree.find(Textfield).length, 1);
    assert.equal(tree.find(Textfield).prop('autocompleteInput'), true);
    assert.equal(tree.find(Button).length, 1);
    assert.equal(tree.find(Button).childAt(0).type(), SelectDownChevron);
  });

  it('should render classnames for states', () => {
    const tree = shallow(<ComboBox quiet disabled invalid />);
    assert.equal(tree.prop('className'), 'spectrum-InputGroup spectrum-InputGroup--quiet');
  });

  it('should get completions from options', () => {
    const tree = shallow(<ComboBox options={['one', 'two', 'three']} />);
    assert.deepEqual(tree.prop('getCompletions')('t'), ['two', 'three']);
    assert.deepEqual(tree.prop('getCompletions')('T'), ['two', 'three']);
    assert.deepEqual(tree.prop('getCompletions')('tw'), ['two']);
  });

  it('should toggle menu on button click', async () => {
    const tree = mount(<ComboBox options={['one', 'two', 'three']} />);
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
    assert(instance.state.open);
    assert.equal(textfieldNode, document.activeElement);

    tree.update();

    // navigate to "focus" first menu item (autocomplete uses aria-activedescendant)
    assert.equal(tree.find(MenuItem).at(0).prop('focused'), false);
    textfield.simulate('keydown', {key: 'ArrowDown', preventDefault: () => {}});
    assert.equal(tree.find(MenuItem).at(0).prop('focused'), true);

    // click button to hide menu
    button.simulate('click');
    await sleep(1);
    assert(!instance.state.open);
    assert.equal(textfieldNode, document.activeElement);

    tree.unmount();
  });

  it('should not filter if we havent changed', () => {
    const tree = shallow(<ComboBox options={['one', 'two', 'three']} />);
    assert.deepEqual(tree.prop('getCompletions')('two'), ['one', 'two', 'three']);
    tree.prop('onChange')();
    assert.deepEqual(tree.prop('getCompletions')('two'), ['two']);
  });

  it('should support icons', function () {
    const tree = shallow(<ComboBox options={OPTION_ICONS} />);
    assert.equal(tree.prop('getCompletions')('t').length, 2);
    assert.equal(tree.prop('getCompletions')('tw').length, 1);
  });
});
