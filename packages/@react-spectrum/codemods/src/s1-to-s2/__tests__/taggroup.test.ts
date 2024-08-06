// @ts-ignore
import {defineSnapshotTest} from 'jscodeshift/dist/testUtils';
import transform from '../src/codemods/codemod';

const test = (name: string, input: string) => {
  defineSnapshotTest(transform, {}, input, name);
};

test('Static - Renames Item to Tag', `
import {TagGroup, Item} from '@adobe/react-spectrum';

<div>
  <TagGroup aria-label="Static TagGroup items example">
    <Item>News</Item>
    <Item>Travel</Item>
    <Item>Gaming</Item>
    <Item>Shopping</Item>
  </TagGroup>
</div>
`);

test('Static - Renames key to id', `
import {TagGroup, Item} from '@adobe/react-spectrum';

let externalKey = 'travel';
<div>
  <TagGroup aria-label="Static TagGroup items example">
    <Item key="news">News</Item>
    <Item key={externalKey}>Travel</Item>
    <Item>Gaming</Item>
    <Item>Shopping</Item>
  </TagGroup>
</div>
`);

test('Dynamic - Renames Item to Tag', `
import {TagGroup, Item} from '@adobe/react-spectrum';
const items = [
  {id: 1, name: 'News'},
  {id: 2, name: 'Travel'},
  {id: 3, name: 'Gaming'},
  {id: 4, name: 'Shopping'}
];

<div>
  <TagGroup items={items} aria-label="Dynamic TagGroup items example">
    {item => <Item>{item.name}</Item>}
  </TagGroup>
</div>
`);

test('Dynamic - Renames key to id', `
import {TagGroup, Item} from '@adobe/react-spectrum';
const items = [
  {id: 1, name: 'News'},
  {id: 2, name: 'Travel'},
  {id: 3, name: 'Gaming'},
  {id: 4, name: 'Shopping'}
];

<div>
  <TagGroup items={items} aria-label="Dynamic TagGroup items example">
    {item => <Item key={item.id}>{item.name}</Item>}
  </TagGroup>
  <TagGroup items={items} aria-label="Dynamic TagGroup items example">
    {item => <Item id={item.id}>{item.name}</Item>}
  </TagGroup>
  <TagGroup items={items} aria-label="Dynamic TagGroup items example">
    {item => <Item>{item.name}</Item>}
  </TagGroup>
</div>
`);

test('changes validationState to isInvalid or nothing', `
import {TagGroup, Item} from '@adobe/react-spectrum';

let validationState = 'invalid';
let props = {validationState: 'invalid'};
<div>
  <TagGroup
    aria-label="Static TagGroup items example"
    validationState="invalid">
    <Item>News</Item>
  </TagGroup>
  <TagGroup
    aria-label="Static TagGroup items example"
    validationState="valid">
    <Item>News</Item>
  </TagGroup>
  <TagGroup
    aria-label="Static TagGroup items example"
    validationState={'invalid'}>
    <Item>News</Item>
  </TagGroup>
  <TagGroup
    aria-label="Static TagGroup items example"
    validationState={validationState}>
    <Item>News</Item>
  </TagGroup>
  <TagGroup
    aria-label="Static TagGroup items example"
    {...props}>
    <Item>News</Item>
  </TagGroup>
</div>
`);
