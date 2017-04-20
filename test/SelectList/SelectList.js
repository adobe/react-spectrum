import React from 'react';
import expect from 'expect';
import {shallow} from 'enzyme';
import SelectList from '../../src/SelectList';


const testOptions = [
  {label: 'Chocolate', value: 'chocolate'},
  {label: 'Vanilla', value: 'vanilla'},
  {label: 'Strawberry', value: 'strawberry'},
  {label: 'Caramel', value: 'caramel'},
  {label: 'Cookies and Cream', value: 'cookiescream', disabled: true},
  {label: 'Peppermint', value: 'peppermint'},
  {label: 'Some crazy long value that should be cut off', value: 'logVal'}
];

const selectedValue = [
  'chocolate',
  'vanilla',
  'logVal'
];

const groupedOptions = {
  'Group 1': [
    {label: 'Chocolate', value: 'chocolate'},
    {label: 'Vanilla', value: 'vanilla'},
    {label: 'Strawberry', value: 'strawberry'}
  ],
  'Group 2': [
    {label: 'Caramel', value: 'caramel'},
    {label: 'Cookies and Cream', value: 'cookiescream', disabled: true},
    {label: 'Peppermint', value: 'peppermint'}
  ]
};

describe('SelectList', () => {
  it('supports additional classNames', () => {
    const tree = shallow(<SelectList className="bell" />);
    expect(tree.prop('className')).toInclude('bell');
  });

  it('supports a list of options', () => {
    const tree = shallow(<SelectList options={ testOptions } />);
    expect(tree.find('.coral3-SelectList-item').length).toBe(7);
  });

  it('supports a list of grouped options', () => {
    const tree = shallow(<SelectList options={ groupedOptions } />);
    expect(tree.find('.coral-SelectList-group').length).toBe(2);
    expect(tree.find('.coral3-SelectList-item').length).toBe(6);
  });

  it('supports a list of grouped options', () => {
    const tree = shallow(<SelectList options={ groupedOptions } />);
    expect(tree.find('.coral-SelectList-group').length).toBe(2);
    expect(tree.find('.coral3-SelectList-item').length).toBe(6);
  });

  it('supports an item being selected', () => {
    const tree = shallow(<SelectList options={ testOptions } value={ testOptions[0].value } />);
    expect(tree.find('.is-selected').length).toBe(1);
  });

  it('supports an item being selected', () => {
    const tree = shallow(<SelectList options={ testOptions } value={ testOptions[0].value } />);
    const selectedItem = tree.find('.is-selected');
    expect(selectedItem.length).toBe(1);
    expect(selectedItem.prop('aria-selected')).toBe(true);
  });

  it('supports multiple items being selected', () => {
    const tree = shallow(<SelectList options={ testOptions } multiple value={ selectedValue } />);
    expect(tree.find('.is-selected').length).toBe(3);
    tree.find('.is-selected').forEach((node) => {
      expect(node.prop('aria-selected')).toBe(true);
    });
  });

  it('supports all items being disabled', () => {
    const tree = shallow(<SelectList options={ testOptions } disabled />);
    tree.find('.coral3-SelectList-item').forEach((node) => {
      expect(node.hasClass('is-disabled')).toBe(true);
      expect(node.prop('aria-disabled')).toBe(true);
    });
  });

  it('supports an item being disabled', () => {
    const tree = shallow(<SelectList options={ testOptions } />);
    expect(tree.find('.is-disabled').length).toBe(1);
    expect(tree.find('.is-disabled').prop('aria-disabled')).toBe(true);
  });


  it('supports getting focus then blur', () => {
    const tree = shallow(<SelectList options={ testOptions } />);
    tree.simulate('focus');
    expect(tree.hasClass('is-focused')).toBe(true);
    tree.simulate('blur');
    expect(tree.hasClass('is-focused')).toBe(false);
  });

  it('supports items being highlighted by mouseover', () => {
    const tree = shallow(<SelectList options={ testOptions } />);
    tree.find('.coral3-SelectList-item').first().simulate('mouseover');
    expect(tree.find('.coral3-SelectList-item').first().hasClass('is-highlighted')).toBe(true);
  });


  it('supports items being highlighted by focus', () => {
    const tree = shallow(<SelectList options={ testOptions } />);
    tree.find('.coral3-SelectList-item').first().simulate('focus');
    expect(tree.find('.coral3-SelectList-item').first().hasClass('is-highlighted')).toBe(true);
  });

  it('supports selection being returned on selecetion change for single select', () => {
    const tree = shallow(
      <SelectList
        options={ testOptions }
        onChange={ (value) => {
          expect(value).toEqual(testOptions[0]);
        } }
      />
    );
    tree.find('.coral3-SelectList-item').first().simulate('click');
  });

  it('supports selection being returned on selecetion add for multiple select', () => {
    let finalValue;
    const tree = shallow(
      <SelectList
        options={ testOptions }
        value={ [testOptions[0].value] }
        multiple onChange={ (value) => {
          finalValue = value;
        } }
      />
    );
    tree.find('.coral3-SelectList-item').first()
      .simulate('click')
      .simulate('click');
    expect(finalValue).toEqual([]);
  });

  it('supports selection being returned on selecetion remove for multiple select', () => {
    let finalValue;
    const tree = shallow(
      <SelectList
        options={ testOptions }
        value={ [testOptions[0].value] }
        multiple
        onChange={ (value) => {
          finalValue = value;
        } }
      />
    );
    tree.find('.coral3-SelectList-item').first()
      .simulate('click')
      .simulate('click');
    expect(finalValue).toEqual([]);
  });

  it('supports additional properties', () => {
    const tree = shallow(<SelectList foo />);
    expect(tree.prop('foo')).toBe(true);
  });
});
