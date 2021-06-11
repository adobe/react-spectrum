import {CollectionBase, Node} from '@react-types/shared';
import {Item} from '@react-spectrum/actiongroup';
import {List} from './List';
import {ListState, useListState} from '@react-stately/list';
import * as React from 'react';
import {Section} from '@react-spectrum/menu';
import {storiesOf} from '@storybook/react';
import {useSelectableItem, useSelectableList} from '../src';

function SelectableList(props: CollectionBase<any> & {
  isSubUlRelativelyPositioned: boolean,
  isUlRelativelyPositioned: boolean
}) {
  const state = useListState(props);
  const listRef = React.useRef<HTMLUListElement>(null);
  const {listProps} = useSelectableList({
    ref: listRef,
    selectionManager: state.selectionManager,
    collection: state.collection,
    disabledKeys: state.disabledKeys,
    isVirtualized: false,
    autoFocus: true
  });

  const renderLeaf = (node: Node<any>) => <SelectableItem node={node} state={state} />;

  return (
    <ul
      {...listProps}
      style={{
        height: 200, overflow: 'auto', padding: 10, margin: 0, listStyle: 'none',
        position: props.isUlRelativelyPositioned ? 'relative' : 'static'
      }}
      ref={listRef}>
      {Array.from(state.collection).map(node => {
        if (node.hasChildNodes) {
          return (
            <>
              <div
                style={{textTransform: 'uppercase'}}>{node.rendered}</div>
              <ul
                key={node.key}
                style={{
                  position: props.isSubUlRelativelyPositioned ? 'relative' : 'static',
                  padding: 0,
                  margin: 0,
                  listStyle: 'none'
                }}>
                {Array.from(node.childNodes).map(renderLeaf)}
              </ul>
            </>
          );
        } else {
          return renderLeaf(node);
        }
      })}
    </ul>
  );
}

function SelectableItem(props: {
  state: ListState<any>,
  node: Node<any>
}) {
  const {state, node} = props;
  const ref = React.useRef<HTMLLIElement>(null);
  const {itemProps} = useSelectableItem({
    selectionManager: state.selectionManager,
    key: node.key,
    isVirtualized: false,
    ref
  });

  const isFocused = node.key === state.selectionManager.focusedKey;
  return (
    <li
      {...itemProps}
      key={node.key}
      style={{
        backgroundColor: isFocused ? 'gray' : 'white',
        fontWeight: isFocused ? 'bold' : 'normal'
      }}
      ref={ref}>
      {node.rendered}
    </li>
  );
}

const options = [
  <Section title={'Brass'}>
    <Item>Trumpet</Item>
    <Item>Horn</Item>
    <Item>Trombone</Item>
    <Item>Tuba</Item>
  </Section>,
  <Section title={'String'}>
    <Item>Violin</Item>
    <Item>Viola</Item>
    <Item>Cello</Item>
    <Item>Harp</Item>
  </Section>,
  <Section title={'Wind'}>
    <Item>Flute</Item>
    <Item>Oboe</Item>
    <Item>Clarinet</Item>
  </Section>,
  <Section title={'Percussion'}>
    <Item>Piano</Item>
    <Item>Drums</Item>
  </Section>
];

// Press up and down to focus on different items, and make sure the scroll
// container scrolls to reveal as expected.
storiesOf('useSelectableList', module)
  .add('Static ul, static sub ul', () => (
    <SelectableList isSubUlRelativelyPositioned={false} isUlRelativelyPositioned={false}>
      {options}
    </SelectableList>
  ))
  .add('Static ul, relative sub ul', () => (
    <SelectableList isSubUlRelativelyPositioned isUlRelativelyPositioned={false}>
      {options}
    </SelectableList>
  ))
  .add('Relative ul, static sub ul', () => (
    <SelectableList isSubUlRelativelyPositioned={false} isUlRelativelyPositioned>
      {options}
    </SelectableList>
  ))
  .add('Relative ul, relative sub ul', () => (
    <SelectableList isSubUlRelativelyPositioned isUlRelativelyPositioned>
      {options}
    </SelectableList>
  ))
  .add(
    'single select allow empty',
    () => (
      <>
        <div>
          <h4>Single selection allow empty</h4>
          <ol>
            <li>Select the first item by clicking on it</li>
            <li>press arrow down</li>
            <li>Second item is selected ✓</li>
          </ol>
          <List selectionMode="single">
            <Item>Paco de Lucia</Item>
            <Item>Vicente Amigo</Item>
            <Item>Gerardo Nunez</Item>
          </List>
        </div>
        <div>
          <h4>Native selection</h4>
          <span>there is no such native example, it's a dropdown picker</span>
        </div>
      </>
    )
  )
  .add(
    'single select no empty',
    () => (
      <>
        <div>
          <h4>Single selection allow empty</h4>
          <ol>
            <li>Select the first item by clicking on it</li>
            <li>press arrow down</li>
            <li>Second item is selected ✓</li>
          </ol>
          <List selectionMode="single" disallowEmptySelection>
            <Item>Paco de Lucia</Item>
            <Item>Vicente Amigo</Item>
            <Item>Gerardo Nunez</Item>
          </List>
        </div>
        <div>
          <h4>Native selection</h4>
          <span>there is no such native example, it's a dropdown picker</span>
        </div>
      </>
    )
  )
  .add(
    'multi select behaviors',
    () => render()
  );

function render() {
  return (
    <>
      <div>
        <h4>Multi selection</h4>
        <ol>
          <li>
            Select first and second item by clicking on them (while holding
            shift)
          </li>
          <li>Press arrow down (without holding shift)</li>
          <li>
            Third item is just focused. selection is unchanged, even though{' '}
            <code>selectOnFocus</code> is true ❌
          </li>
        </ol>
        <List selectionMode="multiple">
          <Item>Paco de Lucia</Item>
          <Item>Vicente Amigo</Item>
          <Item>Gerardo Nunez</Item>
        </List>
      </div>
      <div>
        <h4>Multi selection</h4>
        <ol>
          <li>
            Select first and second item by clicking on them (while holding
            shift)
          </li>
          <li>Press arrow down (without holding shift)</li>
          <li>
            Third item is just focused. selection is unchanged, even though{' '}
            <code>selectOnFocus</code> is true ❌
          </li>
        </ol>
        <List selectionMode="multiple" disallowEmptySelection>
          <Item>Paco de Lucia</Item>
          <Item>Vicente Amigo</Item>
          <Item>Gerardo Nunez</Item>
        </List>
      </div>
      <div>
        <h4>Native multi selection</h4>
        <ol>
          <li>
            Select first and second item by clicking on them (while holding
            shift)
          </li>
          <li>Press arrow down</li>
          <li>Third item is selected ✓</li>
        </ol>
        <select multiple>
          <option>Paco de Lucia</option>
          <option>Vicente Amigo</option>
          <option>Gerardo Nunez</option>
        </select>
      </div>
    </>
  );
}
