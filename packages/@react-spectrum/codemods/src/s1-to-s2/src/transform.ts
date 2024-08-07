import {CodemodOptions} from '../..';
import {run as jscodeshift} from 'jscodeshift/src/Runner.js';
import path from 'node:path';

const transformPath = path.join(__dirname, 'codemods', 'codemod.js');


export async function transform(options: CodemodOptions) {
  let {
    path: filePath = '.',
    ...rest
  } = options;

  return await jscodeshift(transformPath, [filePath], rest);
}
