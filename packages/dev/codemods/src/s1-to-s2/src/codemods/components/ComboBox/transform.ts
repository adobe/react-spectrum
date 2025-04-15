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
  convertDimensionValueToPx(path, {propName: 'menuWidth'});

  // Remove isQuiet
  removeProp(path, {propName: 'isQuiet'});

  // Comment out loadingState
  commentOutProp(path, {propName: 'loadingState'});

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

  // Comment out onLoadMore
  commentOutProp(path, {propName: 'onLoadMore'});
} 
