
import {GridNode} from '@react-types/grid';
import {Key, useRef} from 'react';

export interface TableColumnResizeState<T> {
  /** Trigger a resize and recalculation. */
  onColumnResize: (column: GridNode<T>, width: number) => void,
  /** Callback for when onColumnResize has started. */
  onColumnResizeStart: (column: GridNode<T>) => void,
  /** Callback for when onColumnResize has ended. */
  onColumnResizeEnd: (column: GridNode<T>) => void
}

export interface TableColumnResizeStateProps {
  /** Callback that is invoked during the entirety of the resize event. */
  onColumnResize?: (key: Key, width: number) => void,
  /** Callback that is invoked when the resize event is ended. */
  onColumnResizeEnd?: (key: Key) => void
}

export function useTableColumnResizeState<T>(props: TableColumnResizeStateProps): TableColumnResizeState<T> {
  const isResizing = useRef<boolean>(null);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function onColumnResizeStart(column: GridNode<T>) {
    isResizing.current = true;
  }

  function onColumnResize(column: GridNode<T>, width: number) {
    props.onColumnResize && props.onColumnResize(column.key, width);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function onColumnResizeEnd(column: GridNode<T>) {
    props.onColumnResizeEnd && isResizing.current && props.onColumnResizeEnd(column.key);
    isResizing.current = false;
  }

  return {
    onColumnResize,
    onColumnResizeStart,
    onColumnResizeEnd
  };
}
