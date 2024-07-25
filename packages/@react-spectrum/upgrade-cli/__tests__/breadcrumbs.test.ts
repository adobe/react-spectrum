// @ts-ignore
import {defineSnapshotTest} from 'jscodeshift/dist/testUtils';
import transform from '../src/codemods/codemod';
jest.mock('../src/getComponents');

const test = (name: string, input: string) => {
  defineSnapshotTest(transform, {}, input, name);
};

test('Static - Renames Item to Breadcrumb and adds import', `
import {Breadcrumbs, Item} from '@adobe/react-spectrum';

<div>
  <Breadcrumbs>
    <Item key="home">Home</Item>
    <Item key="trendy">Trendy</Item>
    <Item key="march 2020 assets">March 2020 Assets</Item>
  </Breadcrumbs>
</div>
`);

test('Static - Renames key to id', `
import {Breadcrumbs, Item} from '@adobe/react-spectrum';
let externalKey = 'travel';
<div>
  <Breadcrumbs>
    <Item key="news">News</Item>
    <Item key={externalKey}>Travel</Item>
    <Item>Gaming</Item>
    <Item>Shopping</Item>
  </Breadcrumbs>
</div>
`);

test('Dynamic - Renames Item to Breadcrumb', `
import {Breadcrumbs, Item} from '@adobe/react-spectrum';
let folders = [
  {id: 1, label: 'Home'},
  {id: 2, label: 'Trendy'},
  {id: 3, label: 'March 2020 Assets'}
];
<div>
  <Breadcrumbs onAction={(a) => setFolderId(a)}>
    {folders.map(f => <Item key={f.id}>{f.label}</Item>)}
  </Breadcrumbs>
</div>
`);

test('Dynamic - Renames key to id', `
import {Breadcrumbs, Item} from '@adobe/react-spectrum';
const items = [
  {id: 1, name: 'News'},
  {id: 2, name: 'Travel'},
  {id: 3, name: 'Gaming'},
  {id: 4, name: 'Shopping'}
];
<div>
  <Breadcrumbs items={items}>
    {item => <Item key={item.id}>{item.name}</Item>}
  </Breadcrumbs>
  <Breadcrumbs items={items}>
    {item => <Item id={item.id}>{item.name}</Item>}
  </Breadcrumbs>
  <Breadcrumbs items={items}>
    {item => <Item>{item.name}</Item>}
  </Breadcrumbs>
</div>
`);

test('Comments out showRoot', `
import {Breadcrumbs, Item} from '@adobe/react-spectrum';

<Breadcrumbs showRoot>
  <Item key="home">Home</Item>
  <Item key="trendy">Trendy</Item>
  <Item key="2020 assets">March 2020 Assets</Item>
  <Item key="winter">Winter</Item>
  <Item key="holiday">Holiday</Item>
</Breadcrumbs>
`);

test('Comments out autoFocusCurrent', `
import {Breadcrumbs, Item} from '@adobe/react-spectrum';

<Breadcrumbs autoFocusCurrent>
  <Item key="home">Home</Item>
  <Item key="trendy">Trendy</Item>
  <Item key="march 2020 assets">March 2020 Assets</Item>
</Breadcrumbs>
`);

test('Comments out isMultiline', `
import {Breadcrumbs, Item} from '@adobe/react-spectrum';

<Breadcrumbs isMultiline>
  <Item key="home">Home</Item>
  <Item key="trendy">Trendy</Item>
  <Item key="march 2020 assets">March 2020 Assets</Item>
</Breadcrumbs>
`);

test('Removes size="S"', `
import {Breadcrumbs, Item} from '@adobe/react-spectrum';

<Breadcrumbs size="S">
  <Item key="home">Home</Item>
  <Item key="trendy">Trendy</Item>
</Breadcrumbs>
`);

test('Leaves a comment if size prop contains "S"', `
import {Breadcrumbs, Item} from '@adobe/react-spectrum';

<Breadcrumbs size={true ? 'M' : 'S'}>
  <Item key="home">Home</Item>
  <Item key="trendy">Trendy</Item>
</Breadcrumbs>
`);
