import {run as jscodeshift} from 'jscodeshift/src/Runner.js';
import path from 'path';
import {UseSubpathsCodemodOptions} from '../..';

const transformPath = path.join(__dirname, 'codemod.js');

export async function use_subpaths(
  options: UseSubpathsCodemodOptions
): Promise<ReturnType<typeof jscodeshift>> {
  let {path: filePath = '.', ...rest} = options;

  return await jscodeshift(transformPath, [filePath], rest);
}
