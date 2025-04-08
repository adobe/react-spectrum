import {NodePath} from '@babel/traverse';
import {removeProp, updatePropNameAndValue} from '../../shared/transforms';
import * as t from '@babel/types';

/**
 * Transforms RadioGroup props:
 * - Change validationState="invalid" to isInvalid.
 * - Remove validationState="valid" (it is no longer supported in Spectrum 2).
 * - Remove showErrorIcon (it has been removed due to accessibility issues).
 */
export default function transformRadioGroup(path: NodePath<t.JSXElement>) {
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

  // Remove showErrorIcon
  // Reason: It has been removed due to accessibility issues
  removeProp(path, {propToRemove: 'showErrorIcon'});
} 
