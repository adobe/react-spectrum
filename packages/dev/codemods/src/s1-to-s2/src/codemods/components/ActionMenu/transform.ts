import {commentOutProp, updateComponentWithinCollection} from '../../shared/transforms';
import {NodePath} from '@babel/traverse';
import * as t from '@babel/types';

/**
 * Transforms ActionMenu props:
 * - Comment out closeOnSelect (it has not been implemented yet).
 * - Comment out trigger (it has not been implemented yet).
 * - Update Item to be a MenuItem.
 */
export default function transformActionMenu(path: NodePath<t.JSXElement>) {
  // Comment out closeOnSelect
  // Reason: It has not been implemented yet
  commentOutProp(path, {propToComment: 'closeOnSelect'});

  // Comment out trigger
  // Reason: It has not been implemented yet
  commentOutProp(path, {propToComment: 'trigger'});
} 
