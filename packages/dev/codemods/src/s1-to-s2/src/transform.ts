import {run as jscodeshift} from 'jscodeshift/src/Runner.js';
import path from 'path';
import {S1ToS2CodemodOptions} from '../..';

const transformPath = path.join(__dirname, 'codemods', 'codemod.js');

export async function transform(
  options: S1ToS2CodemodOptions
): Promise<ReturnType<typeof jscodeshift>> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {path: filePath = '.', agent, ...jscodeshiftOptions} = options;
  return await jscodeshift(transformPath, [filePath], jscodeshiftOptions);
}
