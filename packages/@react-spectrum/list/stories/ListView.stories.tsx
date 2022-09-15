import {action} from '@storybook/addon-actions';
import {ActionBar, ActionBarContainer} from '../../actionbar';
import {ActionButton} from '@react-spectrum/button';
import {ActionGroup} from '@react-spectrum/actiongroup';
import {ActionMenu} from '@react-spectrum/menu';
import Add from '@spectrum-icons/workflow/Add';
import {Breadcrumbs} from '@react-spectrum/breadcrumbs';
import {chain} from '@react-aria/utils';
import {Content} from '@react-spectrum/view';
import Copy from '@spectrum-icons/workflow/Copy';
import Delete from '@spectrum-icons/workflow/Delete';
import {Droppable} from '@react-aria/dnd/stories/dnd.stories';
import Edit from '@spectrum-icons/workflow/Edit';
import File from '@spectrum-icons/illustrations/File';
import {Flex} from '@react-spectrum/layout';
import Folder from '@spectrum-icons/illustrations/Folder';
import {Heading, Text} from '@react-spectrum/text';
import {IllustratedMessage} from '@react-spectrum/illustratedmessage';
import {Image} from '@react-spectrum/image';
import Info from '@spectrum-icons/workflow/Info';
import {Item, ListView} from '../';
import {ItemDropTarget} from '@react-types/shared';
import {Link} from '@react-spectrum/link';
import NoSearchResults from '@spectrum-icons/illustrations/src/NoSearchResults';
import React, {useEffect, useState} from 'react';
import {storiesOf} from '@storybook/react';
import {useAsyncList, useListData} from '@react-stately/data';
import {useDnDHooks} from '@react-spectrum/dnd';

const parameters = {
  args: {
    isQuiet: false,
    density: 'regular',
    selectionMode: 'multiple',
    selectionStyle: 'checkbox',
    overflowMode: 'truncate'
  },
  argTypes: {
    selectionMode: {
      control: {
        type: 'radio',
        options: ['none', 'single', 'multiple']
      }
    },
    selectionStyle: {
      control: {
        type: 'radio',
        options: ['checkbox', 'highlight']
      }
    },
    isQuiet: {
      control: {type: 'boolean'}
    },
    density: {
      control: {
        type: 'select',
        options: ['compact', 'regular', 'spacious']
      }
    },
    overflowMode: {
      control: {
        type: 'radio',
        options: ['truncate', 'wrap']
      }
    }
  }
};

const items: any = [
  {key: 'a', name: 'Adobe Photoshop', type: 'file'},
  {key: 'b', name: 'Adobe XD', type: 'file'},
  {key: 'c', name: 'Documents', type: 'folder', children: [
    {key: 1, name: 'Sales Pitch'},
    {key: 2, name: 'Demo'},
    {key: 3, name: 'Taxes'}
  ]},
  {key: 'd', name: 'Adobe InDesign', type: 'file'},
  {key: 'e', name: 'Utilities', type: 'folder', children: [
    {key: 1, name: 'Activity Monitor'}
  ]},
  {key: 'f', name: 'Adobe AfterEffects', type: 'file'},
  {key: 'g', name: 'Adobe Illustrator', type: 'file'},
  {key: 'h', name: 'Adobe Lightroom', type: 'file'},
  {key: 'i', name: 'Adobe Premiere Pro', type: 'file'},
  {key: 'j', name: 'Adobe Fresco', type: 'file'},
  {key: 'k', name: 'Adobe Dreamweaver', type: 'file'},
  {key: 'l', name: 'Adobe Connect', type: 'file'},
  {key: 'm', name: 'Pictures', type: 'folder', children: [
    {key: 1, name: 'Yosemite'},
    {key: 2, name: 'Jackson Hole'},
    {key: 3, name: 'Crater Lake'}
  ]},
  {key: 'n', name: 'Adobe Acrobat', type: 'file'}
];

// taken from https://random.dog/
const itemsWithThumbs = [
  {key: '0', title: 'folder of good bois', illustration: <Folder />},
  {key: '1', title: 'swimmer', url: 'https://random.dog/b2fe2172-cf11-43f4-9c7f-29bd19601712.jpg'},
  {key: '2', title: 'chocolate', url: 'https://random.dog/2032518a-eec8-4102-9d48-3dca5a26eb23.png'},
  {key: '3', title: 'good boi', url: 'https://random.dog/191091b2-7d69-47af-9f52-6605063f1a47.jpg'},
  {key: '4', title: 'polar bear', url: 'https://random.dog/c22c077e-a009-486f-834c-a19edcc36a17.jpg'},
  {key: '5', title: 'cold boi', url: 'https://random.dog/093a41da-e2c0-4535-a366-9ef3f2013f73.jpg'},
  {key: '6', title: 'pilot', url: 'https://random.dog/09f8ecf4-c22b-49f4-af24-29fb5c8dbb2d.jpg'},
  {key: '7', title: 'nerd', url: 'https://random.dog/1a0535a6-ca89-4059-9b3a-04a554c0587b.jpg'},
  {key: '8', title: 'audiophile', url: 'https://random.dog/32367-2062-4347.jpg'},
  {key: '9', title: 'file of great boi', illustration: <File />}
];

