// @ts-ignore
import {defineSnapshotTest} from 'jscodeshift/dist/testUtils';
import transform from '../src/codemods/codemod';

const test = (name: string, input: string) => {
  defineSnapshotTest(transform, {}, input, name);
};

test('Renames variants', `
// import {TableView, TableHeader, TableBody, Column, Row, Cell} from '@adobe/react-spectrum';

<div>
</div>
`);
