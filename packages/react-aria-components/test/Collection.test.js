import {ListBoxItem} from '../src/ListBox';
import React from 'react';
import {render} from '@testing-library/react';
import {useCollection} from '../src/Collection';


const CollectionTest = (props) => {
  const result = useCollection(props);
  props.spyConnection.current = result.collection;
  return <>{result.portal}</>;
};

const renderItems = (items, spyConnection) => (
  <CollectionTest spyConnection={spyConnection}>
    {items.map((item) => <ListBoxItem key={item} />)}
  </CollectionTest>
);

describe('Collection', () => {
  it('should be frozen even in case of empty initial collection', () => {
    let spyConnection = {};
    render(renderItems([], spyConnection));
    expect(spyConnection.current.frozen).toBe(true);
  });

  it('should have correct firstKey, lastKey and should be frozen after all items are deleted', () => {
    let spyConnection = {};
    const {rerender} = render(renderItems(['a'], spyConnection));
    rerender(renderItems([], spyConnection));
    expect(spyConnection.current.frozen).toBe(true);
    expect(spyConnection.current.firstKey).toBe(null);
    expect(spyConnection.current.lastKey).toBe(null);
  });
});
