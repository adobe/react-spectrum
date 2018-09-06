import assert from 'assert';
import Autocomplete from '../../src/Autocomplete';
import Bell from '../../src/Icon/Bell';
import Button from '../../src/Button';
import ChevronDownMedium from '../../src/Icon/core/ChevronDownMedium';
import ComboBox from '../../src/ComboBox';
import {mount, shallow} from 'enzyme';
import React from 'react';
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
    assert.equal(tree.find(Button).prop('aria-label'), 'Show suggestions');
    assert.equal(tree.find(Button).childAt(0).type(), ChevronDownMedium);
  });

  it('should render classnames for states', () => {
    const tree = shallow(<ComboBox quiet disabled invalid />);
    assert.equal(tree.prop('className'), 'spectrum-InputGroup spectrum-InputGroup--quiet');
  });

  it('should get completions from options', () => {
    const tree = shallow(<ComboBox options={['pineapple', 'Crabapple', 'banana', 'apple']} />);
    assert.deepEqual(tree.prop('getCompletions')('app'), ['apple', 'pineapple', 'Crabapple']);
    assert.deepEqual(tree.prop('getCompletions')('App'), ['apple', 'pineapple', 'Crabapple']);
    assert.deepEqual(tree.prop('getCompletions')('eapp'), ['pineapple']);
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

    const getFocusedProp = () => document.querySelector('li.spectrum-Menu-item').classList[1] === 'is-focused';

    // navigate to "focus" first menu item (autocomplete uses aria-activedescendant)
    assert.equal(getFocusedProp(), false);
    textfield.simulate('keydown', {key: 'ArrowDown', preventDefault: () => {}});
    assert.equal(getFocusedProp(), true);

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
    assert.deepEqual(tree.prop('getCompletions')('t'), ['two', 'three']);
  });

  it('should support icons', function () {
    const tree = shallow(<ComboBox options={OPTION_ICONS} />);
    assert.equal(tree.prop('getCompletions')('t').length, 2);
    assert.equal(tree.prop('getCompletions')('tw').length, 1);
  });

  it('should support additional classNames', () => {
    const tree = shallow(<ComboBox options={OPTION_ICONS} className="myClass" />);
    assert.equal(tree.prop('className'), 'spectrum-InputGroup myClass');
  });

  it('should update accessibility label for button on change', async () => {
    const tree = shallow(<ComboBox />);
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
});
