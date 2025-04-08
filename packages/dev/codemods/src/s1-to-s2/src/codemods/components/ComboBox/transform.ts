import {
  commentOutProp,
  convertDimensionValueToPx,
  removeProp,
  updatePropNameAndValue
} from '../../shared/transforms';
import {NodePath} from '@babel/traverse';
import * as t from '@babel/types';

/**
 * Transforms ComboBox:
 * - Change menuWidth value from a DimensionValue to a pixel value.
 * - Remove isQuiet (it is no longer supported in Spectrum 2).
 * - Comment out loadingState (it has not been implemented yet).
 * - Remove placeholder (it is no longer supported in Spectrum 2).
 * - Change validationState="invalid" to isInvalid.
 * - Remove validationState="valid" (it is no longer supported in Spectrum 2).
 * - Comment out onLoadMore (it has not been implemented yet).
 */
export default function transformComboBox(path: NodePath<t.JSXElement>) {
  // Change menuWidth value from a DimensionValue to a pixel value
  convertDimensionValueToPx(path, {propToConvertValue: 'menuWidth'});

  // Remove isQuiet
  removeProp(path, {propToRemove: 'isQuiet'});

  // Comment out loadingState
  commentOutProp(path, {propToComment: 'loadingState'});

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

  // Comment out onLoadMore
  commentOutProp(path, {propToComment: 'onLoadMore'});
} 
