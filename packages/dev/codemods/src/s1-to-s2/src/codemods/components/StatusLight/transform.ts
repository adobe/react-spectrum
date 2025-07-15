import {NodePath} from '@babel/traverse';
import {removeProp, updatePropNameAndValue} from '../../shared/transforms';
import * as t from '@babel/types';

/**
 * Transforms StatusLight:
 * - Remove isDisabled (it is no longer supported in Spectrum 2).
 * - Change variant="info" to variant="informative".
 */
export default function transformStatusLight(path: NodePath<t.JSXElement>): void {
  // Remove isDisabled
  removeProp(path, {propName: 'isDisabled'});

  // Change variant="info" to variant="informative"
  updatePropNameAndValue(path, {
    oldPropName: 'variant',
    oldPropValue: 'info',
    newPropName: 'variant',
    newPropValue: 'informative'
  });
}
