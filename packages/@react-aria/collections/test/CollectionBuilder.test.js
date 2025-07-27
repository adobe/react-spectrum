import {Collection, CollectionBuilder, createLeafComponent, useCollectionDocument, useCollectionRef} from '../src';
import {mergeRefs, useObjectRef} from '@react-aria/utils';
import React from 'react';
import {render} from '@testing-library/react';

const Item = createLeafComponent('item', () => {
  return <div />;
});

const renderItems = (items, spyCollection, collectionRef) => (
  <CollectionBuilder content={<Collection>{items.map((item) => <Item id={item} key={item} textValue={item} />)}</Collection>} collectionRef={collectionRef}>
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

  it('should support modifying the content via useCollectionContent', () => {
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

  describe('synchronization', () => {
    let CollectionAContext = React.createContext(null);
    let CollectionAStateContext = React.createContext(null);
    let CollectionBContext = React.createContext(null);
    let CollectionBStateContext = React.createContext(null);
  
    let CollectionA = React.forwardRef(({items}, ref) => {
      let ctx = React.useContext(CollectionAContext);
      let state = React.useContext(CollectionAStateContext);
      let mergedRef = useObjectRef(React.useMemo(() => mergeRefs(ref, ctx), [ref, ctx]));
  
      if (state) {
        return (
          <div data-testid="collection-a">
            {Array.from(state).map(item => <div data-testid={item.key} key={item.key} />)}
          </div>
        );
      }
  
      return renderItems(items, {}, mergedRef);
    });
  
    let CollectionB = React.forwardRef(({items}, ref) => {
      let ctx = React.useContext(CollectionBContext);
      let state = React.useContext(CollectionBStateContext);
      let mergedRef = useObjectRef(React.useMemo(() => mergeRefs(ref, ctx), [ref, ctx]));
  
      if (state) {
        return (
          <div data-testid="collection-b">
            {Array.from(state).map(item => <div data-testid={item.key} key={item.key} />)}
          </div>
        );
      }
  
      return renderItems(items, {}, mergedRef);
    });
  
    let Synchronized = ({collectionA, collectionB, children, filterFn}) => {
      let synchronized = React.useMemo(() => filterFn(collectionA, collectionB), [filterFn, collectionA, collectionB]);
      return (
        <CollectionAStateContext.Provider value={synchronized.collectionA}>
          <CollectionBStateContext.Provider value={synchronized.collectionB}>
            {children}
          </CollectionBStateContext.Provider>
        </CollectionAStateContext.Provider>
      );
    };

    let Synchronizer = ({spy: Spy, children}) => {
      let useCollectionContent = React.useCallback(() => null, []);
      let useCollectionChildren = React.useCallback(() => () => null, []);
        
      let refA = useCollectionRef({useCollectionContent, useCollectionChildren}, React.useRef(null));
      let refB = useCollectionRef({useCollectionContent, useCollectionChildren}, React.useRef(null));
  
      let contentA = <CollectionBContext.Provider value={refB}>{children}</CollectionBContext.Provider>;
      let contentB = <CollectionAContext.Provider value={refA}>{children}</CollectionAContext.Provider>;

      // One way because changes in the DocumentB will not trigger a rerender of DocumentA
      let filterFn = React.useCallback((cA, cB) => {
        let keysA = new Set(cA.getKeys());
        return {collectionA: cA, collectionB: cB.UNSTABLE_filter(item => keysA.has(item))};
      }, []);
  
      return (
        <CollectionBuilder content={contentA}>
          {(c1) => (<CollectionBuilder content={contentB}>
            {(c2) => (<>
              <Synchronized collectionA={c1} collectionB={c2} children={children} filterFn={filterFn} />
              <Spy collectionA={c1} collectionB={c2} />
            </>)}
          </CollectionBuilder>)}
        </CollectionBuilder>
      );
    };
  
    let TwoWaySynchronizer = ({spy: Spy, children}) => {
      let useCollectionContent = React.useCallback(() => null, []);
      let useCollectionChildren = React.useCallback(() => () => null, []);
  
      let stateA = useCollectionDocument();
      let stateB = useCollectionDocument();
  
      let useCollectionDocumentA = React.useCallback(() => stateA, [stateA]);
      let useCollectionDocumentB = React.useCallback(() => stateB, [stateB]);
  
      let refA = useCollectionRef({useCollectionContent, useCollectionChildren}, React.useRef(null));
      let contentA = <CollectionBContext.Provider value={refA}>{children}</CollectionBContext.Provider>;
  
      let refB = useCollectionRef({useCollectionContent, useCollectionChildren}, React.useRef(null));
      let contentB = <CollectionAContext.Provider value={refB}>{children}</CollectionAContext.Provider>;
  
      let refA2 = useCollectionRef({useCollectionDocument: useCollectionDocumentA}, React.useRef(null));
      let refB2 = useCollectionRef({useCollectionDocument: useCollectionDocumentB}, React.useRef(null));

      let filterFn = React.useCallback((cA, cB) => {
        let keysA = new Set(cA.getKeys()), keysB = new Set(cB.getKeys());
        let collectionA = cA.UNSTABLE_filter(item => keysB.has(item));
        let collectionB = cB.UNSTABLE_filter(item => keysA.has(item));
        return {collectionA, collectionB};
      }, []);
  
      return (
        <>
          <CollectionBuilder content={contentA} collectionRef={refA2} children={useCollectionChildren()} />
          <CollectionBuilder content={contentB} collectionRef={refB2} children={useCollectionChildren()} />
          <Synchronized collectionA={stateA.collection} collectionB={stateB.collection} children={children} filterFn={filterFn} />
          <Spy collectionA={stateA.collection} collectionB={stateB.collection} />
        </>
      );
    };

    it('should support one-way synchronization of multiple collections', () => {
      let Spy = jest.fn();
      
      // Synchronizer will force CollectionB to only be rendered with keys of CollectionA
      let {queryAllByTestId} = render(
        <Synchronizer spy={Spy}>
          <CollectionA items={['a', 'b']} />
          <CollectionB items={['a', 'c']} />
        </Synchronizer>
      );
  
      expect(Spy).toHaveBeenCalledTimes(2);
      expect(Spy.mock.calls[1][0].collectionA.getFirstKey()).toBe('a');
      expect(Spy.mock.calls[1][0].collectionA.getLastKey()).toBe('b');
      expect(Spy.mock.calls[1][0].collectionB.getFirstKey()).toBe('a');
      expect(Spy.mock.calls[1][0].collectionB.getLastKey()).toBe('c');
  
      expect(queryAllByTestId('a')).toHaveLength(2);
      expect(queryAllByTestId('b')).toHaveLength(1);
      expect(queryAllByTestId('c')).toHaveLength(0);
    });
      
    it('should support two-way synchronization of multiple collections', () => {
      let Spy = jest.fn();
      
      // TwoWaySynchronizer will force both collections to only be rendered with mutually shared keys
      let {queryAllByTestId} = render(
        <TwoWaySynchronizer spy={Spy}>
          <CollectionA items={['a', 'b']} />
          <CollectionB items={['a', 'c']} />
        </TwoWaySynchronizer>
      );
  
      expect(Spy).toHaveBeenCalledTimes(2);
      expect(Spy.mock.calls[1][0].collectionA.getFirstKey()).toBe('a');
      expect(Spy.mock.calls[1][0].collectionA.getLastKey()).toBe('b');
      expect(Spy.mock.calls[1][0].collectionB.getFirstKey()).toBe('a');
      expect(Spy.mock.calls[1][0].collectionB.getLastKey()).toBe('c');
  
      expect(queryAllByTestId('a')).toHaveLength(2);
      expect(queryAllByTestId('b')).toHaveLength(0);
      expect(queryAllByTestId('c')).toHaveLength(0);
    });
  });
});
