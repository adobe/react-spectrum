import {run as jscodeshift} from 'jscodeshift/src/Runner.js';
import path from 'path';
import {UseMonopackagesCodemodOptions} from '../..';

const transformPath = path.join(__dirname, 'codemod.js');

export async function use_monopackages(options: UseMonopackagesCodemodOptions) {
  let {
    path: filePath = '.',
    ...rest
  } = options;

  return await jscodeshift(transformPath, [filePath], rest);
}
