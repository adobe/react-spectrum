import {commentOutProp} from '../../shared/transforms';
import {NodePath} from '@babel/traverse';
import * as t from '@babel/types';

/**
 * Transforms ListView:
 * - Comment out density (it has not been implemented yet).
 * - Comment out dragAndDropHooks (it has not been implemented yet).
 */
export default function transformListView(path: NodePath<t.JSXElement>): void {
  commentOutProp(path, {propName: 'density'});
  commentOutProp(path, {propName: 'dragAndDropHooks'});
}
