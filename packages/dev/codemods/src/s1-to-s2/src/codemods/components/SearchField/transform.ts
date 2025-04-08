import {commentOutProp, removeProp, updatePropNameAndValue} from '../../shared/transforms';
import {NodePath} from '@babel/traverse';
import * as t from '@babel/types';

/**
 * Transforms SearchField props:
 * - Remove placeholder (it has been removed due to accessibility issues).
 * - Comment out icon (it has not been implemented yet).
 * - Remove isQuiet (it is no longer supported in Spectrum 2).
 * - Change validationState="invalid" to isInvalid.
 * - Remove validationState="valid" (it is no longer supported in Spectrum 2).
 */
export default function transformSearchField(path: NodePath<t.JSXElement>) {
  // Remove placeholder
  // Reason: It has been removed due to accessibility issues
  removeProp(path, {propToRemove: 'placeholder'});

  // Comment out icon
  // Reason: It has not been implemented yet
  commentOutProp(path, {propToComment: 'icon'});

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
