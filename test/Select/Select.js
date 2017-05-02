import Button from '../../src/Button';
import Dropdown from '../../src/Dropdown';
import expect from 'expect';
import React from 'react';
import Select, {SelectMenu} from '../../src/Select';
import {shallow} from 'enzyme';

const testOptions = [
  {label: 'Chocolate', value: 'chocolate'},
  {label: 'Vanilla', value: 'vanilla'},
  {label: 'Strawberry', value: 'strawberry'},
  {label: 'Caramel', value: 'caramel'},
  {label: 'Cookies and Cream', value: 'cookiescream', disabled: true},
  {label: 'Coconut', value: 'coco'},
  {label: 'Peppermint', value: 'peppermint'},
  {label: 'Some crazy long value that should be cut off', value: 'logVal'}
];

describe('Select', () => {
  it('renders a dropdown', () => {
    const tree = shallow(<Select />);
    const dropdown = tree.find(Dropdown);
    expect(dropdown.prop('className')).toBe('coral3-Select');
    expect(tree.state('value')).toBe(null);
  });

  it('supports additional classNames', () => {
    const tree = shallow(<Select className="myClass" />);
    const select = tree.find(Dropdown);

    expect(select.hasClass('myClass')).toBe(true);
    // Check that coral3-Select is not overwritten by the provided class.
    expect(select.hasClass('coral3-Select')).toBe(true);
  });

  it('renders options', () => {
    const tree = shallow(<Select options={testOptions} />);
    expect(tree.find('.coral3-Select-label').text()).toBe('Chocolate');
    expect(tree.find(SelectMenu).prop('options')).toEqual(testOptions);
    expect(tree.find(SelectMenu).prop('value')).toBe('chocolate');
  });

  it('renders options with multiple select', () => {
    const tree = shallow(<Select options={testOptions} multiple />);
    expect(tree.find('.coral3-Select-label').text()).toBe('Select an option');
    expect(tree.find(SelectMenu).prop('options')).toEqual(testOptions);
    expect(tree.find(SelectMenu).prop('value')).toEqual([]);
  });

  it('should set an initial value', () => {
    const tree = shallow(<Select options={testOptions} value="vanilla" />);
    expect(tree.find('.coral3-Select-label').text()).toBe('Vanilla');
    expect(tree.find(SelectMenu).prop('options')).toEqual(testOptions);
    expect(tree.find(SelectMenu).prop('value')).toBe('vanilla');
  });

  it('should set an initial value with multiple select', () => {
    const tree = shallow(<Select options={testOptions} value={['vanilla', 'caramel']} multiple />);
    expect(tree.find('.coral3-Select-label').text()).toBe('Select an option');
    expect(tree.find(SelectMenu).prop('options')).toEqual(testOptions);
    expect(tree.find(SelectMenu).prop('value')).toEqual(['vanilla', 'caramel']);
  });

  it('should set a default value', () => {
    const tree = shallow(<Select options={testOptions} defaultValue="vanilla" />);
    expect(tree.find('.coral3-Select-label').text()).toBe('Vanilla');
    expect(tree.find(SelectMenu).prop('options')).toEqual(testOptions);
    expect(tree.find(SelectMenu).prop('value')).toBe('vanilla');
  });

  it('should update value if passed in', () => {
    const tree = shallow(<Select options={testOptions} value="vanilla" />);
    expect(tree.find('.coral3-Select-label').text()).toBe('Vanilla');
    expect(tree.find(SelectMenu).prop('options')).toEqual(testOptions);
    expect(tree.find(SelectMenu).prop('value')).toBe('vanilla');

    tree.setProps({value: 'chocolate'});

    expect(tree.find('.coral3-Select-label').text()).toBe('Chocolate');
    expect(tree.find(SelectMenu).prop('options')).toEqual(testOptions);
    expect(tree.find(SelectMenu).prop('value')).toBe('chocolate');
  });

  it('should handle selection', () => {
    const onChange = expect.createSpy();
    const tree = shallow(<Select options={testOptions} onChange={onChange} />);
    expect(tree.state('value')).toBe('chocolate');

    tree.find(Dropdown).simulate('select', 'vanilla');

    expect(tree.state('value')).toBe('vanilla');
    expect(onChange).toHaveBeenCalled();
  });

  it('should not update state if value prop is passed', () => {
    const onChange = expect.createSpy();
    const tree = shallow(<Select options={testOptions} value="vanilla" onChange={onChange} />);
    expect(tree.state('value')).toBe('vanilla');

    tree.find(Dropdown).simulate('select', 'chocolate');

    expect(tree.state('value')).toBe('vanilla');
    expect(onChange).toHaveBeenCalled();
  });

  it('should trigger the menu on key press', () => {
    const tree = shallow(<Select options={testOptions} />);

    for (let key of ['Enter', 'ArrowDown', 'Space']) {
      const spy = expect.createSpy();
      tree.instance().button = {onClick: spy};

      tree.find(Button).simulate('keyDown', {key, preventDefault: function () {}});
      expect(spy).toHaveBeenCalled();
    }
  });
});
