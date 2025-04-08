import {
  commentOutProp,
  convertDimensionValueToPx,
  removeProp,
  updatePropNameAndValue
} from '../../shared/transforms';
import {NodePath} from '@babel/traverse';
import * as t from '@babel/types';

/**
 * Transforms Picker props:
 * - Change menuWidth value from a DimensionValue to a pixel value.
 * - Remove isQuiet (it is no longer supported in Spectrum 2).
 * - Change validationState="invalid" to isInvalid.
 * - Remove validationState="valid" (it is no longer supported in Spectrum 2).
 * - Comment out isLoading (it has not been implemented yet).
 * - Comment out onLoadMore (it has not been implemented yet).
 * - Update Item to be a PickerItem.
 */
export default function transformPicker(path: NodePath<t.JSXElement>) {
  // Change menuWidth value from a DimensionValue to a pixel value
  // Reason: API change
  convertDimensionValueToPx(path, {propToConvertValue: 'menuWidth'});

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

  // Comment out isLoading
  // Reason: It has not been implemented yet
  commentOutProp(path, {propToComment: 'isLoading'});

  // Comment out onLoadMore
  // Reason: It has not been implemented yet
  commentOutProp(path, {propToComment: 'onLoadMore'});
} 
