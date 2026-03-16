import {Collection, CollectionBuilder, CollectionNode, createBranchComponent, createLeafComponent} from '../src';
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
});
