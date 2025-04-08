import {NodePath} from '@babel/traverse';
import {removeProp, updatePropNameAndValue} from '../../shared/transforms';
import * as t from '@babel/types';

/**
 * Transforms StatusLight:
 * - Remove isDisabled (it is no longer supported in Spectrum 2).
 * - Change variant="info" to variant="informative".
 */
export default function transformStatusLight(path: NodePath<t.JSXElement>) {
  // Remove isDisabled
  removeProp(path, {propToRemove: 'isDisabled'});

  // Change variant="info" to variant="informative"
  updatePropNameAndValue(path, {
    oldProp: 'variant',
    oldValue: 'info',
    newProp: 'variant',
    newValue: 'informative'
  });
} 
