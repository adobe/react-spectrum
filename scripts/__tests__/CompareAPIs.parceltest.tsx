
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

  async function setupProject(root, scopeName = '@test', packageName = 'parcel-test-app') {
    let pkg = JSON.stringify({
      name: `${scopeName}/${packageName}`,
      version: '0.0.2',
      private: true,
      'docs-json': './dist/api.json',
      targets: {
        'docs-json': {
          source: './src/index.tsx'
        }
      },
      dependencies: {
        react: '^18.2.0',
        'react-dom': '^18.2.0'
      }
    });
    let packagePath = join(root, scopeName);
    let projectPath = join(packagePath, packageName);
    await inputFS.mkdirp(root);
    await inputFS.mkdirp(packagePath);
    await inputFS.mkdirp(projectPath);
    await inputFS.mkdirp(join(projectPath, 'src'));
    await inputFS.mkdirp(join(projectPath, 'dist'));
    await inputFS.writeFile(join(projectPath, 'package.json'), pkg, {});
    await outputFS.mkdirp(join(inputFS.cwd(), root));
    await outputFS.mkdirp(join(inputFS.cwd(), packagePath));
    await outputFS.mkdirp(join(inputFS.cwd(), projectPath));
    await outputFS.mkdirp(join(inputFS.cwd(), projectPath, 'src'));
    await outputFS.mkdirp(join(inputFS.cwd(), projectPath, 'dist'));
    await outputFS.writeFile(join(inputFS.cwd(), projectPath, 'package.json'), pkg, {});
  }

  async function createRootPackage(workspaces = ['@test/parcel-test-app']) {
    let pkg = JSON.stringify({
      name: 'monorepo',
      version: '0.0.2',
      private: true,
      workspaces,
      dependencies: {
        react: '^18.2.0',
        'react-dom': '^18.2.0'
      }
    });
    await inputFS.writeFile(join('dist', 'package.json'), pkg, {});
    await outputFS.writeFile(join(inputFS.cwd(), 'package.json'), pkg, {});
  }

  beforeEach(async () => {
    await inputFS.mkdirp('dist');
    await outputFS.mkdirp(join(inputFS.cwd(), 'dist'));
    await outputFS.mkdirp(join(inputFS.cwd(), 'dist/branch'));
    await outputFS.mkdirp(join(inputFS.cwd(), 'dist/base'));
    await setupProject('base');
    await setupProject('branch');
    await createRootPackage();
  });

  afterEach(async () => {
    await inputFS.rimraf('base');
    await inputFS.rimraf('branch');
    await inputFS.rimraf('dist');
    await outputFS.rimraf(join(inputFS.cwd(), 'dist'));
  });
  const getParcelInstance = (entries: string[]) =>
    new Parcel({
      config: join(rootPath, '.parcelrc'),
      entries,
      targets: ['docs-json'],
      inputFS,
      outputFS,
      workerFarm,
      // if we don't set this, it will cause tests to have unpredictable results
      shouldDisableCache: true
    });

  // every test must supply at least the 'index' file, they can include more, but that must be the entry point
  async function writeSourceFile(branch: 'base' | 'branch', name: string, contents:string, scopeName = '@test', packageName = 'parcel-test-app') {
    return inputFS.writeFile(`${branch}/${scopeName}/${packageName}/src/${name}`, contents, {});
  }

  async function runBranchBuild(entries = ['@test/parcel-test-app'], scopeName = '@test', packageName = 'parcel-test-app') {
    const parcel = getParcelInstance(entries.map(entry => join('branch', entry)));
    await parcel.run();
    await outputFS.mkdirp(join(inputFS.cwd(), 'dist', 'branch', 'dist'));
    await outputFS.mkdirp(join(inputFS.cwd(), 'dist', `branch/${scopeName}`, 'dist'));
    await outputFS.mkdirp(join(inputFS.cwd(), 'dist', `branch/${scopeName}/${packageName}`, 'dist'));
    await outputFS.writeFile(join(inputFS.cwd(), 'dist', `branch/${scopeName}/${packageName}`, 'package.json'), JSON.stringify({}), {});
    return await outputFS.copyFile(join(inputFS.cwd(), `branch/${scopeName}/${packageName}`, 'dist', 'api.json'), join(inputFS.cwd(), 'dist', `branch/${scopeName}/${packageName}/dist`, 'api.json'));
  }

  async function runPublishedBuild(entries = ['@test/parcel-test-app'], scopeName = '@test', packageName = 'parcel-test-app') {
    const parcel = getParcelInstance(entries.map(entry => join('base', entry)));
    await parcel.run();
    await outputFS.mkdirp(join(inputFS.cwd(), 'dist', 'base', 'dist'));
    await outputFS.mkdirp(join(inputFS.cwd(), 'dist', `base/${scopeName}`, 'dist'));
    await outputFS.mkdirp(join(inputFS.cwd(), 'dist', `base/${scopeName}/${packageName}`, 'dist'));
    await outputFS.writeFile(join(inputFS.cwd(), 'dist', `base/${scopeName}/${packageName}`, 'package.json'), JSON.stringify({}), {});
    return await outputFS.copyFile(join(inputFS.cwd(), `base/${scopeName}/${packageName}`, 'dist', 'api.json'), join(inputFS.cwd(), 'dist', `base/${scopeName}/${packageName}/dist`, 'api.json'));
  }

  async function doCompare(branchAPIs = [join(inputFS.cwd(), 'dist', 'branch', '@test', 'parcel-test-app', 'dist', 'api.json')], publishedAPIs = [join(inputFS.cwd(), 'dist', 'base', '@test', 'parcel-test-app', 'dist', 'api.json')]) {
    await compare(join(inputFS.cwd(), 'dist'), outputFS, {branchAPIs, publishedAPIs});
    let result = outputFS.readFileSync(join(inputFS.cwd(), 'dist', 'result.txt'), 'utf-8');
    result = result.replace(/(#* )(.*\/react-spectrum\/)(.*)/g, '$1$3');
    return result;
  }

  describe('components', () => {
    it('writes export entry for React component', async () => {
      await writeSourceFile('branch', 'index.tsx', `
      import React from 'react';

      export function App1(props: {id: number}): JSX.Element {
        return <div />;
      }
      `);

      await runBranchBuild();

      await writeSourceFile('base', 'index.tsx', `
      import React from 'react';

      export function App1(props: {id: string}): JSX.Element {
        return <div />;
      }
      `);

      await runPublishedBuild();

      let result = await doCompare();
      expect(result).toMatchSnapshot();
    }, 50000);

    it('follows dependencies', async () => {
      await writeSourceFile('branch', 'index.tsx', `
      import React from 'react';
      interface AppOpts {
        id: number;
      }
      interface AppProps {
        opts: AppOpts;
      }
      export function App1(props: AppProps): JSX.Element {
        return <div />;
      }
      `);

      await runBranchBuild();

      await writeSourceFile('base', 'index.tsx', `
      import React from 'react';
      interface AppOpts {
        id: string;
      }
      interface AppProps {
        opts: AppOpts;
      }
      export function App1(props: AppProps): JSX.Element {
        return <div />;
      }
      `);

      await runPublishedBuild();

      let result = await doCompare();
      expect(result).toMatchSnapshot();
    }, 50000);

    it('compares non template to template version', async () => {
      await writeSourceFile('branch', 'index.tsx', `
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

      await writeSourceFile('base', 'index.tsx', `
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

      let result = await doCompare();

      expect(result).toMatchSnapshot();
    }, 50000);

    it('can remove a new interface that did not previously exist', async () => {
      await writeSourceFile('branch', 'index.tsx', '');

      await runBranchBuild();

      await writeSourceFile('base', 'index.tsx', `
      export interface Foo {
        bar: number
      }
      `);

      await runPublishedBuild();

      let result = await doCompare();

      expect(result).toMatchSnapshot();
    }, 50000);

    it('can add a new interface that did not previously exist', async () => {
      await writeSourceFile('branch', 'index.tsx', `
      export interface Foo {
        bar: number
      }
      `);

      await runBranchBuild();

      await writeSourceFile('base', 'index.tsx', '');

      await runPublishedBuild();

      let result = await doCompare();

      expect(result).toMatchSnapshot();
    }, 50000);

    it('can handle top level exported identifiers', async () => {
      await writeSourceFile('branch', 'index.tsx', `
        export let theme: Key = 'foo';
      `);

      await runBranchBuild();

      await writeSourceFile('base', 'index.tsx', `
        export let theme: number = 5;
      `);

      await runPublishedBuild();

      let result = await doCompare();
      expect(result).toMatchSnapshot();
    }, 50000);

    it('can extend other interfaces', async () => {
      await writeSourceFile('branch', 'index.tsx', `
        interface Foo {
          bar: number
        }
        export interface SpectrumToastContainerProps extends Foo {}
      `);

      await runBranchBuild();

      await writeSourceFile('base', 'index.tsx', '');

      await runPublishedBuild();

      let result = await doCompare();
      expect(result).toMatchSnapshot();
    }, 50000);

    it('can extend other interfaces with no properties', async () => {
      await writeSourceFile('branch', 'index.tsx', `
        import {RefObject} from 'react';
        export interface ComponentProps extends RefObject {}
      `);

      await runBranchBuild();

      await writeSourceFile('base', 'index.tsx', '');

      await runPublishedBuild();

      let result = await doCompare();
      expect(result).toMatchSnapshot();
    }, 50000);

    it('alphabetizes properties', async () => {
      await writeSourceFile('branch', 'index.tsx', `
        export interface Alphabetize {
          foo: string,
          bar: string
        }
      `);

      await runBranchBuild();

      await writeSourceFile('base', 'index.tsx', '');

      await runPublishedBuild();

      let result = await doCompare();
      expect(result).toMatchSnapshot();
    }, 50000);

    it('does not change parameter order', async () => {
      await writeSourceFile('branch', 'index.tsx', `
        export function fooConcat(foo: string, bar: string): string {
          return foo + bar;
        }
      `);

      await runBranchBuild();

      await writeSourceFile('base', 'index.tsx', '');

      await runPublishedBuild();

      let result = await doCompare();
      expect(result).toMatchSnapshot();
    }, 50000);

    it('does not change type parameter order', async () => {
      await writeSourceFile('branch', 'index.tsx', `
        export interface ComponentProps<T, C> {
            foo: T,
            bar: C
        }
      `);

      await runBranchBuild();

      await writeSourceFile('base', 'index.tsx', '');

      await runPublishedBuild();

      let result = await doCompare();
      expect(result).toMatchSnapshot();
    }, 50000);

    it('handles return values', async () => {
      await writeSourceFile('branch', 'index.tsx', `
    export function Bar(props: {val: number}): null {
      return null;
    }
      `);

      await runBranchBuild();

      await writeSourceFile('base', 'index.tsx', '');

      await runPublishedBuild();

      let result = await doCompare();
      expect(result).toMatchSnapshot();
    }, 50000);

    it('handles return values that are functions', async () => {
      await writeSourceFile('branch', 'index.tsx', `
    export function Bar(props: {val: number}): () => void {
      return;
    }
      `);

      await runBranchBuild();

      await writeSourceFile('base', 'index.tsx', '');

      await runPublishedBuild();

      let result = await doCompare();
      expect(result).toMatchSnapshot();
    }, 50000);

    it('handles mapped types', async () => {
      await writeSourceFile('branch', 'index.tsx', `
      export type Mutable<T> = {
        -readonly[P in keyof T]: T[P]
      };
      `);

      await runBranchBuild();

      await writeSourceFile('base', 'index.tsx', '');

      await runPublishedBuild();

      let result = await doCompare();
      expect(result).toMatchSnapshot();
    }, 50000);

    it('indents interface properties correctly', async () => {
      await writeSourceFile('branch', 'index.tsx', `
export interface DateSegment {
  /** The type of segment. */
  type: SegmentType,
  /** The formatted text for the segment. */
  text: string,
  /** The numeric value for the segment, if applicable. */
  value?: number,
  /** The minimum numeric value for the segment, if applicable. */
  minValue?: number,
  /** The maximum numeric value for the segment, if applicable. */
  maxValue?: number,
  /** Whether the value is a placeholder. */
  isPlaceholder: boolean,
  /** A placeholder string for the segment. */
  placeholder: string,
  /** Whether the segment is editable. */
  isEditable: boolean
}
      `);

      await runBranchBuild();

      await writeSourceFile('base', 'index.tsx', '');

      await runPublishedBuild();

      let result = await doCompare();
      expect(result).toMatchSnapshot();
    }, 50000);
  });

  describe('interface merging', () => {
    it('merges properties when extending', async () => {
      await writeSourceFile('branch', 'index.tsx', `
    interface Validation {
      isValid: boolean;
    }
    export interface State extends Validation {
      foo: Foo
    }
    `);

      await runBranchBuild();

      await writeSourceFile('base', 'index.tsx', '');

      await runPublishedBuild();

      let result = await doCompare();
      expect(result).toMatchSnapshot();
    }, 50000);

    it('merges properties when extending with nested extends', async () => {
      await writeSourceFile('branch', 'index.tsx', `
    interface Validation {
      isValid: boolean;
    }
    interface SpectrumValidation extends Validation {
      showErrorIcon: boolean;
    }
    export interface State extends SpectrumValidation {
      foo: Foo
    }
    `);

      await runBranchBuild();

      await writeSourceFile('base', 'index.tsx', '');

      await runPublishedBuild();

      let result = await doCompare();
      expect(result).toMatchSnapshot();
    }, 50000);

    it('merges properties when extending with nested extends even for empty interfaces', async () => {
      await writeSourceFile('branch', 'index.tsx', `
    interface Validation {
      isValid: boolean;
    }
    interface SpectrumValidation extends Validation {}
    export interface State extends SpectrumValidation {
      foo: Foo
    }
    `);

      await runBranchBuild();

      await writeSourceFile('base', 'index.tsx', '');

      await runPublishedBuild();

      let result = await doCompare();
      expect(result).toMatchSnapshot();
    }, 50000);

    it('merges properties when extending with generics and Omit', async () => {
      await writeSourceFile('branch', 'index.tsx', `
    interface AriaTagGroupProps<T> {
      node: T;
    }
    interface Validation {
      isValid: boolean;
    }
    interface SpectrumHelpTextProps {
      showErrorIcon: boolean;
      errorMessage: string;
    }
    export interface SpectrumTagGroupProps<T> extends AriaTagGroupProps<T>, Validation, Omit<SpectrumHelpTextProps, 'showErrorIcon'> {
      actionLabel?: string,
      onAction?: () => void
    }
    `);

      await runBranchBuild();

      await writeSourceFile('base', 'index.tsx', '');

      await runPublishedBuild();

      let result = await doCompare();
      expect(result).toMatchSnapshot();
    }, 50000);

    describe('other packages', () => {
      // note: this test relies on our source code, so it's not ideal, but it's taking more time than i have to
      // figure out how to yarn link/yarn add a fake package
      it('merges properties when extending with generics from other modules', async () => {
    //     setupProject('branch', '@react-types-test', 'tag');
    //     await createRootPackage(['@test/parcel-test-app', '@react-types-test/tag']);
    //     await writeSourceFile('branch', 'index.tsx', `
    // export interface InterfaceA<T> {
    //   node: T;
    // }
    // export interface InterfaceB {
    //   isValid: boolean;
    // }
    // export interface InterfaceC {
    //   showErrorIcon: boolean;
    //   errorMessage: string;
    // }
    // `, '@react-types-test', 'tag');
        await writeSourceFile('branch', 'index.tsx', `
    import {AriaTagGroupProps} from '@react-aria/tag';
    import {SpectrumHelpTextProps, Validation} from '@react-types/shared';
    export interface SpectrumTagGroupProps<T> extends AriaTagGroupProps<T>, Validation, Omit<SpectrumHelpTextProps, 'showErrorIcon'> {
      actionLabel?: string,
      onAction?: () => void
    }
    `);

        await runBranchBuild();

        await writeSourceFile('base', 'index.tsx', '');

        await runPublishedBuild();

        let result = await doCompare();
        expect(result).toMatchSnapshot();
      }, 50000);
    });
  });
});
