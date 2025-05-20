import {commentOutProp, removeProp, updatePropNameAndValue} from '../../shared/transforms';
import {NodePath} from '@babel/traverse';
import * as t from '@babel/types';

/**
 * Transforms SearchField:
 * - Remove placeholder (it has been removed due to accessibility issues).
 * - Comment out icon (it has not been implemented yet).
 * - Remove isQuiet (it is no longer supported in Spectrum 2).
 * - Change validationState="invalid" to isInvalid.
 * - Remove validationState="valid" (it is no longer supported in Spectrum 2).
 */
export default function transformSearchField(path: NodePath<t.JSXElement>) {
  // Remove placeholder
  removeProp(path, {propName: 'placeholder'});

  // Comment out icon
  commentOutProp(path, {propName: 'icon'});

  // Remove isQuiet
  removeProp(path, {propName: 'isQuiet'});

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
