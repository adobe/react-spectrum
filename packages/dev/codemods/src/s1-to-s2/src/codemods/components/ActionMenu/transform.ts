import {commentOutProp, updatePropName} from '../../shared/transforms';
import {NodePath} from '@babel/traverse';
import * as t from '@babel/types';

/**
 * Transforms ActionMenu:
 * - Rename `closeOnSelect` to `shouldCloseOnSelect`.
 * - Comment out trigger (it has not been implemented yet).
 */
export default function transformActionMenu(path: NodePath<t.JSXElement>): void {
  // Rename `closeOnSelect` to `shouldCloseOnSelect`
  updatePropName(path, {oldPropName: 'closeOnSelect', newPropName: 'shouldCloseOnSelect'});

  // Comment out trigger
  commentOutProp(path, {propName: 'trigger'});
}
