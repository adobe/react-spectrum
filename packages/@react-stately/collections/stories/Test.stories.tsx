import {Item} from '../src';
import React, {useRef} from 'react';
import {storiesOf} from '@storybook/react';
import {Tree} from '@react-spectrum/tree';
import {useAsyncList} from '../src/useAsyncList';

storiesOf('TestAsync', module)
  .add(
    'with loading indicator',
    () => <Component />
  );

interface IItem {
  name: string,
  key: string
}

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

let MORE_ITEMS = [
  {name: '1', key: 'a1a'},
  {name: '2', key: 'b2a'},
  {name: '3', key: 'c3a'},
  {name: '4', key: 'd4a'},
  {name: '5', key: 'e5a'},
  {name: '6', key: 'f6a'},
  {name: '7', key: 'g7a'},
  {name: '8', key: 'h8a'},
  {name: '9', key: 'i9a'}
];

function Component() {
  let scrolling = useRef<boolean>(false);
  let {isLoading, items, onLoadMore} = useAsyncList<IItem>({
    load: async () => {
      let res = await retrieve();
      return {items: res};
    },
    loadMore: async ({items}) => {
      let res = await retrieveMore();
      scrolling.current = false;
      return {items: [...items, ...res]};
    }
  });
  let collection = useRef<any>();

  function onWheelHandle() {
    let container = collection.current;
    if (!container || scrolling.current) {
      return;
    }

    if (container.firstElementChild.scrollTop > 100) {
      scrolling.current = true;
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
  return new Promise<IItem[]>((resolve) => {
    setTimeout(() => {
      resolve(ITEMS);
    }, 1000);
  });
}

async function retrieveMore() {
  return new Promise<IItem[]>((resolve) => {
    setTimeout(() => {
      resolve(MORE_ITEMS);
    }, 1500);
  });
}
