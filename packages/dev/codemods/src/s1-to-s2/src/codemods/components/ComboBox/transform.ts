import {
  commentOutProp,
  convertDimensionValueToPx,
  removeProp,
  updatePropNameAndValue
} from '../../shared/transforms';
import {NodePath} from '@babel/traverse';
import * as t from '@babel/types';

/**
 * Transforms ComboBox props:
 * - Change menuWidth value from a DimensionValue to a pixel value.
 * - Remove isQuiet (it is no longer supported in Spectrum 2).
 * - Comment out loadingState (it has not been implemented yet).
 * - Remove placeholder (it is no longer supported in Spectrum 2).
 * - Change validationState="invalid" to isInvalid.
 * - Remove validationState="valid" (it is no longer supported in Spectrum 2).
 * - Comment out onLoadMore (it has not been implemented yet).
 * - Update Item to be a ComboBoxItem.
 */
export default function transformComboBox(path: NodePath<t.JSXElement>) {
  // Change menuWidth value from a DimensionValue to a pixel value
  // Reason: API change
  convertDimensionValueToPx(path, {propToConvertValue: 'menuWidth'});

  // Remove isQuiet
  // Reason: It is no longer supported in Spectrum 2
  removeProp(path, {propToRemove: 'isQuiet'});

  // Comment out loadingState
  // Reason: It has not been implemented yet
  commentOutProp(path, {propToComment: 'loadingState'});

  // Remove placeholder
  // Reason: It is no longer supported in Spectrum 2
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

  // Comment out onLoadMore
  // Reason: It has not been implemented yet
  commentOutProp(path, {propToComment: 'onLoadMore'});
} 
