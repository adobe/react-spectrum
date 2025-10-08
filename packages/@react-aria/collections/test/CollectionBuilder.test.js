import {BaseCollection, Collection, CollectionBuilder, CollectionNode, createBranchComponent, createLeafComponent} from '../src';
import React from 'react';
import {render} from '@testing-library/react';

class ItemNode extends CollectionNode {
  static type = 'item';
}

const Item = createLeafComponent(ItemNode, () => {
  return <div />;
});

const ItemsOld = createLeafComponent('item', () => {
  return <div />;
});

const SectionOld = createBranchComponent('section', () =>  {
  return <div />;
});

const renderItems = (items, spyCollection) => (
  <CollectionBuilder content={<Collection>{items.map((item) => <Item key={item} />)}</Collection>}>
    {collection => {
      spyCollection.current = collection;
      return null;
    }}
  </CollectionBuilder>
);

const renderItemsOld = (items, spyCollection) => (
  <CollectionBuilder
    content={
      <Collection>
        <SectionOld>
          {items.map((item) => (
            <ItemsOld key={item} />
          ))}
        </SectionOld>
      </Collection>
    }>
    {collection => {
      spyCollection.current = collection;
      return null;
    }}
  </CollectionBuilder>
);

describe('CollectionBuilder', () => {
  it('should be frozen even in case of empty initial collection', () => {
    let spyCollection = {};
    render(renderItems([], spyCollection));
    expect(spyCollection.current.frozen).toBe(true);
  });

  it('should have correct firstKey, lastKey and should be frozen after all items are deleted', () => {
    let spyCollection = {};
    const {rerender} = render(renderItems(['a'], spyCollection));
    rerender(renderItems([], spyCollection));
    expect(spyCollection.current.frozen).toBe(true);
    expect(spyCollection.current.firstKey).toBe(null);
    expect(spyCollection.current.lastKey).toBe(null);
  });

  it('should still support using strings for the collection node class in createLeafComponent/createBranchComponent', () => {
    let spyCollection = {};
    render(renderItemsOld(['a'], spyCollection));
    expect(spyCollection.current.frozen).toBe(true);
    expect(spyCollection.current.firstKey).toBe('react-aria-2');
    expect(spyCollection.current.keyMap.get('react-aria-2').type).toBe('section');
    expect(spyCollection.current.keyMap.get('react-aria-2').firstChildKey).toBe('react-aria-1');
    expect(spyCollection.current.keyMap.get('react-aria-1').type).toBe('item');
  });

  describe('Infinite loop protection', () => {
    it('should protect against circular references in collection iteration', () => {
      let collection = new BaseCollection();
      let node1 = new ItemNode('item-1');
      let node2 = new ItemNode('item-2');
      
      // Circular reference: item-1 -> item-2 -> item-1
      Object.assign(node1, {nextKey: 'item-2'});
      Object.assign(node2, {nextKey: 'item-1', prevKey: 'item-1'});
      
      collection.addNode(node1);
      collection.addNode(node2);
      collection.commit('item-1', 'item-2');
      
      // Should throw an error instead of hanging
      expect(() => {
        // eslint-disable-next-line no-unused-vars
        for (let item of collection) {
          // This would normally cause an infinite loop
        }
      }).toThrow('Circular reference detected in collection at key "item-1". This was likely caused by duplicate IDs. Please ensure all items have unique IDs: https://react-spectrum.adobe.com/react-aria/collections.html#unique-ids');
    });

    it('should protect against infinite loops in getKeyAfter', () => {
      let collection = new BaseCollection();
      
      // Create a node that references itself as parent
      let node1 = new ItemNode('item-1');
      Object.assign(node1, {parentKey: 'item-1'});
      
      collection.addNode(node1);
      collection.commit('item-1', 'item-1');
      
      // Should throw an error instead of hanging
      expect(() => {
        collection.getKeyAfter('item-1');
      }).toThrow('Circular reference detected in collection at key "item-1". This was likely caused by duplicate IDs. Please ensure all items have unique IDs: https://react-spectrum.adobe.com/react-aria/collections.html#unique-ids');
    });

    it('should handle large collections without issues', () => {
      let spyCollection = {};
      
      // Large collection with unique IDs
      const items = Array.from({length: 10000}, (_, i) => `item-${i}`);
      
      const renderLargeCollection = () => (
        <CollectionBuilder
          content={
            <Collection>
              {items.map((item) => <Item key={item} id={item} />)}
            </Collection>
          }>
          {collection => {
            spyCollection.current = collection;
            return null;
          }}
        </CollectionBuilder>
      );

      // Should not throw any errors
      expect(() => {
        render(renderLargeCollection());
      }).not.toThrow();
      
      // Collection should have all items
      expect(spyCollection.current.size).toBe(10000);
      
      // Should be able to iterate without issues
      let count = 0;
      // eslint-disable-next-line no-unused-vars
      for (let item of spyCollection.current) {
        count++;
      }
      expect(count).toBe(10000);
    });

    it('should handle empty collections', () => {
      let spyCollection = {};
      
      const renderEmptyCollection = () => (
        <CollectionBuilder content={<Collection />}>
          {collection => {
            spyCollection.current = collection;
            return null;
          }}
        </CollectionBuilder>
      );

      expect(() => {
        render(renderEmptyCollection());
      }).not.toThrow();
      
      expect(spyCollection.current.size).toBe(0);
    });

    it('should handle very deep nesting within limits', () => {
      let collection = new BaseCollection();
      
      // Create a chain of 100 nested items (under the 1000 limit)
      for (let i = 0; i < 100; i++) {
        let node = new ItemNode(`item-${i}`);
        Object.assign(node, {
          nextKey: i < 99 ? `item-${i + 1}` : null,
          prevKey: i > 0 ? `item-${i - 1}` : null
        });
        collection.addNode(node);
      }
      collection.commit('item-0', 'item-99');
      
      // Should be able to traverse without issues
      expect(() => {
        let count = 0;
        // eslint-disable-next-line no-unused-vars
        for (let item of collection) {
          count++;
        }
        expect(count).toBe(100);
      }).not.toThrow();
    });
  });
});
