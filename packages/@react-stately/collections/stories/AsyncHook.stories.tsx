import {ActionButton} from '@react-spectrum/button';
import {Item, useAsyncList} from '../src';
import {ProgressCircle} from '@react-spectrum/progress';
import React, {useEffect} from 'react';
// import {storiesOf} from '@storybook/react';
import {Tree} from '@react-spectrum/tree';

/*
 these are broken, commenting out for now
storiesOf('useAsyncList', module)
  .add(
    'loadMore support',
    () => (<Component
      loadMore={async ({items}) => {
        let res = await retrieveMore();
        return {items: [...items, ...res]};
      }} />)
  )
  .add(
    'sort support',
    () => (
      <Component
        defaultSortDescriptor={{direction: 'ASC'}}
        sort={({items}) => new Promise(resolve => {
          setTimeout(() => {
            let i = items.sort();
            resolve({items: i.reverse()});
          }, 500);
        })} />
    )
  );
  */

interface IItem {
  name: string,
  key: string
}
let counter = 1;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function Component(props) {
  let {isLoading, items, onLoadMore, onSortChange, sortDescriptor} = useAsyncList<IItem>({
    load: async () => {
      let res = await retrieve();
      return {items: res};
    },
    ...props
  });

  useEffect(() => {counter = 1;}, []);
  return (
    <div style={{position: 'relative'}}>
      <Tree items={items} itemKey="key">
        {({name}) => <Item>{name}</Item>}
      </Tree>
      {isLoading && <ProgressCircle aria-label="Loading..." UNSAFE_style={{position: 'absolute'}} isIndeterminate isCentered />}
      {!isLoading && props.loadMore &&
        <ActionButton UNSAFE_style={{position: 'absolute', bottom: '0', right: '-80px'}} onPress={onLoadMore}>
          Load More
        </ActionButton>
      }
      {!isLoading && props.sort &&
        <ActionButton
          UNSAFE_style={{position: 'absolute', bottom: '0', right: '-80px'}}
          onPress={() => onSortChange({direction: sortDescriptor.direction === 1 ? 0 : 1})}>
          {sortDescriptor.direction === 1 ? 'DESC' : 'ASC'}
        </ActionButton>
      }
    </div>
  );
}

async function retrieve() {
  return new Promise<IItem[]>((resolve) => {
    setTimeout(() => {
      let items = [];
      for (let i = 0; i < 30; i++) {
        items.push({name: `Item ${counter++}`, key: counter});
      }
      resolve(items);
    }, 1000);
  });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function retrieveMore() {
  return new Promise<IItem[]>((resolve) => {
    setTimeout(() => {
      let items = [];
      for (let i = 0; i < 30; i++) {
        items.push({name: `Item ${counter++}`, key: counter});
      }
      resolve(items);
    }, 1500);
  });
}
