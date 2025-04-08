import {NodePath} from '@babel/traverse';
import {removeProp, updatePropNameAndValue} from '../../shared/transforms';
import * as t from '@babel/types';

/**
 * Transforms ColorField props:
 * - Remove isQuiet (it is no longer supported in Spectrum 2).
 * - Remove placeholder (it has been removed due to accessibility issues).
 * - Change validationState="invalid" to isInvalid.
 * - Remove validationState="valid" (it is no longer supported in Spectrum 2).
 */
export default function transformColorField(path: NodePath<t.JSXElement>) {
  // Remove isQuiet
  // Reason: It is no longer supported in Spectrum 2
  removeProp(path, {propToRemove: 'isQuiet'});

  // Remove placeholder
  // Reason: It has been removed due to accessibility issues
  removeProp(path, {propToRemove: 'placeholder'});

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
