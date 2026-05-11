#!/usr/bin/env node
const {parseArgs} = require('node:util');
import {s1_to_s2} from './s1-to-s2/src';
import {use_monopackages} from './use-monopackages/src';
import {use_subpaths} from './use-subpaths/src';

interface JSCodeshiftOptions {
  /**
   * The parser for jscodeshift to use for parsing the source files:
   * https://github.com/facebook/jscodeshift?tab=readme-ov-file#parser.
   *
   * @default 'tsx'
   */
  parser?: 'babel' | 'babylon' | 'flow' | 'ts' | ' tsx';
  /**
   * A glob pattern of files to ignore:
   * https://github.com/facebook/jscodeshift?tab=readme-ov-file#ignoring-files-and-directories.
   *
   * @default '_\_\/node_modules/_\_\'
   */
  ignorePattern?: string;
  /**
   * Whether to run the codemod in dry mode, which will not write any changes to disk.
   *
   * @default false
   */
  dry?: boolean;
  /**
   * The path to the directory to run the codemod in.
   *
   * @default '.'
   */
  path?: string;
}

export interface S1ToS2CodemodOptions extends JSCodeshiftOptions {
  /**
   * An optional subset of components to have the s1-to-s2 codemod apply to.
   * Provide a comma-separated list of component names.
   */
  components?: string;
  /**
   * Whether to run the codemod in agent mode, which skips interactive prompts
   * and package installation. This matches the shipped CLI behavior.
   *
   * @default false
   */
  agent?: boolean;
}

export interface UseMonopackagesCodemodOptions extends JSCodeshiftOptions {
  /**
   * The packages to apply the use-monopackages codemod to.
   */
  packages?: string;
}

export interface UseSubpathsCodemodOptions extends JSCodeshiftOptions {}

const codemods: Record<
  string,
  (
    options: S1ToS2CodemodOptions | UseMonopackagesCodemodOptions | UseSubpathsCodemodOptions
  ) => void
> = {
  's1-to-s2': s1_to_s2,
  'use-monopackages': use_monopackages,
  'use-subpaths': use_subpaths
};

// https://github.com/facebook/jscodeshift?tab=readme-ov-file#usage-cli
const options = {
  parser: {
    type: 'string'
  },
  'ignore-pattern': {
    type: 'string'
  },
  dry: {
    type: 'boolean',
    short: 'd'
  },
  path: {
    type: 'string'
  },
  components: {
    type: 'string'
  },
  agent: {
    type: 'boolean'
  }
};

const {values, positionals} = parseArgs({
  options,
  allowPositionals: true
});

if (positionals.length < 1) {
  console.error(
    'Please specify a codemod to run. Available codemods: ',
    Object.keys(codemods).join(', ')
  );
  process.exit(1);
}

async function main() {
  const codemodName = positionals[0];
  const codemodFunction = codemods[codemodName];

  if (!codemodFunction) {
    console.error(
      `Unknown codemod: ${codemodName}, available codemods: ${Object.keys(codemods).join(', ')}`
    );
    process.exit(1);
  }

  await Promise.resolve(
    codemodFunction({
      parser: 'tsx',
      ignorePattern: '**/node_modules/**',
      path: '.',
      extensions: 'js,jsx,mjs,cjs,ts,tsx',
      ...values
    })
  );
}

main().catch(error => {
  console.error(`Error running codemod: ${error}`);
  process.exit(1);
});
