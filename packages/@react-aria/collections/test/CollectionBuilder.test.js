import {Collection, CollectionBuilder, createLeafComponent, useCollectionRef} from '../src';
import React from 'react';
import {render} from '@testing-library/react';

const Item = createLeafComponent('item', () => {
  return <div />;
});

const renderItems = (items, spyCollection, collectionRef) => (
  <CollectionBuilder content={<Collection>{items.map((item) => <Item key={item} />)}</Collection>} collectionRef={collectionRef}>
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

  it('should support modifying the content via useCollectionChildren', () => {
    let spyCollection = {};
    let ref = {current: null};
    let TestBench = () => {
      let collectionRef = useCollectionRef({useCollectionContent: () => false}, ref);
      return renderItems(['a'], spyCollection, collectionRef);
    };
    render(<TestBench />);
    expect(spyCollection.current.frozen).toBe(true);
    expect(spyCollection.current.firstKey).toBe(null);
    expect(spyCollection.current.lastKey).toBe(null);
  });

  it('should support modifying the rendered children via useCollectionChildren', () => {
    let spyCollection = {};
    let ref = {current: null};
    let TestBench = () => {
      let collectionRef = useCollectionRef({useCollectionChildren: (children) => (c) => <div ref={ref} children={children(c)} />}, ref);
      return renderItems([], spyCollection, collectionRef);
    };
    render(<TestBench />);
    expect(spyCollection.current.frozen).toBe(true);
    expect(ref.current).not.toBe(null);
  });
});
