import {NodePath} from '@babel/traverse';
import {removeProp, updatePropName, updatePropNameAndValue} from '../../shared/transforms';
import * as t from '@babel/types';

/**
 * Transforms TagGroup:
 * - Rename actionLabel to groupActionLabel.
 * - Rename onAction to onGroupAction.
 * - Change validationState="invalid" to isInvalid.
 * - Update Item to be Tag.
 * - Remove validationState="valid" (it is no longer supported in Spectrum 2).
 */
export default function transformTagGroup(path: NodePath<t.JSXElement>): void {
  // Rename actionLabel to groupActionLabel
  updatePropName(path, {oldPropName: 'actionLabel', newPropName: 'groupActionLabel'});

  // Rename onAction to onGroupAction
  updatePropName(path, {oldPropName: 'onAction', newPropName: 'onGroupAction'});

  // Change validationState="invalid" to isInvalid
  updatePropNameAndValue(path, {
    oldPropName: 'validationState',
    oldPropValue: 'invalid',
    newPropName: 'isInvalid',
    newPropValue: true
  });

  // Remove validationState="valid"
  removeProp(path, {propName: 'validationState', propValue: 'valid'});
}
