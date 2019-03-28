import assert from 'assert';
import {mount, shallow} from 'enzyme';
import React from 'react';
import sinon from 'sinon';
import TableCell from '../../src/TableView/js/TableCell';
import TableRow from '../../src/TableView/js/TableRow';

const NOOP = () => {};
const columns = [{title: 'Hi'}, {title: 'Bye'}];
function renderCell(column, cellIndex, rowFocused) {
  return (
    <TableCell column={column} rowFocused={rowFocused}>
      {column.title + ' ' + cellIndex}
    </TableCell>
  );
}

describe('TableRow', function () {
  it('should render a header row', function () {
    let wrapper = shallow(<TableRow isHeaderRow columns={columns} renderCell={renderCell} />);
    let row = wrapper.childAt(0);
    assert.equal(row.prop('className'), 'react-spectrum-TableView-row spectrum-Table-head');
    assert.deepEqual(row.children().map(c => c.shallow().text()), ['Hi 0', 'Bye 1']);
    wrapper.setProps({allowsSelection: true, allowsMultipleSelection: true});
    row = wrapper.childAt(0);
    let checkboxCell = row.childAt(0);
    assert.equal(checkboxCell.prop('className'), 'spectrum-Table-checkboxCell react-spectrum-TableView-checkboxCell');
    let checkbox = checkboxCell.childAt(0);
    assert.equal(checkbox.prop('className'), 'spectrum-Table-checkbox');
    assert.equal(checkbox.prop('title'), 'Select All');
    wrapper.setProps({allowsMultipleSelection: false});
    row = wrapper.childAt(0);
    checkboxCell = row.childAt(0);
    assert.equal(checkboxCell.prop('className'), 'spectrum-Table-checkboxCell react-spectrum-TableView-checkboxCell');
    assert.equal(checkboxCell.prop('aria-label'), 'Select');
    checkbox = checkboxCell.childAt(0);
    assert.deepEqual(checkbox.prop('style'), {visibility: 'hidden'});
  });

  it('should render a body row', function () {
    let wrapper = shallow(<TableRow columns={columns} renderCell={renderCell} />);
    let row = wrapper.childAt(0);
    assert.equal(row.prop('className'), 'react-spectrum-TableView-row spectrum-Table-row');
    assert.deepEqual(row.children().map(c => c.shallow().text()), ['Hi 0', 'Bye 1']);
  });

  it('should render a selectable body row', function () {
    let wrapper = shallow(<TableRow allowsSelection columns={columns} renderCell={renderCell} />);
    let row = wrapper.childAt(0);

    assert.equal(row.prop('className'), 'react-spectrum-TableView-row spectrum-Table-row');

    let checkboxCell = row.childAt(0);
    assert.equal(checkboxCell.prop('className'), 'spectrum-Table-checkboxCell react-spectrum-TableView-checkboxCell');
    let checkbox = checkboxCell.childAt(0);
    assert.equal(checkbox.prop('className'), 'spectrum-Table-checkbox');
    assert(!checkbox.prop('checked'));
    assert.equal(checkbox.prop('title'), 'Select');

    assert.deepEqual(row.children().slice(1).map(c => c.shallow().text()), ['Hi 0', 'Bye 1']);
  });

  it('should render a selected body row', function () {
    let wrapper = shallow(<TableRow allowsSelection selected columns={columns} renderCell={renderCell} />);
    let row = wrapper.childAt(0);

    assert.equal(row.prop('className'), 'react-spectrum-TableView-row spectrum-Table-row is-selected');

    let checkboxCell = row.childAt(0);
    assert.equal(checkboxCell.prop('className'), 'spectrum-Table-checkboxCell react-spectrum-TableView-checkboxCell');
    let checkbox = checkboxCell.childAt(0);
    assert.equal(checkbox.prop('className'), 'spectrum-Table-checkbox');
    assert(checkbox.prop('checked'));
    assert.equal(checkbox.prop('title'), 'Select');

    assert.deepEqual(row.children().slice(1).map(c => c.shallow().text()), ['Hi 0', 'Bye 1']);
  });

  it('should render a drop target row', function () {
    let wrapper = shallow(<TableRow columns={columns} renderCell={renderCell} drop-target />);
    assert.equal(wrapper.childAt(0).prop('className'), 'react-spectrum-TableView-row spectrum-Table-row is-drop-target');
  });

  it('should trigger onSelectChange when the checkbox value changes', function () {
    let onSelectChange = sinon.spy();
    let wrapper = shallow(<TableRow allowsSelection onSelectChange={onSelectChange} columns={columns} renderCell={renderCell} />);
    wrapper.find('.spectrum-Table-checkbox').simulate('change', true);
    assert(onSelectChange.calledOnce);
    assert(onSelectChange.getCall(0).args[0], true);
  });

  it('should trigger onCellClick when clicking on a cell', function () {
    let layoutInfo = {section: 0, index: 5};
    let collectionView = {indexPathForComponent: () => (layoutInfo)};
    let onCellClick = sinon.spy();
    let wrapper = shallow(<TableRow columns={columns} renderCell={renderCell} layoutInfo={layoutInfo} />);
    wrapper.childAt(0).childAt(1).simulate('click');
    assert(!onCellClick.calledOnce);
    wrapper.setProps({collectionView, onCellClick});
    wrapper.childAt(0).childAt(1).simulate('click', {target: {tabIndex: -1}});
    assert(onCellClick.calledOnce);
    assert.deepEqual(onCellClick.getCall(0).args, [columns[1], 5]);
  });

  it('should call onCellFocus when a cell receives focus', function () {
    let layoutInfo = {section: 0, index: 5};
    let onCellFocus = sinon.spy();
    let wrapper = shallow(<TableRow columns={columns} renderCell={renderCell} layoutInfo={layoutInfo} onCellFocus={onCellFocus} />);
    wrapper.childAt(0).childAt(1).simulate('focus');
    assert(onCellFocus.calledOnce);
    assert(onCellFocus.calledWith(1));
  });

  it('should trigger onCellDoubleClick when double clicking on a cell', function () {
    let collectionView = {indexPathForComponent: () => ({section: 0, index: 5})};
    let onCellDoubleClick = sinon.spy();
    let wrapper = shallow(<TableRow columns={columns} renderCell={renderCell} collectionView={collectionView} onCellDoubleClick={onCellDoubleClick} />);
    wrapper.childAt(0).childAt(1).simulate('doubleClick');
    assert(onCellDoubleClick.calledOnce);
    assert.deepEqual(onCellDoubleClick.getCall(0).args, [columns[1], 5]);
  });

  describe('focus', () => {
    it('should call focus on row element', function () {
      const layoutInfo = {section: 0, index: 0};
      const collectionView = {indexPathForComponent: () => (layoutInfo)};
      const rowFocus = sinon.spy();
      const wrapper = shallow(<TableRow allowsSelection columns={columns} renderCell={renderCell} collectionView={collectionView} layoutInfo={layoutInfo} />);
      assert.equal(wrapper.childAt(0).prop('tabIndex'), 0);

      wrapper.instance().focus();
      assert(!rowFocus.calledOnce);

      // stub row ref and row.focus method
      wrapper.instance().row = {
        contains: () => false,
        focus: rowFocus
      };

      wrapper.instance().focus();
      assert(rowFocus.calledOnce);
    });
  });

  it('should update focused state when focused prop changes', () => {
    const layoutInfo = {section: 0, index: 0};
    const wrapper = shallow(<TableRow allowsSelection columns={columns} renderCell={renderCell} layoutInfo={layoutInfo} />);
    wrapper.setProps({'focused': true});
    assert(wrapper.state('focused'));
    wrapper.setProps({'focused': false});
    assert(!wrapper.state('focused'));
  });

  describe('onFocus', () => {
    it('should set focused state of row element to true', async () => {
      const layoutInfo = {section: 0, index: 0};
      const collectionView = {
        indexPathForComponent: () => layoutInfo
      };
      const onFocus = sinon.spy();
      const onCellFocus = sinon.spy();
      const wrapper = mount(<TableRow allowsSelection columns={columns} renderCell={renderCell} layoutInfo={layoutInfo} onFocus={onFocus} onCellFocus={onCellFocus} />);
      wrapper.childAt(0).simulate('focus');
      assert(wrapper.state('focused'));
      wrapper.update();
      assert(onFocus.calledOnce);
      wrapper.setState({focused: false});
      assert(!wrapper.state('focused'));
      wrapper.setProps({collectionView});
      wrapper.childAt(0).simulate('focus');
      wrapper.update();
      assert(onFocus.calledTwice);
      assert(wrapper.state('focused'));
      wrapper.setState({focused: false});
      assert(!wrapper.state('focused'));
      wrapper.childAt(0).simulate('focus', {relatedTarget: wrapper.childAt(0).find('input').getDOMNode()});
      wrapper.update();
      assert(onCellFocus.calledWith(null));
      wrapper.unmount();
    });
  });

  describe('onBlur', () => {
    it('should set focused state of row element to false', function () {
      const layoutInfo = {section: 0, index: 0};
      const collectionView = {
        indexPathForComponent: () => layoutInfo
      };
      const wrapper = shallow(<TableRow allowsSelection columns={columns} renderCell={renderCell} collectionView={collectionView} layoutInfo={layoutInfo} />);
      wrapper.setState({focused: true});
      wrapper.childAt(0).simulate('blur');
      assert(!wrapper.state('focused'));
    });
  });

  it('click on checkbox following a mouseup event should not toggle selection', () => {
    const selectItem = sinon.spy();
    const stopPropagation = sinon.spy();
    const layoutInfo = {section: 0, index: 0};
    const collectionView = {
      indexPathForComponent: () => (layoutInfo),
      selectItem
    };
    const wrapper = shallow(<TableRow allowsSelection columns={columns} renderCell={renderCell} layoutInfo={layoutInfo} />);
    const checkboxCell = wrapper.childAt(0).childAt(0);
    const checkbox = checkboxCell.childAt(0);
    checkbox.simulate('mousedown', {stopPropagation});
    checkbox.simulate('click', {shiftKey: false});
    assert(stopPropagation.calledOnce);
    assert(!selectItem.calledOnce);
    checkbox.simulate('click', {shiftKey: false});
    assert(!selectItem.calledOnce);
    stopPropagation.reset();
    wrapper.setProps({collectionView});
    checkbox.simulate('mousedown', {stopPropagation});
    checkbox.simulate('click', {shiftKey: false});
    assert(stopPropagation.calledOnce);
    assert(selectItem.calledOnce);
    assert.deepEqual(selectItem.getCall(0).args, [{section: 0, index: 0}, true, false, true]);
    checkbox.simulate('click', {shiftKey: true});
    assert(selectItem.calledTwice);
    assert.deepEqual(selectItem.getCall(1).args, [{section: 0, index: 0}, true, true, true]);
  });

  describe('onKeyDown', () => {
    it('should enable horizontal navigation of focusable descendants', async () => {
      const wrapper = mount(<TableRow tableId="foo" allowsSelection columns={columns} renderCell={renderCell} tabIndex={0} />);
      let row = wrapper.childAt(0);
      let eventStub = {
        preventDefault: NOOP,
        stopPropagation: NOOP,
        nativeEvent: {
          stopImmediatePropagation: NOOP
        }
      };

      // ArrowRight with focus on the row should move focus to first focusable descendant
      row.simulate('keyDown', {key: 'ArrowRight', ...eventStub});
      assert.equal(row.find(TableCell).first().getDOMNode(), document.activeElement, 'ArrowRight key on row moves focus to first cell');
      row.find(TableCell).first().simulate('focus', eventStub);
      assert.equal(row.find('input').getDOMNode(), document.activeElement, 'Focusing cell marshalls focus to focusable descendant');

      // "Right" event.key alternative with focus on the row should move focus to first focusable descendant
      row.simulate('keyDown', {key: 'Right', ...eventStub});
      assert.equal(row.find(TableCell).first().getDOMNode(), document.activeElement, 'Right key on row moves focus to first cell');
      row.find(TableCell).first().simulate('focus', eventStub);
      assert.equal(row.find('input').getDOMNode(), document.activeElement);

      row.find('input').simulate('keyDown', {key: 'ArrowRight', ...eventStub});
      assert.equal(row.find(TableCell).at(1).getDOMNode(), document.activeElement, 'ArrowRight key on first cell moves focus to adjacent cell');

      row.find(TableCell).at(1).simulate('keyDown', {key: 'ArrowRight', ...eventStub});
      assert.equal(row.find(TableCell).at(2).getDOMNode(), document.activeElement, 'ArrowRight key on second cell moves focus to adjacent cell');

      // ArrowRight with focus on last focusable descendant in the row should loop focus back to the row
      row.find(TableCell).last().simulate('keyDown', {key: 'ArrowRight', ...eventStub});
      assert.equal(row.getDOMNode(), document.activeElement, 'ArrowRight with focus on last focusable descendant in the row should loop focus back to the row');

      // ArrowLeft with focus on the row should move focus to last focusable descendant
      row.simulate('keyDown', {key: 'ArrowLeft', ...eventStub});
      assert.equal(row.find(TableCell).last().getDOMNode(), document.activeElement, 'ArrowLeft with focus on the row should move focus to last focusable descendant');

      // "Left" event.key alternative with focus on the row should move focus to last focusable descendant
      row.simulate('keyDown', {key: 'Left', ...eventStub});
      assert.equal(row.find(TableCell).last().getDOMNode(), document.activeElement, '"Left" event.key alternative with focus on the row should move focus to last focusable descendant');

      // Focusing on descendant of TableCell should remove tabIndex from parent.
      row.find(TableCell).first().simulate('focus', eventStub);
      assert.equal(row.find('input').getDOMNode(), document.activeElement);
      wrapper.update();

      // Testing in React 14, tabIndex remains -1
      if (row.find(TableCell).first().getDOMNode().getAttribute('tabindex') === '-1') {
        row.find(TableCell).first().getDOMNode().removeAttribute('tabindex');
      }

      // ArrowLeft with focus on first focusable descendant in the row should move focus back to the row
      row.find('input').simulate('keyDown', {key: 'ArrowLeft', ...eventStub});
      assert.equal(row.getDOMNode(), document.activeElement);

      // test else path when allowsSelection is false
      wrapper.setProps({allowsSelection: false});
      row = wrapper.childAt(0);
      row.simulate('keyDown', {key: 'ArrowRight', ...eventStub});
      assert.equal(row.find(TableCell).first().getDOMNode(), document.activeElement);

      wrapper.unmount();
    });

    it('should select all on Ctrl+A or Meta+A for header row', () => {
      const onSelectChange = sinon.spy();
      const wrapper = shallow(<TableRow isHeaderRow allowsSelection columns={columns} renderCell={renderCell} onSelectChange={onSelectChange} />);
      let row = wrapper.childAt(0);

      // "A" key with no modifier should not call onSelectChange
      row.simulate('keyDown', {key: 'a', preventDefault: NOOP, stopPropagation: NOOP});
      assert.equal(onSelectChange.callCount, 0);

      // "Meta+A" should call onSelectChange with true
      row.simulate('keyDown', {key: 'a', metaKey: true, preventDefault: NOOP, stopPropagation: NOOP});
      assert.equal(onSelectChange.callCount, 1);
      assert.equal(onSelectChange.getCall(0).args[0], true);

      // "Ctrl+A" should call onSelectChange with true
      row.simulate('keyDown', {key: 'a', ctrlKey: true, preventDefault: NOOP, stopPropagation: NOOP});
      assert.equal(onSelectChange.callCount, 2);
      assert.equal(onSelectChange.getCall(1).args[0], true);

      onSelectChange.reset();
      wrapper.setProps({isHeaderRow: false});
      row.simulate('keyDown', {key: 'a', ctrlKey: true, preventDefault: NOOP, stopPropagation: NOOP});
      assert.equal(onSelectChange.callCount, 0);
    });

    it('should clear selection on Escape key', () => {
      const onSelectChange = sinon.spy();
      const wrapper = shallow(<TableRow allowsSelection columns={columns} renderCell={renderCell} />);
      let row = wrapper.childAt(0);

      // Esc key with no onSelectChange prop should do nothing
      row.simulate('keyDown', {key: 'Escape', preventDefault: NOOP, stopPropagation: NOOP});
      assert.equal(onSelectChange.callCount, 0);

      // add onSelectChange method
      wrapper.setProps({onSelectChange});

      // Escape key should call onSelectChange with false
      row.simulate('keyDown', {key: 'Escape', preventDefault: NOOP, stopPropagation: NOOP});
      assert.equal(onSelectChange.callCount, 1);
      assert.equal(onSelectChange.getCall(0).args[0], false);

      // "Esc" event.key alternative should call onSelectChange with false
      row.simulate('keyDown', {key: 'Esc', preventDefault: NOOP, stopPropagation: NOOP});
      assert.equal(onSelectChange.callCount, 2);
      assert.equal(onSelectChange.getCall(1).args[0], false);
    });

    it('should permit vertical navigation between the header and first item row', () => {
      const layoutInfo = {section: 0, index: 0};
      const collectionView = {
        indexPathForComponent: () => layoutInfo,
        getSectionLength: () => 1,
        selectedIndexPaths: []
      };
      const tableView = {
        focusedColumnIndex: null
      };
      const wrapper = mount(<div role="grid">
        <div role="rowgroup">
          <TableRow isHeaderRow allowsSelection allowsMultipleSelection columns={columns} renderCell={renderCell} layoutInfo={layoutInfo} collectionView={collectionView} tableView={tableView} />
        </div>
        <div role="rowgroup">
          <div role="presentation">
            <div role="presentation">
              <TableRow allowsSelection allowsMultipleSelection columns={columns} renderCell={renderCell} tabIndex={0} collectionView={collectionView} layoutInfo={layoutInfo} tableView={tableView} />
            </div>
          </div>
        </div>
      </div>);

      // stub collectionView.getDOMNode method to return second "rowgroup".
      collectionView.getDOMNode = () => wrapper.find('[role="rowgroup"]').last().getDOMNode();

      const headerRow = wrapper.find(TableRow).first();
      const bodyRow = wrapper.find(TableRow).last();

      tableView.headerRowRef = headerRow.instance();

      // navigate from header row to first body row
      headerRow.simulate('keyDown', {key: 'ArrowDown', preventDefault: NOOP, stopPropagation: NOOP});
      assert.equal(bodyRow.getDOMNode(), document.activeElement);

      // else path should not move focus, navigation behavior should be handled by EditableCollectionView
      bodyRow.simulate('keyDown', {key: 'ArrowDown', preventDefault: NOOP, stopPropagation: NOOP});
      assert.equal(bodyRow.getDOMNode(), document.activeElement);

      // navigate from body row to first focusable descendant in header row
      bodyRow.simulate('keyDown', {key: 'ArrowUp', preventDefault: NOOP, stopPropagation: NOOP});
      assert.equal(headerRow.find('input').getDOMNode(), document.activeElement);

      // else path for ArrowUp on header row should not move focus
      headerRow.simulate('keyDown', {key: 'ArrowUp', preventDefault: NOOP, stopPropagation: NOOP});
      assert.equal(headerRow.find('input').getDOMNode(), document.activeElement);

      // test "Down" and "Up" event.key alternatives
      headerRow.find('input').simulate('keyDown', {key: 'Down', preventDefault: NOOP, stopPropagation: NOOP});
      assert.equal(bodyRow.getDOMNode(), document.activeElement);
      bodyRow.simulate('keyDown', {key: 'Up', preventDefault: NOOP, stopPropagation: NOOP});
      assert.equal(headerRow.find('input').getDOMNode(), document.activeElement);

      // clean up
      wrapper.unmount();
    });

    describe('should call onCellFocus with null to clear the focusedColumnIndex', () => {
      it('on Tab key', () => {
        const onCellFocus = sinon.spy();
        const wrapper = shallow(<TableRow allowsSelection columns={columns} renderCell={renderCell} onCellFocus={onCellFocus} />);
        let row = wrapper.childAt(0);
        row.simulate('keyDown', {key: 'Tab', preventDefault: NOOP, stopPropagation: NOOP});
        assert(onCellFocus.calledWith(null));
      });

      it('on ArrowDown with focus on checkbox in header row', () => {
        const layoutInfo = {section: 0, index: 0};
        const collectionView = {
          indexPathForComponent: () => (layoutInfo)
        };
        const onCellFocus = sinon.spy();
        const wrapper = mount(<div role="grid">
          <div role="rowgroup">
            <TableRow isHeaderRow allowsSelection allowsMultipleSelection columns={columns} renderCell={renderCell} layoutInfo={layoutInfo} onCellFocus={onCellFocus} />
          </div>
          <div role="rowgroup">
            <div role="presentation">
              <div role="presentation">
                <TableRow allowsSelection allowsMultipleSelection columns={columns} renderCell={renderCell} tabIndex={0} collectionView={collectionView} layoutInfo={layoutInfo} onCellFocus={onCellFocus} />
              </div>
            </div>
          </div>
        </div>);

        // stub collectionView.getDOMNode method to return second "rowgroup".
        collectionView.getDOMNode = () => wrapper.find('[role="rowgroup"]').last().getDOMNode();

        const headerRow = wrapper.find(TableRow).first();

        headerRow.find('input').simulate('keyDown', {key: 'ArrowDown', preventDefault: NOOP, stopPropagation: NOOP, target: headerRow.find('input').getDOMNode()});
        assert(onCellFocus.calledWith(null));
        wrapper.unmount();
      });
    });
  });

  it('should set header row checkbox to indeterminate when multiple items, but not all, are selected', () => {
    let collection = {
      selectedIndexPaths: [
        {section: 0, index: 0},
        {section: 0, index: 1},
        {section: 0, index: 2},
        {section: 0, index: 3},
        {section: 0, index: 4},
        {section: 0, index: 5}
      ]
    };
    let wrapper = shallow(<TableRow isHeaderRow columns={columns} renderCell={renderCell} allowsSelection allowsMultipleSelection collectionView={collection} />);
    let checkbox = wrapper.childAt(0).childAt(0).childAt(0);
    assert(checkbox.prop('indeterminate'));
    assert(!checkbox.prop('checked'));
    wrapper.setProps({selected: true});
    checkbox = wrapper.childAt(0).childAt(0).childAt(0);
    assert(!checkbox.prop('indeterminate'));
    assert(checkbox.prop('checked'));
  });
});
