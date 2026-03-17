import {commentOutProp} from '../../shared/transforms';
import {NodePath} from '@babel/traverse';
import * as t from '@babel/types';

/**
 * Transforms ActionMenu:
 * - Comment out closeOnSelect (it has not been implemented yet).
 * - Comment out trigger (it has not been implemented yet).
 */
export default function transformActionMenu(path: NodePath<t.JSXElement>): void {
  // Comment out closeOnSelect
  commentOutProp(path, {propName: 'closeOnSelect'});

  // Comment out trigger
  commentOutProp(path, {propName: 'trigger'});
}
