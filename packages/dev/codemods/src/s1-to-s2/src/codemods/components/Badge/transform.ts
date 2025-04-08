import {NodePath} from '@babel/traverse';
import * as t from '@babel/types';
import {updatePropNameAndValue} from '../../shared/transforms';

/**
 * Transforms Badge:
 * - Change variant="info" to variant="informative".
 */
export default function transformBadge(path: NodePath<t.JSXElement>) {
  // Change variant="info" to variant="informative"
  updatePropNameAndValue(path, {
    oldProp: 'variant',
    oldValue: 'info',
    newProp: 'variant',
    newValue: 'informative'
  });
} 
