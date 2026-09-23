import {
  Collection,
  CollectionBuilder,
  createBranchComponent,
  createLeafComponent
} from '../../src/collections/CollectionBuilder';
import {CollectionNode} from '../../src/collections/BaseCollection';
import React, {createRef} from 'react';
import {render} from '@testing-library/react';

class ItemNode extends CollectionNode {
  static type = 'item';
}

const Item = createLeafComponent(ItemNode, (props, ref) => {
  return <div {...props} ref={ref} />;
});

const ItemsOld = createLeafComponent('item', (props, ref) => {
  return <div {...props} ref={ref} />;
});

const SectionOld = createBranchComponent('section', (props, ref) => {
  return <div {...props} ref={ref} />;
});

const renderItems = (items, spyCollection, children = () => null) => (
  <CollectionBuilder
    content={
      <Collection>
        {items.map(item => (
          <Item key={item.key} id={item.id} />
        ))}
      </Collection>
    }>
    {collection => {
      spyCollection.current = collection;
      return children(collection);
    }}
  </CollectionBuilder>
);

const renderItemsOld = (items, spyCollection, children = () => null) => (
  <CollectionBuilder
    content={
      <Collection>
        <SectionOld>
          {items.map(item => (
            <ItemsOld key={item} />
          ))}
        </SectionOld>
      </Collection>
    }>
    {collection => {
      spyCollection.current = collection;
      return children(collection);
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
    const {rerender} = render(renderItems([{key: 1, id: 'a'}], spyCollection));
    rerender(renderItems([], spyCollection));
    expect(spyCollection.current.frozen).toBe(true);
    expect(spyCollection.current.firstKey).toBe(null);
    expect(spyCollection.current.lastKey).toBe(null);
  });

  it('should throw when two items share a key', () => {
    let spyCollection = {};
    let adjacent = [
      {key: 1, id: 'a'},
      {key: 2, id: 'a'},
      {key: 3, id: 'b'}
    ];
    expect(() => render(renderItems(adjacent, spyCollection))).toThrow(
      'Duplicate key "a" found in collection. Every item in a collection must have a unique key.'
    );

    let separated = [
      {key: 1, id: 'a'},
      {key: 2, id: 'x'},
      {key: 3, id: 'a'}
    ];
    expect(() => render(renderItems(separated, spyCollection))).toThrow(
      'Duplicate key "a" found in collection.'
    );
  });

  it('should allow a new item to reuse the key of an item removed in the same render', () => {
    let spyCollection = {};
    const {rerender} = render(
      renderItems(
        [
          {key: 1, id: 'a'},
          {key: 2, id: 'b'}
        ],
        spyCollection
      )
    );
    expect([...spyCollection.current.getKeys()]).toEqual(['a', 'b']);

    rerender(
      renderItems(
        [
          {key: 1, id: 'a'},
          {key: 3, id: 'c'},
          {key: 4, id: 'b'}
        ],
        spyCollection
      )
    );
    expect([...spyCollection.current.getKeys()]).toEqual(['a', 'c', 'b']);

    rerender(renderItems([{key: 5, id: 'a'}], spyCollection));
    expect([...spyCollection.current.getKeys()]).toEqual(['a']);
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

  it('should support ref attachment to a rendered node', () => {
    let spyRef = createRef();
    render(
      renderItems([{key: 1, id: 'a'}], {}, collection =>
        Array.from(collection).map(item => (
          <React.Fragment key={item.key}>{item.render(item, spyRef)}</React.Fragment>
        ))
      )
    );
    expect(spyRef.current).toBeEmptyDOMElement();
  });
});
