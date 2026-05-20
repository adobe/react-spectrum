import {NodePath} from '@babel/traverse';
import {
  removeProp,
  updateComponentIfPropPresent,
  updatePropName,
  updatePropNameAndValue,
  updatePropValueAndAddNewPropName
} from '../../shared/transforms';
import * as t from '@babel/types';

/**
 * Transforms Button:
 * - Change variant="cta" to variant="accent"
 * - Change variant="overBackground" to variant="primary" staticColor="white"
 * - Change style to fillStyle
 * - Remove isQuiet (it is no longer supported in Spectrum 2)
 * - If href is present, the Button should be converted to a LinkButton
 * - Remove elementType (it is no longer supported in Spectrum 2).
 */
export default function transformButton(path: NodePath<t.JSXElement>): void {
  // Change variant="cta" to variant="accent"
  updatePropNameAndValue(path, {
    oldPropName: 'variant',
    oldPropValue: 'cta',
    newPropName: 'variant',
    newPropValue: 'accent'
  });

  // Change variant="overBackground" to variant="primary" staticColor="white"
  updatePropValueAndAddNewPropName(path, {
    oldPropName: 'variant',
    oldPropValue: 'overBackground',
    newPropName: 'variant',
    newPropValue: 'primary',
    additionalPropName: 'staticColor',
    additionalPropValue: 'white'
  });

  // Change style to fillStyle
  updatePropName(path, {
    oldPropName: 'style',
    newPropName: 'fillStyle'
  });

  // Remove isQuiet
  removeProp(path, {propName: 'isQuiet'});

  // If href is present, the Button should be converted to a LinkButton
  updateComponentIfPropPresent(path, {
    propName: 'href',
    newComponentName: 'LinkButton'
  });

  // Remove elementType
  removeProp(path, {propName: 'elementType'});
}
