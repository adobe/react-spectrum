import {actHook as act, renderHook} from '@react-spectrum/test-utils-internal';
import {GridCollection} from '../../src/grid/GridCollection';
import {useGridState} from '../../src/grid/useGridState';
import {useMultipleSelectionState} from '../../src/selection/useMultipleSelectionState';

function collection(version) {
  return new GridCollection({
    columnCount: 2,
    items: [
      {
        type: 'item',
        key: 'row',
        childNodes: ['first', 'last'].map((name, index) => ({
          type: 'cell',
          key: `${version}-${name}`,
          index,
          childNodes: []
        }))
      }
    ]
  });
}

it('focuses the current collection without consulting previous collections', () => {
  let {result: selection} = renderHook(() => useMultipleSelectionState({selectionMode: 'single'}));
  let sharedSelection = selection.current;
  let current = collection(0);
  let {result, rerender} = renderHook(
    ({items}) =>
      useGridState({collection: items, focusMode: 'cell', UNSAFE_selectionState: sharedSelection}),
    {initialProps: {items: current}}
  );
  let previousLookups = [];
  for (let version = 1; version <= 5; version++) {
    previousLookups.push(jest.spyOn(current, 'getItem'));
    current = collection(version);
    rerender({items: current});
  }
  for (let lookup of previousLookups) lookup.mockClear();
  act(() => {
    let manager = result.current.selectionManager;
    manager.setFocused(true);
    manager.setFocusedKey('row', 'last');
    expect(manager.isFocused).toBe(true);
    expect(manager.focusedKey).toBe('5-last');
    expect(manager.childFocusStrategy).toBe('last');
  });
  for (let lookup of previousLookups) expect(lookup).not.toHaveBeenCalled();
  act(() => {
    result.current.selectionManager.setFocusedKey('row', 'first');
    expect(result.current.selectionManager.focusedKey).toBe('5-first');
    result.current.selectionManager.setFocusedKey(null);
    expect(result.current.selectionManager.focusedKey).toBeNull();
  });
});
