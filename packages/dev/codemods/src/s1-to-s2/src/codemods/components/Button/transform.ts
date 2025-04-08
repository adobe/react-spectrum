import {
  commentOutProp,
  removeProp,
  updateComponentIfPropPresent,
  updatePropName,
  updatePropNameAndValue,
  updatePropValueAndAddNewProp
} from '../../shared/transforms';
import {NodePath} from '@babel/traverse';
import * as t from '@babel/types';

/**
 * Transforms Button props:
 * - Change variant="cta" to variant="accent"
 * - Change variant="overBackground" to variant="primary" staticColor="white"
 * - Change style to fillStyle
 * - Comment out isPending (it has not been implemented yet)
 * - Remove isQuiet (it is no longer supported in Spectrum 2)
 * - If href is present, the Button should be converted to a LinkButton
 * - Remove elementType (it is no longer supported in Spectrum 2).
 */
export default function transformButton(path: NodePath<t.JSXElement>) {
  // Change variant="cta" to variant="accent"
  updatePropNameAndValue(path, {
    oldProp: 'variant',
    oldValue: 'cta',
    newProp: 'variant',
    newValue: 'accent'
  });

  // Change variant="overBackground" to variant="primary" staticColor="white"
  updatePropValueAndAddNewProp(path, {
    oldProp: 'variant',
    oldValue: 'overBackground',
    newProp: 'variant',
    newValue: 'primary',
    additionalProp: 'staticColor',
    additionalValue: 'white'
  });

  // Change style to fillStyle
  updatePropName(path, {
    oldProp: 'style',
    newProp: 'fillStyle'
  });

  // Comment out isPending
  commentOutProp(path, {propToComment: 'isPending'});

  // Remove isQuiet
  removeProp(path, {propToRemove: 'isQuiet'});

  // If href is present, the Button should be converted to a LinkButton
  updateComponentIfPropPresent(path, {
    propToCheck: 'href',
    newComponent: 'LinkButton'
  });

  // Remove elementType
  removeProp(path, {propToRemove: 'elementType'});
}
