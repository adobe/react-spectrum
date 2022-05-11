import {action} from '@storybook/addon-actions';
import {ActionBar, ActionBarContainer} from '../../actionbar';
import {ActionButton} from '@react-spectrum/button';
import {ActionGroup} from '@react-spectrum/actiongroup';
import {ActionMenu} from '@react-spectrum/menu';
import Add from '@spectrum-icons/workflow/Add';
import {Content} from '@react-spectrum/view';
import Copy from '@spectrum-icons/workflow/Copy';
import Delete from '@spectrum-icons/workflow/Delete';
import {Droppable} from '@react-aria/dnd/stories/dnd.stories';
import Edit from '@spectrum-icons/workflow/Edit';
import FileTxt from '@spectrum-icons/workflow/FileTxt';
import {Flex} from '@react-spectrum/layout';
import Folder from '@spectrum-icons/workflow/Folder';
import {Heading, Text} from '@react-spectrum/text';
import {IllustratedMessage} from '@react-spectrum/illustratedmessage';
import {Image} from '@react-spectrum/image';
import Info from '@spectrum-icons/workflow/Info';
import {Item, ListView} from '../';
import {Link} from '@react-spectrum/link';
import NoSearchResults from '@spectrum-icons/illustrations/src/NoSearchResults';
import React, {useEffect, useState} from 'react';
import {storiesOf} from '@storybook/react';
import {useAsyncList, useListData} from '@react-stately/data';
import {useDragHooks} from '@react-spectrum/dnd';

const items = [
  {key: 'a', name: 'Adobe Photoshop', type: 'file'},
  {key: 'b', name: 'Adobe XD', type: 'file'},
  {key: 'c', name: 'Documents', type: 'folder'},
  {key: 'd', name: 'Adobe InDesign', type: 'file'},
  {key: 'e', name: 'Utilities', type: 'folder'},
  {key: 'f', name: 'Adobe AfterEffects', type: 'file'},
  {key: 'g', name: 'Adobe Illustrator', type: 'file'},
  {key: 'h', name: 'Adobe Lightroom', type: 'file'},
  {key: 'i', name: 'Adobe Premiere Pro', type: 'file'},
  {key: 'j', name: 'Adobe Fresco', type: 'file'},
  {key: 'k', name: 'Adobe Dreamweaver', type: 'file'},
  {key: 'l', name: 'Adobe Connect', type: 'file'},
  {key: 'm', name: 'Pictures', type: 'folder'},
  {key: 'n', name: 'Adobe Acrobat', type: 'file'}
];

// taken from https://random.dog/
const itemsWithThumbs = [
  {key: '1', title: 'swimmer', url: 'https://random.dog/b2fe2172-cf11-43f4-9c7f-29bd19601712.jpg'},
  {key: '2', title: 'chocolate', url: 'https://random.dog/2032518a-eec8-4102-9d48-3dca5a26eb23.png'},
  {key: '3', title: 'good boi', url: 'https://random.dog/191091b2-7d69-47af-9f52-6605063f1a47.jpg'},
  {key: '4', title: 'polar bear', url: 'https://random.dog/c22c077e-a009-486f-834c-a19edcc36a17.jpg'},
  {key: '5', title: 'cold boi', url: 'https://random.dog/093a41da-e2c0-4535-a366-9ef3f2013f73.jpg'},
  {key: '6', title: 'pilot', url: 'https://random.dog/09f8ecf4-c22b-49f4-af24-29fb5c8dbb2d.jpg'},
  {key: '7', title: 'nerd', url: 'https://random.dog/1a0535a6-ca89-4059-9b3a-04a554c0587b.jpg'},
  {key: '8', title: 'audiophile', url: 'https://random.dog/32367-2062-4347.jpg'}
];

