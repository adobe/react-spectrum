import {NodePath} from '@babel/traverse';
import * as t from '@babel/types';
import {updatePropNameAndValue} from '../../shared/transforms';

/**
 * Transforms ProgressCircle:
 * - Change variant="overBackground" to staticColor="white".
 */
export default function transformProgressCircle(path: NodePath<t.JSXElement>): void {
  // Change variant="overBackground" to staticColor="white"
  updatePropNameAndValue(path, {
    oldPropName: 'variant',
    oldPropValue: 'overBackground',
    newPropName: 'staticColor',
    newPropValue: 'white'
  });
}
