import {run as jscodeshift} from 'jscodeshift/src/Runner.js';
import path from 'path';
import {TestUtilsRcUpdateOptions} from '../..';

const transformPath = path.join(__dirname, 'codemod.js');

export async function test_utils_rc_update(
  options: TestUtilsRcUpdateOptions
): Promise<ReturnType<typeof jscodeshift>> {
  let {path: filePath = '.', ...rest} = options;
  return await jscodeshift(transformPath, [filePath], rest);
}
