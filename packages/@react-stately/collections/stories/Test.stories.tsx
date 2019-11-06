import {Item} from '../src';
import React, {useRef} from 'react';
import {storiesOf} from '@storybook/react';
import {Tree} from '@react-spectrum/tree';
import {useAsyncList} from '../src/useAsyncList';

storiesOf('TestAsync', module)
  .add(
    'with loading indicator',
    () => (
      <Component />
      )
  );

let ITEMS = [
  {name: 'Aardvark', key: '1'},
  {name: 'Kangaroo', key: '2'},
  {name: 'Snake', key: '3'},
  {name: 'Danni', key: '4'},
  {name: 'Devon', key: '5'},
  {name: 'Tests', key: '6'},
  {name: 'Aa1rdvark', key: '7'},
  {name: 'Kan1garoo', key: '8'},
  {name: 'Snak1e', key: '9'},
  {name: 'Danni1', key: '10'},
  {name: '1Devon', key: '11'},
  {name: '1T2ests', key: '12'},
  {name: 'Aardvar1k', key: '13'},
  {name: '1K2angaroo', key: '14'}
];
function Component() {
  let {isLoading, items, onLoadMore} = useAsyncList<string>({
    load: async () => {
      let res = await retrieve();
      return {items: res};
    },
    loadMore: async ({items}) => {
      let res = await retrieveMore();
      return {items: [...items, ...res]};
    }
  });
  let collection = useRef();

  function onWheelHandle() {
    let container = collection.current;
    if (!container) {
      return;
    }
    // @ts-ignore
    if (container.firstElementChild.scrollTop > 100) {
      onLoadMore();
    }
  }

  return (
    <div style={{position: 'relative', height: '200px', width: '500px'}} onWheel={onWheelHandle} ref={collection}>
      <Tree items={items} itemKey="key">
        {({name}) => <Item>{name}</Item>}
      </Tree>
      {isLoading && <div style={{position: 'absolute', top: '-50px', fontSize: 40}}>Loading...</div>}
    </div>
  );
}

async function retrieve() {
  return new Promise<string[]>((resolve) => {
    setTimeout(() => {
      // @ts-ignore
      resolve(ITEMS);
    }, 1000);
  });
}

async function retrieveMore() {
  return new Promise<string[]>((resolve) => {
    setTimeout(() => {
      // @ts-ignore
      resolve(MORE_ITEMS);
    }, 1500);
  });
}

let MORE_ITEMS = [
  {name: '1', key: '1a'},
  {name: '2', key: '2a'},
  {name: '3', key: '3a'},
  {name: '4', key: '4a'},
  {name: '5', key: '5a'},
  {name: '6', key: '6a'},
  {name: '7', key: '7a'},
  {name: '8', key: '8a'},
  {name: '9', key: '9a'}
];
