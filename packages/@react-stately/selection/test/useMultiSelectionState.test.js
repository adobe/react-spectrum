import {act, renderHook} from 'react-hooks-testing-library';
import {useMultiSelectionState} from '../src';

describe('useMultiSelectionState', () => {
  let onSelectionChange = jest.fn();

  afterEach(() => {
    onSelectionChange.mockClear();
  });

  it('should be controlled if props.selectedItems is defined', () => {
    const props = {
      selectedItems: ['A', 'B'],
      onSelectionChange
    };
    let {result} = renderHook(() => useMultiSelectionState(props));
    expect(result.current.isSelected('B')).toBe(true);
    expect(result.current.isSelected('C')).toBe(false);
    act(() => result.current.handleSelection('C'));
    expect(result.current.isSelected('C')).toBe(false);
    expect(onSelectionChange).toHaveBeenCalledWith(['A', 'B', 'C']);
  });

  it('should start with value = props.defaultSelectedItems if props.selectedItems is not defined and props.defaultSelectedItems is defined', () => {
    let props = {
      defaultSelectedItems: ['A', 'B'],
      onSelectionChange
    };
    let {result} = renderHook(() => useMultiSelectionState(props));
    expect(result.current.isSelected('B')).toBe(true);
    act(() => result.current.handleSelection('C'));
    expect(onSelectionChange).toHaveBeenCalledWith(['A', 'B', 'C']);
  });

  it('should deselect value if it was already selected', () => {
    let props = {
      defaultSelectedItems: ['A', 'B'],
      onSelectionChange
    };
    let {result} = renderHook(() => useMultiSelectionState(props));
    expect(result.current.isSelected('B')).toBe(true);
    act(() => result.current.handleSelection('B'));
    expect(onSelectionChange).toHaveBeenCalledWith(['A']);
  });

  it('should allow empty selection if allowsEmptySelection flag is set to true', () => {
    let props = {
      defaultSelectedItems: ['A'],
      allowsEmptySelection: true,
      onSelectionChange
    };
    let {result} = renderHook(() => useMultiSelectionState(props));
    act(() => result.current.handleSelection('A'));
    expect(onSelectionChange).toHaveBeenCalledWith([]);
  });

  it('should use setSelectedList for (de)selection of multiple items at once', () => {
    let props = {
      onSelectionChange
    };
    let {result} = renderHook(() => useMultiSelectionState(props));
    act(() => result.current.setSelectedList(['A']));
    expect(onSelectionChange).toHaveBeenCalledWith(['A']);
    act(() => result.current.setSelectedList(['A', 'B', 'C']));
    expect(onSelectionChange).toHaveBeenCalledWith(['A', 'B', 'C']);
    act(() => result.current.setSelectedList([]));
    expect(onSelectionChange).toHaveBeenCalledWith([]);
  });
});
