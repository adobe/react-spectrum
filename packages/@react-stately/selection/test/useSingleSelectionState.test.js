import {act, renderHook} from 'react-hooks-testing-library';
import {useSingleSelectionState} from '../src';

describe('useSingleSelectionState', () => {
  let onSelectionChange = jest.fn();

  afterEach(() => {
    onSelectionChange.mockClear();
  });

  it('should be controlled if props.selectedItem is defined', () => {
    const props = {
      selectedItem: 'A',
      onSelectionChange
    };
    let {result} = renderHook(() => useSingleSelectionState(props));
    expect(result.current.selectedValue).toBe(props.selectedItem);
    act(() => result.current.setSelectedValue('C'));
    expect(result.current.selectedValue).toBe(props.selectedItem);
    expect(onSelectionChange).toHaveBeenCalledWith('C');
  });

  it('should start with value = props.defaultSelectedItems if props.selectedItems is not defined and props.defaultSelectedItems is defined', () => {
    let props = {
      defaultSelectedItem: 'A',
      onSelectionChange
    };
    let {result} = renderHook(() => useSingleSelectionState(props));
    expect(result.current.selectedValue).toBe(props.defaultSelectedItem);
    act(() => result.current.setSelectedValue('C'));
    expect(onSelectionChange).toHaveBeenCalledWith('C');
  });

  // TODO: fix
  it.skip('should deselect value in case allowsEmptySelection flag is true', () => {
    let props = {
      defaultSelectedItems: 'A',
      allowsEmptySelection: true,
      onSelectionChange
    };
    let {result} = renderHook(() => useSingleSelectionState(props));
    expect(result.current.selectedValue).toBe(props.defaultSelectedItem);
    act(() => result.current.setSelectedValue(props.defaultSelectedItems));
    expect(onSelectionChange).toHaveBeenCalledWith(null);
  });

  it('should prevent deselecting if allowsEmptySelection flag is not set', () => {
    let props = {
      defaultSelectedItems: 'A',
      onSelectionChange
    };
    let {result} = renderHook(() => useSingleSelectionState(props));
    act(() => result.current.setSelectedValue(props.defaultSelectedItems));
    expect(onSelectionChange).toHaveBeenCalledWith(props.defaultSelectedItems);
  });
});
