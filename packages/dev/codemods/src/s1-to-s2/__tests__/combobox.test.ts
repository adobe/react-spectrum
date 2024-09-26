// @ts-ignore
import {defineSnapshotTest} from 'jscodeshift/dist/testUtils';
import transform from '../src/codemods/codemod';

const test = (name: string, input: string) => {
  defineSnapshotTest(transform, {}, input, name);
};

test('Static - Renames Item to ComboBoxItem', `
import {ComboBox, Item} from '@adobe/react-spectrum';
<div>
  <ComboBox label="Favorite Animal">
    <Item>Red Panda</Item>
    <Item>Cat</Item>
  </ComboBox>
</div>
`);

test('Static - Renames key to id', `
import {ComboBox, Item} from '@adobe/react-spectrum';
let externalKey = 'travel';
<div>
  <ComboBox label="Favorite Animal">
    <Item key="red panda">Red Panda</Item>
    <Item key="cat">Cat</Item>
  </ComboBox>
</div>
`);

test('Dynamic - Renames Item to ComboBoxItem', `
import {ComboBox, Item} from '@adobe/react-spectrum';
let options = [
  {id: 1, name: 'Aerospace'},
  {id: 2, name: 'Mechanical'}
];
<div>
  <ComboBox
    defaultItems={options}
    label="Pick an engineering major">
    {item => <Item>{item.name}</Item>}
  </ComboBox>
</div>
`);

test('Dynamic - Renames key to id', `
import {ComboBox, Item} from '@adobe/react-spectrum';
const items = [
  {id: 1, name: 'News'},
  {id: 2, name: 'Travel'},
  {id: 3, name: 'Gaming'},
  {id: 4, name: 'Shopping'}
];
<div>
  <ComboBox
    defaultItems={options}
    label="Pick an engineering major">
    {item => <Item key={item.id}>{item.name}</Item>}
  </ComboBox>
  <ComboBox
    defaultItems={options}
    label="Pick an engineering major">
    {item => <Item id={item.id}>{item.name}</Item>}
  </ComboBox>
  <ComboBox
    defaultItems={options}
    label="Pick an engineering major">
    {item => <Item>{item.name}</Item>}
  </ComboBox>
</div>
`);

test('changes validationState to isInvalid or nothing', `
import {ComboBox, Item} from '@adobe/react-spectrum';
let validationState = 'invalid';
let props = {validationState: 'invalid'};
<div>
  <ComboBox
    label="Static ComboBox items example"
    validationState="invalid">
    <Item>News</Item>
  </ComboBox>
  <ComboBox
    label="Static ComboBox items example"
    validationState="valid">
    <Item>News</Item>
  </ComboBox>
  <ComboBox
    label="Static ComboBox items example"
    validationState={'invalid'}>
    <Item>News</Item>
  </ComboBox>
  <ComboBox
    label="Static ComboBox items example"
    validationState={validationState}>
    <Item>News</Item>
  </ComboBox>
  <ComboBox
    label="Static ComboBox items example"
    {...props}>
    <Item>News</Item>
  </ComboBox>
</div>
`);

test('Static - Converts menuWidth to px value', `
import {ComboBox, Item} from '@adobe/react-spectrum';
let menuWidth = 'size-10';
let props = {menuWidth: 'size-10'};
<div>
  <ComboBox label="Favorite Animal" menuWidth="size-10">
    <Item>Red Panda</Item>
    <Item>Cat</Item>
  </ComboBox>
  <ComboBox label="Favorite Animal" menuWidth="size-50">
    <Item>Red Panda</Item>
    <Item>Cat</Item>
  </ComboBox>
  <ComboBox label="Favorite Animal" menuWidth="5in">
    <Item>Red Panda</Item>
    <Item>Cat</Item>
  </ComboBox>
  <ComboBox label="Favorite Animal" menuWidth="50%">
    <Item>Red Panda</Item>
    <Item>Cat</Item>
  </ComboBox>
  <ComboBox label="Favorite Animal" menuWidth={menuWidth}>
    <Item>Red Panda</Item>
    <Item>Cat</Item>
  </ComboBox>
  <ComboBox label="Favorite Animal" {...props}>
    <Item>Red Panda</Item>
    <Item>Cat</Item>
  </ComboBox>
</div>
`);

test('Removes isQuiet', `
import {ComboBox, Item} from '@adobe/react-spectrum';
let isQuiet = true;
let props = {isQuiet: true};
<div>
  <ComboBox isQuiet>
    <Item>Red Panda</Item>
    <Item>Cat</Item>
  </ComboBox>
  <ComboBox isQuiet={true}>
    <Item>Red Panda</Item>
    <Item>Cat</Item>
  </ComboBox>
  <ComboBox isQuiet={false}>
    <Item>Red Panda</Item>
    <Item>Cat</Item>
  </ComboBox>
  <ComboBox isQuiet={isQuiet}>
    <Item>Red Panda</Item>
    <Item>Cat</Item>
  </ComboBox>
  <ComboBox isQuiet={'foo' === 'foo'}>
    <Item>Red Panda</Item>
    <Item>Cat</Item>
  </ComboBox>
  <ComboBox {...props}>
    <Item>Red Panda</Item>
    <Item>Cat</Item>
  </ComboBox>
</div>
`);

test('Removes placeholder', `
import {ComboBox, Item} from '@adobe/react-spectrum';
let placeholder = 'is this actually removed?';
let props = {placeholder: 'is this actually removed?'};
<div>
  <ComboBox placeholder="is this actually removed?">
    <Item>Red Panda</Item>
    <Item>Cat</Item>
  </ComboBox>
  <ComboBox placeholder={"is this actually removed?"}>
    <Item>Red Panda</Item>
    <Item>Cat</Item>
  </ComboBox>
  <ComboBox placeholder={placeholder}>
    <Item>Red Panda</Item>
    <Item>Cat</Item>
  </ComboBox>
  <ComboBox {...props}>
    <Item>Red Panda</Item>
    <Item>Cat</Item>
  </ComboBox>
</div>
`);

test('changes validationState to isInvalid or nothing', `
import {ComboBox, Item} from '@adobe/react-spectrum';
let validationState = 'invalid';
let props = {validationState: 'invalid'};
<div>
  <ComboBox validationState="invalid">
    <Item>Red Panda</Item>
    <Item>Cat</Item>
  </ComboBox>
  <ComboBox validationState="valid">
    <Item>Red Panda</Item>
    <Item>Cat</Item>
  </ComboBox>
  <ComboBox validationState={validationState}>
    <Item>Red Panda</Item>
    <Item>Cat</Item>
  </ComboBox>
  <ComboBox {...props}>
    <Item>Red Panda</Item>
    <Item>Cat</Item>
  </ComboBox>
</div>
`);

test('handles sections', `
import {ComboBox, Section, Item} from '@adobe/react-spectrum';
<ComboBox>
  <Section title="Section title">
    <Item>Item one</Item>
    <Item>Item two</Item>
  </Section>
</ComboBox>
`);
