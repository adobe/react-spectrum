import {Collection, CollectionBuilder, CollectionNode, createBranchComponent, createLeafComponent} from '../src';
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

const SectionOld = createBranchComponent('section', (props, ref) =>  {
  return <div {...props} ref={ref} />;
});

const renderItems = (items, spyCollection, children = () => null) => (
  <CollectionBuilder content={<Collection>{items.map((item) => <Item key={item} />)}</Collection>}>
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
          {items.map((item) => (
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

  it('should support ref attachment to a rendered node', () => {
    let spyRef = createRef();
    render(renderItems(['a'], {}, collection => Array.from(collection).map(
      item => <React.Fragment key={item.key}>{item.render(item, spyRef)}</React.Fragment>
    )));
    expect(spyRef.current).toBeEmptyDOMElement();
  });
});
