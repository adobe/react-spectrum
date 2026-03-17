import {NodePath} from '@babel/traverse';
import * as t from '@babel/types';
import {updateKeyToId} from '../../shared/transforms';

/**
 * Transforms Column:
 * - Update key to id.
 */
export default function transformColumn(path: NodePath<t.JSXElement>): void {
  // Update key to id
  updateKeyToId(path);
}
