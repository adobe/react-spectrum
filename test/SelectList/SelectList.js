import React from 'react';
import expect from 'expect';
import {shallow} from 'enzyme';
import SelectList from '../../src/SelectList';
import {ListItem, ListGroup} from '../../src/List';

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
    expect(tree.find(ListItem).length).toBe(7);
  });

  it('supports a list of grouped options', () => {
    const tree = shallow(<SelectList options={ groupedOptions } />);
    expect(tree.find(ListGroup).length).toBe(2);
    expect(tree.find(ListItem).length).toBe(6);
  });

  it('supports a list of grouped options', () => {
    const tree = shallow(<SelectList options={ groupedOptions } />);
    expect(tree.find(ListGroup).length).toBe(2);
    expect(tree.find(ListItem).length).toBe(6);
  });

  it('supports an item being selected', () => {
    const tree = shallow(<SelectList options={ testOptions } value={ testOptions[0].value } />);
    expect(tree.find({selected: true}).length).toBe(1);
  });

  it('supports an item being selected', () => {
    const tree = shallow(<SelectList options={ testOptions } value={ testOptions[0].value } />);
    const selectedItem = tree.find({selected: true});
    expect(selectedItem.length).toBe(1);
  });

  it('supports multiple items being selected', () => {
    const tree = shallow(<SelectList options={ testOptions } multiple value={ selectedValue } />);
    expect(tree.find({selected: true}).length).toBe(3);
  });

  it('supports all items being disabled', () => {
    const tree = shallow(<SelectList options={ testOptions } disabled />);
    tree.find(ListItem).forEach((node) => {
      expect(node.prop('disabled')).toBe(true);
    });
  });

  it('supports an item being disabled', () => {
    const tree = shallow(<SelectList options={ testOptions } />);
    expect(tree.find({disabled: true}).length).toBe(1);
  });

  it('supports selection being returned on selection change for single select', () => {
    const tree = shallow(
      <SelectList
        options={ testOptions }
        onChange={ (value) => {
          expect(value).toEqual(testOptions[0].value);
        } }
      />
    );
    tree.find(ListItem).first().simulate('select');
  });

  it('supports selection being returned on selection add for multiple select', () => {
    let finalValue;
    const tree = shallow(
      <SelectList
        options={ testOptions }
        value={ [testOptions[1].value] }
        multiple
        onChange={ (value) => {
          finalValue = value;
        } }
      />
    );
    tree.find(ListItem).first()
      .simulate('select');
    expect(finalValue).toEqual([testOptions[1].value, testOptions[0].value]);
  });

  it('supports selection being returned on selection remove for multiple select', () => {
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
    tree.find(ListItem).first()
      .simulate('select');
    expect(finalValue).toEqual([]);
  });

  it('supports additional properties', () => {
    const tree = shallow(<SelectList foo />);
    expect(tree.prop('foo')).toBe(true);
  });
});
