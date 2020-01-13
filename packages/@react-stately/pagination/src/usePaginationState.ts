import {useControlledState} from '@react-stately/utils';
import {useRef} from 'react';

export interface PaginationState {
  onChange?: (val: string | number) => void,
  onDecrement?: () => void,
  onIncrement?: () => void,
  ref?: {current: string | number},
  value?: string | number
}

export function usePaginationState(props): PaginationState {
  const [value, setValue] = useControlledState(props.value, props.defaultValue, props.onChange);
  let ref = useRef(value);

  const onPageInputChange = (value) => {
    if (value === '' || isValidPage(props.maxValue, value)) {
      value = value !== '' ? parseInt(value, 10) : value;
      setValue(value);
      ref.current = value;
    }
  };

  const onIncrement = () => {
    let val = (value === '') ? 1 : parseInt(value, 10) + 1;
    if (isValidPage(props.maxValue, val)) {
      ref.current = val;
      setValue(val);
    }
  };

  const onDecrement = () => {
    let val = (value === '') ? 1 : parseInt(value, 10) - 1;
    if (isValidPage(props.maxValue, val)) {
      ref.current = val;
      setValue(val);
    }
  };

  return {
    onChange: onPageInputChange,
    onDecrement,
    onIncrement,
    ref,
    value
  };
}

function isValidPage(totalPages, page) {
  page = parseInt(page, 10);
  totalPages = parseInt(totalPages, 10);
  return !isNaN(page) && (page >= 1 && totalPages && page <= totalPages);
}
