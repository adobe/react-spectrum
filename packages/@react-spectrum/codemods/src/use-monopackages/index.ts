import {CodemodOptions} from '..';
import {run as jscodeshift} from 'jscodeshift/src/Runner.js';
import path from 'node:path';

const transformPath = path.join(__dirname, 'use-monopackages.js');

export async function use_monopackages(options: CodemodOptions) {
  let {
    path: filePath = '.',
    ...rest
  } = options;

  return await jscodeshift(transformPath, [filePath], rest);
}
