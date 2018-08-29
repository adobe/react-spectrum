import assert from 'assert';
import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import TableRow from '../../src/TableView/js/TableRow';

const columns = [{title: 'Hi'}, {title: 'Bye'}];
function renderCell(column, cellIndex) {
  return <span>{column.title + ' ' + cellIndex}</span>;
}

describe('TableRow', function () {
  it('should render a header row', function () {
    let wrapper = shallow(<TableRow isHeaderRow columns={columns} renderCell={renderCell} />);
    assert.equal(wrapper.prop('className'), 'react-spectrum-TableView-row spectrum-Table-head');
    assert.deepEqual(wrapper.children().map(c => c.text()), ['Hi 0', 'Bye 1']);
  });

  it('should render a body row', function () {
    let wrapper = shallow(<TableRow columns={columns} renderCell={renderCell} />);
    assert.equal(wrapper.prop('className'), 'react-spectrum-TableView-row spectrum-Table-row');
    assert.deepEqual(wrapper.children().map(c => c.text()), ['Hi 0', 'Bye 1']);
  });

  it('should render a selectable body row', function () {
    let wrapper = shallow(<TableRow allowsSelection columns={columns} renderCell={renderCell} />);
    assert.equal(wrapper.prop('className'), 'react-spectrum-TableView-row spectrum-Table-row');

    let checkboxCell = wrapper.childAt(0);
    assert.equal(checkboxCell.prop('className'), 'spectrum-Table-checkboxCell react-spectrum-TableView-checkboxCell');
    assert.equal(checkboxCell.childAt(0).prop('className'), 'spectrum-Table-checkbox');
    assert(!checkboxCell.childAt(0).prop('checked'));

    assert.deepEqual(wrapper.children().slice(1).map(c => c.text()), ['Hi 0', 'Bye 1']);
  });

  it('should render a selected body row', function () {
    let wrapper = shallow(<TableRow allowsSelection selected columns={columns} renderCell={renderCell} />);
    assert.equal(wrapper.prop('className'), 'react-spectrum-TableView-row spectrum-Table-row is-selected');

    let checkboxCell = wrapper.childAt(0);
    assert.equal(checkboxCell.prop('className'), 'spectrum-Table-checkboxCell react-spectrum-TableView-checkboxCell');
    assert.equal(checkboxCell.childAt(0).prop('className'), 'spectrum-Table-checkbox');
    assert(checkboxCell.childAt(0).prop('checked'));

    assert.deepEqual(wrapper.children().slice(1).map(c => c.text()), ['Hi 0', 'Bye 1']);
  });

  it('should trigger onSelectChange when the checkbox value changes', function () {
    let onSelectChange = sinon.spy();
    let wrapper = shallow(<TableRow allowsSelection onSelectChange={onSelectChange} columns={columns} renderCell={renderCell} />);
    wrapper.find('.spectrum-Table-checkbox').simulate('change', true);
    assert(onSelectChange.calledOnce);
    assert(onSelectChange.getCall(0).args[0], true);
  });

  it('should trigger onCellClick when clicking on a cell', function () {
    let collectionView = {indexPathForComponent: () => ({section: 0, index: 5})};
    let onCellClick = sinon.spy();
    let wrapper = shallow(<TableRow columns={columns} renderCell={renderCell} collectionView={collectionView} onCellClick={onCellClick} />);
    wrapper.childAt(1).simulate('click');
    assert(onCellClick.calledOnce);
    assert.deepEqual(onCellClick.getCall(0).args, [columns[1], 5]);
  });

  it('should trigger onCellDoubleClick when double clicking on a cell', function () {
    let collectionView = {indexPathForComponent: () => ({section: 0, index: 5})};
    let onCellDoubleClick = sinon.spy();
    let wrapper = shallow(<TableRow columns={columns} renderCell={renderCell} collectionView={collectionView} onCellDoubleClick={onCellDoubleClick} />);
    wrapper.childAt(1).simulate('doubleClick');
    assert(onCellDoubleClick.calledOnce);
    assert.deepEqual(onCellDoubleClick.getCall(0).args, [columns[1], 5]);
  });
});
