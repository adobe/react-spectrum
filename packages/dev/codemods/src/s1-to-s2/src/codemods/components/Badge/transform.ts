import {NodePath} from '@babel/traverse';
import * as t from '@babel/types';
import {updatePropNameAndValue} from '../../shared/transforms';

/**
 * Transforms Badge:
 * - Change variant="info" to variant="informative".
 */
export default function transformBadge(path: NodePath<t.JSXElement>): void {
  // Change variant="info" to variant="informative"
  updatePropNameAndValue(path, {
    oldPropName: 'variant',
    oldPropValue: 'info',
    newPropName: 'variant',
    newPropValue: 'informative'
  });
}
