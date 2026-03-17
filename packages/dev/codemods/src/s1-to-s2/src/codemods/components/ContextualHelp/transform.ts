import {commentOutProp, updatePlacementToSingleValue} from '../../shared/transforms';
import {NodePath} from '@babel/traverse';
import * as t from '@babel/types';

/**
 * Transforms ContextualHelp:
 * - Comment out variant="info" (informative variant is the only one supported).
 * - Update placement prop to have only one value (e.g., "bottom left" becomes "bottom").
 */
export default function transformContextualHelp(path: NodePath<t.JSXElement>): void {
  // Comment out variant="info"
  commentOutProp(path, {propName: 'variant', propValue: 'info'});

  // Update placement prop to have only one value
  updatePlacementToSingleValue(path, {propToUpdateName: 'placement'});
}
