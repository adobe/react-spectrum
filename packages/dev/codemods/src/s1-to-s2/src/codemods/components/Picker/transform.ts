import {
  convertDimensionValueToPx,
  removeProp,
  updatePropName,
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
 * - Replace isLoading with loadingState.
 */
export default function transformPicker(path: NodePath<t.JSXElement>): void {
  // Change menuWidth value from a DimensionValue to a pixel value
  convertDimensionValueToPx(path, {propName: 'menuWidth'});

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

  // Replace isLoading with loadingState
  updatePropName(path, {
    oldPropName: 'isLoading',
    newPropName: 'loadingState',
    comment: 'Replace boolean passed to isLoading with appropriate loadingState.'
  });
}
