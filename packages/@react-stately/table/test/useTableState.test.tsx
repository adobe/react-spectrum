import {Cell, CollectionBuilderContext, Column, Row, TableBody, TableCollection, TableHeader, useTableState} from '../';
import {Node} from '@react-types/shared';
import React from 'react';
import {renderHook} from '@react-spectrum/test-utils';

describe('useTableState', () => {
  describe('custom collection', () => {
    it('customFactory option', () => {
      let fn = jest.fn();

      class CustomCollection extends TableCollection<object> {
        constructor(nodes: Iterable<Node<object>>, prev: CustomCollection, context: CollectionBuilderContext<object>) {
          fn(context);
          super(nodes, prev, context);
        }
      }

      renderHook(() => useTableState({
        showSelectionCheckboxes: true,
        selectionMode: 'multiple',
        children: [
          <TableHeader><Column>_</Column></TableHeader>,
          <TableBody><Row><Cell>_</Cell></Row></TableBody>
        ],
        collectionFactory: context => (nodes, prev) => new CustomCollection(nodes, prev, context)
      }));

      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn.mock.calls[0][0].showSelectionCheckboxes).toBe(true);
    });
  });
});
