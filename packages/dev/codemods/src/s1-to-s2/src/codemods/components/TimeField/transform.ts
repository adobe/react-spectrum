import {NodePath} from '@babel/traverse';
import {
  removeProp,
  updatePropNameAndValue
} from '../../shared/transforms';
import * as t from '@babel/types';

/**
 * Transforms TimeField:
 * - Remove isQuiet (it is no longer supported in Spectrum 2).
 * - Change validationState="invalid" to isInvalid.
 * - Remove validationState="valid" (it is no longer supported in Spectrum 2).
 */
export default function transformTimeField(path: NodePath<t.JSXElement>): void {
  // Change validationState="invalid" to isInvalid
  updatePropNameAndValue(path, {
    oldPropName: 'validationState',
    oldPropValue: 'invalid',
    newPropName: 'isInvalid',
    newPropValue: true
  });

  // Remove validationState="valid"
  removeProp(path, {propName: 'validationState', propValue: 'valid'});

  // Remove isQuiet
  removeProp(path, {propName: 'isQuiet'});
}
