import {NodePath} from '@babel/traverse';
import {removeProp, updatePropNameAndValue} from '../../shared/transforms';
import * as t from '@babel/types';

/**
 * Transforms NumberField props:
 * - Remove isQuiet (it is no longer supported in Spectrum 2).
 * - Change validationState="invalid" to isInvalid.
 * - Remove validationState="valid" (it is no longer supported in Spectrum 2).
 */
export default function transformNumberField(path: NodePath<t.JSXElement>) {
  // Remove isQuiet
  // Reason: It is no longer supported in Spectrum 2
  removeProp(path, {propToRemove: 'isQuiet'});

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
