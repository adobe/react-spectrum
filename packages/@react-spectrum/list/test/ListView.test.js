/*
 * Copyright 2021 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
import {act, fireEvent, render as renderComponent, within} from '@testing-library/react';
import {ActionButton} from '@react-spectrum/button';
import {CUSTOM_DRAG_TYPE} from '@react-aria/dnd/src/constants';
import {DataTransfer, DataTransferItem, DragEvent} from '@react-aria/dnd/test/mocks';
import {DragExample} from '../stories/ListView.stories';
import {Droppable} from '@react-aria/dnd/test/examples';
import {installPointerEvent, triggerPress} from '@react-spectrum/test-utils';
import {Item, ListView} from '../src';
import {Provider} from '@react-spectrum/provider';
import React from 'react';
import {theme} from '@react-spectrum/theme-default';
import userEvent from '@testing-library/user-event';

function pointerEvent(type, opts) {
  let evt = new Event(type, {bubbles: true, cancelable: true});
  Object.assign(evt, {
    ctrlKey: false,
    metaKey: false,
    shiftKey: false,
    altKey: false,
    button: opts.button || 0,
    width: 1,
    height: 1
  }, opts);
  return evt;
}

describe('ListView', function () {
  let offsetWidth, offsetHeight, scrollHeight;
  let onSelectionChange = jest.fn();
  let onAction = jest.fn();
  let onDragStart = jest.fn();
  let onDragMove = jest.fn();
  let onDragEnd = jest.fn();
  let onDrop = jest.fn();
  let checkSelection = (onSelectionChange, selectedKeys) => {
    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    expect(new Set(onSelectionChange.mock.calls[0][0])).toEqual(new Set(selectedKeys));
  };
  let items = [
    {key: 'foo', label: 'Foo'},
    {key: 'bar', label: 'Bar'},
    {key: 'baz', label: 'Baz'}
  ];

  let manyItems = [];
  for (let i = 1; i <= 100; i++) {
    manyItems.push({id: i, label: 'Foo ' + i});
  }

  beforeAll(function () {
    offsetWidth = jest.spyOn(window.HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(() => 1000);
    offsetHeight = jest.spyOn(window.HTMLElement.prototype, 'clientHeight', 'get').mockImplementation(() => 1000);
    scrollHeight = jest.spyOn(window.HTMLElement.prototype, 'scrollHeight', 'get').mockImplementation(() => 40);
    jest.useFakeTimers();
  });

  afterEach(function () {
    jest.clearAllMocks();
  });

  afterAll(function () {
    offsetWidth.mockReset();
    offsetHeight.mockReset();
    scrollHeight.mockReset();
  });

  let render = (children, locale = 'en-US', scale = 'medium') => {
    let tree = renderComponent(
      <Provider theme={theme} scale={scale} locale={locale}>
        {children}
      </Provider>
    );
    // Allow for Virtualizer layout to update
    act(() => {jest.runAllTimers();});
    return tree;
  };

  let renderList = (props = {}) => {
    let {
      locale,
      scale,
      ...otherProps
    } = props;
    return render(
      <ListView items={items} aria-label="List" {...otherProps}>
        {item => (
          <Item textValue={item.label}>
            {item.label}
          </Item>
        )}
      </ListView>,
      locale,
      scale
    );
  };

  let renderListWithFocusables = (props = {}) => {
    let {
      locale,
      scale,
      ...otherProps
    } = props;
    return render(
      <ListView items={items} aria-label="List" {...otherProps}>
        {item => (
          <Item textValue={item.label}>
            {item.label}
            <ActionButton>button1 {item.label}</ActionButton>
            <ActionButton>button2 {item.label}</ActionButton>
          </Item>
        )}
      </ListView>,
      locale,
      scale
    );
  };

  let getRow = (tree, text) => {
    // Find by text, then go up to the element with the row role.
    let el = tree.getByText(text);
    while (el && !/row/.test(el.getAttribute('role'))) {
      el = el.parentElement;
    }

    return el;
  };

  let moveFocus = (key, opts = {}) => {
    fireEvent.keyDown(document.activeElement, {key, ...opts});
    fireEvent.keyUp(document.activeElement, {key, ...opts});
  };

  it('renders a static listview', function () {
    let {getByRole, getAllByRole} = render(
      <ListView aria-label="List" data-testid="test">
        <Item>Foo</Item>
        <Item>Bar</Item>
        <Item>Baz</Item>
      </ListView>
    );

    let grid = getByRole('grid');
    expect(grid).toBeVisible();
    expect(grid).toHaveAttribute('aria-label', 'List');
    expect(grid).toHaveAttribute('data-testid', 'test');
    expect(grid).toHaveAttribute('aria-rowcount', '3');
    expect(grid).toHaveAttribute('aria-colcount', '1');

    let rows = getAllByRole('row');
    expect(rows).toHaveLength(3);

    let gridCells = within(rows[0]).getAllByRole('gridcell');
    expect(gridCells).toHaveLength(1);
    expect(gridCells[0]).toHaveTextContent('Foo');
  });

  it('renders a dynamic listview', function () {
    let items = [
      {key: 'foo', label: 'Foo'},
      {key: 'bar', label: 'Bar'},
      {key: 'baz', label: 'Baz'}
    ];
    let {getByRole, getAllByRole} = render(
      <ListView items={items} aria-label="List">
        {item =>
          <Item textValue={item.key}>{item.label}</Item>
        }
      </ListView>
    );

    let grid = getByRole('grid');
    expect(grid).toBeVisible();
    expect(grid).toHaveAttribute('aria-label', 'List');
    expect(grid).toHaveAttribute('aria-rowcount', '3');
    expect(grid).toHaveAttribute('aria-colcount', '1');

    let rows = getAllByRole('row');
    expect(rows).toHaveLength(3);

    let gridCells = within(rows[0]).getAllByRole('gridcell');
    expect(gridCells).toHaveLength(1);
    expect(gridCells[0]).toHaveTextContent('Foo');
  });

  it('renders a falsy ids', function () {
    let items = [
      {id: 0, label: 'Foo'},
      {id: 1, label: 'Bar'}
    ];
    let {getByRole, getAllByRole} = render(
      <ListView items={items} aria-label="List">
        {item =>
          <Item textValue={item.label}>{item.label}</Item>
        }
      </ListView>
    );

    let grid = getByRole('grid');
    expect(grid).toBeVisible();

    let rows = getAllByRole('row');
    expect(rows).toHaveLength(2);

    let gridCells = within(rows[0]).getAllByRole('gridcell');
    expect(gridCells).toHaveLength(1);
    expect(gridCells[0]).toHaveTextContent('Foo');
  });

  it('should retain focus on the pressed child', function () {
    let tree = renderListWithFocusables();
    let button = within(getRow(tree, 'Foo')).getAllByRole('button')[1];
    triggerPress(button);
    expect(document.activeElement).toBe(button);
  });

  it('should focus the row if the cell is pressed', function () {
    let tree = renderList({selectionMode: 'single'});
    let cell = within(getRow(tree, 'Bar')).getByRole('gridcell');
    triggerPress(cell);
    act(() => {
      jest.runAllTimers();
    });
    expect(document.activeElement).toBe(getRow(tree, 'Bar'));
  });

  it('should have an aria-label on the row for the row text content', function () {
    let tree = renderList();
    expect(getRow(tree, 'Foo')).toHaveAttribute('aria-label', 'Foo');
    expect(getRow(tree, 'Bar')).toHaveAttribute('aria-label', 'Bar');
    expect(getRow(tree, 'Baz')).toHaveAttribute('aria-label', 'Baz');
  });

  describe('keyboard focus', function () {
    describe('Type to select', function () {
      it('focuses the correct cell when typing', function () {
        let tree = renderList();
        let target = getRow(tree, 'Baz');
        let grid = tree.getByRole('grid');
        userEvent.tab();
        fireEvent.keyDown(grid, {key: 'B'});
        fireEvent.keyUp(grid, {key: 'Enter'});
        fireEvent.keyDown(grid, {key: 'A'});
        fireEvent.keyUp(grid, {key: 'A'});
        fireEvent.keyDown(grid, {key: 'Z'});
        fireEvent.keyUp(grid, {key: 'Z'});
        expect(document.activeElement).toBe(target);
      });
    });

    describe('ArrowRight', function () {
      it('should not move focus if no focusables present', function () {
        let tree = renderList();
        let start = getRow(tree, 'Foo');
        userEvent.tab();
        moveFocus('ArrowRight');
        expect(document.activeElement).toBe(start);
      });

      describe('with cell focusables', function () {
        it('should move focus to next cell and back to row', function () {
          let tree = renderListWithFocusables();
          let start = getRow(tree, 'Foo');
          let focusables = within(start).getAllByRole('button');
          userEvent.tab();
          moveFocus('ArrowRight');
          expect(document.activeElement).toBe(focusables[0]);
          moveFocus('ArrowRight');
          expect(document.activeElement).toBe(focusables[1]);
          moveFocus('ArrowRight');
          expect(document.activeElement).toBe(start);
        });

        it('should move focus to previous cell in RTL', function () {
          let tree = renderListWithFocusables({locale: 'ar-AE'});
          // Should move from button two to button one
          let start = within(getRow(tree, 'Foo')).getAllByRole('button')[1];
          let end = within(getRow(tree, 'Foo')).getAllByRole('button')[0];
          // Need to press to set a modality, otherwise useSelectableCollection will think this is a tab operation
          triggerPress(start);
          expect(document.activeElement).toHaveTextContent('button2 Foo');
          expect(document.activeElement).toBe(start);
          moveFocus('ArrowRight');
          expect(document.activeElement).toBe(end);
          expect(document.activeElement).toHaveTextContent('button1 Foo');
        });
      });
    });

    describe('ArrowLeft', function () {
      it('should not move focus if no focusables present', function () {
        let tree = renderList();
        let start = getRow(tree, 'Foo');
        userEvent.tab();
        moveFocus('ArrowLeft');
        expect(document.activeElement).toBe(start);
      });

      describe('with cell focusables', function () {
        it('should move focus to previous cell and back to row', function () {
          let tree = renderListWithFocusables();
          let focusables = within(getRow(tree, 'Foo')).getAllByRole('button');
          let start = getRow(tree, 'Foo');
          userEvent.tab();
          moveFocus('ArrowLeft');
          expect(document.activeElement).toBe(focusables[1]);
          moveFocus('ArrowLeft');
          expect(document.activeElement).toBe(focusables[0]);
          moveFocus('ArrowLeft');
          expect(document.activeElement).toBe(start);
        });

        it('should move focus to next cell in RTL', function () {
          let tree = renderListWithFocusables({locale: 'ar-AE'});
          // Should move from button one to button two
          let start = within(getRow(tree, 'Foo')).getAllByRole('button')[0];
          let end = within(getRow(tree, 'Foo')).getAllByRole('button')[1];
          // Need to press to set a modality, otherwise useSelectableCollection will think this is a tab operation
          triggerPress(start);
          expect(document.activeElement).toHaveTextContent('button1 Foo');
          expect(document.activeElement).toBe(start);
          moveFocus('ArrowLeft');
          expect(document.activeElement).toBe(end);
          expect(document.activeElement).toHaveTextContent('button2 Foo');
        });
      });
    });

    describe('ArrowUp', function () {
      it('should not wrap focus', function () {
        let tree = renderListWithFocusables();
        let start = getRow(tree, 'Foo');
        userEvent.tab();
        moveFocus('ArrowUp');
        expect(document.activeElement).toBe(start);
      });

      it('should move focus to above row', function () {
        let tree = renderListWithFocusables({selectionMode: 'single'});
        let start = getRow(tree, 'Bar');
        let end = getRow(tree, 'Foo');
        triggerPress(start);
        moveFocus('ArrowUp');
        expect(document.activeElement).toBe(end);
      });

      it('should allow focus on disabled rows', function () {
        let tree = renderListWithFocusables({disabledKeys: ['foo'], selectionMode: 'single'});
        let start = getRow(tree, 'Bar');
        let end = getRow(tree, 'Foo');
        triggerPress(start);
        moveFocus('ArrowUp');
        expect(document.activeElement).toBe(end);
      });
    });

    describe('ArrowDown', function () {
      it('should not wrap focus', function () {
        let tree = renderListWithFocusables({selectionMode: 'single'});
        let start = getRow(tree, 'Baz');
        triggerPress(start);
        moveFocus('ArrowDown');
        expect(document.activeElement).toBe(start);
      });

      it('should move focus to below row', function () {
        let tree = renderListWithFocusables({selectionMode: 'single'});
        let start = getRow(tree, 'Foo');
        let end = getRow(tree, 'Bar');
        triggerPress(start);
        moveFocus('ArrowDown');
        expect(document.activeElement).toBe(end);
      });

      it('should allow focus on disabled rows', function () {
        let tree = renderListWithFocusables({disabledKeys: ['bar'], selectionMode: 'single'});
        let start = getRow(tree, 'Foo');
        let end = getRow(tree, 'Bar');
        triggerPress(start);
        moveFocus('ArrowDown');
        expect(document.activeElement).toBe(end);
      });
    });

    describe('PageUp', function () {
      it('should move focus to a row a page above when focus starts on a row', function () {
        let tree = renderListWithFocusables({items: manyItems, selectionMode: 'single'});
        let start = getRow(tree, 'Foo 25');
        triggerPress(start);
        moveFocus('PageUp');
        expect(document.activeElement).toBe(getRow(tree, 'Foo 1'));
      });

      it('should move focus to a row a page above when focus starts in the row cell', function () {
        let tree = renderListWithFocusables({items: manyItems});
        let focusables = within(getRow(tree, 'Foo 25')).getAllByRole('button');
        let start = focusables[0];
        triggerPress(start);
        expect(document.activeElement).toBe(start);
        moveFocus('PageUp');
        expect(document.activeElement).toBe(getRow(tree, 'Foo 1'));
      });
    });

    describe('PageDown', function () {
      it('should move focus to a row a page below when focus starts on a row', function () {
        let tree = renderListWithFocusables({items: manyItems, selectionMode: 'single'});
        userEvent.tab();
        moveFocus('PageDown');
        expect(document.activeElement).toBe(getRow(tree, 'Foo 25'));
        moveFocus('PageDown');
        expect(document.activeElement).toBe(getRow(tree, 'Foo 49'));
      });

      it('should move focus to a row a page below when focus starts in the row cell', function () {
        let tree = renderListWithFocusables({items: manyItems});
        let focusables = within(getRow(tree, 'Foo 1')).getAllByRole('button');
        let start = focusables[0];
        triggerPress(start);
        expect(document.activeElement).toBe(start);
        moveFocus('PageDown');
        expect(document.activeElement).toBe(getRow(tree, 'Foo 25'));
        moveFocus('PageDown');
        expect(document.activeElement).toBe(getRow(tree, 'Foo 49'));
      });
    });

    describe('Home', function () {
      it('should move focus to the first row when focus starts on a row', function () {
        let tree = renderListWithFocusables({items: manyItems, selectionMode: 'single'});
        let start = getRow(tree, 'Foo 15');
        triggerPress(start);
        moveFocus('Home');
        expect(document.activeElement).toBe(getRow(tree, 'Foo 1'));
      });

      it('should move focus to the first row when focus starts in the row cell', function () {
        let tree = renderListWithFocusables({items: manyItems});
        let focusables = within(getRow(tree, 'Foo 15')).getAllByRole('button');
        let start = focusables[0];
        triggerPress(start);
        expect(document.activeElement).toBe(start);
        moveFocus('Home');
        expect(document.activeElement).toBe(getRow(tree, 'Foo 1'));
      });
    });

    describe('End', function () {
      it('should move focus to the last row when focus starts on a row', function () {
        let tree = renderListWithFocusables({items: manyItems});
        userEvent.tab();
        moveFocus('End');
        expect(document.activeElement).toBe(getRow(tree, 'Foo 100'));
      });

      it('should move focus to the last row when focus starts in the row cell', function () {
        let tree = renderListWithFocusables({items: manyItems});
        let focusables = within(getRow(tree, 'Foo 1')).getAllByRole('button');
        let start = focusables[0];
        triggerPress(start);
        expect(document.activeElement).toBe(start);
        moveFocus('End');
        expect(document.activeElement).toBe(getRow(tree, 'Foo 100'));
      });
    });
  });

  it('should display loading affordance with proper height (isLoading)', function () {
    let {getAllByRole} = render(<ListView aria-label="List" loadingState="loading">{[]}</ListView>);
    let row = getAllByRole('row')[0];
    expect(row.parentNode.style.height).toBe('1000px');
    let progressbar = within(row).getByRole('progressbar');
    expect(progressbar).toBeTruthy();
  });

  it('should display loading affordance with proper height (isLoadingMore)', function () {
    let items = [
      {key: 'foo', label: 'Foo'},
      {key: 'bar', label: 'Bar'},
      {key: 'baz', label: 'Baz'}
    ];
    let {getByRole} = render(
      <ListView items={items} aria-label="List" loadingState="loadingMore">
        {item =>
          <Item textValue={item.key}>{item.label}</Item>
        }
      </ListView>
    );
    let progressbar = getByRole('progressbar');
    expect(progressbar).toBeTruthy();
    expect(progressbar.parentNode.parentNode.parentNode.style.height).toBe('40px');
  });

  it('should render empty state', function () {
    function renderEmptyState() {
      return <div>No results</div>;
    }
    let {getByText} = render(<ListView aria-label="List" renderEmptyState={renderEmptyState} />);
    expect(getByText('No results')).toBeTruthy();
  });

  it('supports custom data attributes', () => {
    let {getByRole} = render(
      <ListView aria-label="List" data-testid="test">
        <Item>Foo</Item>
        <Item>Bar</Item>
      </ListView>
    );
    let grid = getByRole('grid');
    expect(grid).toHaveAttribute('data-testid', 'test');
  });

  describe('selection', function () {
    installPointerEvent();
    let items = [
      {key: 'foo', label: 'Foo'},
      {key: 'bar', label: 'Bar'},
      {key: 'baz', label: 'Baz'}
    ];
    let renderSelectionList = (props) => render(
      <ListView items={items} aria-label="List" {...props}>
        {item => (
          <Item key={item.key} textValue={item.key}>
            {item.label}
          </Item>
        )}
      </ListView>
    );

    it('should select an item from checkbox', function () {
      let tree = renderSelectionList({onSelectionChange, selectionMode: 'multiple'});

      let row = tree.getAllByRole('row')[1];
      expect(row).toHaveAttribute('aria-selected', 'false');
      act(() => userEvent.click(within(row).getByRole('checkbox')));

      checkSelection(onSelectionChange, ['bar']);
      expect(row).toHaveAttribute('aria-selected', 'true');
    });

    it('should select a row by pressing the Space key on a row', function () {
      let tree = renderSelectionList({onSelectionChange, selectionMode: 'multiple'});

      let row = tree.getAllByRole('row')[1];
      expect(row).toHaveAttribute('aria-selected', 'false');
      fireEvent.keyDown(row, {key: ' '});
      fireEvent.keyUp(row, {key: ' '});

      checkSelection(onSelectionChange, ['bar']);
      expect(row).toHaveAttribute('aria-selected', 'true');
    });

    it('should select a row by pressing the Enter key on a row', function () {
      let tree = renderSelectionList({onSelectionChange, selectionMode: 'multiple'});

      let row = tree.getAllByRole('row')[1];
      expect(row).toHaveAttribute('aria-selected', 'false');
      fireEvent.keyDown(row, {key: 'Enter'});
      fireEvent.keyUp(row, {key: 'Enter'});

      checkSelection(onSelectionChange, ['bar']);
      expect(row).toHaveAttribute('aria-selected', 'true');
    });

    it('should only allow one item to be selected in single selection', function () {
      let tree = renderSelectionList({onSelectionChange, selectionMode: 'single'});

      let rows = tree.getAllByRole('row');
      expect(rows[1]).toHaveAttribute('aria-selected', 'false');
      act(() => userEvent.click(within(rows[1]).getByRole('checkbox')));

      checkSelection(onSelectionChange, ['bar']);
      expect(rows[1]).toHaveAttribute('aria-selected', 'true');

      onSelectionChange.mockClear();
      act(() => userEvent.click(within(rows[2]).getByRole('checkbox')));
      checkSelection(onSelectionChange, ['baz']);
      expect(rows[1]).toHaveAttribute('aria-selected', 'false');
      expect(rows[2]).toHaveAttribute('aria-selected', 'true');
    });

    it('should allow multiple items to be selected in multiple selection', function () {
      let tree = renderSelectionList({onSelectionChange, selectionMode: 'multiple'});

      let rows = tree.getAllByRole('row');
      expect(rows[1]).toHaveAttribute('aria-selected', 'false');
      act(() => userEvent.click(within(rows[1]).getByRole('checkbox')));

      checkSelection(onSelectionChange, ['bar']);
      expect(rows[1]).toHaveAttribute('aria-selected', 'true');

      onSelectionChange.mockClear();
      act(() => userEvent.click(within(rows[2]).getByRole('checkbox')));
      checkSelection(onSelectionChange, ['bar', 'baz']);
      expect(rows[1]).toHaveAttribute('aria-selected', 'true');
      expect(rows[2]).toHaveAttribute('aria-selected', 'true');
    });

    it('should toggle items in selection highlight with ctrl-click on Mac', function () {
      let uaMock = jest.spyOn(navigator, 'platform', 'get').mockImplementation(() => 'Mac');
      let tree = renderSelectionList({onSelectionChange, selectionMode: 'multiple', selectionStyle: 'highlight'});

      let rows = tree.getAllByRole('row');
      expect(rows[1]).toHaveAttribute('aria-selected', 'false');
      expect(rows[2]).toHaveAttribute('aria-selected', 'false');
      act(() => userEvent.click(getRow(tree, 'Bar'), {ctrlKey: true}));

      checkSelection(onSelectionChange, ['bar']);
      expect(rows[1]).toHaveAttribute('aria-selected', 'true');

      onSelectionChange.mockClear();
      act(() => userEvent.click(getRow(tree, 'Baz'), {ctrlKey: true}));
      checkSelection(onSelectionChange, ['baz']);
      expect(rows[1]).toHaveAttribute('aria-selected', 'false');
      expect(rows[2]).toHaveAttribute('aria-selected', 'true');

      uaMock.mockRestore();
    });

    it('should allow multiple items to be selected in selection highlight with ctrl-click on Windows', function () {
      let uaMock = jest.spyOn(navigator, 'userAgent', 'get').mockImplementation(() => 'Windows');
      let tree = renderSelectionList({onSelectionChange, selectionMode: 'multiple', selectionStyle: 'highlight'});

      let rows = tree.getAllByRole('row');
      expect(rows[0]).toHaveAttribute('aria-selected', 'false');
      expect(rows[1]).toHaveAttribute('aria-selected', 'false');
      expect(rows[2]).toHaveAttribute('aria-selected', 'false');
      act(() => userEvent.click(getRow(tree, 'Foo'), {ctrlKey: true}));

      checkSelection(onSelectionChange, ['foo']);
      expect(rows[0]).toHaveAttribute('aria-selected', 'true');

      onSelectionChange.mockClear();
      act(() => userEvent.click(getRow(tree, 'Baz'), {ctrlKey: true}));
      checkSelection(onSelectionChange, ['foo', 'baz']);
      expect(rows[0]).toHaveAttribute('aria-selected', 'true');
      expect(rows[1]).toHaveAttribute('aria-selected', 'false');
      expect(rows[2]).toHaveAttribute('aria-selected', 'true');

      uaMock.mockRestore();
    });

    it('should toggle items in selection highlight with meta-click on Windows', function () {
      let uaMock = jest.spyOn(navigator, 'userAgent', 'get').mockImplementation(() => 'Windows');
      let tree = renderSelectionList({onSelectionChange, selectionMode: 'multiple', selectionStyle: 'highlight'});

      let rows = tree.getAllByRole('row');
      expect(rows[1]).toHaveAttribute('aria-selected', 'false');
      expect(rows[2]).toHaveAttribute('aria-selected', 'false');
      act(() => userEvent.click(getRow(tree, 'Bar'), {metaKey: true}));

      checkSelection(onSelectionChange, ['bar']);
      expect(rows[1]).toHaveAttribute('aria-selected', 'true');

      onSelectionChange.mockClear();
      act(() => userEvent.click(getRow(tree, 'Baz'), {metaKey: true}));
      checkSelection(onSelectionChange, ['baz']);
      expect(rows[1]).toHaveAttribute('aria-selected', 'false');
      expect(rows[2]).toHaveAttribute('aria-selected', 'true');

      uaMock.mockRestore();
    });

    it('should support single tap to perform row selection with screen reader if onAction isn\'t provided', function () {
      let tree = renderSelectionList({onSelectionChange, selectionMode: 'multiple', selectionStyle: 'highlight'});

      let rows = tree.getAllByRole('row');
      expect(rows[1]).toHaveAttribute('aria-selected', 'false');

      act(() => userEvent.click(within(rows[1]).getByText('Bar'), {pointerType: 'touch', width: 0, height: 0}));
      checkSelection(onSelectionChange, [
        'bar'
      ]);
      expect(rows[1]).toHaveAttribute('aria-selected', 'true');
      onSelectionChange.mockReset();

      // Android TalkBack double tap test, pointer event sets pointerType and onClick handles the rest
      expect(rows[2]).toHaveAttribute('aria-selected', 'false');
      act(() => {
        let el = within(rows[2]).getByText('Baz');
        fireEvent(el, pointerEvent('pointerdown', {pointerId: 1, width: 1, height: 1, pressure: 0, detail: 0}));
        fireEvent(el, pointerEvent('pointerup', {pointerId: 1, width: 1, height: 1, pressure: 0, detail: 0}));
        fireEvent.click(el, {pointerType: 'mouse', width: 1, height: 1, detail: 1});
      });
      checkSelection(onSelectionChange, [
        'bar', 'baz'
      ]);
      expect(rows[1]).toHaveAttribute('aria-selected', 'true');
      expect(rows[2]).toHaveAttribute('aria-selected', 'true');
    });

    it('should support single tap to perform onAction with screen reader', function () {
      let tree = renderSelectionList({onSelectionChange, selectionMode: 'multiple', selectionStyle: 'highlight', onAction});

      let rows = tree.getAllByRole('row');
      act(() => userEvent.click(within(rows[1]).getByText('Bar'), {pointerType: 'touch', width: 0, height: 0}));
      expect(onSelectionChange).not.toHaveBeenCalled();
      expect(onAction).toHaveBeenCalledTimes(1);
      expect(onAction).toHaveBeenCalledWith('bar');

      // Android TalkBack double tap test, pointer event sets pointerType and onClick handles the rest
      act(() => {
        let el = within(rows[2]).getByText('Baz');
        fireEvent(el, pointerEvent('pointerdown', {pointerId: 1, width: 1, height: 1, pressure: 0, detail: 0}));
        fireEvent(el, pointerEvent('pointerup', {pointerId: 1, width: 1, height: 1, pressure: 0, detail: 0}));
        fireEvent.click(el, {pointerType: 'mouse', width: 1, height: 1, detail: 1});
      });
      expect(onSelectionChange).not.toHaveBeenCalled();
      expect(onAction).toHaveBeenCalledTimes(2);
      expect(onAction).toHaveBeenCalledWith('baz');
    });

    it('should not call onSelectionChange when hitting Space/Enter on the currently selected row', function () {
      let tree = renderSelectionList({onSelectionChange, selectionMode: 'multiple', selectionStyle: 'highlight', onAction});

      let row = tree.getAllByRole('row')[1];
      expect(row).toHaveAttribute('aria-selected', 'false');
      act(() => userEvent.click(getRow(tree, 'Bar'), {ctrlKey: true}));

      checkSelection(onSelectionChange, ['bar']);
      expect(row).toHaveAttribute('aria-selected', 'true');
      expect(onAction).toHaveBeenCalledTimes(0);

      fireEvent.keyDown(row, {key: 'Space'});
      fireEvent.keyUp(row, {key: 'Space'});
      expect(onSelectionChange).toHaveBeenCalledTimes(1);
      expect(onAction).toHaveBeenCalledTimes(0);

      fireEvent.keyDown(row, {key: 'Enter'});
      fireEvent.keyUp(row, {key: 'Enter'});
      expect(onSelectionChange).toHaveBeenCalledTimes(1);
      expect(onAction).toHaveBeenCalledTimes(1);
      expect(onAction).toHaveBeenCalledWith('bar');
    });

  });

  describe('scrolling', function () {
    it('should scroll to a row when it is focused', function () {
      let tree = render(
        <ListView
          width="250px"
          height="60px"
          aria-label="List"
          data-testid="test"
          selectionStyle="highlight"
          selectionMode="multiple"
          onSelectionChange={onSelectionChange}
          items={[...Array(20).keys()].map(k => ({key: k, name: `Item ${k}`}))}>
          {item => <Item>{item.name}</Item>}
        </ListView>
      );
      let grid = tree.getByRole('grid');
      Object.defineProperty(grid, 'clientHeight', {
        get() {
          return 60;
        }
      });
      // fire resize so the new clientHeight is requested
      act(() => {
        fireEvent(window, new Event('resize'));
      });
      userEvent.tab();
      expect(grid.scrollTop).toBe(0);

      let rows = tree.getAllByRole('row');
      let rowWrappers = rows.map(item => item.parentElement);

      expect(rowWrappers[0].style.top).toBe('0px');
      expect(rowWrappers[0].style.height).toBe('40px');
      expect(rowWrappers[1].style.top).toBe('40px');
      expect(rowWrappers[1].style.height).toBe('40px');

      // scroll us down far enough that item 0 isn't in the view
      moveFocus('ArrowDown');
      moveFocus('ArrowDown');
      moveFocus('ArrowDown');
      expect(document.activeElement).toBe(getRow(tree, 'Item 3'));
      expect(grid.scrollTop).toBe(100);

      moveFocus('ArrowUp');
      moveFocus('ArrowUp');
      moveFocus('ArrowUp');
      expect(document.activeElement).toBe(getRow(tree, 'Item 0'));
      expect(grid.scrollTop).toBe(0);
    });
  });

  describe('drag and drop', function () {
    function DraggableListView(props) {
      let {dragHookOptions, listViewProps} = props;
      return (
        <>
          <Droppable onDrop={onDrop} />
          <DragExample dragHookOptions={{onDragStart, onDragMove, onDragEnd, ...dragHookOptions}} listViewProps={{onSelectionChange, ...listViewProps}} />
        </>
      );
    }
    beforeEach(() => {
      jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(() => ({
        left: 0,
        top: 0,
        x: 0,
        y: 0,
        width: 100,
        height: 50
      }));
    });

    afterEach(() => {
      act(() => {jest.runAllTimers();});
      jest.clearAllMocks();
    });

    describe('via mouse', function () {
      it('should show a default drag preview on drag', function () {
        let {getAllByRole, getAllByText} = render(
          <DraggableListView />
        );

        let row = getAllByRole('row')[0];
        let cell = within(row).getByRole('gridcell');
        let cellText = getAllByText(cell.textContent);
        expect(cellText).toHaveLength(1);

        // Need raf to be async so the drag preview shows up properly
        jest.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => setTimeout(cb, 0));
        let dataTransfer = new DataTransfer();

        fireEvent.pointerDown(cell, {button: 0, pointerId: 1, clientX: 5, clientY: 5});
        // TODO: fireEvent.dragStart(cell, {dataTransfer, clientX: 5, clientY: 5}) doesn't propagate the clientX and Y values,
        // test if upgrading testing library/jsdom fixes issue
        fireEvent(cell, new DragEvent('dragstart', {dataTransfer, clientX: 5, clientY: 5}));
        expect(dataTransfer._dragImage.x).toBe(5);
        expect(dataTransfer._dragImage.y).toBe(5);

        cellText = getAllByText(cell.textContent);
        expect(cellText).toHaveLength(2);
        fireEvent.pointerUp(cell, {button: 0, pointerId: 1, clientX: 5, clientY: 5});
        fireEvent(cell, new DragEvent('dragend', {dataTransfer, clientX: 5, clientY: 5}));

        act(() => {jest.runAllTimers();});
        cellText = getAllByText(cell.textContent);
        expect(cellText).toHaveLength(1);
      });

      it('should allow drag and drop of a single row', async function () {
        let {getAllByRole, getByText} = render(
          <DraggableListView />
        );

        let droppable = getByText('Drop here');
        let row = getAllByRole('row')[0];
        expect(row).toHaveAttribute('draggable', 'true');
        let cell = within(row).getByRole('gridcell');
        expect(cell).toHaveTextContent('Adobe Photoshop');

        let dataTransfer = new DataTransfer();
        fireEvent.pointerDown(cell, {button: 0, pointerId: 1, clientX: 0, clientY: 0});
        fireEvent(cell, new DragEvent('dragstart', {dataTransfer, clientX: 0, clientY: 0}));
        expect([...dataTransfer.items]).toEqual([new DataTransferItem('text/plain', 'Adobe Photoshop')]);

        act(() => jest.runAllTimers());

        expect(onDragStart).toHaveBeenCalledTimes(1);
        expect(onDragStart).toHaveBeenCalledWith({
          type: 'dragstart',
          keys: new Set('a'),
          x: 0,
          y: 0
        });

        fireEvent.pointerMove(cell, {button: 0, pointerId: 1, clientX: 1, clientY: 1});
        fireEvent(cell, new DragEvent('drag', {dataTransfer, clientX: 1, clientY: 1}));
        expect(onDragMove).toHaveBeenCalledTimes(1);
        expect(onDragMove).toHaveBeenCalledWith({
          type: 'dragmove',
          keys: new Set('a'),
          x: 1,
          y: 1
        });

        fireEvent(droppable, new DragEvent('dragenter', {dataTransfer, clientX: 1, clientY: 1}));
        fireEvent(droppable, new DragEvent('drop', {dataTransfer, clientX: 1, clientY: 1}));
        act(() => jest.runAllTimers());
        expect(onDrop).toHaveBeenCalledTimes(1);
        expect(onDrop).toHaveBeenCalledWith({
          type: 'drop',
          x: 1,
          y: 1,
          dropOperation: 'move',
          items: [
            {
              kind: 'text',
              types: new Set(['text/plain']),
              getText: expect.any(Function)
            }
          ]
        });

        expect(await onDrop.mock.calls[0][0].items[0].getText('text/plain')).toBe('Adobe Photoshop');

        fireEvent.pointerUp(cell, {button: 0, pointerId: 1, clientX: 1, clientY: 1});
        fireEvent(cell, new DragEvent('dragend', {dataTransfer, clientX: 1, clientY: 1}));
        expect(onDragEnd).toHaveBeenCalledTimes(1);
        expect(onDragEnd).toHaveBeenCalledWith({
          type: 'dragend',
          keys: new Set('a'),
          x: 1,
          y: 1,
          dropOperation: 'move'
        });
      });

      it('should allow drag and drop of multiple rows', async function () {
        let {getAllByRole, getByText} = render(
          <DraggableListView />
        );

        let droppable = getByText('Drop here');
        let rows = getAllByRole('row');
        act(() => userEvent.click(within(rows[0]).getByRole('checkbox')));
        act(() => userEvent.click(within(rows[1]).getByRole('checkbox')));
        // This row should be non-draggable
        act(() => userEvent.click(within(rows[2]).getByRole('checkbox')));
        act(() => userEvent.click(within(rows[3]).getByRole('checkbox')));

        expect(new Set(onSelectionChange.mock.calls[3][0])).toEqual(new Set(['a', 'b', 'c', 'd']));

        let cellA = within(rows[0]).getByRole('gridcell');
        expect(cellA).toHaveTextContent('Adobe Photoshop');
        expect(rows[0]).toHaveAttribute('draggable', 'true');

        let cellB = within(rows[1]).getByRole('gridcell');
        expect(cellB).toHaveTextContent('Adobe XD');
        expect(rows[1]).toHaveAttribute('draggable', 'true');

        let cellC = within(rows[2]).getByRole('gridcell');
        expect(cellC).toHaveTextContent('Documents');
        expect(rows[2]).not.toHaveAttribute('draggable', 'true');

        let cellD = within(rows[3]).getByRole('gridcell');
        expect(cellD).toHaveTextContent('Adobe InDesign');
        expect(rows[3]).toHaveAttribute('draggable', 'true');

        let dataTransfer = new DataTransfer();
        fireEvent.pointerDown(cellA, {button: 0, pointerId: 1, clientX: 0, clientY: 0});
        fireEvent(cellA, new DragEvent('dragstart', {dataTransfer, clientX: 0, clientY: 0}));
        expect([...dataTransfer.items]).toEqual([
          new DataTransferItem('text/plain', 'Adobe Photoshop\nAdobe XD\nAdobe InDesign'),
          new DataTransferItem(
            CUSTOM_DRAG_TYPE,
            JSON.stringify([{'text/plain': 'Adobe Photoshop'}, {'text/plain': 'Adobe XD'}, {'text/plain': 'Adobe InDesign'}]
          ))
        ]);

        act(() => jest.runAllTimers());

        expect(onDragStart).toHaveBeenCalledTimes(1);
        expect(onDragStart).toHaveBeenCalledWith({
          type: 'dragstart',
          keys: new Set(['a', 'b', 'd']),
          x: 0,
          y: 0
        });

        fireEvent.pointerMove(cellA, {button: 0, pointerId: 1, clientX: 1, clientY: 1});
        fireEvent(cellA, new DragEvent('drag', {dataTransfer, clientX: 1, clientY: 1}));
        expect(onDragMove).toHaveBeenCalledTimes(1);
        expect(onDragMove).toHaveBeenCalledWith({
          type: 'dragmove',
          keys: new Set(['a', 'b', 'd']),
          x: 1,
          y: 1
        });

        fireEvent(droppable, new DragEvent('dragenter', {dataTransfer, clientX: 1, clientY: 1}));
        fireEvent(droppable, new DragEvent('drop', {dataTransfer, clientX: 1, clientY: 1}));
        act(() => jest.runAllTimers());
        expect(onDrop).toHaveBeenCalledTimes(1);

        // onDrop should only have 3 items, Documents shouldn't be included
        expect(await onDrop.mock.calls[0][0].items.length).toBe(3);
        expect(await onDrop.mock.calls[0][0].items[0].getText('text/plain')).toBe('Adobe Photoshop');
        expect(await onDrop.mock.calls[0][0].items[1].getText('text/plain')).toBe('Adobe XD');
        expect(await onDrop.mock.calls[0][0].items[2].getText('text/plain')).toBe('Adobe InDesign');

        fireEvent.pointerUp(cellA, {button: 0, pointerId: 1, clientX: 1, clientY: 1});
        fireEvent(cellA, new DragEvent('dragend', {dataTransfer, clientX: 1, clientY: 1}));
        expect(onDragEnd).toHaveBeenCalledTimes(1);
        expect(onDragEnd).toHaveBeenCalledWith({
          type: 'dragend',
          keys: new Set(['a', 'b', 'd']),
          x: 1,
          y: 1,
          dropOperation: 'move'
        });
      });

      it('should not allow drag operations on a disabled row', function () {
        let {getAllByRole} = render(
          <DraggableListView listViewProps={{disabledKeys: ['a']}} />
        );

        let row = getAllByRole('row')[0];
        let cell = within(row).getByRole('gridcell');
        expect(cell).toHaveTextContent('Adobe Photoshop');
        expect(row).not.toHaveAttribute('draggable', 'true');

        let dataTransfer = new DataTransfer();
        fireEvent.pointerDown(cell, {button: 0, pointerId: 1, clientX: 0, clientY: 0});
        fireEvent(cell, new DragEvent('dragstart', {dataTransfer, clientX: 0, clientY: 0}));
        expect([...dataTransfer.items]).toEqual([]);
        expect(onDragStart).toHaveBeenCalledTimes(0);
      });

      it('should not allow drag operations on a non draggable row', function () {
        let allowsDraggingItem = (key) => {
          if (key === 'c') {
            return false;
          }
          return true;
        };

        let {getAllByRole} = render(
          <DraggableListView dragHookOptions={{allowsDraggingItem}} />
        );

        let rows = getAllByRole('row');
        // This row should be non-draggable
        act(() => userEvent.click(within(rows[2]).getByRole('checkbox')));
        act(() => userEvent.click(within(rows[3]).getByRole('checkbox')));
        expect(new Set(onSelectionChange.mock.calls[1][0])).toEqual(new Set(['c', 'd']));

        let cellC = within(rows[2]).getByRole('gridcell');
        expect(cellC).toHaveTextContent('Documents');
        expect(rows[2]).not.toHaveAttribute('draggable', 'true');

        let dataTransfer = new DataTransfer();
        fireEvent.pointerDown(cellC, {button: 0, pointerId: 1, clientX: 0, clientY: 0});
        fireEvent(cellC, new DragEvent('dragstart', {dataTransfer, clientX: 0, clientY: 0}));
        expect([...dataTransfer.items]).toEqual([]);
        expect(onDragStart).toHaveBeenCalledTimes(0);
      });
    });

    describe('via keyboard', function () {
      afterEach(() => {
        fireEvent.keyDown(document.body, {key: 'Escape'});
        fireEvent.keyUp(document.body, {key: 'Escape'});
      });

      it('should allow drag and drop of a single row', async function () {
        let {getAllByRole, getByText} = render(
          <DraggableListView />
        );

        let droppable = getByText('Drop here');
        let row = getAllByRole('row')[0];
        let cell = within(row).getByRole('gridcell');
        expect(cell).toHaveTextContent('Adobe Photoshop');
        expect(row).toHaveAttribute('draggable', 'true');

        userEvent.tab();
        let draghandle = within(cell).getAllByRole('button')[0];
        expect(draghandle).toBeTruthy();
        expect(draghandle).toHaveAttribute('draggable', 'true');

        fireEvent.keyDown(draghandle, {key: 'Enter'});
        fireEvent.keyUp(draghandle, {key: 'Enter'});

        expect(onDragStart).toHaveBeenCalledTimes(1);
        expect(onDragStart).toHaveBeenCalledWith({
          type: 'dragstart',
          keys: new Set('a'),
          x: 50,
          y: 25
        });

        act(() => jest.runAllTimers());
        expect(document.activeElement).toBe(droppable);
        fireEvent.keyDown(droppable, {key: 'Enter'});
        fireEvent.keyUp(droppable, {key: 'Enter'});

        expect(onDrop).toHaveBeenCalledTimes(1);
        expect(await onDrop.mock.calls[0][0].items[0].getText('text/plain')).toBe('Adobe Photoshop');

        expect(onDragEnd).toHaveBeenCalledTimes(1);
        expect(onDragEnd).toHaveBeenCalledWith({
          type: 'dragend',
          keys: new Set('a'),
          x: 50,
          y: 25,
          dropOperation: 'move'
        });
      });

      it('should allow drag and drop of multiple rows', async function () {
        let {getAllByRole, getByText} = render(
          <DraggableListView listViewProps={{selectedKeys: ['a', 'b', 'c', 'd']}} />
        );

        let droppable = getByText('Drop here');
        let rows = getAllByRole('row');

        let cellA = within(rows[0]).getByRole('gridcell');
        expect(cellA).toHaveTextContent('Adobe Photoshop');
        expect(rows[0]).toHaveAttribute('draggable', 'true');

        let cellB = within(rows[1]).getByRole('gridcell');
        expect(cellB).toHaveTextContent('Adobe XD');
        expect(rows[1]).toHaveAttribute('draggable', 'true');

        let cellC = within(rows[2]).getByRole('gridcell');
        expect(cellC).toHaveTextContent('Documents');
        expect(rows[2]).not.toHaveAttribute('draggable', 'true');

        let cellD = within(rows[3]).getByRole('gridcell');
        expect(cellD).toHaveTextContent('Adobe InDesign');
        expect(rows[3]).toHaveAttribute('draggable', 'true');

        userEvent.tab();
        let draghandle = within(cellA).getAllByRole('button')[0];
        expect(draghandle).toBeTruthy();

        fireEvent.keyDown(draghandle, {key: 'Enter'});
        fireEvent.keyUp(draghandle, {key: 'Enter'});

        expect(onDragStart).toHaveBeenCalledTimes(1);
        expect(onDragStart).toHaveBeenCalledWith({
          type: 'dragstart',
          keys: new Set(['a', 'b', 'd']),
          x: 50,
          y: 25
        });

        act(() => jest.runAllTimers());
        expect(document.activeElement).toBe(droppable);
        fireEvent.keyDown(droppable, {key: 'Enter'});
        fireEvent.keyUp(droppable, {key: 'Enter'});

        expect(onDrop).toHaveBeenCalledTimes(1);

        // onDrop should only have 3 items, Documents shouldn't be included
        expect(await onDrop.mock.calls[0][0].items.length).toBe(3);
        expect(await onDrop.mock.calls[0][0].items[0].getText('text/plain')).toBe('Adobe Photoshop');
        expect(await onDrop.mock.calls[0][0].items[1].getText('text/plain')).toBe('Adobe XD');
        expect(await onDrop.mock.calls[0][0].items[2].getText('text/plain')).toBe('Adobe InDesign');

        expect(onDragEnd).toHaveBeenCalledTimes(1);
        expect(onDragEnd).toHaveBeenCalledWith({
          type: 'dragend',
          keys: new Set(['a', 'b', 'd']),
          x: 50,
          y: 25,
          dropOperation: 'move'
        });
      });
    });

    it('should make row selection happen on pressUp if list is draggable', function () {
      let allowsDraggingItem = (key) => {
        if (key === 'b') {
          return false;
        }
        return true;
      };

      let {getAllByRole} = render(
        <DraggableListView dragHookOptions={{allowsDraggingItem}} />
      );

      let rows = getAllByRole('row');
      let draggableRow = rows[0];
      let nonDraggableRow = rows[1];
      expect(draggableRow).toHaveAttribute('aria-selected', 'false');
      fireEvent.mouseDown(draggableRow);
      expect(draggableRow).toHaveAttribute('aria-selected', 'false');
      expect(onSelectionChange).toHaveBeenCalledTimes(0);
      fireEvent.mouseUp(draggableRow);
      expect(draggableRow).toHaveAttribute('aria-selected', 'true');
      checkSelection(onSelectionChange, ['a']);

      onSelectionChange.mockReset();
      expect(nonDraggableRow).toHaveAttribute('aria-selected', 'false');
      fireEvent.mouseDown(nonDraggableRow);
      expect(nonDraggableRow).toHaveAttribute('aria-selected', 'false');
      expect(onSelectionChange).toHaveBeenCalledTimes(0);
      fireEvent.mouseUp(nonDraggableRow);
      expect(nonDraggableRow).toHaveAttribute('aria-selected', 'true');
      checkSelection(onSelectionChange, ['a', 'b']);
    });

    it('should toggle selection upon clicking the row checkbox', function () {
      let {getAllByRole} = render(
        <DraggableListView />
      );

      let row = getAllByRole('row')[0];
      expect(row).toHaveAttribute('aria-selected', 'false');
      expect(row).toHaveAttribute('draggable', 'true');
      act(() => userEvent.click(within(row).getByRole('checkbox')));
      expect(row).toHaveAttribute('aria-selected', 'true');
      expect(onDragStart).toHaveBeenCalledTimes(0);
      checkSelection(onSelectionChange, ['a']);
    });

    it('should only display the drag handle on keyboard focus for dragggable items', function () {
      let {getAllByRole} = render(
        <DraggableListView listViewProps={{selectionMode: 'single'}} />
      );

      let rows = getAllByRole('row');
      let cellA = within(rows[0]).getByRole('gridcell');
      triggerPress(cellA);
      expect(document.activeElement).toBe(rows[0]);
      let dragHandle = within(cellA).getAllByRole('button')[0];
      // If the dragHandle has a style applied, it is visually hidden
      expect(dragHandle.style).toBeTruthy();
      expect(dragHandle.style.position).toBe('absolute');

      fireEvent.pointerDown(rows[0], {button: 0, pointerId: 1});
      dragHandle = within(cellA).getAllByRole('button')[0];
      expect(dragHandle.style).toBeTruthy();
      expect(dragHandle.style.position).toBe('absolute');
      fireEvent.pointerUp(rows[0], {button: 0, pointerId: 1});

      fireEvent.pointerEnter(rows[0]);
      dragHandle = within(cellA).getAllByRole('button')[0];
      expect(dragHandle.style).toBeTruthy();
      expect(dragHandle.style.position).toBe('absolute');

      // If dragHandle doesn't have a position applied, it isn't visually hidden
      fireEvent.keyDown(rows[0], {key: 'Enter'});
      fireEvent.keyUp(rows[0], {key: 'Enter'});
      dragHandle = within(cellA).getAllByRole('button')[0];
      expect(dragHandle.style.position).toBe('');
    });

    it('should not display the drag handle on hover, press, or keyboard focus for disabled/non dragggable items', function () {
      let allowsDraggingItem = (key) => {
        if (key === 'b') {
          return false;
        }
        return true;
      };

      function hasDragHandle(el) {
        let buttons = within(el).getAllByRole('button');
        return buttons[0].getAttribute('draggable');
      }

      // This makes cell A disabled and cell B non-draggable. Cell C becomes draggable.
      let {getAllByRole} = render(
        <DraggableListView dragHookOptions={{allowsDraggingItem}} listViewProps={{disabledKeys: ['a']}} />
      );

      let rows = getAllByRole('row');
      let cellA = within(rows[0]).getByRole('gridcell');
      let cellB = within(rows[1]).getByRole('gridcell');

      userEvent.tab();
      expect(hasDragHandle(cellA)).toBeFalsy();
      moveFocus('ArrowDown');
      expect(hasDragHandle(cellB)).toBeFalsy();

      fireEvent.pointerDown(cellA, {button: 0, pointerId: 1});
      expect(hasDragHandle(cellA)).toBeFalsy();
      fireEvent.pointerUp(cellA, {button: 0, pointerId: 1});

      fireEvent.pointerDown(cellB, {button: 0, pointerId: 1});
      expect(hasDragHandle(cellB)).toBeFalsy();
      fireEvent.pointerUp(cellB, {button: 0, pointerId: 1});

      fireEvent.pointerEnter(cellA);
      expect(hasDragHandle(cellA)).toBeFalsy();
      fireEvent.pointerEnter(cellB);
      expect(hasDragHandle(cellB)).toBeFalsy();
    });

    it('should open a menu upon click', function () {
      let {getAllByRole, getByRole} = render(
        <DraggableListView />
      );

      let row = getAllByRole('row')[0];
      expect(row).toHaveAttribute('aria-selected', 'false');
      expect(row).toHaveAttribute('draggable', 'true');

      let menuButton = within(row).getAllByRole('button')[1];
      expect(menuButton).toHaveAttribute('aria-expanded', 'false');

      triggerPress(menuButton);
      act(() => {jest.runAllTimers();});

      let menu = getByRole('menu');
      expect(menu).toBeTruthy();
      expect(menuButton).toHaveAttribute('aria-expanded', 'true');
      expect(row).toHaveAttribute('aria-selected', 'false');
      expect(onDragStart).toHaveBeenCalledTimes(0);
      expect(onSelectionChange).toHaveBeenCalledTimes(0);
    });

    describe('accessibility', function () {
      it('drag handle should reflect the correct number of draggable rows', async function () {
        let allowsDraggingItem = (key) => {
          if (key === 'c') {
            return false;
          }
          return true;
        };

        // Only 2 draggable items are selected since c is non draggable
        let {getAllByRole} = render(
          <DraggableListView dragHookOptions={[allowsDraggingItem]} listViewProps={{defaultSelectedKeys: ['a', 'b', 'c']}} />
        );

        let rows = getAllByRole('row');
        expect(rows[0]).toHaveAttribute('draggable', 'true');
        let cellA = within(rows[0]).getByRole('gridcell');
        let dragButtonA = within(cellA).getAllByRole('button')[0];
        expect(dragButtonA).toHaveAttribute('aria-label', 'Drag 2 selected items');

        expect(rows[1]).toHaveAttribute('draggable', 'true');
        let cellB = within(rows[1]).getByRole('gridcell');
        let dragButtonB = within(cellB).getAllByRole('button')[0];
        expect(dragButtonB).toHaveAttribute('aria-label', 'Drag 2 selected items');

        expect(rows[2]).not.toHaveAttribute('draggable');

        expect(rows[3]).toHaveAttribute('draggable', 'true');
        let cellD = within(rows[3]).getByRole('gridcell');
        let dragButtonD = within(cellD).getAllByRole('button')[0];
        expect(dragButtonD).toHaveAttribute('aria-label', 'Drag Adobe InDesign');

        // After selecting row 4, the aria-label should reflect 3 selected items rather than just "Drag Adobe InDesign"
        act(() => userEvent.click(within(rows[3]).getByRole('checkbox')));
        expect(dragButtonA).toHaveAttribute('aria-label', 'Drag 3 selected items');
        expect(dragButtonB).toHaveAttribute('aria-label', 'Drag 3 selected items');
        expect(dragButtonD).toHaveAttribute('aria-label', 'Drag 3 selected items');

        act(() => userEvent.click(within(rows[0]).getByRole('checkbox')));
        expect(dragButtonA).toHaveAttribute('aria-label', 'Drag Adobe Photoshop');
        expect(dragButtonB).toHaveAttribute('aria-label', 'Drag 2 selected items');
        expect(dragButtonD).toHaveAttribute('aria-label', 'Drag 2 selected items');
      });
    });
  });
});
