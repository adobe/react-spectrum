import {NodePath} from '@babel/traverse';
import {removeProp, updatePropNameAndValue} from '../../shared/transforms';
import * as t from '@babel/types';

/**
 * Transforms ColorField:
 * - Remove isQuiet (it is no longer supported in Spectrum 2).
 * - Remove placeholder (it has been removed due to accessibility issues).
 * - Change validationState="invalid" to isInvalid.
 * - Remove validationState="valid" (it is no longer supported in Spectrum 2).
 */
export default function transformColorField(path: NodePath<t.JSXElement>) {
  // Remove isQuiet
  removeProp(path, {propToRemove: 'isQuiet'});

  // Remove placeholder
  removeProp(path, {propToRemove: 'placeholder'});

  // Change validationState="invalid" to isInvalid
  updatePropNameAndValue(path, {
    oldProp: 'validationState',
    oldValue: 'invalid',
    newProp: 'isInvalid',
    newValue: true
  });

  // Remove validationState="valid"
  removeProp(path, {propToRemove: 'validationState', propValue: 'valid'});
} 
