import {NodePath} from '@babel/traverse';
import {removeComponentIfWithinParent} from '../../shared/transforms';
import * as t from '@babel/types';

/**
 * Transforms Divider:
 * - Remove Divider component if within a Dialog (Updated design for Dialog in Spectrum 2).
 */
export default function transformDivider(path: NodePath<t.JSXElement>): void {
  // Remove Divider component if within a Dialog
  removeComponentIfWithinParent(path, {parentComponentName: 'Dialog'});
}