export function renderEmptyState() {
  return (
    <IllustratedMessage>
      <svg width="150" height="103" viewBox="0 0 150 103">
        <path d="M133.7,8.5h-118c-1.9,0-3.5,1.6-3.5,3.5v27c0,0.8,0.7,1.5,1.5,1.5s1.5-0.7,1.5-1.5V23.5h119V92c0,0.3-0.2,0.5-0.5,0.5h-118c-0.3,0-0.5-0.2-0.5-0.5V69c0-0.8-0.7-1.5-1.5-1.5s-1.5,0.7-1.5,1.5v23c0,1.9,1.6,3.5,3.5,3.5h118c1.9,0,3.5-1.6,3.5-3.5V12C137.2,10.1,135.6,8.5,133.7,8.5z M15.2,21.5V12c0-0.3,0.2-0.5,0.5-0.5h118c0.3,0,0.5,0.2,0.5,0.5v9.5H15.2z M32.6,16.5c0,0.6-0.4,1-1,1h-10c-0.6,0-1-0.4-1-1s0.4-1,1-1h10C32.2,15.5,32.6,15.9,32.6,16.5z M13.6,56.1l-8.6,8.5C4.8,65,4.4,65.1,4,65.1c-0.4,0-0.8-0.1-1.1-0.4c-0.6-0.6-0.6-1.5,0-2.1l8.6-8.5l-8.6-8.5c-0.6-0.6-0.6-1.5,0-2.1c0.6-0.6,1.5-0.6,2.1,0l8.6,8.5l8.6-8.5c0.6-0.6,1.5-0.6,2.1,0c0.6,0.6,0.6,1.5,0,2.1L15.8,54l8.6,8.5c0.6,0.6,0.6,1.5,0,2.1c-0.3,0.3-0.7,0.4-1.1,0.4c-0.4,0-0.8-0.1-1.1-0.4L13.6,56.1z" />
      </svg>
      <Heading>No results</Heading>
      <Content>No results found, press <Link onPress={action('linkPress')}>here</Link> for more info.</Content>
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

let getAllowedDropOperationsAction = action('getAllowedDropOperationsAction');

storiesOf('ListView', module)
  .addDecorator(decorator)
  .addParameters(parameters)
  .add('default', args => (
    <ListView width="250px" aria-label="default ListView" {...args}>
      <Item textValue="Adobe Photoshop">Adobe Photoshop</Item>
      <Item textValue="Adobe Illustrator">Adobe Illustrator</Item>
      <Item textValue="Adobe XD">Adobe XD</Item>
    </ListView>
  ))
  .add('dynamic items', args => (
    <ListView aria-label="Dynamic items" items={items} width="300px" height="250px" {...args}>
      {(item: any) => (
        <Item key={item.key} textValue={item.name}>
          <Text>
            {item.name}
          </Text>
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
  .add('dynamic items - small viewport', args => (
    <ListView aria-label="small view port listview" items={items} width="100px" height="250px" {...args}>
      {(item: any) => (
        <Item key={item.key} textValue={item.name}>
          <Text>
            {item.name}
          </Text>
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
  .add('falsy ids as keys', args => (
    <FalsyIds {...args} />
  ))
  .add('empty list', args => (
    <ListView aria-label="empty ListView" width="300px" height="300px" renderEmptyState={renderEmptyState} {...args}>
      {[]}
    </ListView>
  ))
  .add('loading', args => (
    <ListView aria-label="loading ListView" width="300px" height="300px" loadingState="loading" {...args}>
      {[]}
    </ListView>
  ))
  .add('loadingMore', args => (
    <ListView aria-label="loading more ListView" width="300px" height="300px" loadingState="loadingMore" {...args}>
      <Item textValue="Adobe Photoshop">Adobe Photoshop</Item>
      <Item textValue="Adobe Illustrator">Adobe Illustrator</Item>
      <Item textValue="Adobe XD">Adobe XD</Item>
    </ListView>
  ))
  .add('async listview loading', args => (
    <AsyncList {...args} />
  ))
  .add('async listview loading with actions', args => (
    <AsyncList withActions {...args} />
  ))
  .add('dynamic items + renderEmptyState', args => (<EmptyTest {...args} />))
  .add('with ActionBar', args => <ActionBarExample {...args} />)
  .add('with emphasized ActionBar', args => <ActionBarExample isEmphasized {...args} />)
  .add('thumbnails', args => (
    <ListView width="250px" items={itemsWithThumbs} aria-label="ListView with thumbnails" {...args}>
      {(item: any) => (
        <Item textValue={item.title}>
          {item.url && <Image src={item.url} alt="" />}
          {item.illustration}
          <Text>{item.title}</Text>
          {item.url && <Text slot="description">JPG</Text>}
        </Item>
      )}
    </ListView>
  ))
  .add('long text', args => (
    <ListView width="250px" {...args}>
      <Item textValue="Homeward Bound: The Incredible Journey">Homeward Bound: The Incredible Journey</Item>
      <Item textValue="Monsters University">
        <Text>Monsters University</Text>
        <Text slot="description">As a first grader, Mike Wazowski begins to dream of becoming a Scarer</Text>
      </Item>
    </ListView>
  ));

storiesOf('ListView/Actions', module)
  .addParameters(parameters)
  .add('ActionButton', (args) =>
    renderActionsExample(props => <ActionButton {...props}><Copy /></ActionButton>, args))
  .add('ActionGroup', args =>
    renderActionsExample(() => (
      <ActionGroup buttonLabelBehavior="hide" onAction={action('actionGroupAction')}>
        <Item key="add">
          <Add />
          <Text>Add</Text>
        </Item>
        <Item key="delete">
          <Delete />
          <Text>Delete</Text>
        </Item>
      </ActionGroup>
    ), args))
  .add('ActionMenu', args =>
    renderActionsExample(() => (
      <ActionMenu onAction={action('actionMenuAction')}>
        <Item key="add">
          <Add />
          <Text>Add</Text>
        </Item>
        <Item key="delete">
          <Delete />
          <Text>Delete</Text>
        </Item>
      </ActionMenu>
    ), args))
  .add('ActionGroup + ActionMenu', args =>
    renderActionsExample(() => (
      <>
        <ActionGroup buttonLabelBehavior="hide" onAction={action('actionGroupAction')}>
          <Item key="info">
            <Info />
            <Text>Info</Text>
          </Item>
        </ActionGroup>
        <ActionMenu onAction={action('actionMenuACtion')}>
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
    ), args));

storiesOf('ListView/Selection', module)
  .addParameters(parameters)
  .add('default', args => (
    <ListView aria-label="default selection ListView" width="250px" height={400} onSelectionChange={action('onSelectionChange')} items={items} {...args}>
      {(item: any) => (
        <Item textValue={item.name}>
          {item.type === 'folder' ? <Folder /> : null}
          <Text>{item.name}</Text>
        </Item>
      )}
    </ListView>
  ))
  .add('disable folders', args => (
    <ListView aria-label="disabled folders ListView" width="250px" height={400} onSelectionChange={action('onSelectionChange')} items={items} disabledKeys={['c', 'e', 'm']} {...args}>
      {(item: any) => (
        <Item textValue={item.name}>
          {item.type === 'folder' ? <Folder /> : null}
          <Text>{item.name}</Text>
        </Item>
      )}
    </ListView>
  ))
  .add('disable folder selection', args => (
    <ListView aria-label="disabled folder selection ListView" width="250px" height={400} onSelectionChange={action('onSelectionChange')} items={items} disabledKeys={['c', 'e', 'm']} disabledBehavior="selection" {...args}>
      {(item: any) => (
        <Item textValue={item.name}>
          {item.type === 'folder' ? <Folder /> : null}
          <Text>{item.name}</Text>
          <ActionMenu>
            <Item key="add">
              <Add />
              <Text>Add</Text>
            </Item>
            <Item key="delete">
              <Delete />
              <Text>Delete</Text>
            </Item>
          </ActionMenu>
        </Item>
      )}
    </ListView>
  ))
  .add('onAction', args => (
    <NavigationExample {...args} />
  ))
  .add('onAction, disable folder selection', args => (
    <NavigationExample disabledType="folder" disabledBehavior="selection" {...args} />
  ))
  .add('onAction, disable folder selection, with row actions', args => (
    <NavigationExample disabledType="folder" disabledBehavior="selection" showActions {...args} />
  ))
  .add('onAction, disable files', args => (
    <NavigationExample disabledType="file" {...args} />
  ))
  .add('onAction, disable files, with row actions', args => (
    <NavigationExample disabledType="file" showActions {...args} />
  ));

storiesOf('ListView/Drag and Drop', module)
  .addParameters(parameters)
  .add(
    'Drag out of list',
    args => (
      <Flex direction="row" wrap alignItems="center">
        <input />
        <Droppable />
        <DragExample
          dragHookOptions={{onDragStart: action('dragStart'), onDragEnd: action('dragEnd')}}
          listViewProps={args} />
      </Flex>
    )
  )
  .add(
    'Drag within list (Reorder)',
    args => (
      <Flex direction="row" wrap alignItems="center">
        <ReorderExample {...args} disabledKeys={['1']} onDrop={action('drop')} onDragStart={action('dragStart')} onDragEnd={action('dragEnd')} />
      </Flex>
    )
  )
  .add(
    'Drag into folder',
    args => (
      <Flex direction="row" wrap alignItems="center">
        <DragIntoItemExample listViewProps={args} />
      </Flex>
    )
  )
  .add(
    'Drag between lists',
    args => (
      <Flex direction="row" wrap alignItems="center">
        <DragBetweenListsExample {...args} />
      </Flex>
    )
  )
  .add(
    'Drag between lists (Root only)',
    args => (
      <Flex direction="row" wrap alignItems="center">
        <DragBetweenListsRootOnlyExample listViewProps={args} />
      </Flex>
    ), {description: {data: 'Folders are non-draggable.'}}
  )
  .add(
    'draggable rows, onAction',
    args => (
      <Flex direction="row" wrap alignItems="center">
        <input />
        <Droppable />
        <DragExample listViewProps={{onAction: action('onAction'), ...args}} dragHookOptions={{onDragStart: action('dragStart'), onDragEnd: action('dragEnd')}} />
      </Flex>
    ), {description: {data: 'Folders are non-draggable.'}}
  )
  .add(
    'draggable rows, allow copy and link',
    args => (
      <Flex direction="row" wrap alignItems="center">
        <input />
        <Droppable />
        <DragExample listViewProps={{onAction: action('onAction'), ...args}} dragHookOptions={{onDragStart: action('dragStart'), onDragEnd: action('dragEnd'), getAllowedDropOperations: () => { getAllowedDropOperationsAction(); return ['copy', 'link', 'cancel'];}}} />
      </Flex>
    ), {description: {data: 'Allows copy, link, and cancel operations. Copy should be the default operation, and link should be the operation when the CTRL key is held while dragging.'}}
  );

storiesOf('ListView/Drag and Drop/Util Handlers', module)
  .addParameters(parameters)
  .add(
    'drag out of list',
    args => (
      <Flex direction="row" wrap alignItems="center">
        <input />
        <Droppable />
        <DragExampleUtilHandlers listViewProps={args} dndOptions={{onDragStart: action('dragStart'), onDragEnd: action('dragEnd')}} />
      </Flex>
    )
  )
  .add(
    'drag within list (reorder)',
    args => (
      <ReorderExampleUtilHandlers listViewProps={args} dndOptions={{onDragStart: action('dragStart'), onDragEnd: action('dragEnd')}} />
    )
  )
  .add(
    'drop onto item/folder',
    args => (
      <ItemDropExampleUtilHandlers listViewProps={args} dndOptions={{onDragStart: action('dragStart'), onDragEnd: action('dragEnd')}} />
    ), {description: {data: 'Allows dropping on items and folders. Dropping on a item is a no op (action fires still). Dropping external items is also a no op'}}
  )
  .add(
    'drop onto root',
    args => (
      <RootDropExampleUtilHandlers listViewProps={args} firstListDnDOptions={{onDragStart: action('dragStart')}} />
    ), {description: {data: 'Allows one way dragging from first list to root of second list. Copy and link operations shouldnt remove items from the first list'}}
  )
  .add(
    'drop between items',
    args => (
      <InsertExampleUtilHandlers listViewProps={args} firstListDnDOptions={{onDragStart: action('dragStart')}} />
    ), {description: {data: 'Allows one way dragging from first list to between items of second list. Copy and link operations shouldnt remove items from the first list'}}
  )
  .add(
    'allows directories and files from finder',
    args => (
      <FinderDropUtilHandlers listViewProps={args} />
    ), {description: {data: 'The first list should allow only directory drops. The second list should allow all drag type drops (directory, files).'}}
  )
  .add(
    'complex drag between lists',
    args => (
      <DragBetweenListsComplex
        listViewProps={args}
        firstListDnDOptions={{
          onDragStart: action('dragStartList1')
        }}
        secondListDnDOptions={{
          onDragStart: action('dragStartList2')
        }} />
    ), {description: {data: 'The first list should allow dragging and drops into its folder, but disallow reorder operations. External root drops should be placed at the end of the list. The second list should allow all operations and root drops should be placed at the top of the list. Move and copy operations are allowed. The invalid drag item should be able to be dropped in either list if accompanied by other valid drag items.'}}
  )
  .add(
    'util handlers overridden by onDrop and getDropOperations',
    args => <DragBetweenListsOverride {...args} />,
    {description: {data: 'The first list should be draggable, the second list should only be root droppable. No actions for onRootDrop, onReorder, onItemDrop, or onInsert should appear in the storybook actions panel.'}}
  );

function renderActionsExample(renderActions, props?) {
  return (
    <ListView width="300px" selectionMode="single" {...props} onAction={action('onAction')} onSelectionChange={action('onSelectionChange')} aria-label="render actions ListView">
      <Item key="a" textValue="Utilities" hasChildItems>
        <Folder />
        <Text>Utilities</Text>
        <Text slot="description">16 items</Text>
        {renderActions({onPress: action('actionPress')})}
      </Item>
      <Item key="b" textValue="Adobe Photoshop">
        <Text>Adobe Photoshop</Text>
        <Text slot="description">Application</Text>
        {renderActions({onPress: action('actionPress')})}
      </Item>
      <Item key="c" textValue="Adobe Illustrator">
        <Text>Adobe Illustrator</Text>
        <Text slot="description">Application</Text>
        {renderActions({onPress: action('actionPress')})}
      </Item>
      <Item key="d" textValue="Adobe XD">
        <Text>Adobe XD</Text>
        <Text slot="description">Application</Text>
        {renderActions({onPress: action('actionPress')})}
      </Item>
    </ListView>
  );
}

function NavigationExample(props) {
  let [selectedKeys, setSelectedKeys] = useState(new Set());
  let [breadcrumbs, setBreadcrumbs] = useState([
    {
      key: 'root',
      name: 'Root',
      type: 'folder',
      children: items
    }
  ]);

  let {name, children} = breadcrumbs[breadcrumbs.length - 1];

  let onAction = key => {
    let item = children.find(item => item.key === key);
    if (item.type === 'folder') {
      setBreadcrumbs([...breadcrumbs, item]);
      setSelectedKeys(new Set());
    }
  };

  let onBreadcrumbAction = key => {
    let index = breadcrumbs.findIndex(item => item.key === key);
    setBreadcrumbs(breadcrumbs.slice(0, index + 1));
    setSelectedKeys(new Set());
  };

  return (
    <div>
      <Breadcrumbs onAction={onBreadcrumbAction}>
        {breadcrumbs.map(item => <Item key={item.key}>{item.name}</Item>)}
      </Breadcrumbs>
      <ListView
        aria-label={name}
        width="250px"
        height={400}
        onSelectionChange={chain(setSelectedKeys, action('onSelectionChange'))}
        selectionMode="multiple"
        selectionStyle="checkbox"
        selectedKeys={selectedKeys}
        items={children}
        disabledKeys={props.disabledType ? children.filter(item => item.type === props.disabledType).map(item => item.key) : null}
        onAction={chain(onAction, action('onAction'))}
        {...props}>
        {(item: any) => (
          <Item hasChildItems={item.type === 'folder'} textValue={item.name}>
            {item.type === 'folder' ? <Folder /> : null}
            <Text>{item.name}</Text>
            {props.showActions &&
              <ActionMenu>
                <Item key="add">
                  <Add />
                  <Text>Add</Text>
                </Item>
                <Item key="delete">
                  <Delete />
                  <Text>Delete</Text>
                </Item>
              </ActionMenu>
            }
          </Item>
        )}
      </ListView>
    </div>
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
          <ListView aria-label="render empty state ListView" items={items} width="250px" height={hasDivProps ? null : '500px'} renderEmptyState={renderEmpty}>
            {
              item => (
                <Item key={item.key}>
                  {item.name}
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

  let {dndHooks} = useDnDHooks({
    getItems,
    getAllowedDropOperations() {
      getAllowedDropOperationsAction();
      return ['move', 'cancel'];
    },
    ...dragHookOptions
  });

  return (
    <ListView
      aria-label="draggable list view"
      width="300px"
      selectionMode="multiple"
      items={items}
      disabledKeys={['f']}
      dndHooks={dndHooks}
      {...listViewProps}>
      {(item: any) => (
        <Item key={item.key} textValue={item.name} hasChildItems={item.type === 'folder'}>
          {item.type === 'folder' && <Folder />}
          {item.key === 'a' && <File />}
          <Text>
            {item.name}
          </Text>
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

let itemList1 = [
  {id: '1', type: 'item', textValue: 'Item One'},
  {id: '2', type: 'item', textValue: 'Item Two'},
  {id: '3', type: 'item', textValue: 'Item Three'},
  {id: '4', type: 'item', textValue: 'Item Four'},
  {id: '5', type: 'item', textValue: 'Item Five'},
  {id: '6', type: 'item', textValue: 'Item Six'}
];

let itemList2 = [
  {id: '7', type: 'item', textValue: 'Item Seven'},
  {id: '8', type: 'item', textValue: 'Item Eight'},
  {id: '9', type: 'item', textValue: 'Item Nine'},
  {id: '10', type: 'item', textValue: 'Item Ten'},
  {id: '11', type: 'item', textValue: 'Item Eleven'},
  {id: '12', type: 'item', textValue: 'Item Twelve'}
];

export function ReorderExample(props) {
  let {onDrop, onDragStart, onDragEnd, disabledKeys = ['2'], ...otherprops} = props;
  let list = useListData({
    initialItems: props.items || itemList1
  });

  // Use a random drag type so the items can only be reordered within this list and not dragged elsewhere.
  let dragType = React.useMemo(() => `keys-${Math.random().toString(36).slice(2)}`, []);

  let onMove = (keys: React.Key[], target: ItemDropTarget) => {
    if (target.dropPosition === 'before') {
      list.moveBefore(target.key, keys);
    } else {
      list.moveAfter(target.key, keys);
    }
  };

  let {dndHooks} = useDnDHooks({
    getItems(keys) {
      return [...keys].map(key => {
        key = JSON.stringify(key);
        return {
          [dragType]: key,
          'text/plain': key
        };
      });
    },
    getAllowedDropOperations() {
      getAllowedDropOperationsAction();
      return ['move', 'cancel'];
    },
    onDragStart: onDragStart,
    onDragEnd: onDragEnd,
    async onDrop(e) {
      onDrop(e);
      if (e.target.type !== 'root' && e.target.dropPosition !== 'on') {
        let keys = [];
        for (let item of e.items) {
          if (item.kind === 'text') {
            let key;
            if (item.types.has(dragType)) {
              key = JSON.parse(await item.getText(dragType));
              keys.push(key);
            } else if (item.types.has('text/plain')) {
              // Fallback for Chrome Android case: https://bugs.chromium.org/p/chromium/issues/detail?id=1293803
              // Multiple drag items are contained in a single string so we need to split them out
              key = await item.getText('text/plain');
              keys = key.split('\n').map(val => val.replaceAll('"', ''));
            }
          }
        }
        onMove(keys, e.target);
      }
    },
    getDropOperation(target) {
      if (target.type === 'root' || target.dropPosition === 'on') {
        return 'cancel';
      }

      return 'move';
    }
  });


  return (
    <ListView
      aria-label="reorderable list view"
      selectionMode="multiple"
      width="300px"
      items={list.items}
      disabledKeys={disabledKeys}
      dndHooks={dndHooks}
      {...otherprops}>
      {(item: any) => (
        <Item>
          {item.textValue}
        </Item>
      )}
    </ListView>
  );
}

export function DragIntoItemExample(props) {
  let {
    listViewProps = {},
    dragHookOptions = {},
    dropHookOptions = {}
  } = props;
  let {onDragStart, onDragEnd} = dragHookOptions;
  let {onDrop} = dropHookOptions;
  let onDropAction = chain(action('onDrop'), onDrop);
  let getAllowedDropOperationsAction = action('getAllowedDropOperations');

  let list = useListData({
    initialItems: [
      {id: '0', type: 'folder', textValue: 'Folder 1', childNodes: []},
      {id: '1', type: 'item', textValue: 'One'},
      {id: '2', type: 'item', textValue: 'Two'},
      {id: '3', type: 'item', textValue: 'Three'},
      {id: '4', type: 'item', textValue: 'Four'},
      {id: '5', type: 'item', textValue: 'Five'},
      {id: '6', type: 'item', textValue: 'Six'},
      {id: '7', type: 'folder', textValue: 'Folder disabled', childNodes: []},
      {id: '8', type: 'folder', textValue: 'Folder 2', childNodes: []}
    ]
  });
  let disabledKeys: React.Key[] = ['2', '7'];

  // Use a random drag type so the items can only be reordered within this list and not dragged elsewhere.
  let dragType = React.useMemo(() => `keys-${Math.random().toString(36).slice(2)}`, []);

  let onMove = (keys: React.Key[], target: ItemDropTarget) => {
    let folderItem = list.getItem(target.key);
    let draggedItems = keys.map((key) => list.getItem(key));
    list.update(target.key, {...folderItem, childNodes: [...folderItem.childNodes, ...draggedItems]});
    list.remove(...keys);
  };

  let {dndHooks} = useDnDHooks({
    getItems(keys) {
      return [...keys].map(key => {
        key = JSON.stringify(key);
        return {
          [dragType]: key,
          'text/plain': key
        };
      });
    },
    getAllowedDropOperations() {
      getAllowedDropOperationsAction();
      return ['move', 'cancel'];
    },
    onDragStart: chain(action('dragStart'), onDragStart),
    onDragEnd: chain(action('dragEnd'), onDragEnd),
    onDrop: async e => {
      onDropAction(e);
      if (e.target.type !== 'root' && e.target.dropPosition === 'on') {
        let keys = [];
        for (let item of e.items) {
          if (item.kind === 'text') {
            let key;
            if (item.types.has(dragType)) {
              key = JSON.parse(await item.getText(dragType));
              keys.push(key);
            } else if (item.types.has('text/plain')) {
              // Fallback for Chrome Android case: https://bugs.chromium.org/p/chromium/issues/detail?id=1293803
              // Multiple drag items are contained in a single string so we need to split them out
              key = await item.getText('text/plain');
              keys = key.split('\n').map(val => val.replaceAll('"', ''));
            }
          }
        }
        if (!keys.includes(e.target.key)) {
          onMove(keys, e.target);
        }
      }
    },
    getDropOperation(target) {
      if (target.type === 'root' || target.dropPosition !== 'on' || !list.getItem(target.key).childNodes || disabledKeys.includes(target.key)) {
        return 'cancel';
      }

      return 'move';
    }
  });

  return (
    <ListView
      aria-label="Drop into list view item example"
      selectionMode="multiple"
      width="300px"
      items={list.items}
      disabledKeys={disabledKeys}
      dndHooks={dndHooks}
      {...listViewProps}>
      {(item: any) => (
        <Item textValue={item.textValue} hasChildItems={item.type === 'folder'}>
          <Text>{item.type === 'folder' ? `${item.textValue} (Drop items here)` : `Item ${item.textValue}`}</Text>
          {item.type === 'folder' &&
            <>
              <Folder />
              <Text slot="description">{`contains ${item.childNodes.length} dropped item(s)`}</Text>
            </>
          }
        </Item>
      )}
    </ListView>
  );
}

export function DragBetweenListsExample(props) {
  let {onDragStart, onDragEnd, onDrop} = props;
  let onDropAction = chain(action('onDrop'), onDrop);
  onDragStart = chain(action('dragStart'), onDragStart);
  onDragEnd = chain(action('dragEnd'), onDragEnd);

  let list1 = useListData({
    initialItems: props.items1 || itemList1
  });

  let list2 = useListData({
    initialItems: props.items2 || itemList2
  });

  let onMove = (keys: React.Key[], target: ItemDropTarget) => {
    let sourceList = list1.getItem(keys[0]) ? list1 : list2;
    let destinationList = list1.getItem(target.key) ? list1 : list2;

    if (sourceList === destinationList) {
        // Handle dragging within same list
      if (target.dropPosition === 'before') {
        sourceList.moveBefore(target.key, keys);
      } else {
        sourceList.moveAfter(target.key, keys);
      }
    } else {
      // Handle dragging between lists
      if (target.dropPosition === 'before') {
        destinationList.insertBefore(target.key, ...keys.map(key => sourceList.getItem(key)));
      } else {
        destinationList.insertAfter(target.key, ...keys.map(key => sourceList.getItem(key)));
      }
      sourceList.remove(...keys);
    }
  };

  // Use a random drag type so the items can only be reordered within the two lists and not dragged elsewhere.
  let dragType = React.useMemo(() => `keys-${Math.random().toString(36).slice(2)}`, []);

  let {dndHooks} = useDnDHooks({
    getItems(keys) {
      return [...keys].map(key => {
        key = JSON.stringify(key);
        return {
          [dragType]: key,
          'text/plain': key
        };
      });
    },
    getAllowedDropOperations() {
      getAllowedDropOperationsAction();
      return ['move', 'cancel'];
    },
    onDragStart,
    onDragEnd,
    onDrop: async e => {
      onDropAction(e);
      if (e.target.type !== 'root' && e.target.dropPosition !== 'on') {
        let keys = [];
        for (let item of e.items) {
          if (item.kind === 'text') {
            let key;
            if (item.types.has(dragType)) {
              key = JSON.parse(await item.getText(dragType));
              keys.push(key);
            } else if (item.types.has('text/plain')) {
              // Fallback for Chrome Android case: https://bugs.chromium.org/p/chromium/issues/detail?id=1293803
              // Multiple drag items are contained in a single string so we need to split them out
              key = await item.getText('text/plain');
              keys = key.split('\n').map(val => val.replaceAll('"', ''));
            }
          }
        }
        onMove(keys, e.target);
      }
    },
    getDropOperation(target) {
      if (target.type === 'root' || target.dropPosition === 'on') {
        return 'cancel';
      }

      return 'move';
    }
  });

  return (
    <>
      <Flex direction="column" margin="size-100">
        <Text alignSelf="center">List 1</Text>
        <ListView
          aria-label="First list view"
          selectionMode="multiple"
          width="300px"
          items={list1.items}
          disabledKeys={['2']}
          dndHooks={dndHooks}
          {...props}>
          {(item: any) => (
            <Item>
              {item.textValue}
            </Item>
        )}
        </ListView>
      </Flex>
      <Flex direction="column" margin="size-100">
        <Text alignSelf="center">List 2</Text>
        <ListView
          aria-label="Second list view"
          selectionMode="multiple"
          width="300px"
          items={list2.items}
          disabledKeys={['2']}
          dndHooks={dndHooks}
          {...props}>
          {(item: any) => (
            <Item>
              {item.textValue}
            </Item>
        )}
        </ListView>
      </Flex>
    </>
  );
}

export function DragBetweenListsRootOnlyExample(props) {
  let {
    listViewProps = {},
    dragHookOptions = {},
    dropHookOptions = {}
  } = props;
  let {onDragStart, onDragEnd} = dragHookOptions;
  let {onDrop} = dropHookOptions;
  let onDropAction = chain(action('onDrop'), onDrop);

  let list1 = useListData({
    initialItems: props.items1 || itemList1
  });

  let list2 = useListData({
    initialItems: props.items2 || itemList2
  });

  let onMove = (keys: React.Key[], destinationList) => {
    let sourceList = list1.getItem(keys[0]) ? list1 : list2;

    let items = keys.map(key => sourceList.getItem(key));
    sourceList.remove(...keys);
    destinationList.append(...items);
  };

  let {dndHooks: dndHooksFirst} = useDnDHooks({
    getItems(keys) {
      return [...keys].map(key => {
        key = JSON.stringify(key);
        return {
          'list1': key,
          'text/plain': key
        };
      });
    },
    getAllowedDropOperations() {
      getAllowedDropOperationsAction();
      return ['move', 'cancel'];
    },
    onDragStart: chain(action('dragStart'), onDragStart),
    onDragEnd: chain(action('dragEnd'), onDragEnd),
    onDrop: async e => {
      onDropAction(e);
      if (e.target.type === 'root') {
        let keys = [];
        for (let item of e.items) {
          if (item.kind === 'text') {
            let key;
            if (item.types.has('list2')) {
              key = JSON.parse(await item.getText('list2'));
              keys.push(key);
            } else if (item.types.has('text/plain')) {
              // Fallback for Chrome Android case: https://bugs.chromium.org/p/chromium/issues/detail?id=1293803
              // Multiple drag items are contained in a single string so we need to split them out
              key = await item.getText('text/plain');
              keys = key.split('\n').map(val => val.replaceAll('"', ''));
            }
          }
        }
        onMove(keys, list1);
      }
    },
    getDropOperation(target, types) {
      if (target.type === 'root' && (types.has('list2') || types.has('text/plain'))) {
        return 'move';
      }

      return 'cancel';
    }
  });

  let {dndHooks: dndHooksSecond} = useDnDHooks({
    getItems(keys) {
      return [...keys].map(key => {
        key = JSON.stringify(key);
        return {
          'list2': key,
          'text/plain': key
        };
      });
    },
    getAllowedDropOperations() {
      getAllowedDropOperationsAction();
      return ['move', 'cancel'];
    },
    onDragStart: chain(action('dragStart'), onDragStart),
    onDragEnd: chain(action('dragEnd'), onDragEnd),
    onDrop: async e => {
      onDropAction(e);
      if (e.target.type === 'root') {
        let keys = [];
        for (let item of e.items) {
          if (item.kind === 'text') {
            let key;
            if (item.types.has('list1')) {
              key = JSON.parse(await item.getText('list1'));
              keys.push(key);
            } else if (item.types.has('text/plain')) {
              // Fallback for Chrome Android case: https://bugs.chromium.org/p/chromium/issues/detail?id=1293803
              // Multiple drag items are contained in a single string so we need to split them out
              key = await item.getText('text/plain');
              keys = key.split('\n').map(val => val.replaceAll('"', ''));
            }
          }
        }
        onMove(keys, list2);
      }
    },
    getDropOperation(target, types) {
      if (target.type === 'root' && (types.has('list1') || types.has('text/plain'))) {
        return 'move';
      }

      return 'cancel';
    }
  });

  return (
    <>
      <Flex direction="column" margin="size-100">
        <Text alignSelf="center">List 1</Text>
        <ListView
          aria-label="First list view"
          selectionMode="multiple"
          width="300px"
          items={list1.items}
          disabledKeys={['2']}
          dndHooks={dndHooksFirst}
          {...listViewProps}>
          {(item: any) => (
            <Item>
              {item.textValue}
            </Item>
        )}
        </ListView>
      </Flex>
      <Flex direction="column" margin="size-100">
        <Text alignSelf="center">List 2</Text>
        <ListView
          aria-label="Second list view"
          selectionMode="multiple"
          width="300px"
          items={list2.items}
          disabledKeys={['2']}
          dndHooks={dndHooksSecond}
          {...listViewProps}>
          {(item: any) => (
            <Item>
              {item.textValue}
            </Item>
        )}
        </ListView>
      </Flex>
    </>
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
      onLoadMore={list.loadMore}
      {...props}>
      {(item: any) => {
        if (props.withActions) {
          return <Item key={item.name} textValue={item.name}><Text>{item.name}</Text><ActionButton>Edit</ActionButton></Item>;
        }
        return <Item key={item.name} textValue={item.name}>{item.name}</Item>;
      }}
    </ListView>
  );
}

function FalsyIds(props) {
  let items = [
    {id: 1, name: 'key=1'},
    {id: 0, name: 'key=0'}
  ];

  return (
    <ListView aria-label="falsy id ListView" width="250px" height={400} selectionMode="multiple" onSelectionChange={action('onSelectionChange')} items={items} onAction={action('onAction')} {...props}>
      {(item: any) => <Item>{item.name}</Item>}
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
      <ListView {...props} selectedKeys={list.selectedKeys} onSelectionChange={list.setSelectedKeys} items={list.items} width="250px" aria-label="Action Bar ListView">
        {(item: any) => <Item>{item.name}</Item>}
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

// Util Handler stories
let itemProcessor = async (items, acceptedDragTypes) => {
  let processedItems = [];
  let text;
  for (let item of items) {
    for (let type of acceptedDragTypes) {
      if (item.kind === 'text' && item.types.has(type)) {
        text = await item.getText(type);
        processedItems.push(JSON.parse(text));
        break;
      } else if (item.types.size === 1 && item.types.has('text/plain')) {
        // Fallback for Chrome Android case: https://bugs.chromium.org/p/chromium/issues/detail?id=1293803
        // Multiple drag items are contained in a single string so we need to split them out
        text = await item.getText('text/plain');
        processedItems = text.split('\n').map(val => JSON.parse(val));
        break;
      }
    }
  }
  return processedItems;
};

let folderList1 = [
  {identifier: '1', type: 'file', name: 'Adobe Photoshop'},
  {identifier: '2', type: 'file', name: 'Adobe XD'},
  {identifier: '3', type: 'folder', name: 'Documents',  childNodes: []},
  {identifier: '4', type: 'file', name: 'Adobe InDesign'},
  {identifier: '5', type: 'folder', name: 'Utilities',  childNodes: []},
  {identifier: '6', type: 'file', name: 'Adobe AfterEffects'}
];

let folderList2 = [
  {identifier: '7', type: 'folder', name: 'Pictures',  childNodes: []},
  {identifier: '8', type: 'file', name: 'Adobe Fresco'},
  {identifier: '9', type: 'folder', name: 'Apps',  childNodes: []},
  {identifier: '10', type: 'file', name: 'Adobe Illustrator'},
  {identifier: '11', type: 'file', name: 'Adobe Lightroom'},
  {identifier: '12', type: 'file', name: 'Adobe Dreamweaver'},
  {identifier: '13', type: 'unique_type', name: 'invalid drag item'}
];

function DragExampleUtilHandlers(props) {
  let {listViewProps, dndOptions} = props;
  let list = useListData({
    initialItems: folderList1,
    getKey: (item) => item.identifier
  });

  let acceptedDragTypes = ['file', 'folder', 'text/plain'];
  let {dndHooks} = useDnDHooks({
    getItems: (keys) => [...keys].map(key => {
      let item = list.getItem(key);
      return {
        [`${item.type}`]: JSON.stringify(item),
        'text/plain': JSON.stringify(item)
      };
    }),
    acceptedDragTypes,
    ...dndOptions
  });

  return (
    <ListView
      aria-label="Draggable ListView with dnd hook util handlers"
      selectionMode="multiple"
      width="size-3600"
      height="size-3600"
      items={list.items}
      {...listViewProps}
      dndHooks={dndHooks}>
      {(item: any) => (
        <Item textValue={item.name} key={item.identifier}>
          <Text>{item.name}</Text>
          {item.type === 'folder' &&
            <>
              <Folder />
              <Text slot="description">{`contains ${item.childNodes.length} dropped item(s)`}</Text>
            </>
          }
        </Item>
      )}
    </ListView>
  );
}

function ReorderExampleUtilHandlers(props) {
  let {listViewProps, dndOptions} = props;
  let list = useListData({
    initialItems: folderList1,
    getKey: (item) => item.identifier
  });

  let acceptedDragTypes = ['file', 'folder', 'text/plain'];
  let {dndHooks} = useDnDHooks({
    getItems: (keys) => [...keys].map(key => {
      let item = list.getItem(key);
      return {
        [`${item.type}`]: JSON.stringify(item),
        'text/plain': JSON.stringify(item)
      };
    }),
    onReorder: async (e) => {
      let {
        keys,
        target,
        dropOperation
      } = e;
      action('onReorder')(e);

      let itemsToCopy = [];
      if (dropOperation === 'copy') {
        for (let key of keys) {
          let item = {...list.getItem(key)};
          item.identifier = Math.random().toString(36).slice(2);
          itemsToCopy.push(item);
        }
      }

      if (target.dropPosition === 'before') {
        if (dropOperation === 'move') {
          list.moveBefore(target.key, [...keys]);
        } else if (dropOperation === 'copy') {
          list.insertBefore(target.key, ...itemsToCopy);
        }
      } else if (target.dropPosition === 'after') {
        if (dropOperation === 'move') {
          list.moveAfter(target.key, [...keys]);
        } else if (dropOperation === 'copy') {
          list.insertAfter(target.key, ...itemsToCopy);
        }
      }
    },
    acceptedDragTypes,
    ...dndOptions
  });

  return (
    <ListView
      aria-label="Reorderable ListView from util handlers"
      selectionMode="multiple"
      width="size-3600"
      height="size-3600"
      items={list.items}
      {...listViewProps}
      dndHooks={dndHooks}>
      {(item: any) => (
        <Item textValue={item.name} key={item.identifier}>
          <Text>{item.name}</Text>
          {item.type === 'folder' &&
            <>
              <Folder />
              <Text slot="description">{`contains ${item.childNodes.length} dropped item(s)`}</Text>
            </>
          }
        </Item>
      )}
    </ListView>
  );
}

function ItemDropExampleUtilHandlers(props) {
  let {listViewProps, dndOptions} = props;
  let list = useListData({
    initialItems: folderList1,
    getKey: (item) => item.identifier
  });

  let acceptedDragTypes = ['file', 'folder', 'text/plain'];
  let {dndHooks} = useDnDHooks({
    getItems: (keys) => [...keys].map(key => {
      let item = list.getItem(key);
      return {
        [`${item.type}`]: JSON.stringify(item),
        'text/plain': JSON.stringify(item)
      };
    }),
    onItemDrop: async (e) => {
      let {
        items,
        target,
        isInternalDrop,
        dropOperation
      } = e;
      action('onItemDrop')(e);
      if (isInternalDrop) {
        let processedItems = await itemProcessor(items, acceptedDragTypes);
        let targetItem = list.getItem(target.key);
        if (targetItem?.childNodes != null) {
          list.update(target.key, {...targetItem, childNodes: [...targetItem.childNodes, ...processedItems]});
          if (isInternalDrop && dropOperation === 'move') {
            let keysToRemove = processedItems.map(item => item.identifier);
            list.remove(...keysToRemove);
          }
        }
      }
    },
    acceptedDragTypes,
    ...dndOptions
  });

  return (
    <ListView
      aria-label="Item and folder droppable ListView from dnd hook util handlers"
      selectionMode="multiple"
      width="size-3600"
      height="size-3600"
      items={list.items}
      {...listViewProps}
      dndHooks={dndHooks}>
      {(item: any) => (
        <Item textValue={item.name} key={item.identifier}>
          <Text>{item.name}</Text>
          {item.type === 'folder' &&
            <>
              <Folder />
              <Text slot="description">{`contains ${item.childNodes.length} dropped item(s)`}</Text>
            </>
          }
        </Item>
      )}
    </ListView>
  );
}

function RootDropExampleUtilHandlers(props) {
  let {listViewProps, firstListDnDOptions, secondListDnDOptions} = props;
  let list1 = useListData({
    initialItems: folderList1,
    getKey: (item) => item.identifier
  });
  let list2 = useListData({
    initialItems: folderList2,
    getKey: (item) => item.identifier
  });

  let acceptedDragTypes = ['file', 'folder', 'text/plain'];
  let {dndHooks: list1Hooks} = useDnDHooks({
    getItems: (keys) => [...keys].map(key => {
      let item = list1.getItem(key);
      return {
        [`${item.type}`]: JSON.stringify(item),
        'text/plain': JSON.stringify(item)
      };
    }),
    onDragEnd: (e) => {
      let {
        dropOperation,
        isInternalDrop,
        keys
      } = e;
      action('onDragEnd')(e);
      if (dropOperation === 'move' && !isInternalDrop) {
        list1.remove(...keys);
      }
    },
    acceptedDragTypes,
    ...firstListDnDOptions
  });

  let {dndHooks: list2Hooks} = useDnDHooks({
    onRootDrop: async (e) => {
      action('onRootDropList1')(e);
      let processedItems = await itemProcessor(e.items, acceptedDragTypes);
      list2.append(...processedItems);
    },
    acceptedDragTypes,
    ...secondListDnDOptions
  });

  return (
    <Flex wrap gap="size-300">
      <ListView
        aria-label="Draggable ListView"
        selectionMode="multiple"
        width="size-3600"
        height="size-3600"
        items={list1.items}
        {...listViewProps}
        dndHooks={list1Hooks}>
        {(item: any) => (
          <Item textValue={item.name} key={item.identifier}>
            <Text>{item.name}</Text>
            {item.type === 'folder' &&
              <>
                <Folder />
                <Text slot="description">{`contains ${item.childNodes.length} dropped item(s)`}</Text>
              </>
            }
          </Item>
        )}
      </ListView>
      <ListView
        aria-label="Root droppable ListView from dnd hook util handlers"
        selectionMode="multiple"
        width="size-3600"
        height="size-3600"
        items={list2.items}
        {...listViewProps}
        dndHooks={list2Hooks}>
        {(item: any) => (
          <Item textValue={item.name} key={item.identifier}>
            <Text>{item.name}</Text>
            {item.type === 'folder' &&
              <>
                <Folder />
                <Text slot="description">{`contains ${item.childNodes.length} dropped item(s)`}</Text>
              </>
            }
          </Item>
        )}
      </ListView>
    </Flex>
  );
}

function InsertExampleUtilHandlers(props) {
  let {listViewProps, firstListDnDOptions, secondListDnDOptions} = props;
  let list1 = useListData({
    initialItems: folderList1,
    getKey: (item) => item.identifier
  });
  let list2 = useListData({
    initialItems: folderList2,
    getKey: (item) => item.identifier
  });

  let acceptedDragTypes = ['file', 'folder', 'text/plain'];
  let {dndHooks: list1Hooks} = useDnDHooks({
    getItems: (keys) => [...keys].map(key => {
      let item = list1.getItem(key);
      return {
        [`${item.type}`]: JSON.stringify(item),
        'text/plain': JSON.stringify(item)
      };
    }),
    onDragEnd: (e) => {
      let {
        dropOperation,
        isInternalDrop,
        keys
      } = e;
      action('onDragEnd')(e);
      if (dropOperation === 'move' && !isInternalDrop) {
        list1.remove(...keys);
      }
    },
    acceptedDragTypes,
    ...firstListDnDOptions
  });

  let {dndHooks: list2Hooks} = useDnDHooks({
    onInsert: async (e) => {
      let {
        items,
        target
      } = e;
      action('onInsertList2')(e);
      let processedItems = await itemProcessor(items, acceptedDragTypes);

      if (target.dropPosition === 'before') {
        list2.insertBefore(target.key, ...processedItems);
      } else if (target.dropPosition === 'after') {
        list2.insertAfter(target.key, ...processedItems);
      }
    },
    acceptedDragTypes,
    ...secondListDnDOptions
  });

  return (
    <Flex wrap gap="size-300">
      <ListView
        aria-label="Draggable ListView"
        selectionMode="multiple"
        width="size-3600"
        height="size-3600"
        items={list1.items}
        {...listViewProps}
        dndHooks={list1Hooks}>
        {(item: any) => (
          <Item textValue={item.name} key={item.identifier}>
            <Text>{item.name}</Text>
            {item.type === 'folder' &&
              <>
                <Folder />
                <Text slot="description">{`contains ${item.childNodes.length} dropped item(s)`}</Text>
              </>
            }
          </Item>
        )}
      </ListView>
      <ListView
        aria-label="Insert droppable ListView from dnd hook util handlers"
        selectionMode="multiple"
        width="size-3600"
        height="size-3600"
        items={list2.items}
        {...listViewProps}
        dndHooks={list2Hooks}>
        {(item: any) => (
          <Item textValue={item.name} key={item.identifier}>
            <Text>{item.name}</Text>
            {item.type === 'folder' &&
              <>
                <Folder />
                <Text slot="description">{`contains ${item.childNodes.length} dropped item(s)`}</Text>
              </>
            }
          </Item>
        )}
      </ListView>
    </Flex>
  );
}

function FinderDropUtilHandlers(props) {
  let {listViewProps, firstListDnDOptions, secondListDnDOptions} = props;
  let list1 = useListData({
    initialItems: folderList1,
    getKey: (item) => item.identifier
  });
  let list2 = useListData({
    initialItems: folderList2,
    getKey: (item) => item.identifier
  });

  let {dndHooks: list1Hooks} = useDnDHooks({
    acceptedDragTypes: ['directory'],
    onInsert: async (e) => {
      action('onInsertList1')(e);
    },
    onItemDrop: async (e) => {
      action('onItemDropList1')(e);
    },
    ...firstListDnDOptions
  });

  let {dndHooks: list2Hooks} = useDnDHooks({
    onInsert: async (e) => {
      action('onInsertList2')(e);
    },
    onItemDrop: async (e) => {
      action('onItemDropList2')(e);
    },
    acceptedDragTypes: 'all',
    ...secondListDnDOptions
  });

  return (
    <Flex wrap gap="size-300">
      <ListView
        aria-label="ListView that accepts directory drops only"
        selectionMode="multiple"
        width="size-3600"
        height="size-3600"
        items={list1.items}
        {...listViewProps}
        dndHooks={list1Hooks}>
        {(item: any) => (
          <Item textValue={item.name} key={item.identifier}>
            <Text>{item.name}</Text>
            {item.type === 'folder' &&
              <>
                <Folder />
                <Text slot="description">{`contains ${item.childNodes.length} dropped item(s)`}</Text>
              </>
            }
          </Item>
        )}
      </ListView>
      <ListView
        aria-label="ListView that accepts all drag types"
        selectionMode="multiple"
        width="size-3600"
        height="size-3600"
        items={list2.items}
        {...listViewProps}
        dndHooks={list2Hooks}>
        {(item: any) => (
          <Item textValue={item.name} key={item.identifier}>
            <Text>{item.name}</Text>
            {item.type === 'folder' &&
              <>
                <Folder />
                <Text slot="description">{`contains ${item.childNodes.length} dropped item(s)`}</Text>
              </>
            }
          </Item>
        )}
      </ListView>
    </Flex>
  );
}

export function DragBetweenListsComplex(props) {
  let {listViewProps, firstListDnDOptions, secondListDnDOptions} = props;
  let list1 = useListData({
    initialItems: folderList1,
    getKey: (item) => item.identifier
  });

  let list2 = useListData({
    initialItems: folderList2,
    getKey: (item) => item.identifier
  });
  let acceptedDragTypes = ['file', 'folder', 'text/plain'];

  let itemProcessor = async (items, acceptedDragTypes) => {
    let processedItems = [];
    let text;
    for (let item of items) {
      for (let type of acceptedDragTypes) {
        // TODO: this logic will need to be updated for files/directories,
        if (item.kind === 'text' && item.types.has(type)) {
          text = await item.getText(type);
          processedItems.push(JSON.parse(text));
          break;
        } else if (item.types.size === 1 && item.types.has('text/plain')) {
          // Fallback for Chrome Android case: https://bugs.chromium.org/p/chromium/issues/detail?id=1293803
          // Multiple drag items are contained in a single string so we need to split them out
          text = await item.getText('text/plain');
          processedItems = text.split('\n').map(val => JSON.parse(val));
          break;
        }
      }
    }
    return processedItems;
  };

  // List 1 should allow on item drops and external drops, but disallow reordering/internal drops
  let {dndHooks: dndHooksList1} = useDnDHooks({
    getItems: (keys) => [...keys].map(key => {
      let item = list1.getItem(key);
      return {
        [`${item.type}`]: JSON.stringify(item),
        'text/plain': JSON.stringify(item)
      };
    }),
    onInsert: async (e) => {
      let {
        items,
        target
      } = e;
      action('onInsertList1')(e);
      let processedItems = await itemProcessor(items, acceptedDragTypes);

      if (target.dropPosition === 'before') {
        list1.insertBefore(target.key, ...processedItems);
      } else if (target.dropPosition === 'after') {
        list1.insertAfter(target.key, ...processedItems);
      }

    },
    onRootDrop: async (e) => {
      action('onRootDropList1')(e);
      let processedItems = await itemProcessor(e.items, acceptedDragTypes);
      list1.append(...processedItems);
    },
    onItemDrop: async (e) => {
      let {
        items,
        target,
        isInternalDrop,
        dropOperation
      } = e;
      action('onItemDropList1')(e);
      let processedItems = await itemProcessor(items, acceptedDragTypes);
      let targetItem = list1.getItem(target.key);
      list1.update(target.key, {...targetItem, childNodes: [...targetItem.childNodes, ...processedItems]});

      if (isInternalDrop && dropOperation === 'move') {
        // TODO test this, perhaps it would be easier to also pass the draggedKeys to onItemDrop instead?
        // TODO: dig into other libraries to see how they handle this
        let keysToRemove = processedItems.map(item => item.identifier);
        list1.remove(...keysToRemove);
      }
    },
    acceptedDragTypes,
    onDragEnd: (e) => {
      let {
        dropOperation,
        isInternalDrop,
        keys
      } = e;
      action('onDragEndList1')(e);
      if (dropOperation === 'move' && !isInternalDrop) {
        list1.remove(...keys);
      }
    },
    getAllowedDropOperations: () => ['move', 'copy'],
    shouldAcceptItemDrop: (target) => !!list1.getItem(target.key).childNodes,
    ...firstListDnDOptions
  });

  // List 2 should allow reordering, on folder drops, and on root drops
  let {dndHooks: dndHooksList2} = useDnDHooks({
    getItems: (keys) => [...keys].map(key => {
      let item = list2.getItem(key);
      let dragItem = {};
      let itemString = JSON.stringify(item);
      dragItem[`${item.type}`] = itemString;
      if (item.type !== 'unique_type') {
        dragItem['text/plain'] = itemString;
      }

      return dragItem;
    }),
    onInsert: async (e) => {
      let {
        items,
        target
      } = e;
      action('onInsertList2')(e);
      let processedItems = await itemProcessor(items, acceptedDragTypes);

      if (target.dropPosition === 'before') {
        list2.insertBefore(target.key, ...processedItems);
      } else if (target.dropPosition === 'after') {
        list2.insertAfter(target.key, ...processedItems);
      }
    },
    onReorder: async (e) => {
      let {
        keys,
        target,
        dropOperation
      } = e;
      action('onReorderList2')(e);

      let itemsToCopy = [];
      if (dropOperation === 'copy') {
        for (let key of keys) {
          let item = {...list2.getItem(key)};
          item.identifier = Math.random().toString(36).slice(2);
          itemsToCopy.push(item);
        }
      }

      if (target.dropPosition === 'before') {
        if (dropOperation === 'move') {
          list2.moveBefore(target.key, [...keys]);
        } else if (dropOperation === 'copy') {
          list2.insertBefore(target.key, ...itemsToCopy);
        }
      } else if (target.dropPosition === 'after') {
        if (dropOperation === 'move') {
          list2.moveAfter(target.key, [...keys]);
        } else if (dropOperation === 'copy') {
          list2.insertAfter(target.key, ...itemsToCopy);
        }
      }
    },
    onRootDrop: async (e) => {
      action('onRootDropList2')(e);
      let processedItems = await itemProcessor(e.items, acceptedDragTypes);
      list2.prepend(...processedItems);
    },
    onItemDrop: async (e) => {
      let {
        items,
        target,
        isInternalDrop,
        dropOperation
      } = e;
      action('onItemDropList2')(e);
      let processedItems = await itemProcessor(items, acceptedDragTypes);
      let targetItem = list2.getItem(target.key);
      list2.update(target.key, {...targetItem, childNodes: [...targetItem.childNodes, ...processedItems]});

      if (isInternalDrop && dropOperation === 'move') {
        let keysToRemove = processedItems.map(item => item.identifier);
        list2.remove(...keysToRemove);
      }
    },
    acceptedDragTypes,
    onDragEnd: (e) => {
      let {
        dropOperation,
        isInternalDrop,
        keys
      } = e;
      action('onDragEndList2')(e);
      if (dropOperation === 'move' && !isInternalDrop) {
        let keysToRemove = [...keys].filter(key => list2.getItem(key).type !== 'unique_type');
        list2.remove(...keysToRemove);
      }
    },
    getAllowedDropOperations: () => ['move', 'copy'],
    shouldAcceptItemDrop: (target) => !!list2.getItem(target.key).childNodes,
    ...secondListDnDOptions
  });


  return (
    <Flex wrap gap="size-300">
      <ListView
        aria-label="First ListView in drag between list example"
        selectionMode="multiple"
        width="size-3600"
        height="size-3600"
        items={list1.items}
        {...listViewProps}
        dndHooks={dndHooksList1}>
        {(item: any) => (
          <Item textValue={item.name} key={item.identifier}>
            <Text>{item.name}</Text>
            {item.type === 'folder' &&
              <>
                <Folder />
                <Text slot="description">{`contains ${item.childNodes.length} dropped item(s)`}</Text>
              </>
            }
          </Item>
        )}
      </ListView>
      <ListView
        aria-label="Second ListView in drag between list example"
        selectionMode="multiple"
        width="size-3600"
        height="size-3600"
        items={list2.items}
        {...listViewProps}
        dndHooks={dndHooksList2}
        {...props}>
        {(item: any) => (
          <Item textValue={item.name} key={item.identifier}>
            <Text>{item.name}</Text>
            {item.type === 'folder' &&
              <>
                <Folder />
                <Text slot="description">{`contains ${item.childNodes.length} dropped item(s)`}</Text>
              </>
            }
          </Item>
        )}
      </ListView>
    </Flex>
  );
}

function DragBetweenListsOverride(props) {
  let list1 = useListData({
    initialItems: [
      {identifier: '1', type: 'file', name: 'Adobe Photoshop'},
      {identifier: '2', type: 'file', name: 'Adobe XD'},
      {identifier: '3', type: 'file', name: 'Adobe InDesign'},
      {identifier: '4', type: 'file', name: 'Adobe AfterEffects'}
    ],
    getKey: (item) => item.identifier
  });

  let list2 = useListData({
    initialItems: [
      {identifier: '7', type: 'folder', name: 'Pictures',  childNodes: []},
      {identifier: '8', type: 'file', name: 'Adobe Fresco'},
      {identifier: '9', type: 'folder', name: 'Apps',  childNodes: []},
      {identifier: '10', type: 'file', name: 'Adobe Illustrator'},
      {identifier: '11', type: 'file', name: 'Adobe Lightroom'},
      {identifier: '12', type: 'file', name: 'Adobe Dreamweaver'}
    ],
    getKey: (item) => item.identifier
  });

  let {dndHooks: dndHooksList1} = useDnDHooks({
    getItems: (keys) => [...keys].map(key => {
      let item = list1.getItem(key);
      let dragType = `list-1-adobe-${item.type}`;
      return {
        [`${dragType}`]: JSON.stringify(item),
        'text/plain': JSON.stringify(item)
      };
    }),
    onDragEnd: (e) => {
      action('onDragEnd')(e);
      if (e.dropOperation === 'move') {
        list1.remove(...e.keys);
      }
    }
  });

  let {dndHooks: dndHooksList2} = useDnDHooks({
    getDropOperation: (target, types) => {
      if (target.type !== 'root' || !(types.has('list-1-adobe-file') || types.has('text/plain'))) {
        return 'cancel';
      }

      return 'move';
    },
    onDrop: async (e) => {
      action('onDrop')(e);
      let {
        items
      } = e;
      let itemsToAdd = [];
      let text;
      for (let item of items) {
        if (item.kind === 'text') {
          if (item.types.size === 1 && item.types.has('text/plain')) {
            text = await item.getText('text/plain');
            itemsToAdd = text.split('\n').map(val => JSON.parse(val));
          } else {
            text = await item.getText('list-1-adobe-file');
            itemsToAdd.push(JSON.parse(text));
          }
        }
      }

      list2.append(...itemsToAdd);
    },
    // the below utility handlers shouldn't be called because onDrop is defined
    // shouldAcceptItemDrop and acceptedDragTypes shouldn't affect the behavior either
    onInsert: () => action('onInsert'),
    onReorder: () => action('onReorder'),
    onRootDrop: () => action('onRootDrop'),
    onItemDrop: () => action('onItemDrop'),
    shouldAcceptItemDrop: (target) => !!list2.getItem(target.key).childNodes,
    acceptedDragTypes: 'all'
  });


  return (
    <Flex wrap gap="size-300">
      <ListView
        aria-label="Draggable listview"
        selectionMode="multiple"
        width="size-3600"
        height="size-3600"
        items={list1.items}
        dndHooks={dndHooksList1}
        {...props}>
        {(item: any) => (
          <Item textValue={item.name} key={item.identifier}>
            <Text>{item.name}</Text>
            {item.type === 'folder' && <Folder />}
          </Item>
        )}
      </ListView>
      <ListView
        aria-label="droppable listview"
        selectionMode="multiple"
        width="size-3600"
        height="size-3600"
        items={list2.items}
        dndHooks={dndHooksList2}
        {...props}>
        {(item: any) => (
          <Item textValue={item.name} key={item.identifier}>
            <Text>{item.name}</Text>
            {item.type === 'folder' &&
              <>
                <Folder />
                <Text slot="description">{`contains ${item.childNodes.length} dropped item(s)`}</Text>
              </>
            }
          </Item>
        )}
      </ListView>
    </Flex>
  );
}
