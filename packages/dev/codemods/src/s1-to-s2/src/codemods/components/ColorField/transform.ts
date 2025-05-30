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
  removeProp(path, {propName: 'isQuiet'});

  // Remove placeholder
  removeProp(path, {propName: 'placeholder'});

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