function renderEmptyState() {
  return (
    <IllustratedMessage>
      <svg width="150" height="103" viewBox="0 0 150 103">
        <path d="M133.7,8.5h-118c-1.9,0-3.5,1.6-3.5,3.5v27c0,0.8,0.7,1.5,1.5,1.5s1.5-0.7,1.5-1.5V23.5h119V92c0,0.3-0.2,0.5-0.5,0.5h-118c-0.3,0-0.5-0.2-0.5-0.5V69c0-0.8-0.7-1.5-1.5-1.5s-1.5,0.7-1.5,1.5v23c0,1.9,1.6,3.5,3.5,3.5h118c1.9,0,3.5-1.6,3.5-3.5V12C137.2,10.1,135.6,8.5,133.7,8.5z M15.2,21.5V12c0-0.3,0.2-0.5,0.5-0.5h118c0.3,0,0.5,0.2,0.5,0.5v9.5H15.2z M32.6,16.5c0,0.6-0.4,1-1,1h-10c-0.6,0-1-0.4-1-1s0.4-1,1-1h10C32.2,15.5,32.6,15.9,32.6,16.5z M13.6,56.1l-8.6,8.5C4.8,65,4.4,65.1,4,65.1c-0.4,0-0.8-0.1-1.1-0.4c-0.6-0.6-0.6-1.5,0-2.1l8.6-8.5l-8.6-8.5c-0.6-0.6-0.6-1.5,0-2.1c0.6-0.6,1.5-0.6,2.1,0l8.6,8.5l8.6-8.5c0.6-0.6,1.5-0.6,2.1,0c0.6,0.6,0.6,1.5,0,2.1L15.8,54l8.6,8.5c0.6,0.6,0.6,1.5,0,2.1c-0.3,0.3-0.7,0.4-1.1,0.4c-0.4,0-0.8-0.1-1.1-0.4L13.6,56.1z" />
      </svg>
      <Heading>No results</Heading>
      <Content>No results found</Content>
    </IllustratedMessage>
  );
}

let decorator = (storyFn, context) => {
  let omittedStories = ['draggable rows', 'dynamic items + renderEmptyState'];
  return  window.screen.width <= 700 || omittedStories.some(omittedName => context.name.includes(omittedName)) ?
  storyFn() :
  (
    <>
      <span style={{paddingInline: '10px'}}>
        <label htmlFor="focus-before">Focus before</label>
        <input id="focus-before" />
      </span>
      {storyFn()}
      <span style={{paddingInline: '10px'}}>
        <label htmlFor="focus-after">Focus after</label>
        <input id="focus-after" />
      </span>
    </>
  );
};

