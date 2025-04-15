import {NodePath} from '@babel/traverse';
import * as t from '@babel/types';
import {updatePropNameAndValue} from '../../shared/transforms';

/**
 * Transforms InlineAlert:
 * - Change variant="info" to variant="informative".
 */
export default function transformInlineAlert(path: NodePath<t.JSXElement>) {
  // Change variant="info" to variant="informative"
  updatePropNameAndValue(path, {
    oldPropName: 'variant',
    oldPropValue: 'info',
    newPropName: 'variant',
    newPropValue: 'informative'
  });
} 
