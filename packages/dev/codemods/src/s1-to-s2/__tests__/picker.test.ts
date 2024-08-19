// @ts-ignore
import {defineSnapshotTest} from 'jscodeshift/dist/testUtils';
import transform from '../src/codemods/codemod';

const test = (name: string, input: string) => {
  defineSnapshotTest(transform, {}, input, name);
};

test('Static - Renames Item to PickerItem', `
import {Picker, Item} from '@adobe/react-spectrum';
<div>
  <Picker label="Ice Cream">
    <Item>Chocolate</Item>
    <Item>Vanilla</Item>
  </Picker>
</div>
`);

test('Static - Renames key to id', `
import {Picker, Item} from '@adobe/react-spectrum';
<div>
  <Picker label="Ice Cream">
    <Item key="chocolate">Chocolate</Item>
    <Item key="vanilla">Vanilla</Item>
  </Picker>
</div>
`);

test('Dynamic - Renames Item to PickerItem', `
import {Picker, Item} from '@adobe/react-spectrum';
let options = [
  {id: 1, name: 'Chocolate'},
  {id: 2, name: 'Vanilla'}
];
<div>
  <Picker 
    label="Ice Cream"
    items={options}>
    {(item) => <Item id={item.id}>{item.name}</Item>}
  </Picker>
  <Picker 
    label="Ice Cream"
    items={options}>
    {(item) => <Item key={item.id}>{item.name}</Item>}
  </Picker>
  <Picker 
    label="Ice Cream"
    items={options}>
    {(item) => <Item>{item.name}</Item>}
  </Picker>
</div>
`);

test('Static - Converts menuWidth to px value', `
import {Picker, Item} from '@adobe/react-spectrum';
let menuWidth = 'size-10';
let props = {menuWidth: 'size-10'};
<div>
  <Picker label="Ice Cream" menuWidth="size-10">
    <Item>Chocolate</Item>
    <Item>Vanilla</Item>
  </Picker>
  <Picker label="Ice Cream" menuWidth="size-50">
    <Item>Chocolate</Item>
    <Item>Vanilla</Item>
  </Picker>
  <Picker label="Ice Cream" menuWidth="10vw">
    <Item>Chocolate</Item>
    <Item>Vanilla</Item>
  </Picker>
  <Picker label="Ice Cream" menuWidth="5cm">
    <Item>Chocolate</Item>
    <Item>Vanilla</Item>
  </Picker>
  <Picker label="Ice Cream" menuWidth={menuWidth}>
    <Item>Chocolate</Item>
    <Item>Vanilla</Item>
  </Picker>
  <Picker label="Ice Cream" {...props}>
    <Item>Chocolate</Item>
    <Item>Vanilla</Item>
  </Picker>
</div>
`);

test('Static - Removes isQuiet', `
import {Picker, Item} from '@adobe/react-spectrum';
let isQuiet = true;
let props = {isQuiet: true};
<div>
  <Picker label="Ice Cream" isQuiet>
    <Item>Chocolate</Item>
    <Item>Vanilla</Item>
  </Picker>
  <Picker label="Ice Cream" isQuiet={true}>
    <Item>Chocolate</Item>
    <Item>Vanilla</Item>
  </Picker>
  <Picker label="Ice Cream" isQuiet={false}>
    <Item>Chocolate</Item>
    <Item>Vanilla</Item>
  </Picker>
  <Picker label="Ice Cream" isQuiet={'foo' === 'foo'}>
    <Item>Chocolate</Item>
    <Item>Vanilla</Item>
  </Picker>
  <Picker label="Ice Cream" {...props}>
    <Item>Chocolate</Item>
    <Item>Vanilla</Item>
  </Picker>
</div>
`);

test('changes validationState to isInvalid or nothing', `
import {Picker, Item} from '@adobe/react-spectrum';
let validationState = 'invalid';
let props = {validationState: 'invalid'};
<div>
  <Picker validationState="invalid">
    <Item>Chocolate</Item>
    <Item>Vanilla</Item>
  </Picker>
  <Picker validationState="valid">
    <Item>Chocolate</Item>
    <Item>Vanilla</Item>
  </Picker>
  <Picker validationState={'invalid'}>
    <Item>Chocolate</Item>
    <Item>Vanilla</Item>
  </Picker>
  <Picker validationState={validationState}>
    <Item>Chocolate</Item>
    <Item>Vanilla</Item>
  </Picker>
  <Picker {...props}>
    <Item>Chocolate</Item>
    <Item>Vanilla</Item>
  </Picker>
</div>
`);

test('handles sections', `
import {Picker, Section, Item} from '@adobe/react-spectrum';
<Picker>
  <Section title="Section title">
    <Item>Item one</Item>
    <Item>Item two</Item>
  </Section>
</Picker>
`);