storiesOf('ListView', module)
  .addDecorator(decorator)
  .add('default', () => (
    <ListView width="250px">
      <Item textValue="Adobe Photoshop">Adobe Photoshop</Item>
      <Item textValue="Adobe Illustrator">Adobe Illustrator</Item>
      <Item textValue="Adobe XD">Adobe XD</Item>
    </ListView>
  ))
  .add('isQuiet', () => (
    <ListView width="250px" isQuiet>
      <Item textValue="Adobe Photoshop">Adobe Photoshop</Item>
      <Item textValue="Adobe Illustrator">Adobe Illustrator</Item>
      <Item textValue="Adobe XD">Adobe XD</Item>
    </ListView>
  ))
  .add('with buttons', () => (
    <ListView width="300px">
      <Item textValue="Adobe Photoshop">
        <Content>Adobe Photoshop</Content>
        <ActionButton>Edit</ActionButton>
      </Item>
      <Item textValue="Adobe Illustrator">
        <Content>Adobe Illustrator</Content>
        <ActionButton>Edit</ActionButton>
      </Item>
      <Item textValue="Adobe XD">
        <Content>Adobe XD</Content>
        <ActionButton>Edit</ActionButton>
      </Item>
    </ListView>
  ))
  .add('dynamic items', () => (
    <ListView items={items} width="300px" height="250px">
      {(item) => (
        <Item key={item.key} textValue={item.name}>
          <Content>
            {item.name}
          </Content>
          <ActionGroup buttonLabelBehavior="hide">
            <Item key="edit">
              <Edit />
              <Text>Edit</Text>
            </Item>
            <Item key="delete">
              <Delete />
              <Text>Delete</Text>
            </Item>
          </ActionGroup>
        </Item>
        )}
    </ListView>
    )
  )
  .add('dynamic items - small viewport', () => (
    <ListView items={items} width="100px" height="250px">
      {(item) => (
        <Item key={item.key} textValue={item.name}>
          <Content>
            {item.name}
          </Content>
          <ActionGroup buttonLabelBehavior="hide">
            <Item key="edit">
              <Edit />
              <Text>Edit</Text>
            </Item>
            <Item key="delete">
              <Delete />
              <Text>Delete</Text>
            </Item>
          </ActionGroup>
        </Item>
      )}
    </ListView>
    )
  )
  .add('falsy ids as keys', () => (
    <FalsyIds />
  ))
  .add('empty list', () => (
    <ListView width="300px" height="300px" renderEmptyState={renderEmptyState}>
      {[]}
    </ListView>
  ))
  .add('loading', () => (
    <ListView width="300px" height="300px" loadingState="loading">
      {[]}
    </ListView>
  ))
  .add('loadingMore', () => (
    <ListView width="300px" height="300px" loadingState="loadingMore">
      <Item textValue="Adobe Photoshop">Adobe Photoshop</Item>
      <Item textValue="Adobe Illustrator">Adobe Illustrator</Item>
      <Item textValue="Adobe XD">Adobe XD</Item>
    </ListView>
  ))
  .add('async listview loading', () => (
    <AsyncList />
  ))
  .add('async listview loading with actions', () => (
    <AsyncList withActions />
  ))
  .add('density: compact', () => (
    <ListView width="250px" density="compact">
      <Item textValue="Adobe Photoshop">Adobe Photoshop</Item>
      <Item textValue="Adobe Illustrator">Adobe Illustrator</Item>
      <Item textValue="Adobe XD">Adobe XD</Item>
    </ListView>
  ))
  .add('density: spacious', () => (
    <ListView width="250px" density="spacious">
      <Item textValue="Adobe Photoshop">Adobe Photoshop</Item>
      <Item textValue="Adobe Illustrator">Adobe Illustrator</Item>
      <Item textValue="Adobe XD">Adobe XD</Item>
    </ListView>
  ))
  .add('selection: none', () => (
    <Example selectionMode="none" />
  ))
  .add('selection: single, checkbox', () => (
    <Example selectionMode="single" />
  ))
  .add('selection: single, checkbox, disabled', () => (
    <Example selectionMode="single" disabledKeys={['row1']} />
  ))
  .add('selection: single, checkbox, isQuiet', () => (
    <Example selectionMode="single" isQuiet />
  ))
  .add('selection: multiple, checkbox', () => (
    <Example selectionMode="multiple" />
  ))
  .add('selection: multiple, checkbox, isQuiet', () => (
    <Example selectionMode="multiple" isQuiet />
  ))
  .add('parent folder example', () => (
    <Example2 selectionMode="multiple" />
  ))
  .add('actions: ActionButton', () =>
    renderActionsExample(props => <ActionButton {...props}><Copy /></ActionButton>))
  .add('actions: ActionGroup', () =>
    renderActionsExample(props => (
      <ActionGroup buttonLabelBehavior="hide" {...props}>
        <Item key="add">
          <Add />
          <Text>Add</Text>
        </Item>
        <Item key="delete">
          <Delete />
          <Text>Delete</Text>
        </Item>
      </ActionGroup>
    )))
  .add('actions: ActionMenu', () =>
    renderActionsExample(props => (
      <ActionMenu {...props}>
        <Item key="add">
          <Add />
          <Text>Add</Text>
        </Item>
        <Item key="delete">
          <Delete />
          <Text>Delete</Text>
        </Item>
      </ActionMenu>
    )))
  .add('actions: ActionGroup + ActionMenu', () =>
    renderActionsExample(props => (
      <>
        <ActionGroup buttonLabelBehavior="hide" {...props} slot="actionGroup">
          <Item key="info">
            <Info />
            <Text>Info</Text>
          </Item>
        </ActionGroup>
        <ActionMenu {...props} slot="actionMenu">
          <Item key="add">
            <Add />
            <Text>Add</Text>
          </Item>
          <Item key="delete">
            <Delete />
            <Text>Delete</Text>
          </Item>
        </ActionMenu>
      </>
    )))
  .add('dynamic items + renderEmptyState', () => (<EmptyTest />))
  .add('selectionStyle: highlight', () => (
    <ListView width="250px" height={400} onSelectionChange={action('onSelectionChange')} selectionStyle="highlight" selectionMode="multiple" items={items}>
      {item => <Item>{item.name}</Item>}
    </ListView>
  ))
  .add('isQuiet, selectionStyle: highlight', () => (
    <ListView width="250px" isQuiet selectionMode="single" selectionStyle="highlight">
      <Item textValue="Home">Home</Item>
      <Item textValue="Apps">Apps</Item>
      <Item textValue="Document Cloud">Document Cloud</Item>
      <Item textValue="Creative Cloud">Creative Cloud</Item>
      <Item textValue="Send & Track">Send & Track</Item>
      <Item textValue="Reviews">Reviews</Item>
    </ListView>
  ))
  .add('isQuiet, selectionStyle: highlight, multiple', () => (
    <ListView width="250px" isQuiet selectionMode="multiple" selectionStyle="highlight">
      <Item textValue="Home">Home</Item>
      <Item textValue="Apps">Apps</Item>
      <Item textValue="Document Cloud">Document Cloud</Item>
      <Item textValue="Creative Cloud">Creative Cloud</Item>
      <Item textValue="Send & Track">Send & Track</Item>
      <Item textValue="Reviews">Reviews</Item>
    </ListView>
  ))
  .add('selectionStyle: highlight, onAction', () => (
    <ListView width="250px" height={400} onSelectionChange={action('onSelectionChange')} selectionStyle="highlight" selectionMode="multiple" items={items} onAction={action('onAction')}>
      {item => <Item>{item.name}</Item>}
    </ListView>
  ))
  .add('selectionMode: none, onAction', () => (
    <ListView width="250px" height={400} onSelectionChange={action('onSelectionChange')} selectionMode="none" items={items} onAction={action('onAction')}>
      {item => <Item>{item.name}</Item>}
    </ListView>
  ))
  .add('selectionStyle: checkbox, onAction', () => (
    <ListView width="250px" height={400} onSelectionChange={action('onSelectionChange')} selectionMode="multiple" selectionStyle="checkbox" items={[...Array(20).keys()].map(k => ({key: k, name: `Item ${k}`}))} onAction={action('onAction')}>
      {item => <Item>{item.name}</Item>}
    </ListView>
  ))
  .add('with ActionBar', () => <ActionBarExample />)
  .add('with emphasized ActionBar', () => <ActionBarExample isEmphasized />)
  .add(
    'thumbnails',
    () => (
      <ListView width="250px" items={itemsWithThumbs}>
        {
          (item) => <Item textValue={item.title}><Image src={item.url} /><Content>{item.title}</Content><Text slot="description">JPG</Text></Item>
        }
      </ListView>
    )
  )
  .add(
    'draggable rows',
    () => (
      <Flex direction="row" wrap alignItems="center">
        <input />
        <Droppable />
        <DragExample dragHookOptions={{onDragStart: action('dragStart'), onDragEnd: action('dragEnd')}} />
      </Flex>
    ), {description: {data: 'Folders are non-draggable.'}}
  )
  .add(
    'draggable rows, onAction',
    () => (
      <Flex direction="row" wrap alignItems="center">
        <input />
        <Droppable />
        <DragExample listViewProps={{onAction: action('onAction')}} dragHookOptions={{onDragStart: action('dragStart'), onDragEnd: action('dragEnd')}} />
      </Flex>
    ), {description: {data: 'Folders are non-draggable.'}}
  )
  .add(
    'draggable rows, selectionStyle: highlight, onAction',
    () => (
      <Flex direction="row" wrap alignItems="center">
        <input />
        <Droppable />
        <DragExample listViewProps={{selectionStyle: 'highlight', onAction: action('onAction')}} dragHookOptions={{onDragStart: action('dragStart'), onDragEnd: action('dragEnd')}} />
      </Flex>
    ), {description: {data: 'Folders are non-draggable.'}})
  .add('overflowMode="truncate" (default)', () => (
    <ListView width="250px" overflowMode="truncate">
      <Item textValue="row 1">row 1 with a very very very very very long title</Item>
      <Item textValue="row 2">
        <Text>Text slot with a really really really long name</Text>
        <Text slot="description">Description slot with a really really long name</Text>
      </Item>
      <Item textValue="row 3">
        <Content>Content slot with really really long name</Content>
      </Item>
      <Item textValue="row 4">
        <Link >Link slot with a very very very very long name</Link>
      </Item>
    </ListView>
  ))
  .add('overflowMode="wrap"', () => (
    <ListView width="250px" overflowMode="wrap">
      <Item textValue="row 1">row 1 with a very very very very very long title</Item>
      <Item textValue="row 2">
        <Text>Text slot with a really really really long name</Text>
        <Text slot="description">Description slot with a really really long name</Text>
      </Item>
      <Item textValue="row 3">
        <Content>Content slot with really really long name</Content>
      </Item>
      <Item textValue="row 4">
        <Link >Link slot with a very very very very long name</Link>
      </Item>
    </ListView>
  ));

