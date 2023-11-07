import {join} from 'path';
import {MemoryFS, NodeFS} from '@parcel/fs';
import Parcel, {createWorkerFarm} from '@parcel/core';

const rootPath = join(__dirname, '..', '..', '..', '..');

describe('DocsTransformer - API', () => {
  const workerFarm = createWorkerFarm();

  const outputFS = new MemoryFS(workerFarm);
  let inputFS = new NodeFS();

  afterAll(() => {
    workerFarm.end();
  });

  beforeEach(async () => {
    let pkg = JSON.stringify({
      name: '@adobe/parcel-transformer-test-app',
      version: '0.0.2',
      private: true,
      'apiCheck': './dist/api.json',
      targets: {
        'apiCheck': {
          source: './src/index.tsx'
        }
      },
      dependencies: {
        react: '^18.2.0',
        'react-dom': '^18.2.0'
      }
    });
    await inputFS.mkdirp('test');
    await inputFS.mkdirp('test/src');
    await inputFS.mkdirp('test/dist');
    await inputFS.writeFile('test/package.json', pkg, {});
  });

  afterEach(async () => {
    await inputFS.rimraf(join(inputFS.cwd(), 'test'));
    await outputFS.rimraf('test');
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
  async function writeSourceFile(name: string, contents:string, packageName?: string) {
    if (packageName) {
      return inputFS.writeFile(`test/${packageName}/${name}`, contents, {});
    }
    if (name.split('.').length > 1) {
      return inputFS.writeFile(`test/src/${name}`, contents, {});
    }
    return inputFS.writeFile(`test/src/${name}.tsx`, contents, {});
  }

  async function runBuild() {
    const parcel = getParcelInstance('test');
    await parcel.run();

    // this replace will change all the url paths that are variable depending on the machine and makes them predictable
    // i was unable to find a jest matcher that could handle Object keys that varied, finding matches for the value was easy
    // "/Users/username/parcel/packages/test/src/index.tsx:Foo" -> "/test/src/index.tsx:Foo"
    const code = JSON.parse(
      outputFS.readFileSync(join(inputFS.cwd(), 'test', 'dist', 'api.json'), 'utf8')
        .replace(/(")(\/.*)(\/test\/.*?")/g, '$1$3')
        .replace(/(")(\/.*)(\/packages\/.*?")/g, '$1$3')
    );
    return code;
  }

  describe('builtins', () => {
    it('writes export entry for static number', async () => {
      await writeSourceFile('index', `
    export let a: number = 4;
    `);
      let code = await runBuild();
      expect(code).toMatchSnapshot();
    }, 50000);

    it('writes export entry for static string', async () => {
      await writeSourceFile('index', `
    export let b: string = "foo";
    `);
      let code = await runBuild();
      expect(code).toMatchSnapshot();
    }, 50000);

    it('writes export entry for referenced string', async () => {
      await writeSourceFile('index', `
    let name = 'foo';
    export let c = name;
    `);
      let code = await runBuild();
      expect(code).toMatchSnapshot();
    }, 50000);

    it('writes export entry for referenced function', async () => {
      await writeSourceFile('index', `
    function foo() {
      return 'foo';
    }
    export let d = foo();
    `);
      let code = await runBuild();
      expect(code).toMatchSnapshot();
    }, 50000);

    it('writes export entry for mapped types', async () => {
      await writeSourceFile('index', `
      export type Mutable<T> = {
        -readonly[P in keyof T]: T[P]
      };
    `);
      let code = await runBuild();
      expect(code).toMatchSnapshot();
    }, 50000);
  });

  describe('components', () => {
    it('writes export entry for React component', async () => {
      await writeSourceFile('index', `
    import React from 'react';

    export function App1(props): JSX.Element {
      return <div />;
    }
    `);
      let code = await runBuild();
      expect(code).toMatchSnapshot();
    }, 50000);

    it('writes export entry for localName React component', async () => {
      await writeSourceFile('index', `
    import React from 'react';

    function App2(props) {
      return <div />;
    }
    export {App2 as AppReal};
    `);
      let code = await runBuild();
      expect(code).toMatchSnapshot();
    }, 50000);
  });

  describe('types', () => {
    it('writes export entry for type', async () => {
      await writeSourceFile('index', `
    export type Foo = number;
    `);
      let code = await runBuild();
      expect(code).toMatchSnapshot();
    }, 50000);

    it('writes export entry for type union', async () => {
      await writeSourceFile('index', `
    export type Foo = number | string;
    `);
      let code = await runBuild();
      expect(code).toMatchSnapshot();
    }, 50000);

    it('writes export entry for type regex', async () => {
      await writeSourceFile('index', `
    export type Foo = \`\${number}%\`;
    `);
      let code = await runBuild();
      expect(code).toMatchSnapshot();
    }, 50000);

    it('writes export entry for complex type regex', async () => {
      await writeSourceFile('index', `
    export type Foo = \`\${number}.\${number} \${string}\`;
    `);
      let code = await runBuild();
      expect(code).toMatchSnapshot();
    }, 50000);
  });

  describe('interfaces', () => {
    it('writes export entry for interface', async () => {
      await writeSourceFile('index', `
    export interface Foo {
      a: number
    };
    `);
      let code = await runBuild();
      expect(code).toMatchSnapshot();
    }, 50000);

    it('follows imported interfaces', async () => {
      await writeSourceFile('component', `
    export interface Foo {
      a: number
    };
    `);
      await writeSourceFile('index', `
    import {Foo} from './component';
    export function Bar(props: Foo): null {
      return null;
    }
    `);
      let code = await runBuild();
      expect(code).toMatchSnapshot();
    }, 50000);

    it('follows local references', async () => {
      await writeSourceFile('index', `
    type Foo = string
    export interface State {
      foo: Foo
    }
    `);
      let code = await runBuild();
      expect(code).toMatchSnapshot();
    }, 50000);

    it('can omit properties', async () => {
      await writeSourceFile('index', `
    interface Foo {
      a: number
      b: string
    }
    export interface State extends Omit<Foo, 'a'> {}
    `);
      let code = await runBuild();
      expect(code).toMatchSnapshot();
    }, 50000);

    it('can infer properties', async () => {
      await writeSourceFile('index', `
    export type IntrinsicHTMLAttributes = {
      [K in keyof ReactDOM]: ReactDOM[K] extends DOMFactory<infer T, any> ? T : never
    };
    `);
      let code = await runBuild();
      expect(code).toMatchSnapshot();
    }, 50000);

    it('can pick properties', async () => {
      await writeSourceFile('index', `
    type IntrinsicHTMLAttributes = {
      [K in keyof ReactDOM]: ReactDOM[K] extends DOMFactory<infer T, any> ? T : never
    };
    type TextFieldIntrinsicElements = keyof Pick<IntrinsicHTMLElements, 'input' | 'textarea'>;
    `);
      let code = await runBuild();
      expect(code).toMatchSnapshot();
    }, 50000);
  });

  describe('identifiers', () => {
    it('writes export entry for identifiers', async () => {
      await writeSourceFile('column', `
    export interface SpectrumColumnProps<T> {id: string};
    export let Column = (props: {id: string}) => null;
    `);
      await writeSourceFile('index', `
    import {Column, SpectrumColumnProps} from './column';
    const SpectrumColumn = Column as <T>(props: SpectrumColumnProps<T>) => React.JSX.Element;
    export {SpectrumColumn as Column};
    `);
      let code = await runBuild();
      expect(code).toMatchSnapshot();
    }, 50000);

    it('writes export entry for identifiers real file', async () => {
      await writeSourceFile('src', `
    import {Column} from '@react-stately/table';
    import {SpectrumColumnProps} from '@react-types/table';
    const SpectrumColumn: <T>(props: SpectrumColumnProps<T>) => JSX.Element = Column as <T>(props: SpectrumColumnProps<T>) => JSX.Element;
    export {SpectrumColumn as Column};
    export type {SpectrumColumnProps} from '@react-types/table';
    `);
      await writeSourceFile('index', `
    export * from './src';
    `);
      let code = await runBuild();
      expect(code).toMatchSnapshot();
    }, 50000);
  });

  describe('links', () => {
    it('css modules', async () => {
      await writeSourceFile('theme', `
        export type CSSModule = {
          [className: string]: string
        };
        export interface Theme {
          global?: CSSModule,
          light?: CSSModule
        };
      `);
      await writeSourceFile('defaultTheme', `
        import {Theme} from './theme';
        let defaultTheme: Theme = {
          global: 'global'
        };
        export default defaultTheme;
      `);
      await writeSourceFile('index', `
        import defaultTheme from './defaultTheme';
        import {Theme} from './theme';
        export let theme: Theme = {
          ...defaultTheme,
          global: {
            ...defaultTheme.global
          }
        };
      `);
      let code = await runBuild();
      expect(code).toMatchSnapshot();
    }, 50000);
  });

  describe('interface merging', () => {
    it('merges properties when extending', async () => {
      await writeSourceFile('index', `
    interface Validation {
      isValid: boolean;
    }
    export interface State extends Validation {
      foo: Foo
    }
    `);
      let code = await runBuild();
      expect(code).toMatchSnapshot();
    }, 50000);

    it('merges properties when extending and does not substitute generics when none are provided', async () => {
      await writeSourceFile('index', `
      export interface Baz extends Foo<string> {}

      interface Foo<T> extends Coo {
        foo: T
      }

      interface Coo<F = Element> {
        coo: F
      }
    `);
      let code = await runBuild();
      expect(code).toMatchSnapshot();
    }, 50000);

    it('merges omit properties when extending', async () => {
      await writeSourceFile('index', `
      export interface Baz extends Foo<string> {}

      interface Foo<T> extends Omit<Coo, 'coo'> {
        foo: T
      }

      interface Coo<F = Element> {
        coo: F
      }
    `);
      let code = await runBuild();
      expect(code).toMatchSnapshot();
    }, 50000);

    it('merges properties when extending with split exports', async () => {
      await writeSourceFile('index', `
    import {AriaTagGroupProps} from '@react-aria/tag';
    import {SpectrumHelpTextProps, Validation} from '@react-types/shared';
    export interface SpectrumTagGroupProps<T> extends AriaTagGroupProps<T>, Validation, Omit<SpectrumHelpTextProps, 'showErrorIcon'> {
      actionLabel?: string,
      onAction?: () => void
    }
    `);
      let code = await runBuild();
      expect(code).toMatchSnapshot();
    }, 50000);
  });
});
