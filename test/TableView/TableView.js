import assert from 'assert';
import {IndexPath} from '@react/collection-view';
import ListDataSource from '../../src/ListDataSource';
import {mount, shallow} from 'enzyme';
import React from 'react';
import sinon from 'sinon';
import {sleep} from '../utils';
import TableCell from '../../src/TableView/js/TableCell';
import TableRow from '../../src/TableView/js/TableRow';
import {TableView} from '../../src/TableView';

describe('TableView', function () {
  var ds, renderCell;
  var columns = [
    {title: 'active'},
    {title: 'name', sortable: true}
  ];
  var cellData = {active: true, name: 'Sunshine Bear'};
  before(function () {
    renderCell = function () {};

    class TableDS extends ListDataSource {
      load() {
        return [
          {active: true, name: 'test'},
          {active: false, name: 'foo'},
          {active: true, name: 'bar'},
          {active: false, name: 'baz'}
        ];
      }
    }

    ds = new TableDS;
  });

  it('should render a table view', function () {
    const table = shallow(
      <TableView
        columns={columns}
        dataSource={ds}
        renderCell={renderCell}
        allowsSelection
        allowsMultipleSelection />
    );

    assert.equal(table.prop('role'), 'grid');
    assert.equal(table.hasClass('react-spectrum-TableView spectrum-Table'), true);
    assert.deepEqual(table.find(TableRow).prop('columns'), columns);
    assert.equal(table.find(TableRow).prop('allowsSelection'), true);
    assert.equal(table.find(TableRow).prop('allowsMultipleSelection'), true);
    assert.equal(table.find(TableRow).prop('isHeaderRow'), true);
  });

  it('should render a quiet table view', function () {
    const table = shallow(
      <TableView
        columns={columns}
        dataSource={ds}
        renderCell={renderCell}
        allowsSelection={false}
        quiet />
    );
    assert.equal(table.prop('role'), 'grid');
    assert.equal(table.hasClass('spectrum-Table--quiet'), true);
    assert.equal(table.find(TableRow).prop('allowsSelection'), false);
    assert.equal(table.find(TableRow).prop('allowsMultipleSelection'), false);
  });

  it('should pass correct props to collectionview', function () {
    const table = shallow(
      <TableView
        columns={columns}
        dataSource={ds}
        renderCell={renderCell}
        allowsSelection
        selectedIndexPaths={[new IndexPath(0, 0)]}
        allowsMultipleSelection
        quiet />
    );

    var collectionView = table.find('.react-spectrum-TableView-body');
    assert.deepEqual(collectionView.prop('dataSource'), ds);
    assert.equal(collectionView.prop('canSelectItems'), true);
    assert.equal(collectionView.prop('allowsMultipleSelection'), true);
    assert.equal(collectionView.prop('selectionMode'), 'toggle');
    assert.deepEqual(collectionView.prop('selectedIndexPaths'), [new IndexPath(0, 0)]);
  });

  it('should return Itemview row with props', function () {
    const table = shallow(
      <TableView
        columns={columns}
        dataSource={ds}
        renderCell={renderCell} />
    );
    let Wrapper = (props) => props.children;
    let wrapper = shallow(<Wrapper>{table.instance().renderItemView('foo', cellData)}</Wrapper>);

    assert(wrapper.find(TableRow));
    assert.equal(wrapper.find(TableRow).prop('columns'), columns);
    assert.equal(wrapper.find(TableRow).prop('allowsSelection'), true);
  });

  it('should return renderColumnHeader row prop defined header', function () {
    const renderColumnHeader = sinon.spy();
    const col = {title: 'name'};
    const table = shallow(
      <TableView
        columns={columns}
        dataSource={ds}
        renderCell={renderCell}
        renderColumnHeader={renderColumnHeader} />
    );
    let Wrapper = (props) => props.children;
    let wrapper = shallow(<Wrapper>{table.instance().renderColumnHeader(col)}</Wrapper>);

    assert(wrapper.find(TableCell));
    assert.equal(wrapper.find(TableCell).prop('isHeaderRow'), true);
    assert.deepEqual(wrapper.find(TableCell).prop('column'), col);
    assert.equal(wrapper.find(TableCell).prop('sortDir'), null);
    assert.equal(renderColumnHeader.callCount, 1);
    assert.deepEqual(renderColumnHeader.getCall(0).args[0], col);
  });

  it('should return renderColumnHeader row with props', function () {
    const table = shallow(
      <TableView
        columns={columns}
        dataSource={ds}
        renderCell={renderCell} />
    );
    let Wrapper = (props) => props.children;
    let wrapper = shallow(<Wrapper>{table.instance().renderColumnHeader({title: 'name'})}</Wrapper>);

    assert(wrapper.find(TableCell));
    assert.deepEqual(wrapper.find(TableCell).prop('column'), {title: 'name'});
    assert.equal(wrapper.find(TableCell).childAt(0).text(), 'name');
  });

  it('should call props.renderCell in renderCell', function () {
    const renderCell = sinon.spy();
    const col = {title: 'name'};
    const table = shallow(
      <TableView
        columns={columns}
        dataSource={ds}
        renderCell={renderCell} />
    );
    let Wrapper = (props) => props.children;
    let wrapper = shallow(<Wrapper>{table.instance().renderCell({name: 'Sunshine Bear', active: true}, col, 0, 0, 0, 0)}</Wrapper>);

    assert(wrapper.find(TableCell));
    assert.deepEqual(wrapper.find(TableCell).prop('column'), col);
    assert.equal(renderCell.callCount, 1);
    assert.deepEqual(renderCell.getCall(0).args[1], {name: 'Sunshine Bear', active: true});

    wrapper = shallow(<Wrapper>{table.instance().renderCell({name: 'Sunshine Bear', active: true}, col, 0)}</Wrapper>);

    assert(wrapper.find(TableCell));
    assert.deepEqual(wrapper.find(TableCell).prop('column'), col);
    assert.equal(renderCell.callCount, 2);
    assert.deepEqual(renderCell.getCall(1).args[1], {name: 'Sunshine Bear', active: true});
  });

  it('should call internal sort if column prop is set', async function () {
    const performSort = sinon.spy(ds, 'performSort');
    const onSortChange = sinon.spy();
    const table = mount(
      <TableView
        columns={columns}
        dataSource={ds}
        renderCell={renderCell}
        onSortChange={onSortChange} />
    );
    await sleep(100);
    await table.instance().sortByColumn(columns[0]);

    assert.equal(performSort.callCount, 0);
    assert.equal(onSortChange.callCount, 0);
    await table.instance().sortByColumn(columns[1]);

    assert.equal(performSort.callCount, 1);
    assert.equal(onSortChange.callCount, 1);
    assert.deepEqual(performSort.getCall(0).args[0], {column: columns[1], direction: 1});
    assert.deepEqual(onSortChange.getCall(0).args[0], {column: columns[1], direction: 1});

    table.update();
    assert.equal(table.find(TableRow).find(TableCell).at(2).prop('sortDir'), 1);
    performSort.restore();
  });

  it('should sort using the passed props (controlled)', async function () {
    const performSort = sinon.spy(ds, 'performSort');
    const onSortChange = sinon.spy();
    const table = mount(
      <TableView
        columns={columns}
        dataSource={ds}
        renderCell={renderCell}
        sortDescriptor={{column: columns[1], direction: -1}}
        onSortChange={onSortChange} />
    );

    assert.equal(table.find(TableRow).find(TableCell).at(2).prop('sortDir'), -1);
    await sleep(100);

    await table.instance().sortByColumn(columns[1]);

    assert.equal(performSort.callCount, 0);
    assert.equal(onSortChange.callCount, 1);
    assert.deepEqual(onSortChange.getCall(0).args[0], {column: columns[1], direction: 1});

    table.update();
    assert.equal(table.find(TableRow).find(TableCell).at(2).prop('sortDir'), -1);
    performSort.restore();
  });

  it('should sort using the passed props (uncontrolled)', async function () {
    const performSort = sinon.spy(ds, 'performSort');
    const onSortChange = sinon.spy();
    const table = mount(
      <TableView
        columns={columns}
        dataSource={ds}
        renderCell={renderCell}
        defaultSortDescriptor={{column: columns[1], direction: -1}}
        onSortChange={onSortChange} />
    );

    assert.equal(table.find(TableRow).find(TableCell).at(2).prop('sortDir'), -1);
    await sleep(100);

    await table.instance().sortByColumn(columns[1]);

    assert.equal(performSort.callCount, 1);
    assert.equal(onSortChange.callCount, 1);
    assert.deepEqual(performSort.getCall(0).args[0], {column: columns[1], direction: 1});
    assert.deepEqual(onSortChange.getCall(0).args[0], {column: columns[1], direction: 1});

    table.update();
    assert.equal(table.find(TableRow).find(TableCell).at(2).prop('sortDir'), 1);
    performSort.restore();
  });

  it('should call selectionChange if prop is set', function () {
    const onSelectionChange = sinon.spy();
    const table = mount(
      <TableView
        columns={columns}
        dataSource={ds}
        renderCell={renderCell}
        onSelectionChange={onSelectionChange} />
    );

    table.instance().onSelectionChange([new IndexPath(0, 0)]);
    assert.equal(onSelectionChange.callCount, 1);
    assert.equal(onSelectionChange.getCall(0).args[0][0].index, 0);
  });

  it('setSelectAll should call selectAll or clearSelection method of collection', () => {
    const selectAll = sinon.spy();
    const clearSelection = sinon.spy();
    const table = shallow(
      <TableView
        columns={columns}
        dataSource={ds}
        renderCell={renderCell} />
    );
    table.instance().collection = {
      relayout: () => {},
      selectAll,
      clearSelection,
      selectedIndexPaths: [],
      getNumberOfSections: () => 1,
      getSectionLength: () => 6
    };
    table.instance().setSelectAll(true);
    assert(selectAll.calledOnce);
    table.instance().collection.selectedIndexPaths = [
      new IndexPath(0, 0),
      new IndexPath(0, 1),
      new IndexPath(0, 2),
      new IndexPath(0, 3)
    ];
    table.instance().onSelectionChange();
    assert.equal(table.instance().collection.selectedIndexPaths.length, ds.getSectionLength(0));
    table.instance().setSelectAll(false);
    assert(clearSelection.calledOnce);
    table.instance().collection.selectedIndexPaths = [];
    table.instance().onSelectionChange();
    assert.notEqual(table.instance().collection.selectedIndexPaths.length, ds.getSectionLength(0));
  });

  it('should have collection ref when mounted', () => {
    const table = mount(
      <TableView
        columns={columns}
        dataSource={ds}
        renderCell={renderCell} />
    );

    assert(table.instance().collection);
    table.unmount();
  });

  it('focus cell should update focusedColumnIndex, and focusing row should move focus to focused column', () => {
    const table = mount(
      <TableView
        columns={columns}
        dataSource={ds}
        renderCell={renderCell} />
    );
    const tableCells = table.find(TableCell);
    tableCells.last().simulate('focus');
    assert.equal(table.instance().focusedColumnIndex, tableCells.length - 1);
    tableCells.last().getDOMNode().focus = sinon.spy();
    table.find(TableRow).first().simulate('focus', {target: table.find(TableRow).first().getDOMNode()});
    assert(tableCells.last().getDOMNode().focus.calledOnce);
    table.unmount();
  });

  it('should allow a row height override', function () {
    const tree = shallow(
      <TableView
        columns={columns}
        dataSource={ds}
        renderCell={renderCell}
        rowHeight={56} />
    );
    assert.equal(tree.instance().layout.rowHeight, 56);
  });

  it('should have a row height ceiling of 72', function () {
    const tree = shallow(
      <TableView
        columns={columns}
        dataSource={ds}
        renderCell={renderCell}
        rowHeight={80} />
    );
    assert.equal(tree.instance().layout.rowHeight, 72);
  });

  it('should have a row height floor of 48', function () {
    const tree = shallow(
      <TableView
        columns={columns}
        dataSource={ds}
        renderCell={renderCell}
        rowHeight={24} />
    );
    assert.equal(tree.instance().layout.rowHeight, 48);
  });
  
  it('should re-render on columns prop change', function () {
    const table = shallow(
      <TableView
        columns={columns}
        dataSource={ds}
        renderCell={renderCell}
        rowHeight={24} />
    );
    assert.deepEqual(table.find(TableRow).prop('columns'), columns);
    const newCols = [{title: 'new'}];
    table.setProps({columns: newCols});
    assert.deepEqual(table.find(TableRow).prop('columns'), newCols);
  });
});
