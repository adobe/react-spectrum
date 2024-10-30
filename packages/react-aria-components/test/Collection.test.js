import {Collection, CollectionBuilder} from '../src/Collection';
import {ListBoxItem} from '../src/ListBox';
import React from 'react';
import {render} from '@testing-library/react';

const renderItems = (items, spyCollection) => (
  <CollectionBuilder content={<Collection>{items.map((item) => <ListBoxItem key={item} />)}</Collection>}>
    {collection => {
      spyCollection.current = collection;
      return null;
    }}
  </CollectionBuilder>
);

describe('Collection', () => {
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
});
