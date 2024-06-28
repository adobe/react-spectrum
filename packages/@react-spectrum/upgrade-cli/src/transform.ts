import path from 'node:path';
import {run as jscodeshift} from 'jscodeshift/src/Runner.js';

const transformPath = path.join(__dirname, 'codemods', 'codemod.js');

interface Options {
  componentSubset?: string,
  path?: string,
  ignorePattern?: string,
  parser?: string
}

export async function transform(options: Options) {
  let {
    path: filePath = '.',
    ...rest
  } = options;

  return await jscodeshift(transformPath, [filePath], rest);
}
