
import {compare} from '../compareAPIs';
import {join} from 'path';
import {MemoryFS, NodeFS} from '@parcel/fs';
import Parcel, {createWorkerFarm} from '@parcel/core';

const rootPath = join(__dirname, '..', '..');

describe('Compare API', () => {
  const workerFarm = createWorkerFarm();

  const outputFS = new MemoryFS(workerFarm);
  let inputFS = new NodeFS();

  afterAll(() => {
    workerFarm.end();
  });

  async function setupProject(root) {
    let pkg = JSON.stringify({
      name: '@adobe/parcel-transformer-test-app',
      version: '0.0.2',
      private: true,
      apiCheck: './dist/api.json',
      targets: {
        apiCheck: {
          source: './src/index.tsx'
        }
      },
      dependencies: {
        react: '^18.2.0',
        'react-dom': '^18.2.0'
      }
    });
    await inputFS.mkdirp(root);
    await inputFS.mkdirp(join(root, 'src'));
    await inputFS.mkdirp(join(root, 'dist'));
    await inputFS.writeFile(join(root, 'package.json'), pkg, {});
    await outputFS.mkdirp(join(inputFS.cwd(), root));
    await outputFS.mkdirp(join(inputFS.cwd(), root, 'src'));
    await outputFS.mkdirp(join(inputFS.cwd(), root, 'dist'));
    await outputFS.writeFile(join(inputFS.cwd(), root, 'package.json'), pkg, {});
  }

  beforeEach(async () => {
    await outputFS.mkdirp(join(inputFS.cwd(), 'dist'));
    await outputFS.mkdirp(join(inputFS.cwd(), 'dist/branch'));
    await outputFS.mkdirp(join(inputFS.cwd(), 'dist/base'));
    await inputFS.mkdirp('dist');
    await setupProject('base');
    await setupProject('branch');
  });

  afterEach(async () => {
    await inputFS.rimraf('base');
    await inputFS.rimraf('branch');
    await inputFS.rimraf('dist');
    await outputFS.rimraf(join(inputFS.cwd(), 'dist'));
  });
  const getParcelInstance = (workingDir: string) =>
    new Parcel({
      config: join(rootPath, '.parcelrc'),
      entries: [workingDir],
      targets: ['apiCheck'],
      inputFS,
      outputFS,
      workerFarm,
      // if we don't set this, it will cause tests to have unpredictable results
      shouldDisableCache: true
    });

  // every test must supply at least the 'index' file, they can include more, but that must be the entry point
  async function writeSourceFile(project: string, name: string, contents:string, packageName?: string) {
    if (packageName) {
      return inputFS.writeFile(`${project}/${packageName}/${name}`, contents, {});
    }
    if (name.split('.').length > 1) {
      return inputFS.writeFile(`${project}/src/${name}`, contents, {});
    }
    return inputFS.writeFile(`${project}/src/${name}.tsx`, contents, {});
  }

  async function runBranchBuild() {
    const parcel = getParcelInstance('branch');
    await parcel.run();
    await outputFS.mkdirp(join(inputFS.cwd(), 'branch', 'dist'));
    await outputFS.writeFile(join(inputFS.cwd(), 'branch', 'dist', 'package.json'), JSON.stringify({}), {});
    return await outputFS.copyFile(join(inputFS.cwd(), 'branch', 'dist', 'api.json'), join(inputFS.cwd(), 'dist', 'branch', 'api.json'));
  }

  async function runPublishedBuild() {
    const parcel = getParcelInstance('base');
    await parcel.run();
    await outputFS.mkdirp(join(inputFS.cwd(), 'base', 'dist'));
    await outputFS.writeFile(join(inputFS.cwd(), 'base', 'dist', 'package.json'), JSON.stringify({}), {});
    return await outputFS.copyFile(join(inputFS.cwd(), 'base', 'dist', 'api.json'), join(inputFS.cwd(), 'dist', 'base', 'api.json'));
  }

  describe('components', () => {
    it('writes export entry for React component', async () => {
      await writeSourceFile('branch', 'index', `
      import React from 'react';

      export function App1(props: {id: number}) {
        return <div />;
      }
      `);

      await runBranchBuild();

      await writeSourceFile('base', 'index', `
      import React from 'react';

      export function App1(props: {id: string}) {
        return <div />;
      }
      `);

      await runPublishedBuild();

      await compare(inputFS.cwd(), outputFS);
      let result = outputFS.readFileSync(join(inputFS.cwd(), 'dist', 'result.txt'), 'utf-8');

      expect(result).toMatchSnapshot();
    }, 50000);

    it('compares non template to template version', async () => {
      await writeSourceFile('branch', 'index', `
      export interface TableColumnResizeState<T> {
        /**
         * Called to update the state that a resize event has occurred.
         * Returns the new widths for all columns based on the resized column.
         **/
        onColumnResize: (key: Key, width: number) => Map<Key, number>,
        /** Callback for when onColumnResize has started. */
        onColumnResizeStart: (key: Key) => void,
        /** Callback for when onColumnResize has ended. */
        onColumnResizeEnd: (key: Key) => void,
        /** Gets the current width for the specified column. */
        getColumnWidth: (key: Key) => number,
        /** Gets the current minWidth for the specified column. */
        getColumnMinWidth: (key: Key) => number,
        /** Gets the current maxWidth for the specified column. */
        getColumnMaxWidth: (key: Key) => number,
        /** Currently calculated widths for all columns. */
        widths: Map<Key, number>,
        /** Key of the currently resizing column. */
        resizingColumn: Key | null,
        /** A reference to the table state. */
        tableState: TableState<T>
      }
      `);

      await runBranchBuild();

      await writeSourceFile('base', 'index', `
      export interface TableColumnResizeState {
        /** Trigger a resize and recalculation. */
        onColumnResize: (key: Key, width: number) => void,
        /** Callback for when onColumnResize has started. */
        onColumnResizeStart: (key: Key) => void,
        /** Callback for when onColumnResize has ended. */
        onColumnResizeEnd: (key: Key) => void,
        /** Gets the current width for the specified column. */
        getColumnWidth: (key: Key) => number,
        /** Gets the current minWidth for the specified column. */
        getColumnMinWidth: (key: Key) => number,
        /** Gets the current maxWidth for the specified column. */
        getColumnMaxWidth: (key: Key) => number,
        /** Currently calculated widths for all columns. */
        widths: Map<Key, number>
      }
      `);

      await runPublishedBuild();

      await compare(inputFS.cwd(), outputFS);
      let result = outputFS.readFileSync(join(inputFS.cwd(), 'dist', 'result.txt'), 'utf-8');

      expect(result).toMatchSnapshot();
    }, 50000);

    it('can remove a new interface that did not previously exist', async () => {
      await writeSourceFile('branch', 'index', '');

      await runBranchBuild();

      await writeSourceFile('base', 'index', `
      export interface Foo {
        bar: number
      }
      `);

      await runPublishedBuild();

      await compare(inputFS.cwd(), outputFS);
      let result = outputFS.readFileSync(join(inputFS.cwd(), 'dist', 'result.txt'), 'utf-8');

      expect(result).toMatchSnapshot();
    }, 50000);

    it('can add a new interface that did not previously exist', async () => {
      await writeSourceFile('branch', 'index', `
      export interface Foo {
        bar: number
      }
      `);

      await runBranchBuild();

      await writeSourceFile('base', 'index', '');

      await runPublishedBuild();

      await compare(inputFS.cwd(), outputFS);
      let result = outputFS.readFileSync(join(inputFS.cwd(), 'dist', 'result.txt'), 'utf-8');

      expect(result).toMatchSnapshot();
    }, 50000);

    it('can handle top level exported identifiers', async () => {
      await writeSourceFile('branch', 'index', `
        export let theme: Key = 'foo';
      `);

      await runBranchBuild();

      await writeSourceFile('base', 'index', `
        export let theme: number = 5;
      `);

      await runPublishedBuild();

      await compare(inputFS.cwd(), outputFS);
      let result = outputFS.readFileSync(join(inputFS.cwd(), 'dist', 'result.txt'), 'utf-8');
      expect(result).toMatchSnapshot();
    }, 50000);

    it('can extend other interfaces', async () => {
      await writeSourceFile('branch', 'index', `
        interface Foo {
          bar: number
        }
        export interface SpectrumToastContainerProps extends Foo {}
      `);

      await runBranchBuild();

      await writeSourceFile('base', 'index', '');

      await runPublishedBuild();

      await compare(inputFS.cwd(), outputFS);
      let result = outputFS.readFileSync(join(inputFS.cwd(), 'dist', 'result.txt'), 'utf-8');
      expect(result).toMatchSnapshot();
    }, 50000);

    it('can extend other interfaces with no properties', async () => {
      await writeSourceFile('branch', 'index', `
        import {RefObject} from 'react';
        export interface SpectrumToastContainerProps extends RefObject {}
      `);

      await runBranchBuild();

      await writeSourceFile('base', 'index', '');

      await runPublishedBuild();

      await compare(inputFS.cwd(), outputFS);
      let result = outputFS.readFileSync(join(inputFS.cwd(), 'dist', 'result.txt'), 'utf-8');
      expect(result).toMatchSnapshot();
    }, 50000);
  });
});
