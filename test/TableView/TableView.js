import assert from 'assert';
import {DragTarget, EditableCollectionView, IndexPath, Point, Size} from '@react/collection-view';
import ListDataSource from '../../src/ListDataSource';
import {mount, shallow} from 'enzyme';
import Provider from '../../src/Provider';
import React from 'react';
import sinon, {stub} from 'sinon';
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
          {active: false, name: 'baz'},
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

    assert.equal(table.hasClass('react-spectrum-TableView spectrum-Table'), true);
    assert.deepEqual(table.find(TableRow).prop('columns'), columns);
    assert.deepEqual(table.find(TableRow).prop('allowsSelection'), true);
    assert.deepEqual(table.find(TableRow).prop('allowsSelection'), true);
    assert.deepEqual(table.find(TableRow).prop('isHeaderRow'), true);
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
    assert.equal(table.hasClass('spectrum-Table--quiet'), true);
    assert.deepEqual(table.find(TableRow).prop('allowsSelection'), false);
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
    const table = shallow(
      <TableView
        columns={columns}
        dataSource={ds}
        renderCell={renderCell}
        onSortChange={onSortChange} />
    );
    table.instance().collection = {relayout: () => {}, selectedIndexPaths: []};
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
    assert.equal(table.find(TableRow).dive().find(TableCell).at(2).prop('sortDir'), 1);
    performSort.restore();
  });

  it('should sort using the passed props (controlled)', async function () {
    const performSort = sinon.spy(ds, 'performSort');
    const onSortChange = sinon.spy();
    const table = shallow(
      <TableView
        columns={columns}
        dataSource={ds}
        renderCell={renderCell}
        sortDescriptor={{column: columns[1], direction: -1}}
        onSortChange={onSortChange} />
    );

    assert.equal(table.find(TableRow).dive().find(TableCell).at(2).prop('sortDir'), -1);

    table.instance().collection = {relayout: () => {}, selectedIndexPaths: []};
    await sleep(100);

    await table.instance().sortByColumn(columns[1]);

    assert.equal(performSort.callCount, 0);
    assert.equal(onSortChange.callCount, 1);
    assert.deepEqual(onSortChange.getCall(0).args[0], {column: columns[1], direction: 1});

    table.update();
    assert.equal(table.find(TableRow).dive().find(TableCell).at(2).prop('sortDir'), -1);
    performSort.restore();
  });

  it('should sort using the passed props (uncontrolled)', async function () {
    const performSort = sinon.spy(ds, 'performSort');
    const onSortChange = sinon.spy();
    const table = shallow(
      <TableView
        columns={columns}
        dataSource={ds}
        renderCell={renderCell}
        defaultSortDescriptor={{column: columns[1], direction: -1}}
        onSortChange={onSortChange} />
    );

    assert.equal(table.find(TableRow).dive().find(TableCell).at(2).prop('sortDir'), -1);

    table.instance().collection = {relayout: () => {}, selectedIndexPaths: []};
    await sleep(100);

    await table.instance().sortByColumn(columns[1]);

    assert.equal(performSort.callCount, 1);
    assert.equal(onSortChange.callCount, 1);
    assert.deepEqual(performSort.getCall(0).args[0], {column: columns[1], direction: 1});
    assert.deepEqual(onSortChange.getCall(0).args[0], {column: columns[1], direction: 1});

    table.update();
    assert.equal(table.find(TableRow).dive().find(TableCell).at(2).prop('sortDir'), 1);
    performSort.restore();
  });

  it('should call selectionChange if prop is set', function () {
    const onSelectionChange = sinon.spy();
    const table = shallow(
      <TableView
        columns={columns}
        dataSource={ds}
        renderCell={renderCell}
        onSelectionChange={onSelectionChange} />
    );
    table.instance().collection = {relayout: () => {}, selectedIndexPaths: [new IndexPath(0, 0)], getNumberOfSections: () => 1, getSectionLength: () => 6};

    table.instance().onSelectionChange();
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

  it('should render an infiniteScroll table', async function () {
    const loadMoreStub = stub(ds, 'loadMore').callsFake(() => {});
    const tree = shallow(
      <TableView
        columns={columns}
        dataSource={ds}
        renderCell={renderCell} />
    );
    const tableInstance = tree.instance();

    // shallow doesn't render down far enough to make this, so create the collection instance
    tableInstance.collection = {relayout: () => {}, contentOffset: new Point(0, 0), contentSize: new Size(100, 1000), size: new Size(100, 100), dataSource: ds};
    tree.find(EditableCollectionView).simulate('scroll');
    await sleep(100);

    assert.equal(loadMoreStub.callCount, 0);

    tableInstance.collection.contentOffset = new Point(0, 900);
    tree.find(EditableCollectionView).simulate('scroll');
    await sleep(100);

    assert.equal(loadMoreStub.callCount, 1);
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

  it('should support dragging rows', function () {
    const tree = shallow(
      <TableView
        columns={columns}
        dataSource={ds}
        renderCell={renderCell}
        canDragItems />
    );

    assert.equal(tree.find(EditableCollectionView).prop('canDragItems'), true);

    tree.instance().collection = {
      relayout: () => {},
      getItemView: (indexPath) => ({children: [
        tree.instance().renderItemView('item', ds.getItem(indexPath.section, indexPath.index))
      ]})
    };

    let Wrapper = (props) => props.children;
    let dragView = shallow(<Wrapper>{tree.instance().renderDragView(new DragTarget('item', new IndexPath(0, 0)))}</Wrapper>);
    assert.equal(dragView.type(), Provider);
    assert.equal(dragView.prop('theme'), 'light');
    assert.equal(dragView.find(TableRow).length, 1);
  });

  it('should pass the correct theme to the drag view from the context', function () {
    const tree = shallow(
      <TableView
        columns={columns}
        dataSource={ds}
        renderCell={renderCell}
        canDragItems />
    , {context: {theme: 'dark'}});

    tree.instance().collection = {
      relayout: () => {}, 
      getItemView: (indexPath) => ({children: [
        tree.instance().renderItemView('item', ds.getItem(indexPath.section, indexPath.index))
      ]})
    };

    let Wrapper = (props) => props.children;
    let dragView = shallow(<Wrapper>{tree.instance().renderDragView(new DragTarget('item', new IndexPath(0, 0)))}</Wrapper>);
    assert.equal(dragView.type(), Provider);
    assert.equal(dragView.prop('theme'), 'dark');
  });

  it('should support custom drag views', function () {
    const tree = shallow(
      <TableView
        columns={columns}
        dataSource={ds}
        renderCell={renderCell}
        canDragItems
        renderDragView={() => <div>Drag view</div>} />
    );

    tree.instance().collection = {
      relayout: () => {}, 
      selectedIndexPaths: []
    };

    let Wrapper = (props) => props.children;
    let dragView = shallow(<Wrapper>{tree.instance().renderDragView(new DragTarget('item', new IndexPath(0, 0)))}</Wrapper>);
    assert.equal(dragView.find('div').length, 1);
    assert.equal(dragView.find('div').text(), 'Drag view');
  });

  it('should support drag and drop onto the table body with dropPosition="on"', function () {
    const tree = shallow(
      <TableView
        columns={columns}
        dataSource={ds}
        renderCell={renderCell}
        dropPosition="on" />
    );

    assert.equal(tree.find(EditableCollectionView).prop('className'), 'react-spectrum-TableView-body spectrum-Table-body');

    tree.instance().dropTargetUpdated(new DragTarget('item', new IndexPath(0, 0), DragTarget.DROP_BETWEEN));
    tree.update();
    assert.equal(tree.find(EditableCollectionView).prop('className'), 'react-spectrum-TableView-body spectrum-Table-body is-drop-target');

    tree.instance().dropTargetUpdated(new DragTarget('item', new IndexPath(0, 0), DragTarget.DROP_ON));
    tree.update();
    assert.equal(tree.find(EditableCollectionView).prop('className'), 'react-spectrum-TableView-body spectrum-Table-body');
  });

  it('should not highlight the table body with dropPosition="between"', function () {
    const tree = shallow(
      <TableView
        columns={columns}
        dataSource={ds}
        renderCell={renderCell}
        dropPosition="between" />
    );

    assert.equal(tree.find(EditableCollectionView).prop('className'), 'react-spectrum-TableView-body spectrum-Table-body');

    tree.instance().dropTargetUpdated(new DragTarget('item', new IndexPath(0, 0), DragTarget.DROP_BETWEEN));
    tree.update();
    assert.equal(tree.find(EditableCollectionView).prop('className'), 'react-spectrum-TableView-body spectrum-Table-body');
  });

  it('should highlight the table body if the table is empty with dropPosition="between"', function () {
    const tree = shallow(
      <TableView
        columns={columns}
        dataSource={new ListDataSource}
        renderCell={renderCell}
        dropPosition="between" />
    );

    assert.equal(tree.find(EditableCollectionView).prop('className'), 'react-spectrum-TableView-body spectrum-Table-body');

    tree.instance().dropTargetUpdated(new DragTarget('item', new IndexPath(0, 0), DragTarget.DROP_BETWEEN));
    tree.update();
    assert.equal(tree.find(EditableCollectionView).prop('className'), 'react-spectrum-TableView-body spectrum-Table-body is-drop-target');
  });
});
