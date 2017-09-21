import assert from 'assert';
import {ListItem} from '../../src/List';
import React from 'react';
import SelectList from '../../src/SelectList';
import {shallow} from 'enzyme';

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

describe('SelectList', () => {
  it('supports additional classNames', () => {
    const tree = shallow(<SelectList className="bell" />);
    assert(tree.prop('className').indexOf('bell') >= 0);
  });

  it('supports a list of options', () => {
    const tree = shallow(<SelectList options={testOptions} />);
    assert.equal(tree.find(ListItem).length, 7);
  });

  it('supports an item being selected', () => {
    const tree = shallow(<SelectList options={testOptions} value={testOptions[0].value} />);
    assert.equal(tree.find({selected: true}).length, 1);
  });

  it('supports an item being selected', () => {
    const tree = shallow(<SelectList options={testOptions} value={testOptions[0].value} />);
    const selectedItem = tree.find({selected: true});
    assert.equal(selectedItem.length, 1);
  });

  it('supports multiple items being selected', () => {
    const tree = shallow(<SelectList options={testOptions} multiple value={selectedValue} />);
    assert.equal(tree.find({selected: true}).length, 3);
  });

  it('supports all items being disabled', () => {
    const tree = shallow(<SelectList options={testOptions} disabled />);
    tree.find(ListItem).forEach((node) => {
      assert.equal(node.prop('disabled'), true);
    });
  });

  it('supports an item being disabled', () => {
    const tree = shallow(<SelectList options={testOptions} />);
    assert.equal(tree.find({disabled: true}).length, 1);
  });

  it('supports selection being returned on selection change for single select', () => {
    const tree = shallow(
      <SelectList
        options={testOptions}
        onChange={(value) => {
          assert.deepEqual(value, testOptions[0].value);
        }} />
    );
    tree.find(ListItem).first().simulate('select');
  });

  it('supports selection being returned on selection add for multiple select', () => {
    let finalValue;
    const tree = shallow(
      <SelectList
        options={testOptions}
        value={[testOptions[1].value]}
        multiple
        onChange={(value) => {
          finalValue = value;
        }} />
    );
    tree.find(ListItem).first()
      .simulate('select');
    assert.deepEqual(finalValue, [testOptions[1].value, testOptions[0].value]);
  });

  it('supports selection being returned on selection remove for multiple select', () => {
    let finalValue;
    const tree = shallow(
      <SelectList
        options={testOptions}
        value={[testOptions[0].value]}
        multiple
        onChange={(value) => {
          finalValue = value;
        }} />
    );
    tree.find(ListItem).first()
      .simulate('select');
    assert.deepEqual(finalValue, []);
  });

  it('supports additional properties', () => {
    const tree = shallow(<SelectList foo />);
    assert.equal(tree.prop('foo'), true);
  });
});
