import {
  commentOutProp,
  convertDimensionValueToPx,
  removeProp,
  updatePropNameAndValue
} from '../../shared/transforms';
import {NodePath} from '@babel/traverse';
import * as t from '@babel/types';

/**
 * Transforms Picker:
 * - Change menuWidth value from a DimensionValue to a pixel value.
 * - Remove isQuiet (it is no longer supported in Spectrum 2).
 * - Change validationState="invalid" to isInvalid.
 * - Remove validationState="valid" (it is no longer supported in Spectrum 2).
 * - Comment out isLoading (it has not been implemented yet).
 * - Comment out onLoadMore (it has not been implemented yet).
 */
export default function transformPicker(path: NodePath<t.JSXElement>) {
  // Change menuWidth value from a DimensionValue to a pixel value
  convertDimensionValueToPx(path, {propToConvertValue: 'menuWidth'});

  // Remove isQuiet
  removeProp(path, {propToRemove: 'isQuiet'});

  // Change validationState="invalid" to isInvalid
  updatePropNameAndValue(path, {
    oldProp: 'validationState',
    oldValue: 'invalid',
    newProp: 'isInvalid',
    newValue: true
  });

  // Remove validationState="valid"
  removeProp(path, {propToRemove: 'validationState', propValue: 'valid'});

  // Comment out isLoading
  commentOutProp(path, {propToComment: 'isLoading'});

  // Comment out onLoadMore
  commentOutProp(path, {propToComment: 'onLoadMore'});
} 