function Example(props?) {
  return (
    <ListView width="250px" onSelectionChange={action('onSelectionChange')} {...props}>
      <Item key="Utilities" hasChildItems>
        <Content>Utilities</Content>
      </Item>
      <Item textValue="Adobe Photoshop">Adobe Photoshop</Item>
      <Item textValue="Adobe Illustrator">Adobe Illustrator</Item>
      <Item textValue="Adobe XD">Adobe XD</Item>
    </ListView>
  );
}

function Example2(props?) {
  return (
    <ListView width="250px" onSelectionChange={action('onSelectionChange')} onAction={action('onAction')} {...props}>
      <Item key="Utilities" hasChildItems>Utilities</Item>
      <Item textValue="Adobe Photoshop">Adobe Photoshop</Item>
      <Item textValue="Adobe Illustrator">Adobe Illustrator</Item>
      <Item textValue="Adobe XD">Adobe XD</Item>
    </ListView>
  );
}

function renderActionsExample(renderActions, props?) {
  return (
    <ListView width="300px" selectionMode="single" {...props} onAction={action('onAction')} onSelectionChange={keys => console.log('sel', keys)}>
      <Item key="a" textValue="Utilities" hasChildItems>
        <Folder />
        <Content>Utilities</Content>
        <Text slot="description">16 items</Text>
        {renderActions({onPress: action('actionPress')})}
      </Item>
      <Item key="b" textValue="Adobe Photoshop">
        <Content>Adobe Photoshop</Content>
        <Text slot="description">Application</Text>
        {renderActions({onPress: action('actionPress')})}
      </Item>
      <Item key="c" textValue="Adobe Illustrator">
        <Content>Adobe Illustrator</Content>
        <Text slot="description">Application</Text>
        {renderActions({onPress: action('actionPress')})}
      </Item>
      <Item key="d" textValue="Adobe XD">
        <Content>Adobe XD</Content>
        <Text slot="description">Application</Text>
        {renderActions({onPress: action('actionPress')})}
      </Item>
    </ListView>
  );
}

