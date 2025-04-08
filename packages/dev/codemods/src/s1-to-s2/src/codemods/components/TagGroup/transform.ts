import {NodePath} from '@babel/traverse';
import {removeProp, updatePropName, updatePropNameAndValue} from '../../shared/transforms';
import * as t from '@babel/types';

/**
 * Transforms TagGroup props:
 * - Rename actionLabel to groupActionLabel.
 * - Rename onAction to onGroupAction.
 * - Change validationState="invalid" to isInvalid.
 * - Update Item to be Tag.
 * - Remove validationState="valid" (it is no longer supported in Spectrum 2).
 */
export default function transformTagGroup(path: NodePath<t.JSXElement>) {
  // Rename actionLabel to groupActionLabel
  updatePropName(path, {oldProp: 'actionLabel', newProp: 'groupActionLabel'});

  // Rename onAction to onGroupAction
  updatePropName(path, {oldProp: 'onAction', newProp: 'onGroupAction'});

  // Change validationState="invalid" to isInvalid
  updatePropNameAndValue(path, {
    oldProp: 'validationState',
    oldValue: 'invalid',
    newProp: 'isInvalid',
    newValue: true
  });

  // Remove validationState="valid"
  // Reason: It is no longer supported in Spectrum 2
  removeProp(path, {propToRemove: 'validationState', propValue: 'valid'});
} 
