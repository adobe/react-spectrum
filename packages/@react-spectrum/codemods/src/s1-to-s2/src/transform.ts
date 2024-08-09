import {run as jscodeshift} from 'jscodeshift/src/Runner.js';
import path from 'path';
import {S1ToS2CodemodOptions} from '../..';

const transformPath = path.join(__dirname, 'codemods', 'codemod.js');

export async function transform(options: S1ToS2CodemodOptions) {
  let {
    path: filePath = '.',
    ...rest
  } = options;

  return await jscodeshift(transformPath, [filePath], rest);
}