let i = 0;
function EmptyTest() {
  const [items, setItems] = useState([]);
  const [divProps, setDivProps] = useState({});

  useEffect(() => {
    let newItems = [];
    for (i = 0; i < 20; i++) {
      newItems.push({key: i, name: `Item ${i}`});
    }
    setItems(newItems);
  }, []);

  const renderEmpty = () => (
    <IllustratedMessage>
      <NoSearchResults />
      <Heading>No items</Heading>
    </IllustratedMessage>
  );
  let hasDivProps = Object.keys(divProps).length > 0;
  return (
    <div>
      <Flex direction="row">
        <div {...divProps}>
          <ListView items={items} width="250px" height={hasDivProps ? null : '500px'} renderEmptyState={renderEmpty}>
            {
              item => (
                <Item key={item.key}>
                  <Content>{item.name}</Content>
                </Item>
              )
            }
          </ListView>
        </div>
        <div style={{paddingLeft: '10px'}}>
          <ActionButton
            isDisabled={hasDivProps}
            onPress={() => setDivProps({style: {display: 'flex', flexGrow: 1, minWidth: '200px', maxHeight: '500px'}})}>
            Use flex div wrapper (no set height)
          </ActionButton>
          <Flex gap={10} marginTop={10}>
            <ActionButton onPress={() => setItems([])}>
              Clear All
            </ActionButton>
            <ActionButton
              onPress={() => {
                let newArr = [...items];
                newArr.push({key: i++, name: `Item ${i}`});
                setItems(newArr);
              }}>
              Add 1
            </ActionButton>
            <ActionButton
              onPress={() => {
                let newItems = [...items];
                setItems(newItems.slice(0, 4));
              }}>
              Slice (0, 4)
            </ActionButton>
          </Flex>
        </div>
      </Flex>
    </div>
  );
}


