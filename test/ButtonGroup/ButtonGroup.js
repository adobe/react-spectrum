import assert from 'assert';
import Button from '../../src/Button';
import ButtonGroup from '../../src/ButtonGroup';
import React from 'react';
import {shallow} from 'enzyme';

const defaultProps = {
  children: [
    <Button label="React" value="react" icon="checkCircle" />,
    <Button label="Add" value="add" icon="add" />,
    <Button label="Delete" value="delete" icon="delete" disabled />,
    <Button label="Bell" value="bell" icon="bell" />,
    <Button label="Camera" value="camera" icon="camera" />,
    <Button label="Undo" value="undo" icon="undo" readOnly />
  ]
};

const selectedValue = [
  'react',
  'add',
  'undo'
];

describe('ButtonGroup', () => {
  it('supports additional classNames', () => {
    const tree = shallow(<ButtonGroup className="bell" />);
    assert(tree.prop('className').indexOf('bell') >= 0);
  });

  it('supports numerous buttons', () => {
    const tree = shallow(<ButtonGroup {...defaultProps} />);
    assert.equal(tree.find(Button).length, 6);
  });

  it('supports an item being selected', () => {
    const tree = shallow(<ButtonGroup {...defaultProps} value={selectedValue[0]} />);
    assert.equal(tree.find({selected: true}).length, 1);
  });

  it('supports an item being selected', () => {
    const tree = shallow(<ButtonGroup {...defaultProps} value={selectedValue[0]} />);
    const selectedItem = tree.find({selected: true});
    assert.equal(selectedItem.length, 1);
  });

  it('supports multiple items being selected', () => {
    const tree = shallow(<ButtonGroup {...defaultProps} multiple value={selectedValue} />);
    assert.equal(tree.find({selected: true}).length, 3);
  });

  it('supports all items being disabled', () => {
    const tree = shallow(<ButtonGroup {...defaultProps} disabled />);
    tree.find(Button).forEach((node) => {
      assert.equal(node.prop('disabled'), true);
    });
  });

  it('supports an item being disabled', () => {
    const tree = shallow(<ButtonGroup {...defaultProps} />);
    assert.equal(tree.find({disabled: true}).length, 1);
  });

  it('supports readOnly', () => {
    const tree = shallow(<ButtonGroup {...defaultProps} readOnly />);
    tree.find(Button).first().simulate('click');
    assert.equal(tree.find({selected: true}).length, 0);
  });

  it('supports selection being returned on selection change for single select', (done) => {
    const tree = shallow(
      <ButtonGroup
        {...defaultProps}
        onChange={(value) => {
          assert.deepEqual(value, 'react');
          done();
        }} />
    );
    tree.find(Button).first().simulate('click');
  });
});