export function DragExample(props?) {
  let {listViewProps, dragHookOptions} = props;
  let getItems = (keys) => [...keys].map(key => {
    let item = items.find(item => item.key === key);
    return {
      'text/plain': item.name
    };
  });

  let allowsDraggingItem = (key) => {
    let item = items.find(item => item.key === key);
    return item.type !== 'folder';
  };

  let dragHooks = useDragHooks({
    allowsDraggingItem,
    getItems,
    ...dragHookOptions
  });

  return (
    <ListView
      aria-label="draggable list view"
      width="300px"
      selectionMode="multiple"
      items={items}
      disabledKeys={['f']}
      dragHooks={dragHooks}
      {...listViewProps}>
      {(item: any) => (
        <Item key={item.key} textValue={item.name} hasChildItems={item.type === 'folder'}>
          {item.type === 'folder' && <Folder />}
          {item.key === 'a' && <FileTxt />}
          <Content>
            {item.name}
          </Content>
          {item.key === 'b' && <Text slot="description">Beta</Text>}
          <ActionMenu
            onAction={action('onAction')}>
            <Item key="edit" textValue="Edit">
              <Edit />
              <Text>Edit</Text>
            </Item>
            <Item key="delete" textValue="Delete">
              <Delete />
              <Text>Delete</Text>
            </Item>
          </ActionMenu>
        </Item>
      )}
    </ListView>
  );
}

function AsyncList(props) {
  interface StarWarsChar {
    name: string,
    url: string
  }

  let list = useAsyncList<StarWarsChar>({
    async load({signal, cursor}) {
      if (cursor) {
        cursor = cursor.replace(/^http:\/\//i, 'https://');
      }

      // Slow down load so progress circle can appear
      await new Promise(resolve => setTimeout(resolve, 1500));
      let res = await fetch(cursor || 'https://swapi.py4e.com/api/people/?search=', {signal});
      let json = await res.json();
      return {
        items: json.results,
        cursor: json.next
      };
    }
  });
  return (
    <ListView
      selectionMode="multiple"
      aria-label="example async loading list"
      width="size-6000"
      height="size-3000"
      items={list.items}
      loadingState={list.loadingState}
      onLoadMore={list.loadMore}>
      {(item) => {
        if (props.withActions) {
          return <Item key={item.name} textValue={item.name}><Content>{item.name}</Content><ActionButton>Edit</ActionButton></Item>;
        }
        return <Item key={item.name} textValue={item.name}>{item.name}</Item>;
      }}
    </ListView>
  );
}

function FalsyIds() {
  let items = [
    {id: 1, name: 'key=1'},
    {id: 0, name: 'key=0'}
  ];

  return (
    <ListView width="250px" height={400} selectionMode="multiple" onSelectionChange={action('onSelectionChange')} items={items} onAction={action('onAction')}>
      {item => <Item>{item.name}</Item>}
    </ListView>
  );
}

function ActionBarExample(props?) {
  let list = useListData({
    initialItems: [
      {key: 0, name: 'Adobe Photoshop'},
      {key: 1, name: 'Adobe Illustrator'},
      {key: 2, name: 'Adobe XD'}
    ],
    initialSelectedKeys: [0]
  });
  return (
    <ActionBarContainer height={300}>
      <ListView selectionMode="multiple" selectedKeys={list.selectedKeys} onSelectionChange={list.setSelectedKeys} items={list.items} width="250px">
        {item => <Item>{item.name}</Item>}
      </ListView>
      <ActionBar
        selectedItemCount={list.selectedKeys === 'all' ? list.items.length : list.selectedKeys.size}
        onAction={action('onAction')}
        onClearSelection={() => list.setSelectedKeys(new Set([]))}
        {...props}>
        <Item key="edit">
          <Edit />
          <Text>Edit</Text>
        </Item>
        <Item key="copy">
          <Copy />
          <Text>Copy</Text>
        </Item>
        <Item key="delete">
          <Delete />
          <Text>Delete</Text>
        </Item>
      </ActionBar>
    </ActionBarContainer>
  );
}
